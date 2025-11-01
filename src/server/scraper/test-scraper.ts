/**
 * 네이버 뉴스 크롤러 테스트 스크립트
 *
 * 실행 방법:
 * pnpm tsx src/server/scraper/test-scraper.ts
 */
import { saveNews } from "../storage/json-store.server";

import { removeDuplicateNews, scrapeNaverNews } from "./scraper-naver-news.server";

async function main() {
  console.log("=== 네이버 뉴스 크롤러 테스트 시작 ===\n");

  try {
    // 뉴스 수집 (5개만 테스트)
    const news = await scrapeNaverNews(5, (current, total) => {
      console.log(`진행률: ${current}/${total} (${Math.round((current / total) * 100)}%)`);
    });

    console.log("\n=== 크롤링 결과 ===");
    console.log(`총 수집: ${news.length}개`);

    // 중복 제거
    const uniqueNews = removeDuplicateNews(news);
    console.log(`중복 제거 후: ${uniqueNews.length}개\n`);

    // 결과 출력
    uniqueNews.forEach((item, index) => {
      console.log(`\n[${index + 1}] ${item.title}`);
      console.log(`  언론사: ${item.source}`);
      console.log(`  게시: ${item.publishedAt}`);
      console.log(`  URL: ${item.url}`);
      console.log(`  본문: ${item.content.substring(0, 100)}...`);
    });

    // JSON 저장
    console.log("\n=== 파일 저장 중 ===");
    const savedPath = await saveNews(uniqueNews);
    console.log(`저장 완료: ${savedPath}`);

    console.log("\n=== 테스트 성공 ✅ ===");
  } catch (error) {
    console.error("\n=== 테스트 실패 ❌ ===");
    console.error(error);
    process.exit(1);
  }
}

main();
