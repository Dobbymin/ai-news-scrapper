"use client";

import { useState } from "react";

import { Button } from "@/shared";

import { CryptoNewsListWidget } from "@/widgets/crypto-news-list-widget";
import { NewsListWidget } from "@/widgets/news-list-widget";

import { AnalyzeButton } from "@/features/ai-analysis";
import { CryptoScraperButton } from "@/features/crypto-news-scraper";

/**
 * 뉴스 목록 페이지
 * @description 일반 뉴스와 코인 뉴스를 탭으로 전환하여 표시
 *
 * Note: 이 페이지는 빌드 시점에 렌더링되지 않도록 dynamic import 사용 권장
 */
export default function News() {
  const [activeTab, setActiveTab] = useState<"general" | "crypto">("general");

  return (
    <div className='space-y-8'>
      {/* 페이지 헤더 */}
      <div className='flex items-start justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>뉴스 목록</h1>
          <p className='mt-2 text-muted-foreground'>AI가 분석한 뉴스와 감성 분석 결과를 확인하세요.</p>
        </div>

        {/* 수집 버튼 - 탭에 따라 다른 버튼 표시 */}
        <div className='shrink-0'>{activeTab === "general" ? <AnalyzeButton /> : <CryptoScraperButton />}</div>
      </div>

      {/* 탭 버튼 */}
      <div className='flex gap-2 border-b'>
        <Button
          variant={activeTab === "general" ? "default" : "ghost"}
          onClick={() => setActiveTab("general")}
          className='rounded-b-none'
        >
          📰 일반 뉴스
        </Button>
        <Button
          variant={activeTab === "crypto" ? "default" : "ghost"}
          onClick={() => setActiveTab("crypto")}
          className='rounded-b-none'
        >
          🪙 코인 뉴스
        </Button>
      </div>

      {/* 탭 컨텐츠 */}
      <div className='mt-6'>{activeTab === "general" ? <NewsListWidget /> : <CryptoNewsListWidget />}</div>
    </div>
  );
}
