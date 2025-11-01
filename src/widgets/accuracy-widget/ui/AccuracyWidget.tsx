/**
 * AccuracyWidget - Widget Main Component
 * @description 정확도 검토 위젯
 */

"use client";

import { Alert, AlertDescription, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared";
import { useAccuracyData } from "../model/useAccuracyData";
import { AccuracyStats } from "./AccuracyStats";
import { AccuracyRecordCard } from "./AccuracyRecordCard";

export function AccuracyWidget() {
  const { accuracyData, averageAccuracy, directionMatchRate, averageErrorRate } = useAccuracyData();

  return (
    <div className="space-y-8">
      {/* 전체 통계 */}
      <AccuracyStats
        averageAccuracy={averageAccuracy}
        directionMatchRate={directionMatchRate}
        averageErrorRate={averageErrorRate}
        totalRecords={accuracyData.length}
        matchedRecords={accuracyData.filter((r) => r.directionMatch).length}
      />

      {/* 일별 정확도 기록 */}
      <Card>
        <CardHeader>
          <CardTitle>일별 정확도 기록</CardTitle>
          <CardDescription>예측 투자 지수와 실제 시장 결과를 비교합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {accuracyData.map((record) => (
            <AccuracyRecordCard key={record.date} record={record} />
          ))}
        </CardContent>
      </Card>

      {/* 개선 제안 */}
      <Alert>
        <AlertDescription>
          💡 <strong>AI 학습 진행 중:</strong> 정확도가 지속적으로 개선되고 있습니다. 매일 정확도를 검토하여 AI
          성능을 높여보세요.
        </AlertDescription>
      </Alert>
    </div>
  );
}
