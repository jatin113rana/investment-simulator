"use server";

import prisma from "@/lib/db/db";
import { syncCurrentUser } from "@/lib/auth/user-sync";
import { buyOrderSchema, BuyOrderInput } from "@/lib/validation/trade";
import { TransactionType } from "@prisma/client";
import Decimal from "decimal.js";

/**
 * Server Action: Executes an atomic Virtual Buy Order for a Mutual Fund.
 * All mathematical operations use Decimal.js for exact financial accuracy.
 */
export async function executeBuyOrder(input: BuyOrderInput) {
  const dbUser = await syncCurrentUser();
  if (!dbUser) {
    throw new Error("Unauthorized: Active session required.");
  }

  const parsed = buyOrderSchema.parse(input);

  // 1. Validate Classroom Membership & Ownership
  const membership = await prisma.classroomMembership.findUnique({
    where: { id: parsed.membershipId },
    include: { classroom: true },
  });

  if (!membership) {
    throw new Error("Classroom membership not found.");
  }

  if (membership.studentId !== dbUser.id && dbUser.role !== "ADMIN") {
    throw new Error("Forbidden: You can only trade within your own classroom memberships.");
  }

  // 2. Validate Target Mutual Fund & Current NAV
  const fund = await prisma.mutualFund.findUnique({
    where: { id: parsed.fundId },
  });

  if (!fund || !fund.isActive) {
    throw new Error("Selected mutual fund is not available for trading.");
  }

  const amountDecimal = new Decimal(parsed.amountInRupees);
  const navDecimal = new Decimal(fund.currentNav);

  if (navDecimal.lessThanOrEqualTo(0)) {
    throw new Error("Invalid NAV price for selected fund.");
  }

  // 3. Check Virtual Cash Balance Sufficiency
  if (new Decimal(membership.cashBalance).lessThan(amountDecimal)) {
    throw new Error(
      `Insufficient virtual cash balance. Available: ₹${membership.cashBalance.toNumber().toLocaleString("en-IN")}, Required: ₹${amountDecimal.toNumber().toLocaleString("en-IN")}`
    );
  }

  // 4. Calculate Exact Purchased Units
  const purchasedUnitsDecimal = amountDecimal.div(navDecimal);

  // 5. Execute Atomic Database Transaction
  const result = await prisma.$transaction(async (tx) => {
    // Deduct cash from membership balance
    const updatedMembership = await tx.classroomMembership.update({
      where: { id: membership.id },
      data: {
        cashBalance: new Decimal(membership.cashBalance).sub(amountDecimal),
      },
    });

    // Check if student already holds units in this mutual fund
    const existingHolding = await tx.holding.findUnique({
      where: {
        membershipId_fundId: {
          membershipId: membership.id,
          fundId: fund.id,
        },
      },
    });

    let holding;

    if (existingHolding) {
      const newUnits = new Decimal(existingHolding.units).add(purchasedUnitsDecimal);
      const newTotalInvested = new Decimal(existingHolding.totalInvested).add(amountDecimal);
      const newAvgCostNav = newTotalInvested.div(newUnits);

      holding = await tx.holding.update({
        where: { id: existingHolding.id },
        data: {
          units: newUnits,
          totalInvested: newTotalInvested,
          averageCostNav: newAvgCostNav,
        },
      });
    } else {
      holding = await tx.holding.create({
        data: {
          membershipId: membership.id,
          fundId: fund.id,
          units: purchasedUnitsDecimal,
          totalInvested: amountDecimal,
          averageCostNav: navDecimal,
        },
      });
    }

    // Record Immutable Transaction Log
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

    return {
      membership: {
        ...updatedMembership,
        cashBalance: updatedMembership.cashBalance.toNumber(),
      },
      holding: {
        ...holding,
        units: holding.units.toNumber(),
        totalInvested: holding.totalInvested.toNumber(),
        averageCostNav: holding.averageCostNav.toNumber(),
      },
      transaction: {
        ...transaction,
        units: transaction.units.toNumber(),
        executionNav: transaction.executionNav.toNumber(),
        totalAmount: transaction.totalAmount.toNumber(),
      },
    };
  });

  return {
    success: true,
    message: `Successfully bought ${result.transaction.units.toFixed(4)} units of ${fund.name} for ₹${parsed.amountInRupees.toLocaleString("en-IN")}`,
    data: result,
  };
}
