"use server";

import { getCurrentUserWithRole } from "@/lib/auth/rbac";
import { sellOrderSchema, SellOrderInput } from "@/lib/validation/trade";
import { TransactionType } from "@prisma/client";
import Decimal from "decimal.js";
import { runSerializableTransaction } from "@/lib/db/serializable-transaction";
import { assertRateLimit, consumeRateLimit } from "@/lib/security/rate-limit";

/**
 * Server Action: Executes an atomic Virtual Sell Order for a Mutual Fund.
 * All mathematical operations use Decimal.js for exact financial accuracy.
 */
export async function executeSellOrder(input: SellOrderInput) {
  const dbUser = await getCurrentUserWithRole();
  if (!dbUser) {
    throw new Error("Unauthorized: Active session required.");
  }
  assertRateLimit(consumeRateLimit(`sell:${dbUser.id}`, 30, 60_000));

  const parsed = sellOrderSchema.parse(input);

  const unitsToSellDecimal = new Decimal(parsed.unitsToSell);
  const result = await runSerializableTransaction(async (tx) => {
    const membership = await tx.classroomMembership.findUnique({ where: { id: parsed.membershipId } });
    if (!membership) throw new Error("Classroom membership not found.");
    if (membership.studentId !== dbUser.id && dbUser.role !== "ADMIN") {
      throw new Error("Forbidden: You can only trade within your own classroom memberships.");
    }

    const fund = await tx.mutualFund.findUnique({ where: { id: parsed.fundId } });
    if (!fund || !fund.isActive) throw new Error("Selected mutual fund is not available for trading.");
    const holding = await tx.holding.findUnique({ where: { membershipId_fundId: { membershipId: membership.id, fundId: fund.id } } });
    if (!holding || new Decimal(holding.units).lessThan(unitsToSellDecimal)) {
      const availableUnits = holding ? new Decimal(holding.units).toNumber() : 0;
      throw new Error(`Insufficient holding units. Available: ${availableUnits.toFixed(4)}, Requested: ${unitsToSellDecimal.toNumber().toFixed(4)}`);
    }

    const navDecimal = new Decimal(fund.currentNav);
    const totalProceedsDecimal = unitsToSellDecimal.mul(navDecimal);
    const remainingUnits = new Decimal(holding.units).sub(unitsToSellDecimal);
    const updatedMembership = await tx.classroomMembership.update({
      where: { id: membership.id },
      data: { cashBalance: { increment: totalProceedsDecimal } },
    });

    let updatedHolding = null;
    if (remainingUnits.lessThanOrEqualTo(0.0001)) {
      await tx.holding.delete({ where: { id: holding.id } });
    } else {
      updatedHolding = await tx.holding.update({
        where: { id: holding.id },
        data: { units: remainingUnits, totalInvested: remainingUnits.mul(new Decimal(holding.averageCostNav)) },
      });
    }

    const transaction = await tx.transaction.create({
      data: { membershipId: membership.id, fundId: fund.id, type: TransactionType.SELL, units: unitsToSellDecimal, executionNav: navDecimal, totalAmount: totalProceedsDecimal },
    });

    return {
      fundName: fund.name,
      membership: { ...updatedMembership, cashBalance: updatedMembership.cashBalance.toNumber() },
      holding: updatedHolding ? { ...updatedHolding, units: updatedHolding.units.toNumber(), totalInvested: updatedHolding.totalInvested.toNumber(), averageCostNav: updatedHolding.averageCostNav.toNumber() } : null,
      transaction: { ...transaction, units: transaction.units.toNumber(), executionNav: transaction.executionNav.toNumber(), totalAmount: transaction.totalAmount.toNumber() },
      totalProceeds: totalProceedsDecimal.toNumber(),
    };
  });

  return {
    success: true,
    message: `Successfully sold ${parsed.unitsToSell.toFixed(4)} units of ${result.fundName} for ₹${result.totalProceeds.toLocaleString("en-IN")}`,
    data: { membership: result.membership, holding: result.holding, transaction: result.transaction },
  };
}
