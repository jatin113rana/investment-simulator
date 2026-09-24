import prisma from "@/lib/db/db";
import Decimal from "decimal.js";

export interface ParsedAMFIRecord {
  schemeCode: string;
  schemeName: string;
  nav: number;
  date: string;
  category: string;
  fundHouse: string;
}

/**
 * Top 20 Curated Indian Mutual Funds for the Investment Simulator
 */
export const CURATED_TOP_MUTUAL_FUNDS = [
  {
    schemeCode: "119060",
    name: "HDFC Index Fund - NIFTY 50 Plan - Direct",
    category: "Equity Scheme - Index Funds",
    fundHouse: "HDFC Mutual Fund",
    fallbackNav: 210.45,
  },
  {
    schemeCode: "122639",
    name: "Parag Parikh Flexi Cap Fund - Direct Plan - Growth",
    category: "Equity Scheme - Flexi Cap Fund",
    fundHouse: "PPFAS Mutual Fund",
    fallbackNav: 82.35,
  },
  {
    schemeCode: "120503",
    name: "SBI Bluechip Fund - Direct Plan - Growth",
    category: "Equity Scheme - Large Cap Fund",
    fundHouse: "SBI Mutual Fund",
    fallbackNav: 89.60,
  },
  {
    schemeCode: "120586",
    name: "ICICI Prudential Technology Fund - Direct Plan - Growth",
    category: "Equity Scheme - Sectoral / Thematic",
    fundHouse: "ICICI Prudential Mutual Fund",
    fallbackNav: 195.10,
  },
  {
    schemeCode: "125354",
    name: "Axis Small Cap Fund - Direct Plan - Growth",
    category: "Equity Scheme - Small Cap Fund",
    fundHouse: "Axis Mutual Fund",
    fallbackNav: 104.75,
  },
  {
    schemeCode: "120716",
    name: "Nippon India Small Cap Fund - Direct Plan - Growth",
    category: "Equity Scheme - Small Cap Fund",
    fundHouse: "Nippon India Mutual Fund",
    fallbackNav: 168.90,
  },
  {
    schemeCode: "118989",
    name: "Mirae Asset Large Cap Fund - Direct Plan - Growth",
    category: "Equity Scheme - Large Cap Fund",
    fundHouse: "Mirae Asset Mutual Fund",
    fallbackNav: 112.40,
  },
  {
    schemeCode: "120492",
    name: "SBI Small Cap Fund - Direct Plan - Growth",
    category: "Equity Scheme - Small Cap Fund",
    fundHouse: "SBI Mutual Fund",
    fallbackNav: 172.15,
  },
  {
    schemeCode: "119825",
    name: "UTI Nifty 50 Index Fund - Direct Plan - Growth",
    category: "Equity Scheme - Index Funds",
    fundHouse: "UTI Mutual Fund",
    fallbackNav: 162.80,
  },
  {
    schemeCode: "120377",
    name: "Kotak Emerging Equity Fund - Direct Plan - Growth",
    category: "Equity Scheme - Mid Cap Fund",
    fundHouse: "Kotak Mahindra Mutual Fund",
    fallbackNav: 124.50,
  },
  {
    schemeCode: "120828",
    name: "DSP Midcap Fund - Direct Plan - Growth",
    category: "Equity Scheme - Mid Cap Fund",
    fundHouse: "DSP Mutual Fund",
    fallbackNav: 118.20,
  },
  {
    schemeCode: "141695",
    name: "Tata Digital India Fund - Direct Plan - Growth",
    category: "Equity Scheme - Sectoral / Thematic",
    fundHouse: "Tata Mutual Fund",
    fallbackNav: 48.90,
  },
  {
    schemeCode: "120166",
    name: "HDFC Mid-Cap Opportunities Fund - Direct Plan - Growth",
    category: "Equity Scheme - Mid Cap Fund",
    fundHouse: "HDFC Mutual Fund",
    fallbackNav: 156.30,
  },
  {
    schemeCode: "120594",
    name: "ICICI Prudential Bluechip Fund - Direct Plan - Growth",
    category: "Equity Scheme - Large Cap Fund",
    fundHouse: "ICICI Prudential Mutual Fund",
    fallbackNav: 108.65,
  },
  {
    schemeCode: "122638",
    name: "Parag Parikh Tax Saver Fund - Direct Plan - Growth",
    category: "Equity Scheme - ELSS",
    fundHouse: "PPFAS Mutual Fund",
    fallbackNav: 31.40,
  },
  {
    schemeCode: "119063",
    name: "HDFC Small Cap Fund - Direct Plan - Growth",
    category: "Equity Scheme - Small Cap Fund",
    fundHouse: "HDFC Mutual Fund",
    fallbackNav: 132.75,
  },
  {
    schemeCode: "120684",
    name: "Quant Small Cap Fund - Direct Plan - Growth",
    category: "Equity Scheme - Small Cap Fund",
    fundHouse: "Quant Mutual Fund",
    fallbackNav: 245.10,
  },
  {
    schemeCode: "119799",
    name: "Motilal Oswal Midcap Fund - Direct Plan - Growth",
    category: "Equity Scheme - Mid Cap Fund",
    fundHouse: "Motilal Oswal Mutual Fund",
    fallbackNav: 98.80,
  },
  {
    schemeCode: "120707",
    name: "Nippon India Growth Fund - Direct Plan - Growth",
    category: "Equity Scheme - Mid Cap Fund",
    fundHouse: "Nippon India Mutual Fund",
    fallbackNav: 310.25,
  },
  {
    schemeCode: "120524",
    name: "SBI Equity Hybrid Fund - Direct Plan - Growth",
    category: "Hybrid Scheme - Aggressive Hybrid Fund",
    fundHouse: "SBI Mutual Fund",
    fallbackNav: 254.60,
  },
];

