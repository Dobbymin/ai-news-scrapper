import { NextRequest, NextResponse } from "next/server";

import { analyzeAndCalculate } from "@/server/ai/analyze-and-calculate.server";

/**
 * POST /api/analyze/run
 * @description 뉴스 수집 및 AI 분석 실행
 */
export async function POST(request: NextRequest) {
  try {
    console.log("🚀 뉴스 분석 시작...");

    // 분석 실행
    const result = await analyzeAndCalculate();

    return NextResponse.json({
      success: true,
      message: "분석이 완료되었습니다.",
      data: result,
    });
  } catch (error) {
    console.error("❌ 분석 실행 실패:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "분석 실행 중 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}
