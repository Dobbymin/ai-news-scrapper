/**
 * 시장 데이터 크롤러 통합 테스트 스크립트
 *
 * 실행 방법:
 * pnpm tsx src/server/scraper/test-market-scraper.ts
 */
import { printCryptoSummary, scrapeCryptoMarket } from "./scraper-coinness.server";
import { collectAndSaveMarketData, printMarketSummary, scrapeAllMarketData } from "./scraper-market.server";
import { printStockSummary, scrapeStockMarket } from "./scraper-naver-finance.server";

async function testCryptoScraper() {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🧪 암호화폐 크롤러 단독 테스트");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  try {
    const cryptoData = await scrapeCryptoMarket();
    printCryptoSummary(cryptoData);
    console.log("✅ 암호화폐 크롤러 테스트 성공\n");
    return true;
  } catch (error) {
    console.error("❌ 암호화폐 크롤러 테스트 실패:", error);
    return false;
  }
}

async function testStockScraper() {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🧪 주식 시장 크롤러 단독 테스트");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  try {
    const stockData = await scrapeStockMarket();
    printStockSummary(stockData);
    console.log("✅ 주식 시장 크롤러 테스트 성공\n");
    return true;
  } catch (error) {
    console.error("❌ 주식 시장 크롤러 테스트 실패:", error);
    return false;
  }
}

async function testIntegratedScraper() {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🧪 통합 크롤러 테스트");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  try {
    const result = await scrapeAllMarketData();

    if (!result.success || !result.data) {
      throw new Error(result.error || "데이터 수집 실패");
    }

    // 부분 실패 경고
    if (result.partialFailure) {
      console.warn("⚠️  부분 실패 발생:");
      if (result.partialFailure.crypto) {
        console.warn("  - 암호화폐 데이터 수집 실패");
      }
      if (result.partialFailure.stock) {
        console.warn("  - 주식 데이터 수집 실패");
      }
      console.log("");
    }

    // 결과 출력
    printMarketSummary(result.data);

    console.log("✅ 통합 크롤러 테스트 성공\n");
    return true;
  } catch (error) {
    console.error("❌ 통합 크롤러 테스트 실패:", error);
    return false;
  }
}

async function testSaveMarketData() {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🧪 시장 데이터 저장 테스트");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  try {
    const filePath = await collectAndSaveMarketData();
    console.log(`📁 저장된 파일: ${filePath}`);
    console.log("✅ 데이터 저장 테스트 성공\n");
    return true;
  } catch (error) {
    console.error("❌ 데이터 저장 테스트 실패:", error);
    return false;
  }
}

async function main() {
  console.log("\n╔════════════════════════════════════════════╗");
  console.log("║  시장 데이터 크롤러 통합 테스트 시작      ║");
  console.log("╚════════════════════════════════════════════╝\n");

  const results = {
    crypto: false,
    stock: false,
    integrated: false,
    save: false,
  };

  // 1. 암호화폐 크롤러 테스트
  results.crypto = await testCryptoScraper();

  // 2. 주식 시장 크롤러 테스트
  results.stock = await testStockScraper();

  // 3. 통합 크롤러 테스트
  results.integrated = await testIntegratedScraper();

  // 4. 저장 테스트
  if (results.integrated) {
    results.save = await testSaveMarketData();
  }

  // 최종 결과
  console.log("\n╔════════════════════════════════════════════╗");
  console.log("║           테스트 결과 요약                 ║");
  console.log("╚════════════════════════════════════════════╝\n");
  console.log(`암호화폐 크롤러: ${results.crypto ? "✅ 성공" : "❌ 실패"}`);
  console.log(`주식 시장 크롤러: ${results.stock ? "✅ 성공" : "❌ 실패"}`);
  console.log(`통합 크롤러: ${results.integrated ? "✅ 성공" : "❌ 실패"}`);
  console.log(`데이터 저장: ${results.save ? "✅ 성공" : "❌ 실패"}`);

  const allSuccess = Object.values(results).every((r) => r);

  if (allSuccess) {
    console.log("\n🎉 모든 테스트 성공!\n");
    process.exit(0);
  } else {
    console.log("\n⚠️  일부 테스트 실패\n");
    process.exit(1);
  }
}

main();