/**
 * Fetches and parses live daily NAV text feed from AMFI.
 */
export async function fetchLiveAMFINAVs(): Promise<Map<string, { nav: number; date: string }>> {
  const map = new Map<string, { nav: number; date: string }>();

  try {
    const response = await fetch("https://portal.amfiindia.com/spages/NAVAll.txt", {
      next: { revalidate: 3600 },
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    });

    if (!response.ok) {
      console.warn(`AMFI fetch returned HTTP ${response.status}. Using baseline values.`);
      return map;
    }

    const text = await response.text();
    const lines = text.split("\n");

    for (const line of lines) {
      const parts = line.split(";");
      if (parts.length >= 6) {
        const schemeCode = parts[0]?.trim();
        const navStr = parts[4]?.trim();
        const date = parts[5]?.trim();
        const nav = parseFloat(navStr);

        if (schemeCode && !isNaN(nav) && date) {
          map.set(schemeCode, { nav, date });
        }
      }
    }
  } catch (error) {
    console.warn("Failed to fetch live AMFI NAV feed. Using baseline values:", error);
  }

  return map;
}

/**
 * Synchronizes the top curated mutual funds in Neon PostgreSQL database.
 */
export async function syncAMFIMutualFunds() {
  const liveNavs = await fetchLiveAMFINAVs();
  const todayStr = new Date().toISOString().split("T")[0];

  const results = [];

  for (const fund of CURATED_TOP_MUTUAL_FUNDS) {
    const liveData = liveNavs.get(fund.schemeCode);
    const navVal = liveData ? liveData.nav : fund.fallbackNav;
    const dateVal = liveData ? liveData.date : todayStr;

    const navDecimal = new Decimal(navVal);

    // Upsert Mutual Fund record
    const dbFund = await prisma.mutualFund.upsert({
      where: { schemeCode: fund.schemeCode },
      update: {
        currentNav: navDecimal,
        name: fund.name,
        category: fund.category,
        fundHouse: fund.fundHouse,
        isActive: true,
      },
      create: {
        schemeCode: fund.schemeCode,
        name: fund.name,
        category: fund.category,
        fundHouse: fund.fundHouse,
        currentNav: navDecimal,
        isActive: true,
      },
    });

    // Record price history entry
    await prisma.fundPriceHistory.upsert({
      where: {
        schemeCode_date: {
          schemeCode: fund.schemeCode,
          date: dateVal,
        },
      },
      update: {
        nav: navDecimal,
      },
      create: {
        fundId: dbFund.id,
        schemeCode: fund.schemeCode,
        date: dateVal,
        nav: navDecimal,
      },
    });

    results.push({
      id: dbFund.id,
      schemeCode: dbFund.schemeCode,
      name: dbFund.name,
      currentNav: navDecimal.toNumber(),
      date: dateVal,
    });
  }

  return {
    success: true,
    totalFundsSynced: results.length,
    timestamp: new Date().toISOString(),
    funds: results,
  };
}
