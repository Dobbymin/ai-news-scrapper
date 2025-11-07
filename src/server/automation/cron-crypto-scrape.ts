/**
 * 매일 10시(KST) 자동 실행되는 코인 뉴스 크롤링 + 분석 러너
 * - GitHub Actions에서 tsx로 실행됩니다.
 * - 결과는 Supabase 데이터베이스에 저장됩니다.
 */
import "dotenv/config";

import { analyzeCryptoNews } from "../ai/analyze-crypto-news.server";
import { removeDuplicateCryptoNews, scrapeBlockmediaNewsWithRetry } from "../scraper/scraper-blockmedia.server";
import { saveCryptoNewsToSupabase } from "../storage/supabase-store.server";

async function main() {
  const start = Date.now();
  const today = new Date();

  console.log("\n⏰ 코인 뉴스 자동 크롤링 작업 시작 (KST)");
  console.log("━".repeat(50));

  try {
    // 1) 크롤링 (재시도 포함)
    console.log("\n📰 Step 1: 블록미디어 크롤링");
    const news = await scrapeBlockmediaNewsWithRetry(20);
    if (news.length === 0) {
      console.warn("⚠️  수집된 뉴스가 없습니다. 작업을 종료합니다.");
      return;
    }

    // 2) 중복 제거
    const uniqueNews = removeDuplicateCryptoNews(news);
    console.log(`🧹 중복 제거 후 ${uniqueNews.length}/${news.length}건 유지`);

    // 3) Supabase에 저장
    console.log("\n💾 Step 2: Supabase에 뉴스 저장");
    const savedCount = await saveCryptoNewsToSupabase(uniqueNews, today);
    console.log(`✅ 저장 완료: ${savedCount}건`);

    // 4) 분석 (크롤링한 데이터를 바로 전달하여 I/O 최소화)
    console.log("\n📊 Step 3: 감성 분석 실행");
    const result = await analyzeCryptoNews(uniqueNews, today);
    console.log(`✅ 분석 완료: 총 ${result.totalNews}건, 투자 지수 ${result.investmentIndex}%`);

    const took = Math.round((Date.now() - start) / 1000);
    console.log("━".repeat(50));
    console.log(`🎉 작업 완료 (${took}s)`);
  } catch (error) {
    console.error("❌ 작업 실패:", error);
    process.exitCode = 1;
  }
}

main();
