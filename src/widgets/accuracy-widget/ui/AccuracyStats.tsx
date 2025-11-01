/**
 * AccuracyStats - Widget UI Component
 * @description 정확도 통계 카드 컴포넌트
 */
import { Card, CardContent, CardHeader, CardTitle, Progress } from "@/shared";

interface AccuracyStatsProps {
  averageAccuracy: number;
  directionMatchRate: number;
  averageErrorRate: number;
  totalRecords: number;
  matchedRecords: number;
}

export function AccuracyStats({
  averageAccuracy,
  directionMatchRate,
  averageErrorRate,
  totalRecords,
  matchedRecords,
}: AccuracyStatsProps) {
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return "text-green-600";
    if (accuracy >= 70) return "text-blue-600";
    if (accuracy >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className='grid gap-4 md:grid-cols-3'>
      {/* 평균 정확도 */}
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm font-medium'>평균 정확도</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-baseline gap-2'>
            <div className={`text-3xl font-bold ${getAccuracyColor(averageAccuracy)}`}>
              {averageAccuracy.toFixed(1)}%
            </div>
          </div>
          <Progress value={averageAccuracy} className='mt-2 h-2' />
          <p className='mt-2 text-xs text-muted-foreground'>최근 {totalRecords}일 평균</p>
        </CardContent>
      </Card>

      {/* 방향 일치율 */}
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm font-medium'>방향 일치율</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-baseline gap-2'>
            <div className='text-3xl font-bold text-green-600'>{Math.round(directionMatchRate)}%</div>
          </div>
          <Progress value={directionMatchRate} className='mt-2 h-2 [&>div]:bg-green-600' />
          <p className='mt-2 text-xs text-muted-foreground'>
            {matchedRecords}/{totalRecords} 성공
          </p>
        </CardContent>
      </Card>

      {/* 평균 오차율 */}
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm font-medium'>평균 오차율</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-baseline gap-2'>
            <div className='text-3xl font-bold text-blue-600'>{averageErrorRate.toFixed(1)}%</div>
          </div>
          <Progress value={averageErrorRate} className='mt-2 h-2 [&>div]:bg-blue-600' />
          <p className='mt-2 text-xs text-muted-foreground'>낮을수록 좋음</p>
        </CardContent>
      </Card>
    </div>
  );
}
