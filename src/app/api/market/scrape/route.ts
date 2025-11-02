import { NextRequest, NextResponse } from "next/server";

import { scrapeAllMarketData } from "@/server/scraper/scraper-market.server";
import { saveJson } from "@/server/storage/json-store.server";

/**
 * POST /api/market/scrape
 * @description 암호화폐와 주식 시장 데이터를 수집합니다.
 * 
 * 이 API는:
 * 1. 비트코인, 이더리움 가격 변동률 수집
 * 2. KOSPI, KOSDAQ 지수 변동률 수집
 * 3. 시장 데이터를 JSON 파일로 저장
 */
export async function POST(request: NextRequest) {
  try {
    console.log("📈 시장 데이터 수집 시작...");

    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];

    // 시장 데이터 수집
    const result = await scrapeAllMarketData(today);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "시장 데이터 수집에 실패했습니다.",
          error: result.error,
          partialFailure: result.partialFailure,
        },
        { status: 500 },
      );
    }

    console.log("✅ 시장 데이터 수집 완료");

    // 데이터 저장
    const marketData = {
      date: dateStr,
      crypto: {
        btc: result.data?.crypto.btc || 0,
        eth: result.data?.crypto.eth || 0,
      },
      stock: {
        kospi: result.data?.stock.kospi || 0,
        kosdaq: result.data?.stock.kosdaq || 0,
      },
      collectedAt: new Date().toISOString(),
    };

    const filePath = await saveJson(marketData, "market", `market-${dateStr}.json`);
    console.log(`💾 시장 데이터 저장: ${filePath}`);

    return NextResponse.json({
      success: true,
      message: "시장 데이터 수집이 완료되었습니다.",
      data: marketData,
    });
  } catch (error) {
    console.error("❌ 시장 데이터 수집 실패:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "시장 데이터 수집 중 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}
