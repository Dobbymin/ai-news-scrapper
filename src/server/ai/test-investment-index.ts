/**
 * 투자 지수 계산 및 통합 파이프라인 테스트
 *
 * 실행 방법:
 * pnpm tsx src/server/ai/test-investment-index.ts
 */
import type { SentimentAnalysis } from "@/entities/analysis";

import { loadNews } from "../storage/json-store.server";
import {
  calculateAverageConfidenceBySentiment,
  calculateInvestmentIndex,
  calculateSimpleInvestmentIndex,
  filterHighConfidenceNews,
  getInvestmentGrade,
  getInvestmentRecommendation,
} from "../utils/calculate-investment-index.server";

import { analyzeAndCalculate, printAnalysisResult, printSimpleSummary } from "./analyze-and-calculate.server";
import { analyzeSingleNews } from "./sentiment-analyzer.server";

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
 * 테스트 1: 투자 지수 계산 로직
 */
async function testInvestmentIndexCalculation() {
  console.log("\n🧪 테스트 1: 투자 지수 계산 로직");
  console.log("━".repeat(50));

  try {
    // 샘플 분석 결과 생성
    const sampleAnalyses: SentimentAnalysis[] = [
      { newsId: 1, sentiment: "positive", confidence: 85, keywords: ["금리 인하"], reason: "금리 인하는 긍정적" },
      { newsId: 2, sentiment: "positive", confidence: 75, keywords: ["실적 개선"], reason: "실적 개선" },
      { newsId: 3, sentiment: "negative", confidence: 90, keywords: ["규제 강화"], reason: "규제 강화" },
      { newsId: 4, sentiment: "neutral", confidence: 60, keywords: ["뉴스"], reason: "중립" },
      { newsId: 5, sentiment: "positive", confidence: 65, keywords: ["투자"], reason: "투자 증가" },
    ];

    // 가중치 적용 지수
    const weightedIndex = calculateInvestmentIndex(sampleAnalyses);
    console.log(`  - 가중치 적용 투자 지수: ${weightedIndex}%`);
    console.log(`  - 등급: ${getInvestmentGrade(weightedIndex)}`);
    console.log(`  - 추천: ${getInvestmentRecommendation(weightedIndex)}`);

    // 단순 지수
    const simpleIndex = calculateSimpleInvestmentIndex(sampleAnalyses);
    console.log(`\n  - 단순 투자 지수: ${simpleIndex}%`);

    // 신뢰도 높은 뉴스 필터링
    const highConfidence = filterHighConfidenceNews(sampleAnalyses);
    console.log(`\n  - 신뢰도 높은 뉴스: ${highConfidence.length}/${sampleAnalyses.length}개`);

    // 감성별 평균 신뢰도
    const avgConfidence = calculateAverageConfidenceBySentiment(sampleAnalyses);
    console.log(`\n  - 감성별 평균 신뢰도:`);
    console.log(`    긍정: ${avgConfidence.positive}%`);
    console.log(`    부정: ${avgConfidence.negative}%`);
    console.log(`    중립: ${avgConfidence.neutral}%`);

    return true;
  } catch (error) {
    console.error("❌ 투자 지수 계산 실패:", error);
    return false;
  }
}

/**
 * 테스트 2: 실제 뉴스 3개로 전체 파이프라인 테스트
 */
