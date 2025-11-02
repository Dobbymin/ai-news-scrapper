import { NextRequest, NextResponse } from "next/server";

import { loadLatestAnalysis } from "@/server/storage/json-store.server";
import { getInvestmentGrade, getInvestmentRecommendation } from "@/server/utils/calculate-investment-index.server";

/**
 * GET /api/analysis/latest
 * @description 가장 최근 분석 결과를 반환
 */
export async function GET(request: NextRequest) {
  try {
    const analysis = await loadLatestAnalysis();

    if (!analysis) {
      return NextResponse.json({ error: "분석 데이터를 찾을 수 없습니다." }, { status: 404 });
    }

    // grade와 recommendation 추가
    const grade = getInvestmentGrade(analysis.investmentIndex);
    const recommendation = getInvestmentRecommendation(analysis.investmentIndex);

    return NextResponse.json({
      ...analysis,
      grade,
      recommendation,
    });
  } catch (error) {
    console.error("분석 데이터 로드 실패:", error);
    return NextResponse.json({ error: "분석 데이터를 불러오는 중 오류가 발생했습니다." }, { status: 500 });
  }
}
