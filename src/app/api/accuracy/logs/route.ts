import { NextRequest, NextResponse } from "next/server";
import { loadAccuracyLogs } from "@/server/storage/json-store.server";

/**
 * GET /api/accuracy/logs
 * @description 정확도 로그 목록을 반환
 * @query limit - 반환할 로그 개수 (기본값: 10)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const logs = await loadAccuracyLogs(limit);

    if (!logs || logs.length === 0) {
      return NextResponse.json(
        { error: "정확도 로그를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(logs);
  } catch (error) {
    console.error("정확도 로그 로드 실패:", error);
    return NextResponse.json(
      { error: "정확도 로그를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
