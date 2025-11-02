/**
 * AccuracyWidget - Widget Main Component
 * @description 정확도 검토 위젯
 */

"use client";

import { Alert, AlertDescription, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared";

import { useAccuracyData } from "../model/useAccuracyData";

import { AccuracyChart } from "./AccuracyChart";
import { AccuracyRecordCard } from "./AccuracyRecordCard";
import { AccuracyStats } from "./AccuracyStats";

/**
 * AccuracyWidget - Widget Main Component
 * @description 정확도 검토 위젯
 */

/**
 * AccuracyWidget - Widget Main Component
 * @description 정확도 검토 위젯
 */

/**
 * AccuracyWidget - Widget Main Component
 * @description 정확도 검토 위젯
 */

export function AccuracyWidget() {
  const { accuracyData, averageAccuracy, directionMatchRate, averageErrorRate, loading, error } = useAccuracyData();

  // 로딩 상태
  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-center'>
          <div className='text-lg font-medium'>정확도 데이터 로딩 중...</div>
          <div className='mt-2 text-sm text-muted-foreground'>잠시만 기다려주세요.</div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Alert className='border-red-200 bg-red-50'>
        <AlertDescription className='text-red-800'>
          ❌ <strong>오류 발생:</strong> {error}
        </AlertDescription>
      </Alert>
    );
  }

  // 데이터 없음
  if (accuracyData.length === 0) {
    return (
      <Alert className='border-yellow-200 bg-yellow-50'>
        <AlertDescription className='text-yellow-800'>
          📊 <strong>정확도 데이터가 없습니다.</strong> AI 분석을 실행한 후 다음날 시장 결과와 비교하여 정확도를 확인할
          수 있습니다.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className='space-y-8'>
      {/* 정확도 계산 방법 설명 */}
      <Card>
        <CardHeader>
          <CardTitle>📊 AI 정확도 평가 방법</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='space-y-2 text-sm'>
            <div className='flex gap-2'>
              <span className='font-semibold text-blue-600'>1️⃣</span>
              <div>
                <strong>예측 투자 지수 산출:</strong> AI가 당일 뉴스를 분석하여 0-100% 투자 지수를 예측합니다.
              </div>
            </div>
            <div className='flex gap-2'>
              <span className='font-semibold text-blue-600'>2️⃣</span>
              <div>
                <strong>실제 시장 결과 수집:</strong> 다음날 암호화폐(비트코인, 이더리움)와 주요 주식 시장의 실제 변동률을
                측정합니다.
              </div>
            </div>
            <div className='flex gap-2'>
              <span className='font-semibold text-blue-600'>3️⃣</span>
              <div>
                <strong>방향 일치 여부:</strong> 예측이 긍정적(50% 이상)일 때 시장이 상승했는지, 부정적일 때 하락했는지
                확인합니다.
              </div>
            </div>
            <div className='flex gap-2'>
              <span className='font-semibold text-blue-600'>4️⃣</span>
              <div>
                <strong>정확도 계산:</strong> 100% - |예측 지수 - 실제 변동률|로 오차율을 계산하고, 방향 일치율과 함께
                종합 평가합니다.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 전체 통계 */}
      <AccuracyStats
        averageAccuracy={averageAccuracy}
        directionMatchRate={directionMatchRate}
        averageErrorRate={averageErrorRate}
        totalRecords={accuracyData.length}
        matchedRecords={accuracyData.filter((r) => r.directionMatch).length}
      />

      {/* 정확도 추이 차트 */}
      <AccuracyChart data={accuracyData} />

      {/* 일별 정확도 기록 */}
      <Card>
        <CardHeader>
          <CardTitle>일별 정확도 기록</CardTitle>
          <CardDescription>예측 투자 지수와 실제 시장 결과를 비교합니다.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {accuracyData.map((record) => (
            <AccuracyRecordCard key={record.date} record={record} />
          ))}
        </CardContent>
      </Card>

      {/* 개선 제안 */}
      <Alert>
        <AlertDescription>
          💡 <strong>AI 학습 진행 중:</strong> 정확도가 지속적으로 개선되고 있습니다. 매일 정확도를 검토하여 AI 성능을
          높여보세요.
        </AlertDescription>
      </Alert>
    </div>
  );
}
