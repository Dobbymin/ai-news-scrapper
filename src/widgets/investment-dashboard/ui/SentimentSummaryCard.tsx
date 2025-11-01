/**
 * SentimentSummaryCard - Widget UI Component
 * @description 감성 분석 요약을 표시하는 카드 컴포넌트
 */
import { SentimentBadge } from "@/entities";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared";

interface SentimentSummaryCardProps {
  positive: number;
  negative: number;
  neutral: number;
  totalNews: number;
}

export function SentimentSummaryCard({ positive, negative, neutral, totalNews }: SentimentSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>감성 분석</CardTitle>
        <CardDescription>수집된 {totalNews}개 뉴스의 감성 분포입니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-3 gap-4 text-center'>
          <div className='space-y-2'>
            <SentimentBadge sentiment='positive' />
            <div className='text-3xl font-bold text-green-600'>{positive}</div>
            <div className='text-sm text-muted-foreground'>긍정</div>
          </div>
          <div className='space-y-2'>
            <SentimentBadge sentiment='negative' />
            <div className='text-3xl font-bold text-red-600'>{negative}</div>
            <div className='text-sm text-muted-foreground'>부정</div>
          </div>
          <div className='space-y-2'>
            <SentimentBadge sentiment='neutral' />
            <div className='text-3xl font-bold text-gray-600'>{neutral}</div>
            <div className='text-sm text-muted-foreground'>중립</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
