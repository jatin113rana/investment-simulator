"use server";

import prisma from "@/lib/db/db";
import { syncCurrentUser } from "@/lib/auth/user-sync";
import { sellOrderSchema, SellOrderInput } from "@/lib/validation/trade";
import { TransactionType } from "@prisma/client";
import Decimal from "decimal.js";

/**
 * Server Action: Executes an atomic Virtual Sell Order for a Mutual Fund.
 * All mathematical operations use Decimal.js for exact financial accuracy.
 */
export async function executeSellOrder(input: SellOrderInput) {
  const dbUser = await syncCurrentUser();
  if (!dbUser) {
    throw new Error("Unauthorized: Active session required.");
  }

  const parsed = sellOrderSchema.parse(input);

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

  // 2. Validate Target Mutual Fund & Holding Units
  const fund = await prisma.mutualFund.findUnique({
    where: { id: parsed.fundId },
  });

  if (!fund || !fund.isActive) {
    throw new Error("Selected mutual fund is not available for trading.");
  }

  const holding = await prisma.holding.findUnique({
    where: {
      membershipId_fundId: {
        membershipId: membership.id,
        fundId: fund.id,
      },
    },
  });

  const unitsToSellDecimal = new Decimal(parsed.unitsToSell);

  if (!holding || new Decimal(holding.units).lessThan(unitsToSellDecimal)) {
    const availableUnits = holding ? new Decimal(holding.units).toNumber() : 0;
    throw new Error(
      `Insufficient holding units. Available: ${availableUnits.toFixed(4)}, Requested: ${unitsToSellDecimal.toNumber().toFixed(4)}`
    );
  }

  const navDecimal = new Decimal(fund.currentNav);
  const totalProceedsDecimal = unitsToSellDecimal.mul(navDecimal);

  // 3. Execute Atomic Database Transaction
  const result = await prisma.$transaction(async (tx) => {
    // Add sales proceeds back to virtual cash balance
    const updatedMembership = await tx.classroomMembership.update({
      where: { id: membership.id },
      data: {
        cashBalance: new Decimal(membership.cashBalance).add(totalProceedsDecimal),
      },
    });

    const currentUnits = new Decimal(holding.units);
    const remainingUnits = currentUnits.sub(unitsToSellDecimal);

    let updatedHolding = null;

    if (remainingUnits.lessThanOrEqualTo(0.0001)) {
      // Remove holding if completely liquidated
      await tx.holding.delete({
        where: { id: holding.id },
      });
    } else {
      const avgCostNav = new Decimal(holding.averageCostNav);
      const newTotalInvested = remainingUnits.mul(avgCostNav);

      updatedHolding = await tx.holding.update({
        where: { id: holding.id },
        data: {
          units: remainingUnits,
          totalInvested: newTotalInvested,
        },
      });
    }

    // Record Immutable Transaction Log
    const transaction = await tx.transaction.create({
      data: {
        membershipId: membership.id,
        fundId: fund.id,
        type: TransactionType.SELL,
        units: unitsToSellDecimal,
        executionNav: navDecimal,
        totalAmount: totalProceedsDecimal,
      },
    });

    return {
      membership: {
        ...updatedMembership,
        cashBalance: updatedMembership.cashBalance.toNumber(),
      },
      holding: updatedHolding
        ? {
            ...updatedHolding,
            units: updatedHolding.units.toNumber(),
            totalInvested: updatedHolding.totalInvested.toNumber(),
            averageCostNav: updatedHolding.averageCostNav.toNumber(),
          }
        : null,
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
    message: `Successfully sold ${parsed.unitsToSell.toFixed(4)} units of ${fund.name} for ₹${totalProceedsDecimal.toNumber().toLocaleString("en-IN")}`,
    data: result,
  };
}
