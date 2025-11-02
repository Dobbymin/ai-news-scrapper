/**
 * AccuracyCard - Widget UI Component
 * @description AI 정확도를 표시하는 카드 컴포넌트
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Progress } from "@/shared";

interface AccuracyCardProps {
  accuracy: number;
}

export function AccuracyCard({ accuracy }: AccuracyCardProps) {
  const getAccuracyColor = (acc: number) => {
    if (acc >= 80) return "text-green-600";
    if (acc >= 70) return "text-blue-600";
    if (acc >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getAccuracyLevel = (acc: number) => {
    if (acc >= 80) return "매우 높음";
    if (acc >= 70) return "높음";
    if (acc >= 60) return "보통";
    return "개선 필요";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🎯 AI 정확도</CardTitle>
        <CardDescription>예측과 실제 시장 결과의 일치율입니다.</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex items-baseline gap-3'>
          <div className={`text-5xl font-bold ${getAccuracyColor(accuracy)}`}>{accuracy}%</div>
          <div className='text-muted-foreground'>({getAccuracyLevel(accuracy)})</div>
        </div>
        <Progress value={accuracy} className='h-3' />
        <div className='space-y-1 text-sm text-muted-foreground'>
          <p>• 예측 방향과 실제 시장 변동 방향 비교</p>
          <p>• 매일 자동으로 학습하여 정확도 개선</p>
        </div>
      </CardContent>
    </Card>
  );
}
