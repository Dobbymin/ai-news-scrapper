/**
 * 전체 크롤링 시스템 통합 테스트
 *
 * 모든 크롤러를 순차적으로 실행하고 성능을 측정합니다.
 *
 * 실행 방법:
 * pnpm tsx src/server/scraper/test-all-scrapers.ts
 */
import { saveNews } from "../storage/json-store.server";

import { collectAndSaveMarketData, printMarketSummary, scrapeAllMarketData } from "./scraper-market.server";
import { removeDuplicateNews, scrapeNaverNews } from "./scraper-naver-news.server";

interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  error?: string;
  dataCount?: number;
}

/**
 * 시간 측정 유틸리티
 */
function measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
  return new Promise(async (resolve, reject) => {
    const startTime = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      resolve({ result, duration });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * 네이버 뉴스 크롤러 테스트
 */
async function testNewsScraper(): Promise<TestResult> {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📰 네이버 뉴스 크롤러 테스트");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  try {
    const { result: news, duration } = await measureTime(async () => {
      return await scrapeNaverNews(20, (current, total) => {
        if (current % 5 === 0 || current === total) {
          console.log(`  진행률: ${current}/${total} (${Math.round((current / total) * 100)}%)`);
        }
      });
    });

    const uniqueNews = removeDuplicateNews(news);
    await saveNews(uniqueNews);

    console.log(`\n✅ 수집: ${uniqueNews.length}개`);
    console.log(`⏱️  소요 시간: ${(duration / 1000).toFixed(2)}초`);

    return {
      name: "네이버 뉴스",
      success: true,
      duration,
      dataCount: uniqueNews.length,
    };
  } catch (error) {
    console.error("❌ 실패:", error);
    return {
      name: "네이버 뉴스",
      success: false,
      duration: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * 시장 데이터 크롤러 테스트
 */
async function testMarketScraper(): Promise<TestResult> {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 시장 데이터 크롤러 테스트");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  try {
    const { result, duration } = await measureTime(async () => {
      return await scrapeAllMarketData();
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || "시장 데이터 수집 실패");
    }

    if (result.partialFailure) {
      console.warn("⚠️  부분 실패 발생");
    }

    printMarketSummary(result.data);

    console.log(`⏱️  소요 시간: ${(duration / 1000).toFixed(2)}초`);

    return {
      name: "시장 데이터",
      success: true,
      duration,
      dataCount: 1,
    };
  } catch (error) {
    console.error("❌ 실패:", error);
    return {
      name: "시장 데이터",
      success: false,
      duration: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * 전체 통합 테스트
 */
async function runIntegratedTest() {
  console.log("\n╔════════════════════════════════════════════╗");
  console.log("║   전체 크롤링 시스템 통합 테스트          ║");
  console.log("╚════════════════════════════════════════════╝\n");
  console.log("🎯 목표: 전체 프로세스 5분 이내 완료\n");

  const results: TestResult[] = [];
  const overallStart = Date.now();

  // 1. 네이버 뉴스 크롤러
  const newsResult = await testNewsScraper();
  results.push(newsResult);

  // 2. 시장 데이터 크롤러
  const marketResult = await testMarketScraper();
  results.push(marketResult);

  const overallDuration = Date.now() - overallStart;

  // 결과 요약
  console.log("\n╔════════════════════════════════════════════╗");
  console.log("║           테스트 결과 요약                 ║");
  console.log("╚════════════════════════════════════════════╝\n");

  results.forEach((result) => {
    const status = result.success ? "✅" : "❌";
    const time = (result.duration / 1000).toFixed(2);
    const count = result.dataCount ? ` (${result.dataCount}개)` : "";

    console.log(`${status} ${result.name}: ${time}초${count}`);
    if (result.error) {
      console.log(`   └─ 에러: ${result.error}`);
    }
  });

  console.log(`\n⏱️  전체 소요 시간: ${(overallDuration / 1000).toFixed(2)}초`);

  const targetTime = 5 * 60 * 1000; // 5분
  if (overallDuration <= targetTime) {
    console.log(`🎉 목표 달성! (목표: ${targetTime / 1000}초 이내)`);
  } else {
    console.log(`⚠️  목표 미달성 (목표: ${targetTime / 1000}초, 실제: ${(overallDuration / 1000).toFixed(2)}초)`);
  }

  // 성능 분석
  console.log("\n📊 성능 분석:");
  console.log(
    `   - 뉴스 크롤링 속도: ${newsResult.success && newsResult.dataCount ? (newsResult.dataCount / (newsResult.duration / 1000)).toFixed(2) : 0}개/초`,
  );
  console.log(`   - 평균 처리 시간: ${(overallDuration / results.length / 1000).toFixed(2)}초`);

  // 성공률
  const successCount = results.filter((r) => r.success).length;
  const successRate = ((successCount / results.length) * 100).toFixed(0);
  console.log(`   - 성공률: ${successRate}% (${successCount}/${results.length})`);

  // 최종 판정
  const allSuccess = results.every((r) => r.success);

  if (allSuccess && overallDuration <= targetTime) {
    console.log("\n🎉 전체 테스트 성공! 모든 목표 달성!\n");
    return 0;
  } else if (allSuccess) {
    console.log("\n✅ 모든 크롤러 성공, 하지만 성능 목표 미달성\n");
    return 0;
  } else {
    console.log("\n❌ 일부 테스트 실패\n");
    return 1;
  }
}

/**
 * 메인 실행
 */
async function main() {
  try {
    const exitCode = await runIntegratedTest();
    process.exit(exitCode);
  } catch (error) {
    console.error("\n💥 치명적 오류:", error);
    process.exit(1);
  }
}

main();
