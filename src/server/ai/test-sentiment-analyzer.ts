/**
 * 감성 분석기 테스트 스크립트
 *
 * 실행 방법:
 * pnpm tsx src/server/ai/test-sentiment-analyzer.ts
 */
import type { AnalysisProgress } from "@/entities/analysis";

import { loadNews } from "../storage/json-store.server";

import {
  analyzeNewsArray,
  analyzeSingleNews,
  extractTopKeywords,
  summarizeAnalysis,
} from "./sentiment-analyzer.server";

/**
 * 시간 측정 헬퍼
 */
function measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; time: number }> {
  return new Promise(async (resolve) => {
    const start = Date.now();
    const result = await fn();
    const time = Date.now() - start;
    resolve({ result, time });
  });
}

/**
 * 단일 뉴스 분석 테스트
 */
async function testSingleNewsAnalysis() {
  console.log("\n🧪 테스트 1: 단일 뉴스 분석");
  console.log("━".repeat(50));

  try {
    // 최신 뉴스 로드
    const newsList = await loadNews();

    if (newsList.length === 0) {
      console.log("❌ 저장된 뉴스가 없습니다. 먼저 뉴스 크롤링을 실행하세요.");
      return false;
    }

    const testNews = newsList[0];
    console.log(`📰 테스트 뉴스: ${testNews.title}`);

    // 분석 실행
    const { result, time } = await measureTime(() => analyzeSingleNews(testNews));

    console.log("\n📊 분석 결과:");
    console.log(`  - 감성: ${result.sentiment}`);
    console.log(`  - 신뢰도: ${result.confidence}%`);
    console.log(`  - 키워드: ${result.keywords.join(", ")}`);
    console.log(`  - 이유: ${result.reason}`);
    console.log(`  - 소요 시간: ${(time / 1000).toFixed(2)}초`);

    return true;
  } catch (error) {
    console.error("❌ 단일 뉴스 분석 실패:", error);
    return false;
  }
}

/**
 * 배치 뉴스 분석 테스트
 */
async function testBatchNewsAnalysis() {
  console.log("\n🧪 테스트 2: 배치 뉴스 분석");
  console.log("━".repeat(50));

  try {
    // 최신 뉴스 로드 (최대 5개)
    const allNews = await loadNews();
    const newsList = allNews.slice(0, 5);

    console.log(`📰 테스트 뉴스: ${newsList.length}개`);

    // 진행 상황 콜백
    const onProgress = (progress: AnalysisProgress) => {
      console.log(
        `⏳ 진행 중: ${progress.current}/${progress.total} (${progress.percentage}%) - ${progress.currentTitle?.substring(0, 30)}...`,
      );
    };

    // 배치 분석 실행
    const { result, time } = await measureTime(() => analyzeNewsArray(newsList, onProgress));

    // 결과 요약
    const summary = summarizeAnalysis(result);
    const topKeywords = extractTopKeywords(result);

    console.log("\n📊 분석 결과 요약:");
    console.log(`  - 총 뉴스: ${result.length}개`);
    console.log(`  - 긍정: ${summary.positive}개 (${((summary.positive / result.length) * 100).toFixed(1)}%)`);
    console.log(`  - 부정: ${summary.negative}개 (${((summary.negative / result.length) * 100).toFixed(1)}%)`);
    console.log(`  - 중립: ${summary.neutral}개 (${((summary.neutral / result.length) * 100).toFixed(1)}%)`);
    console.log(`  - 주요 키워드: ${topKeywords.join(", ")}`);
    console.log(`  - 총 소요 시간: ${(time / 1000).toFixed(2)}초`);
    console.log(`  - 평균 분석 시간: ${(time / result.length / 1000).toFixed(2)}초/뉴스`);

    // 개별 결과 출력
    console.log("\n📋 개별 분석 결과:");
    result.forEach((analysis, index) => {
      const news = newsList.find((n) => n.id === analysis.newsId);
      console.log(`\n[${index + 1}] ${news?.title || "Unknown"}`);
      console.log(`    감성: ${analysis.sentiment} (${analysis.confidence}%)`);
      console.log(`    키워드: ${analysis.keywords.join(", ")}`);
    });

    return true;
  } catch (error) {
    console.error("❌ 배치 뉴스 분석 실패:", error);
    return false;
  }
}

/**
 * 메인 테스트 실행
 */
async function main() {
  console.log("🚀 감성 분석기 테스트 시작");
  console.log("━".repeat(50));

  // API 키 확인
  if (!process.env.GEMINI_API_KEY) {
    console.error("\n❌ GEMINI_API_KEY가 설정되지 않았습니다.");
    console.error("📝 .env.local 파일에 API 키를 추가하세요:");
    console.error("   GEMINI_API_KEY=your_api_key_here");
    console.error("\n📌 API 키 발급: https://makersuite.google.com/app/apikey");
    process.exit(1);
  }

  const results = {
    test1: false,
    test2: false,
  };

  // 테스트 1: 단일 뉴스 분석
  results.test1 = await testSingleNewsAnalysis();

  // 1초 대기
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 테스트 2: 배치 뉴스 분석
  results.test2 = await testBatchNewsAnalysis();

  // 최종 결과
  console.log("\n" + "━".repeat(50));
  console.log("🏁 테스트 완료");
  console.log("━".repeat(50));
  console.log(`✅ 단일 뉴스 분석: ${results.test1 ? "성공" : "실패"}`);
  console.log(`✅ 배치 뉴스 분석: ${results.test2 ? "성공" : "실패"}`);

  const successCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;

  console.log(`\n📊 성공률: ${successCount}/${totalCount} (${((successCount / totalCount) * 100).toFixed(1)}%)`);

  if (successCount === totalCount) {
    console.log("🎉 모든 테스트 통과!");
  } else {
    console.log("⚠️  일부 테스트 실패");
    process.exit(1);
  }
}

// 테스트 실행
main().catch((error) => {
  console.error("💥 예상치 못한 오류:", error);
  process.exit(1);
});
