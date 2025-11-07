import { NextRequest, NextResponse } from "next/server";

import { analyzeAndCalculate } from "@/server/ai/analyze-and-calculate.server";
import { removeDuplicateNews, scrapeNaverNews } from "@/server/scraper/scraper-naver-news.server";
import { saveNews } from "@/server/storage/json-store.server";

/**
 * Route Segment Config
 * - 빌드 시점에 자동 실행 방지
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/news/scrape-and-analyze
 * @description 당일 뉴스 크롤링 후 AI 분석까지 일괄 수행합니다.
 * @query count? 스크랩할 뉴스 개수(기본 20)
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const countParam = searchParams.get("count");
    const count = countParam ? Math.max(1, Number(countParam)) : 20;

    console.log(`📰 뉴스 수집 시작 (count=${count})...`);

    // 1) 뉴스 스크래핑
    const news = await scrapeNaverNews(count);
    const uniqueNews = removeDuplicateNews(news);

    // 2) 저장
    const filePath = await saveNews(uniqueNews);
    console.log(`✅ 뉴스 저장 완료: ${uniqueNews.length}개 (${filePath})`);

    // 3) 분석 실행
    console.log("🤖 분석 시작...");
    const analysis = await analyzeAndCalculate();

    return NextResponse.json({
      success: true,
      message: "뉴스 수집 및 분석이 완료되었습니다.",
      data: {
        scraped: uniqueNews.length,
        analysis,
      },
    });
  } catch (error) {
    console.error("❌ 뉴스 수집/분석 파이프라인 실패:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "뉴스 수집/분석 중 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}
