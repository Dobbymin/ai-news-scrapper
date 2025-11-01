"use client";

import { InvestmentDashboard } from "@/widgets/investment-dashboard";

/**
 * 메인 대시보드 페이지
 * @description 투자 지수, 감성 분석 요약, 정확도 추이를 한눈에 표시
 */
export default function Home() {
  return (
    <div className='space-y-8'>
      {/* 페이지 헤더 */}
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>AI 뉴스 투자 분석</h1>
        <p className='mt-2 text-muted-foreground'>AI가 분석한 뉴스 기반 투자 인사이트를 확인하세요.</p>
      </div>

      {/* 대시보드 위젯 */}
      <InvestmentDashboard />
    </div>
  );
}
