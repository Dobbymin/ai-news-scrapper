"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";

/**
 * 메인 대시보드 페이지
 * @description 투자 지수, 감성 분석 요약, 정확도 추이를 한눈에 표시
 */
export default function MainPage() {
  // TODO: 실제 데이터는 API에서 가져오기
  const investmentIndex = 55;
  const sentiment = {
    positive: 8,
    negative: 6,
    neutral: 6,
  };
  const accuracy = 70;
  const lastUpdated = "2025-11-01";

  const getIndexGrade = (index: number) => {
    if (index >= 80) return { grade: "A+", color: "text-green-600", bg: "bg-green-50" };
    if (index >= 70) return { grade: "A", color: "text-green-500", bg: "bg-green-50" };
    if (index >= 60) return { grade: "B", color: "text-blue-500", bg: "bg-blue-50" };
    if (index >= 50) return { grade: "C", color: "text-yellow-500", bg: "bg-yellow-50" };
    return { grade: "D", color: "text-red-500", bg: "bg-red-50" };
  };

  const gradeInfo = getIndexGrade(investmentIndex);
  const totalNews = sentiment.positive + sentiment.negative + sentiment.neutral;

  return (
    <div className="space-y-8">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">투자 대시보드</h1>
        <p className="text-muted-foreground mt-2">
          AI 뉴스 감성 분석을 통한 투자 지수 및 시장 동향을 확인하세요.
        </p>
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-4">
        <Button size="lg" className="gap-2">
          📰 오늘 뉴스 수집
        </Button>
        <Button size="lg" variant="outline" className="gap-2">
          📊 정확도 검토
        </Button>
      </div>

      {/* 메인 투자 지수 카드 */}
      <Card className={gradeInfo.bg}>
        <CardHeader>
          <CardTitle className="text-lg">오늘의 투자 지수</CardTitle>
          <CardDescription>
            마지막 업데이트: {lastUpdated}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className={`text-6xl font-bold ${gradeInfo.color}`}>
                  {investmentIndex}%
                </span>
                <Badge className={gradeInfo.color}>{gradeInfo.grade}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {investmentIndex >= 60
                  ? "시장 분위기가 다소 긍정적입니다. 신중한 투자를 고려할 수 있습니다."
                  : investmentIndex >= 40
                  ? "시장 분위기가 중립적입니다. 관망하는 것이 좋습니다."
                  : "시장 분위기가 부정적입니다. 투자에 신중을 기해주세요."}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold">{totalNews}개</div>
              <div className="text-sm text-muted-foreground">분석된 뉴스</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 감성 분석 요약 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">긍정 뉴스</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-green-600">
                {sentiment.positive}
              </div>
              <div className="text-sm text-muted-foreground">
                ({Math.round((sentiment.positive / totalNews) * 100)}%)
              </div>
            </div>
            <Progress
              value={(sentiment.positive / totalNews) * 100}
              className="mt-2 h-2 [&>div]:bg-green-600"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">부정 뉴스</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-red-600">
                {sentiment.negative}
              </div>
              <div className="text-sm text-muted-foreground">
                ({Math.round((sentiment.negative / totalNews) * 100)}%)
              </div>
            </div>
            <Progress
              value={(sentiment.negative / totalNews) * 100}
              className="mt-2 h-2 [&>div]:bg-red-600"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">중립 뉴스</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-gray-600">
                {sentiment.neutral}
              </div>
              <div className="text-sm text-muted-foreground">
                ({Math.round((sentiment.neutral / totalNews) * 100)}%)
              </div>
            </div>
            <Progress
              value={(sentiment.neutral / totalNews) * 100}
              className="mt-2 h-2 [&>div]:bg-gray-600"
            />
          </CardContent>
        </Card>
      </div>

      {/* 정확도 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>AI 예측 정확도</CardTitle>
          <CardDescription>
            실제 시장 결과와 비교한 정확도입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-4xl font-bold">{accuracy}%</div>
              <Progress value={accuracy} className="mt-4 h-3" />
            </div>
            <Button variant="outline" asChild>
              <a href="/accuracy">상세 보기 →</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 최근 활동 알림 */}
      <Alert>
        <AlertDescription>
          💡 <strong>Tip:</strong> 매일 아침 뉴스를 수집하여 투자 지수를 확인하고, 저녁에 정확도를 검토하여 AI 성능을 개선하세요.
        </AlertDescription>
      </Alert>
    </div>
  );
}