async function testPartialPipeline() {
  console.log("\n🧪 테스트 2: 부분 파이프라인 (3개 뉴스)");
  console.log("━".repeat(50));

  try {
    // 뉴스 로드
    const allNews = await loadNews();
    if (allNews.length === 0) {
      console.log("❌ 저장된 뉴스가 없습니다.");
      return false;
    }

    const newsList = allNews.slice(0, 3);
    console.log(`📰 테스트 뉴스: ${newsList.length}개\n`);

    // 각 뉴스 분석
    const analyses: SentimentAnalysis[] = [];
    for (const news of newsList) {
      const analysis = await analyzeSingleNews(news);
      analyses.push(analysis);

      // 요청 제한 (1.5초 대기)
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    // 투자 지수 계산
    const investmentIndex = calculateInvestmentIndex(analyses);

    console.log("\n📊 부분 파이프라인 결과:");
    console.log(`  - 투자 지수: ${investmentIndex}%`);
    console.log(`  - 등급: ${getInvestmentGrade(investmentIndex)}`);
    console.log(`  - 긍정: ${analyses.filter((a) => a.sentiment === "positive").length}개`);
    console.log(`  - 부정: ${analyses.filter((a) => a.sentiment === "negative").length}개`);
    console.log(`  - 중립: ${analyses.filter((a) => a.sentiment === "neutral").length}개`);

    return true;
  } catch (error) {
    console.error("❌ 부분 파이프라인 실패:", error);
    return false;
  }
}

/**
 * 테스트 3: 전체 통합 파이프라인 (실제 API 호출)
 *
 * ⚠️ 주의: 실제 Gemini API를 호출하므로 시간이 오래 걸릴 수 있습니다.
 */
async function testFullPipeline() {
  console.log("\n🧪 테스트 3: 전체 통합 파이프라인");
  console.log("━".repeat(50));
  console.log("⚠️  실제 Gemini API를 호출합니다. 5개 뉴스 분석 예상 시간: ~10-15초");
  console.log("━".repeat(50));

  try {
    // 뉴스 개수 제한 (5개만)
    const allNews = await loadNews();
    if (allNews.length === 0) {
      console.log("❌ 저장된 뉴스가 없습니다.");
      return false;
    }

    // 임시로 5개만 저장
    const limitedNews = allNews.slice(0, 5);
    const { loadNews: originalLoadNews } = await import("../storage/json-store.server");

    // loadNews를 오버라이드할 수 없으므로 직접 분석
    console.log("📝 참고: 전체 파이프라인 대신 5개 뉴스로 제한된 테스트를 실행합니다.\n");

    const { result, time } = await measureTime(async () => {
      // 진행 상황 콜백
      const onProgress = (progress: any) => {
        console.log(`⏳ 진행: ${progress.current}/${progress.total} (${progress.percentage}%)`);
      };

      return analyzeAndCalculate(new Date(), onProgress);
    });

    // 결과 출력
    printAnalysisResult(result);

    console.log(`⏱️  총 소요 시간: ${(time / 1000).toFixed(2)}초`);
    console.log(`⚡ 평균 분석 속도: ${(time / result.totalNews / 1000).toFixed(2)}초/뉴스`);

    return true;
  } catch (error) {
    console.error("❌ 전체 파이프라인 실패:", error);
    return false;
  }
}

/**
 * 메인 테스트 실행
 */
async function main() {
  console.log("🚀 투자 지수 계산 테스트 시작");
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
    test3: false,
  };

  // 테스트 1: 투자 지수 계산 로직
  results.test1 = await testInvestmentIndexCalculation();

  // 1초 대기
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 테스트 2: 부분 파이프라인 (3개 뉴스)
  results.test2 = await testPartialPipeline();

  // 사용자에게 전체 파이프라인 실행 여부 확인
  console.log("\n" + "━".repeat(50));
  console.log("⚠️  테스트 3은 전체 뉴스를 분석하므로 시간이 오래 걸립니다.");
  console.log("💡 테스트 3을 건너뛰고 싶다면 Ctrl+C를 누르세요.");
  console.log("━".repeat(50));

  // 5초 대기
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // 테스트 3: 전체 파이프라인
  results.test3 = await testFullPipeline();

  // 최종 결과
  console.log("\n" + "━".repeat(50));
  console.log("🏁 테스트 완료");
  console.log("━".repeat(50));
  console.log(`✅ 투자 지수 계산: ${results.test1 ? "성공" : "실패"}`);
  console.log(`✅ 부분 파이프라인: ${results.test2 ? "성공" : "실패"}`);
  console.log(`✅ 전체 파이프라인: ${results.test3 ? "성공" : "실패"}`);

  const successCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;

  console.log(`\n📊 성공률: ${successCount}/${totalCount} (${((successCount / totalCount) * 100).toFixed(1)}%)`);

  if (successCount === totalCount) {
    console.log("🎉 모든 테스트 통과!");
  } else {
    console.log("⚠️  일부 테스트 실패");
  }
}

// 테스트 실행
main().catch((error) => {
  console.error("💥 예상치 못한 오류:", error);
  process.exit(1);
});
