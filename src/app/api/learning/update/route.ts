import { NextRequest, NextResponse } from "next/server";

import { loadAllAccuracyLogs, loadAnalysis, saveLearningData } from "@/server/storage/json-store.server";
import { createLearningData } from "@/server/utils/learning-data.server";

/**
 * Route Segment Config
 * - 빌드 시점에 자동 실행 방지
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/learning/update
 * @description 학습 데이터를 자동으로 생성하고 업데이트합니다.
 *
 * 이 API는:
 * 1. 모든 정확도 로그를 로드
 * 2. 각 로그에 해당하는 분석 결과를 로드
 * 3. 성공/실패 패턴을 분석하여 학습 데이터 생성
 * 4. 학습 데이터를 저장
 */
export async function POST(request: NextRequest) {
  try {
    console.log("🧠 학습 데이터 업데이트 시작...");

    // 1. 모든 정확도 로그 로드
    const accuracyLogs = await loadAllAccuracyLogs();

    if (accuracyLogs.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "정확도 로그가 없습니다. 먼저 정확도 검증을 실행하세요.",
        },
        { status: 404 },
      );
    }

    console.log(`📊 ${accuracyLogs.length}개의 정확도 로그 발견`);

    // 2. 각 로그에 해당하는 분석 결과 로드
    const analysisResults = [];
    for (const log of accuracyLogs) {
      const dateObj = new Date(log.date);
      const analysis = await loadAnalysis(dateObj);
      if (analysis) {
        analysisResults.push(analysis);
      }
    }

    console.log(`📊 ${analysisResults.length}개의 분석 결과 로드`);

    if (analysisResults.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "분석 결과가 없습니다.",
        },
        { status: 404 },
      );
    }

    // 3. 학습 데이터 생성
    const learningData = createLearningData(accuracyLogs, analysisResults);

    console.log(`✅ 학습 데이터 생성 완료:`);
    console.log(`  - 총 사례: ${learningData.totalCases}개`);
    console.log(`  - 성공 사례: ${learningData.successCases.length}개`);
    console.log(`  - 실패 사례: ${learningData.failureCases.length}개`);

    // 4. 학습 데이터 저장
    const filePath = await saveLearningData(learningData);
    console.log(`💾 학습 데이터 저장: ${filePath}`);

    return NextResponse.json({
      success: true,
      message: "학습 데이터가 업데이트되었습니다.",
      data: {
        totalCases: learningData.totalCases,
        successCases: learningData.successCases.length,
        failureCases: learningData.failureCases.length,
        averageAccuracy: learningData.summary.avgAccuracy,
        directionMatchRate: learningData.summary.directionAccuracy,
      },
    });
  } catch (error) {
    console.error("❌ 학습 데이터 업데이트 실패:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "학습 데이터 업데이트 중 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}
