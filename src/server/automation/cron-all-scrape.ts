import { analyzeCryptoNews } from "@/server/ai/analyze-crypto-news.server";
import { analyzeNewsArray } from "@/server/ai/sentiment-analyzer.server";
import { removeDuplicateCryptoNews, scrapeBlockmediaNewsWithRetry } from "@/server/scraper/scraper-blockmedia.server";
import { scrapeCryptoMarket } from "@/server/scraper/scraper-coinness.server";
import { removeDuplicateNews, scrapeNaverNews } from "@/server/scraper/scraper-naver-news.server";
import {
  saveCryptoNewsToSupabase,
  saveGeneralNewsToSupabase,
  saveMarketDataToSupabase,
  saveNewsAnalysisToSupabase,
} from "@/server/storage/supabase-store.server";
import "dotenv/config";

async function main() {
  const start = Date.now();
  const today = new Date();

  console.log("\n⏰ 전체 크롤링 작업 시작 (KST)");
  console.log("━".repeat(50));

  try {
    // 1) 네이버 뉴스 수집
    console.log("\n📰 Step A: 네이버 뉴스 크롤링");
    const naverNews = await scrapeNaverNews(20);
    console.log(`✅ 크롤링 완료: ${naverNews.length}건`);
    const uniqueNaver = removeDuplicateNews(naverNews);
    console.log(`🧹 중복 제거 후 ${uniqueNaver.length}/${naverNews.length}건 유지`);

    // 저장
    const savedGeneralCount = await saveGeneralNewsToSupabase(uniqueNaver, today);
    if (savedGeneralCount > 0) {
      // 분석
      const naverAnalysis = await analyzeNewsArray(uniqueNaver);
      await saveNewsAnalysisToSupabase({
        date: today.toISOString().split("T")[0],
        totalNews: naverAnalysis.length,
        investmentIndex: 0,
        summary: {
          positive: naverAnalysis.filter((a) => a.sentiment === "positive").length,
          negative: naverAnalysis.filter((a) => a.sentiment === "negative").length,
          neutral: naverAnalysis.filter((a) => a.sentiment === "neutral").length,
        },
        keywords: [],
        newsAnalysis: naverAnalysis,
        analyzedAt: new Date().toISOString(),
      });
    }

    // 2) 코인니스(시장 데이터)
    console.log("\n📈 Step B: 암호화폐 시장 데이터 수집 (Coinness/Binance)");
    const marketData = await scrapeCryptoMarket();
    console.log(`✅ 시장 데이터: BTC ${marketData.btc}%, ETH ${marketData.eth}%`);
    await saveMarketDataToSupabase(marketData, today);

    // 3) 코인 뉴스(기존) 수집
    console.log("\n📰 Step C: 코인 뉴스(블록미디어) 크롤링");
    const cryptoNews = await scrapeBlockmediaNewsWithRetry(20);
    console.log(`✅ 크롤링 완료: ${cryptoNews.length}건`);
    const uniqueCrypto = removeDuplicateCryptoNews(cryptoNews);
    console.log(`🧹 중복 제거 후 ${uniqueCrypto.length}/${cryptoNews.length}건 유지`);

    const savedCryptoCount = await saveCryptoNewsToSupabase(uniqueCrypto, today);
    if (savedCryptoCount > 0) {
      await analyzeCryptoNews(uniqueCrypto, today);
    }

    const took = Math.round((Date.now() - start) / 1000);
    console.log("━".repeat(50));
    console.log(`🎉 전체 작업 완료 (${took}s)`);
  } catch (error) {
    console.error("❌ 전체 작업 실패:", error);
    process.exitCode = 1;
  }
}

main();
