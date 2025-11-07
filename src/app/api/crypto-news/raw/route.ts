import { NextRequest, NextResponse } from "next/server";

import {
  loadCryptoAnalysis,
  loadCryptoNews,
  loadLatestCryptoAnalysis,
  loadLatestCryptoNews,
} from "@/server/storage/json-store.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function withCors(json: any, init?: ResponseInit) {
  const res = NextResponse.json(json, init);
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res;
}

export async function OPTIONS() {
  return withCors({ ok: true });
}

/**
 * GET /api/crypto-news/raw?type=news|analysis&date=YYYY-MM-DD|latest
 *
 * 외부에서 재사용할 수 있도록, 저장된 JSON 원본을 그대로 반환합니다.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const dateParam = searchParams.get("date") || "latest";

    if (!type || (type !== "news" && type !== "analysis")) {
      return withCors(
        { success: false, message: "type 파라미터는 'news' 또는 'analysis' 여야 합니다." },
        { status: 400 },
      );
    }

    let date: Date | null = null;
    if (dateParam !== "latest") {
      const d = new Date(dateParam);
      if (isNaN(d.getTime())) {
        return withCors({ success: false, message: "유효하지 않은 날짜 형식입니다." }, { status: 400 });
      }
      date = d;
    }

    if (type === "news") {
      const data = date ? await loadCryptoNews(date) : await loadLatestCryptoNews();
      if (!data || data.length === 0) {
        return withCors({ success: false, message: "해당 날짜의 코인 뉴스가 없습니다." }, { status: 404 });
      }
      return withCors({ success: true, data });
    }

    // analysis
    const analysis = date ? await loadCryptoAnalysis(date) : await loadLatestCryptoAnalysis();
    if (!analysis) {
      return withCors({ success: false, message: "해당 날짜의 분석 결과가 없습니다." }, { status: 404 });
    }
    return withCors({ success: true, data: analysis });
  } catch (error) {
    console.error("❌ raw crypto api error:", error);
    return withCors(
      { success: false, error: error instanceof Error ? error.message : "알 수 없는 오류" },
      { status: 500 },
    );
  }
}
