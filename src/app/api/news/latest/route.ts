import { NextRequest, NextResponse } from "next/server";
import { loadNews } from "@/server/storage/json-store.server";

/**
 * GET /api/news/latest
 * @description 가장 최근 뉴스 데이터를 반환
 */
export async function GET(request: NextRequest) {
  try {
    const news = await loadNews();

    if (!news || news.length === 0) {
      return NextResponse.json(
        { error: "뉴스 데이터를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(news);
  } catch (error) {
    console.error("뉴스 데이터 로드 실패:", error);
    return NextResponse.json(
      { error: "뉴스 데이터를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
