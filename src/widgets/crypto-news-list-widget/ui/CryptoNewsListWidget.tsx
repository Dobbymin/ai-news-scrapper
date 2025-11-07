/**
 * CryptoNewsListWidget - Widget Main Component
 * @description 코인 뉴스 목록과 필터를 조합한 위젯
 */

"use client";

import { useState } from "react";

import { Alert, AlertDescription } from "@/shared";

import { NewsFilter } from "@/widgets/news-list-widget/ui/NewsFilter";
import { NewsTable } from "@/widgets/news-list-widget/ui/NewsTable";

import type { SentimentType } from "@/entities/analysis";

import { useCryptoNewsList } from "../model/useCryptoNewsList";

/**
 * CryptoNewsListWidget - Widget Main Component
 * @description 코인 뉴스 목록과 필터를 조합한 위젯
 */

export function CryptoNewsListWidget() {
  const { newsData, loading, error } = useCryptoNewsList();
  const [filter, setFilter] = useState<SentimentType | "all">("all");

  // 로딩 상태
  if (loading) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <div className='space-y-4 text-center'>
          <div className='text-2xl'>⏳</div>
          <p className='text-muted-foreground'>코인 뉴스 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Alert className='border-red-200 bg-red-50'>
        <AlertDescription className='text-red-800'>⚠️ {error}</AlertDescription>
      </Alert>
    );
  }

  // 데이터 없음
  if (newsData.length === 0) {
    return (
      <Alert>
        <AlertDescription>🪙 아직 분석된 코인 뉴스가 없습니다.</AlertDescription>
      </Alert>
    );
  }

  // 필터링된 뉴스
  const filteredNews = filter === "all" ? newsData : newsData.filter((news) => news.sentiment === filter);

  // 카운트 계산
  const counts = {
    all: newsData.length,
    positive: newsData.filter((n) => n.sentiment === "positive").length,
    negative: newsData.filter((n) => n.sentiment === "negative").length,
    neutral: newsData.filter((n) => n.sentiment === "neutral").length,
  };

  return (
    <div className='space-y-6'>
      {/* 필터 */}
      <NewsFilter filter={filter} onFilterChange={setFilter} counts={counts} />

      {/* 뉴스 테이블 */}
      <NewsTable newsData={filteredNews} />
    </div>
  );
}
