import { NextRequest, NextResponse } from "next/server";

import { loadAnalysis, loadMarketData, saveAccuracyLog } from "@/server/storage/json-store.server";
import { createAccuracyLog } from "@/server/utils/calculate-accuracy.server";

/**
 * POST /api/accuracy/calculate
 * @description 어제의 예측과 오늘의 실제 시장 결과를 비교하여 정확도를 계산합니다.
 *
 * 이 API는:
 * 1. 어제의 분석 결과(예측)를 로드
 * 2. 오늘의 시장 데이터(실제)를 로드
 * 3. 정확도를 계산하고 로그 저장
 * 4. 학습 데이터 업데이트 트리거
 */
export async function POST(request: NextRequest) {
  try {
    console.log("📊 정확도 계산 시작...");

    // 어제 날짜 계산
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // 오늘 날짜
    const today = new Date();

    console.log(`📅 어제: ${yesterday.toISOString().split("T")[0]}`);
    console.log(`📅 오늘: ${today.toISOString().split("T")[0]}`);

    // 1. 어제의 분석 결과 로드 (예측)
    const analysisResult = await loadAnalysis(yesterday);
    if (!analysisResult) {
      return NextResponse.json(
        {
          success: false,
          message: `어제(${yesterday.toISOString().split("T")[0]})의 분석 결과가 없습니다. 먼저 분석을 실행하세요.`,
        },
        { status: 404 },
      );
    }

    console.log(`✅ 어제 분석 결과 로드: 투자 지수 ${analysisResult.investmentIndex}%`);

    // 2. 오늘의 시장 데이터 로드 (실제)
    const marketData = await loadMarketData(today);
    if (!marketData) {
      return NextResponse.json(
        {
          success: false,
          message: `오늘(${today.toISOString().split("T")[0]})의 시장 데이터가 없습니다. 먼저 시장 데이터를 수집하세요.`,
        },
        { status: 404 },
      );
    }

    console.log(`✅ 오늘 시장 데이터 로드`);
    console.log(`  - BTC: ${marketData.crypto.btc}%`);
    console.log(`  - ETH: ${marketData.crypto.eth}%`);
    console.log(`  - KOSPI: ${marketData.stock.kospi}%`);
    console.log(`  - KOSDAQ: ${marketData.stock.kosdaq}%`);

    // 3. 정확도 계산
    const accuracyLog = createAccuracyLog(analysisResult, marketData);

    console.log(`✅ 정확도 계산 완료:`);
    console.log(`  - 정확도: ${accuracyLog.accuracy}%`);
    console.log(`  - 방향 일치: ${accuracyLog.isCorrect ? "✅" : "❌"}`);
    console.log(`  - 오차율: ${accuracyLog.errorRate}%`);

    // 4. 정확도 로그 저장
    const filePath = await saveAccuracyLog(accuracyLog, yesterday);
    console.log(`💾 정확도 로그 저장: ${filePath}`);

    // 5. 학습 데이터 업데이트 트리거 (비동기)
    fetch(`${request.nextUrl.origin}/api/learning/update`, {
      method: "POST",
    }).catch((err) => console.error("학습 데이터 업데이트 실패:", err));

    return NextResponse.json({
      success: true,
      message: "정확도 계산이 완료되었습니다.",
      data: {
        date: accuracyLog.date,
        accuracy: accuracyLog.accuracy,
        isCorrect: accuracyLog.isCorrect,
        errorRate: accuracyLog.errorRate,
        prediction: accuracyLog.prediction,
      },
    });
  } catch (error) {
    console.error("❌ 정확도 계산 실패:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "정확도 계산 중 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}
