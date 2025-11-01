"use client";

import { NewsListWidget } from "@/widgets/news-list-widget";

/**
 * 뉴스 목록 페이지
 * @description 수집된 뉴스 리스트와 감성 분석 결과를 표시
 */
export default function NewsListPage() {
  return (
    <div className="space-y-8">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">뉴스 목록</h1>
        <p className="text-muted-foreground mt-2">AI가 분석한 뉴스와 감성 분석 결과를 확인하세요.</p>
      </div>

      {/* 뉴스 리스트 위젯 */}
      <NewsListWidget />
    </div>
  );
}
