"use server";

import { getCurrentUserWithRole } from "@/lib/auth/rbac";
import { buyOrderSchema, BuyOrderInput } from "@/lib/validation/trade";
import { TransactionType } from "@prisma/client";
import Decimal from "decimal.js";
import { runSerializableTransaction } from "@/lib/db/serializable-transaction";
import { assertRateLimit, consumeRateLimit } from "@/lib/security/rate-limit";

/**
 * Server Action: Executes an atomic Virtual Buy Order for a Mutual Fund.
 * All mathematical operations use Decimal.js for exact financial accuracy.
 */
export async function executeBuyOrder(input: BuyOrderInput) {
  const dbUser = await getCurrentUserWithRole();
  if (!dbUser) {
    throw new Error("Unauthorized: Active session required.");
  }
  assertRateLimit(consumeRateLimit(`buy:${dbUser.id}`, 30, 60_000));

  const parsed = buyOrderSchema.parse(input);
  const amountDecimal = new Decimal(parsed.amountInRupees);
  const result = await runSerializableTransaction(async (tx) => {
    const membership = await tx.classroomMembership.findUnique({ where: { id: parsed.membershipId } });
    if (!membership) throw new Error("Classroom membership not found.");
    if (membership.studentId !== dbUser.id && dbUser.role !== "ADMIN") {
      throw new Error("Forbidden: You can only trade within your own classroom memberships.");
    }

    const fund = await tx.mutualFund.findUnique({ where: { id: parsed.fundId } });
    if (!fund || !fund.isActive) throw new Error("Selected mutual fund is not available for trading.");

    const navDecimal = new Decimal(fund.currentNav);
    if (navDecimal.lessThanOrEqualTo(0)) throw new Error("Invalid NAV price for selected fund.");

    const purchasedUnitsDecimal = amountDecimal.div(navDecimal);
    const balanceUpdate = await tx.classroomMembership.updateMany({
      where: { id: membership.id, cashBalance: { gte: amountDecimal } },
      data: { cashBalance: { decrement: amountDecimal } },
    });
    if (balanceUpdate.count !== 1) {
      throw new Error("Insufficient virtual cash balance for this transaction.");
    }

    const existingHolding = await tx.holding.findUnique({
      where: { membershipId_fundId: { membershipId: membership.id, fundId: fund.id } },
    });
    const holding = existingHolding
      ? await tx.holding.update({
          where: { id: existingHolding.id },
          data: {
            units: { increment: purchasedUnitsDecimal },
            totalInvested: { increment: amountDecimal },
            averageCostNav: new Decimal(existingHolding.totalInvested).add(amountDecimal).div(new Decimal(existingHolding.units).add(purchasedUnitsDecimal)),
          },
        })
      : await tx.holding.create({
          data: {
            membershipId: membership.id,
            fundId: fund.id,
            units: purchasedUnitsDecimal,
            totalInvested: amountDecimal,
            averageCostNav: navDecimal,
          },
        });

    const transaction = await tx.transaction.create({
      data: {
        membershipId: membership.id,
        fundId: fund.id,
        type: TransactionType.BUY,
        units: purchasedUnitsDecimal,
        executionNav: navDecimal,
        totalAmount: amountDecimal,
      },
    });
    const updatedMembership = await tx.classroomMembership.findUniqueOrThrow({ where: { id: membership.id } });

    return {
      fundName: fund.name,
      membership: { ...updatedMembership, cashBalance: updatedMembership.cashBalance.toNumber() },
      holding: { ...holding, units: holding.units.toNumber(), totalInvested: holding.totalInvested.toNumber(), averageCostNav: holding.averageCostNav.toNumber() },
      transaction: { ...transaction, units: transaction.units.toNumber(), executionNav: transaction.executionNav.toNumber(), totalAmount: transaction.totalAmount.toNumber() },
    };
  });

  return {
    success: true,
    message: `Successfully bought ${result.transaction.units.toFixed(4)} units of ${result.fundName} for ₹${parsed.amountInRupees.toLocaleString("en-IN")}`,
    data: { membership: result.membership, holding: result.holding, transaction: result.transaction },
  };
}
