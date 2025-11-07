import { NextRequest, NextResponse } from "next/server";

import {
  loadCryptoAnalysisFromSupabase,
  loadCryptoNewsFromSupabase,
} from "@/server/storage/supabase-store.server";
import {
  calculateInvestmentIndex,
  getInvestmentGrade,
  getInvestmentRecommendation,
} from "@/server/utils/calculate-investment-index.server";

/**
 * GET /api/crypto-news/latest
 * @description 가장 최근의 코인 뉴스와 분석 결과를 반환합니다.
 */
export async function GET(request: NextRequest) {
  try {
    const today = new Date();

    // 1) 코인 뉴스 로드 (Supabase)
    const news = await loadCryptoNewsFromSupabase(today);

    // 2) 분석 결과 로드 (Supabase)
    const analysis = await loadCryptoAnalysisFromSupabase(today);

    if (!analysis) {
      return NextResponse.json(
        {
          success: false,
          message: "분석 결과가 없습니다. 먼저 코인 뉴스 분석을 실행하세요.",
        },
        { status: 404 },
      );
    }

    // 3) 투자 지수 기반 등급 및 추천 계산
    const grade = getInvestmentGrade(analysis.investmentIndex);
    const recommendation = getInvestmentRecommendation(analysis.investmentIndex);

    return NextResponse.json({
      success: true,
      data: {
        news,
        analysis: {
          ...analysis,
          grade,
          recommendation,
        },
      },
    });
  } catch (error) {
    console.error("❌ 최신 코인 뉴스 조회 실패:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "코인 뉴스 조회 중 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}
