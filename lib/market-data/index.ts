"use server";

import prisma from "@/lib/db/db";

export async function getMutualFunds() {
	const funds = await prisma.mutualFund.findMany({
		where: { isActive: true },
		orderBy: [{ fundHouse: "asc" }, { name: "asc" }],
		select: {
			id: true,
			schemeCode: true,
			name: true,
			category: true,
			fundHouse: true,
			currentNav: true,
			updatedAt: true,
		},
	});

	return funds.map((fund) => ({
		...fund,
		currentNav: fund.currentNav.toNumber(),
		updatedAt: fund.updatedAt.toISOString(),
	}));
}
