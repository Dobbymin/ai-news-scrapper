/**
 * AccuracyRecordCard - Widget UI Component
 * @description 개별 정확도 기록 카드 컴포넌트
 */

import { Badge } from "@/shared";
import type { AccuracyRecord } from "../model/types";

interface AccuracyRecordCardProps {
  record: AccuracyRecord;
}

export function AccuracyRecordCard({ record }: AccuracyRecordCardProps) {
  const getDirectionLabel = (direction: "bullish" | "bearish" | "neutral") => {
    const config = {
      bullish: { label: "상승", className: "bg-green-100 text-green-800" },
      bearish: { label: "하락", className: "bg-red-100 text-red-800" },
      neutral: { label: "중립", className: "bg-gray-100 text-gray-800" },
    };
    return config[direction];
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return "text-green-600";
    if (accuracy >= 70) return "text-blue-600";
    if (accuracy >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const directionBadge = getDirectionLabel(record.predictedDirection);

  return (
    <div className="border rounded-lg p-4 space-y-3">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-lg font-semibold">{record.date}</div>
          <Badge className={directionBadge.className}>{directionBadge.label}</Badge>
          {record.directionMatch && (
            <Badge variant="outline" className="bg-green-50 text-green-700">
              ✓ 방향 일치
            </Badge>
          )}
        </div>
        <div className={`text-2xl font-bold ${getAccuracyColor(record.accuracy)}`}>{record.accuracy}%</div>
      </div>

      {/* 예측 vs 실제 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">예측 투자 지수</div>
          <div className="text-2xl font-bold">{record.predictedIndex}%</div>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">실제 시장 결과</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <div className="text-muted-foreground">BTC</div>
              <div className={record.actualBTC >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                {record.actualBTC >= 0 ? "+" : ""}
                {record.actualBTC}%
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">ETH</div>
              <div className={record.actualETH >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                {record.actualETH >= 0 ? "+" : ""}
                {record.actualETH}%
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">KOSPI</div>
              <div className={record.actualKOSPI >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                {record.actualKOSPI >= 0 ? "+" : ""}
                {record.actualKOSPI}%
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">KOSDAQ</div>
              <div
                className={record.actualKOSDAQ >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}
              >
                {record.actualKOSDAQ >= 0 ? "+" : ""}
                {record.actualKOSDAQ}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 오차율 */}
      <div className="pt-2 border-t">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">오차율</span>
          <span className="font-medium">{record.errorRate}%</span>
        </div>
      </div>
    </div>
  );
}
