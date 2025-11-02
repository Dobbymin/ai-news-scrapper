/**
 * InvestmentDashboard - Widget Main Component
 * @description 투자 지수, 감성 분석, 키워드를 조합한 대시보드 위젯
 */

"use client";

import { Alert, AlertDescription } from "@/shared";

import { AnalyzeButton } from "@/features/ai-analysis";

import { useDashboardData } from "../model/useDashboardData";

import { AccuracyCard } from "./AccuracyCard";
import { InvestmentIndexCard } from "./InvestmentIndexCard";
import { KeywordsCard } from "./KeywordsCard";
import { SentimentSummaryCard } from "./SentimentSummaryCard";
import { SentimentTrendChart } from "./SentimentTrendChart";

/**
 * InvestmentDashboard - Widget Main Component
 * @description 투자 지수, 감성 분석, 키워드를 조합한 대시보드 위젯
 */

/**
 * InvestmentDashboard - Widget Main Component
 * @description 투자 지수, 감성 분석, 키워드를 조합한 대시보드 위젯
 */

export function InvestmentDashboard() {
  const { analysisData, accuracy, loading, error } = useDashboardData();

  // 로딩 상태
  if (loading) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <div className='space-y-4 text-center'>
          <div className='text-2xl'>⏳</div>
          <p className='text-muted-foreground'>데이터를 불러오는 중...</p>
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
  if (!analysisData) {
    return (
      <div className='space-y-6'>
        <Alert>
          <AlertDescription>
            📰 아직 분석된 뉴스가 없습니다. 아래 버튼을 눌러 뉴스를 수집하고 분석을 시작하세요.
          </AlertDescription>
        </Alert>
        <AnalyzeButton />
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      {/* 액션 버튼 */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>대시보드</h2>
          <p className='mt-1 text-muted-foreground'>
            마지막 업데이트: {new Date(analysisData.date).toLocaleDateString("ko-KR")}
          </p>
        </div>
        <AnalyzeButton />
      </div>

      {/* 투자 지수 카드 */}
      <InvestmentIndexCard
        investmentIndex={analysisData.investmentIndex}
        grade={analysisData.grade}
        recommendation={analysisData.recommendation}
      />

      {/* 감성 분석 & 정확도 */}
      <div className='grid gap-6 md:grid-cols-2'>
        <SentimentSummaryCard
          positive={analysisData.summary.positive}
          negative={analysisData.summary.negative}
          neutral={analysisData.summary.neutral}
          totalNews={analysisData.totalNews}
        />

        {accuracy !== null && <AccuracyCard accuracy={accuracy} />}
      </div>

      {/* 감성 분포 차트 & 주요 키워드 */}
      <div className='grid gap-6 md:grid-cols-2'>
        <SentimentTrendChart
          positiveCount={analysisData.summary.positive}
          negativeCount={analysisData.summary.negative}
          neutralCount={analysisData.summary.neutral}
        />
        <KeywordsCard keywords={analysisData.keywords} totalNews={analysisData.totalNews} />
      </div>
    </div>
  );
}
