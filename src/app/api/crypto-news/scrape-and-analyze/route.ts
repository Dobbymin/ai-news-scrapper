import { NextRequest, NextResponse } from "next/server";

import { analyzeCryptoNews } from "@/server/ai/analyze-crypto-news.server";
import { removeDuplicateCryptoNews, scrapeBlockmediaNews } from "@/server/scraper/scraper-blockmedia.server";
import { scraperLock } from "@/server/scraper/scraper-lock.server";
import { saveCryptoNews } from "@/server/storage/json-store.server";

/**
 * Route Segment Config
 * - dynamic: 'force-dynamic' → 빌드 시점에 평가하지 않고 항상 런타임에만 실행
 * - runtime: 'nodejs' → Node.js 런타임 사용 (Puppeteer 사용을 위해 필요)
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/crypto-news/scrape-and-analyze
 * @description 코인 뉴스 크롤링 후 AI 분석까지 일괄 수행합니다.
 * @query count? 스크랩할 뉴스 개수(기본 20)
 */
export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`\n🔵 [${requestId}] API 요청 시작`);

  // Singleton Lock 획득 시도
  if (!scraperLock.tryAcquire()) {
    console.warn(`🚫 [${requestId}] Lock 획득 실패 - 이미 처리 중`);
    return NextResponse.json(
      {
        success: false,
        error: "이미 크롤링이 진행 중입니다. 잠시 후 다시 시도하세요.",
      },
      { status: 429 },
    );
  }

  console.log(`✅ [${requestId}] Lock 획득 성공 - 처리 시작`);

  try {
    const { searchParams } = new URL(request.url);
    const countParam = searchParams.get("count");
    const count = countParam ? Math.max(1, Number(countParam)) : 20; // 5개 → 20개로 복원

    console.log(`🪙 코인 뉴스 수집 시작 (count=${count})...`);

    // 1) 코인 뉴스 스크래핑
    const news = await scrapeBlockmediaNews(count);
    console.log(`🔍 크롤링된 뉴스 개수: ${news.length}`);

    const uniqueNews = removeDuplicateCryptoNews(news);
    console.log(`🔍 중복 제거 후 뉴스 개수: ${uniqueNews.length}`);

    // 2) 저장
    const filePath = await saveCryptoNews(uniqueNews);
    console.log(`✅ 코인 뉴스 저장 완료: ${uniqueNews.length}개 (${filePath})`);

    // 3) 분석 실행 (크롤링한 뉴스 데이터를 직접 전달)
    console.log(`🤖 [${requestId}] 코인 뉴스 분석 시작...`);
    const analysis = await analyzeCryptoNews(uniqueNews);

    console.log(`✅ [${requestId}] 모든 처리 완료`);

    return NextResponse.json({
      success: true,
      message: "코인 뉴스 수집 및 분석이 완료되었습니다.",
      data: {
        scraped: uniqueNews.length,
        analysis,
      },
    });
  } catch (error) {
    console.error(`❌ [${requestId}] 파이프라인 실패:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "코인 뉴스 수집/분석 중 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  } finally {
    // Lock 해제
    console.log(`🔓 [${requestId}] Lock 해제`);
    scraperLock.release();
  }
}
