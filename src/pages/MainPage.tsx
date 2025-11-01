"use client";

import { useEffect, useState } from "react";

import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";

interface AnalysisData {
  date: string;
  totalNews: number;
  investmentIndex: number;
  grade: string;
  recommendation: string;
  summary: {
    positive: number;
    negative: number;
    neutral: number;
  };
  keywords: string[];
}

/**
 * 메인 대시보드 페이지
 * @description 투자 지수, 감성 분석 요약, 정확도 추이를 한눈에 표시
 */
export default function MainPage() {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeSuccess, setAnalyzeSuccess] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 분석 데이터 로드
      const analysisRes = await fetch("/api/analysis/latest");
      if (analysisRes.ok) {
        const data = await analysisRes.json();
        setAnalysisData(data);
      }

      // 정확도 데이터 로드
      const accuracyRes = await fetch("/api/accuracy/logs?limit=1");
      if (accuracyRes.ok) {
        const logs = await accuracyRes.json();
        if (logs && logs.length > 0) {
          setAccuracy(logs[0].accuracy);
        }
      }
    } catch (err) {
      console.error("데이터 로드 실패:", err);
      setError("데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      setAnalyzeError(null);
      setAnalyzeSuccess(false);

      const response = await fetch("/api/analyze/run", {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "분석 실행에 실패했습니다.");
      }

      setAnalyzeSuccess(true);

      // 3초 후 페이지 새로고침
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (err) {
      console.error("분석 실행 실패:", err);
      setAnalyzeError(err instanceof Error ? err.message : "분석 실행 중 오류가 발생했습니다.");
    } finally {
      setAnalyzing(false);
    }
  };

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
      <div className='space-y-8'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>투자 대시보드</h1>
          <p className='mt-2 text-muted-foreground'>AI 뉴스 감성 분석을 통한 투자 지수 및 시장 동향을 확인하세요.</p>
        </div>

        <Alert>
          <AlertDescription>
            📰 아직 분석된 뉴스가 없습니다. "오늘 뉴스 수집" 버튼을 클릭하여 시작하세요.
          </AlertDescription>
        </Alert>

        <Button size='lg' className='gap-2'>
          📰 오늘 뉴스 수집
        </Button>
      </div>
    );
  }

  const investmentIndex = analysisData.investmentIndex;
  const sentiment = analysisData.summary;
  const lastUpdated = analysisData.date;

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
    <div className='space-y-8'>
      {/* 페이지 헤더 */}
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>투자 대시보드</h1>
        <p className='mt-2 text-muted-foreground'>AI 뉴스 감성 분석을 통한 투자 지수 및 시장 동향을 확인하세요.</p>
      </div>

      {/* 액션 버튼 */}
      <div className='flex gap-4'>
        <Button size='lg' className='gap-2' onClick={handleAnalyze} disabled={analyzing}>
          {analyzing ? "� 분석 중..." : "�📰 오늘 뉴스 수집"}
        </Button>
        <Button size='lg' variant='outline' className='gap-2' asChild>
          <a href='/accuracy'>📊 정확도 검토</a>
        </Button>
      </div>

      {/* 분석 진행 중 알림 */}
      {analyzing && (
        <Alert className='border-blue-200 bg-blue-50'>
          <AlertDescription className='text-blue-800'>
            ⏳ AI가 뉴스를 분석하고 있습니다. 잠시만 기다려주세요...
          </AlertDescription>
        </Alert>
      )}

      {/* 분석 완료 알림 */}
      {analyzeSuccess && (
        <Alert className='border-green-200 bg-green-50'>
          <AlertDescription className='text-green-800'>
            ✅ 분석이 완료되었습니다! 페이지가 곧 새로고침됩니다.
          </AlertDescription>
        </Alert>
      )}

      {/* 분석 에러 알림 */}
      {analyzeError && (
        <Alert className='border-red-200 bg-red-50'>
          <AlertDescription className='text-red-800'>❌ {analyzeError}</AlertDescription>
        </Alert>
      )}

      {/* 메인 투자 지수 카드 */}
      <Card className={gradeInfo.bg}>
        <CardHeader>
          <CardTitle className='text-lg'>오늘의 투자 지수</CardTitle>
          <CardDescription>마지막 업데이트: {lastUpdated}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-between'>
            <div>
              <div className='flex items-baseline gap-2'>
                <span className={`text-6xl font-bold ${gradeInfo.color}`}>{investmentIndex}%</span>
                <Badge className={gradeInfo.color}>{gradeInfo.grade}</Badge>
              </div>
              <p className='mt-2 text-sm text-muted-foreground'>
                {investmentIndex >= 60
                  ? "시장 분위기가 다소 긍정적입니다. 신중한 투자를 고려할 수 있습니다."
                  : investmentIndex >= 40
                    ? "시장 분위기가 중립적입니다. 관망하는 것이 좋습니다."
                    : "시장 분위기가 부정적입니다. 투자에 신중을 기해주세요."}
              </p>
            </div>
            <div className='text-right'>
              <div className='text-2xl font-semibold'>{totalNews}개</div>
              <div className='text-sm text-muted-foreground'>분석된 뉴스</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 감성 분석 요약 */}
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium'>긍정 뉴스</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-baseline gap-2'>
              <div className='text-3xl font-bold text-green-600'>{sentiment.positive}</div>
              <div className='text-sm text-muted-foreground'>
                ({Math.round((sentiment.positive / totalNews) * 100)}%)
              </div>
            </div>
            <Progress value={(sentiment.positive / totalNews) * 100} className='mt-2 h-2 [&>div]:bg-green-600' />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium'>부정 뉴스</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-baseline gap-2'>
              <div className='text-3xl font-bold text-red-600'>{sentiment.negative}</div>
              <div className='text-sm text-muted-foreground'>
                ({Math.round((sentiment.negative / totalNews) * 100)}%)
              </div>
            </div>
            <Progress value={(sentiment.negative / totalNews) * 100} className='mt-2 h-2 [&>div]:bg-red-600' />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium'>중립 뉴스</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-baseline gap-2'>
              <div className='text-3xl font-bold text-gray-600'>{sentiment.neutral}</div>
              <div className='text-sm text-muted-foreground'>
                ({Math.round((sentiment.neutral / totalNews) * 100)}%)
              </div>
            </div>
            <Progress value={(sentiment.neutral / totalNews) * 100} className='mt-2 h-2 [&>div]:bg-gray-600' />
          </CardContent>
        </Card>
      </div>

      {/* 정확도 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>AI 예측 정확도</CardTitle>
          <CardDescription>실제 시장 결과와 비교한 정확도입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-between'>
            <div className='flex-1'>
              <div className='text-4xl font-bold'>{accuracy}%</div>
              <Progress value={accuracy} className='mt-4 h-3' />
            </div>
            <Button variant='outline' asChild>
              <a href='/accuracy'>상세 보기 →</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 최근 활동 알림 */}
      <Alert>
        <AlertDescription>
          💡 <strong>Tip:</strong> 매일 아침 뉴스를 수집하여 투자 지수를 확인하고, 저녁에 정확도를 검토하여 AI 성능을
          개선하세요.
        </AlertDescription>
      </Alert>
    </div>
  );
}
