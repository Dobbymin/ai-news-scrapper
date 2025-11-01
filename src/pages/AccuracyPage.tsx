"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";

interface AccuracyRecord {
  date: string;
  predictedIndex: number;
  predictedDirection: "bullish" | "bearish" | "neutral";
  actualBTC: number;
  actualETH: number;
  actualKOSPI: number;
  actualKOSDAQ: number;
  accuracy: number;
  directionMatch: boolean;
  errorRate: number;
}

// 임시 데이터
const mockAccuracy: AccuracyRecord[] = [
  {
    date: "2025-11-01",
    predictedIndex: 55,
    predictedDirection: "neutral",
    actualBTC: 0.46,
    actualETH: 0.05,
    actualKOSPI: 0,
    actualKOSDAQ: 0,
    accuracy: 70,
    directionMatch: true,
    errorRate: 4.4,
  },
  {
    date: "2025-10-31",
    predictedIndex: 72,
    predictedDirection: "bullish",
    actualBTC: 2.3,
    actualETH: 1.8,
    actualKOSPI: 0.5,
    actualKOSDAQ: 0.8,
    accuracy: 85,
    directionMatch: true,
    errorRate: 2.1,
  },
  {
    date: "2025-10-30",
    predictedIndex: 45,
    predictedDirection: "bearish",
    actualBTC: -1.2,
    actualETH: -0.8,
    actualKOSPI: -0.3,
    actualKOSDAQ: -0.5,
    accuracy: 78,
    directionMatch: true,
    errorRate: 3.5,
  },
];

/**
 * 정확도 검토 페이지
 * @description AI 예측과 실제 시장 결과를 비교하여 정확도를 표시
 */
export default function AccuracyPage() {
  const averageAccuracy =
    mockAccuracy.reduce((sum, record) => sum + record.accuracy, 0) /
    mockAccuracy.length;

  const getDirectionLabel = (
    direction: "bullish" | "bearish" | "neutral"
  ) => {
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

  return (
    <div className="space-y-8">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">정확도 검토</h1>
        <p className="text-muted-foreground mt-2">
          AI 예측과 실제 시장 결과를 비교하여 정확도를 확인하세요.
        </p>
      </div>

      {/* 전체 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">평균 정확도</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className={`text-3xl font-bold ${getAccuracyColor(averageAccuracy)}`}>
                {averageAccuracy.toFixed(1)}%
              </div>
            </div>
            <Progress value={averageAccuracy} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              최근 {mockAccuracy.length}일 평균
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">방향 일치율</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-green-600">
                {Math.round(
                  (mockAccuracy.filter((r) => r.directionMatch).length /
                    mockAccuracy.length) *
                    100
                )}
                %
              </div>
            </div>
            <Progress
              value={
                (mockAccuracy.filter((r) => r.directionMatch).length /
                  mockAccuracy.length) *
                100
              }
              className="mt-2 h-2 [&>div]:bg-green-600"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {mockAccuracy.filter((r) => r.directionMatch).length}/
              {mockAccuracy.length} 성공
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">평균 오차율</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-blue-600">
                {(
                  mockAccuracy.reduce((sum, r) => sum + r.errorRate, 0) /
                  mockAccuracy.length
                ).toFixed(1)}
                %
              </div>
            </div>
            <Progress
              value={
                mockAccuracy.reduce((sum, r) => sum + r.errorRate, 0) /
                mockAccuracy.length
              }
              className="mt-2 h-2 [&>div]:bg-blue-600"
            />
            <p className="text-xs text-muted-foreground mt-2">
              낮을수록 좋음
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 일별 정확도 기록 */}
      <Card>
        <CardHeader>
          <CardTitle>일별 정확도 기록</CardTitle>
          <CardDescription>
            예측 투자 지수와 실제 시장 결과를 비교합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockAccuracy.map((record) => {
            const directionBadge = getDirectionLabel(record.predictedDirection);
            return (
              <div
                key={record.date}
                className="border rounded-lg p-4 space-y-3"
              >
                {/* 헤더 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-semibold">{record.date}</div>
                    <Badge className={directionBadge.className}>
                      {directionBadge.label}
                    </Badge>
                    {record.directionMatch && (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        ✓ 방향 일치
                      </Badge>
                    )}
                  </div>
                  <div className={`text-2xl font-bold ${getAccuracyColor(record.accuracy)}`}>
                    {record.accuracy}%
                  </div>
                </div>

                {/* 예측 vs 실제 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      예측 투자 지수
                    </div>
                    <div className="text-2xl font-bold">
                      {record.predictedIndex}%
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      실제 시장 결과
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <div className="text-muted-foreground">BTC</div>
                        <div
                          className={
                            record.actualBTC >= 0
                              ? "text-green-600 font-medium"
                              : "text-red-600 font-medium"
                          }
                        >
                          {record.actualBTC >= 0 ? "+" : ""}
                          {record.actualBTC}%
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">ETH</div>
                        <div
                          className={
                            record.actualETH >= 0
                              ? "text-green-600 font-medium"
                              : "text-red-600 font-medium"
                          }
                        >
                          {record.actualETH >= 0 ? "+" : ""}
                          {record.actualETH}%
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">KOSPI</div>
                        <div
                          className={
                            record.actualKOSPI >= 0
                              ? "text-green-600 font-medium"
                              : "text-red-600 font-medium"
                          }
                        >
                          {record.actualKOSPI >= 0 ? "+" : ""}
                          {record.actualKOSPI}%
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">KOSDAQ</div>
                        <div
                          className={
                            record.actualKOSDAQ >= 0
                              ? "text-green-600 font-medium"
                              : "text-red-600 font-medium"
                          }
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
          })}
        </CardContent>
      </Card>

      {/* 개선 제안 */}
      <Alert>
        <AlertDescription>
          💡 <strong>AI 학습 진행 중:</strong> 정확도가 지속적으로 개선되고 있습니다.
          매일 정확도를 검토하여 AI 성능을 높여보세요.
        </AlertDescription>
      </Alert>
    </div>
  );
}
