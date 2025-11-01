/**
 * InvestmentIndexCard - Widget UI Component
 * @description 투자 지수를 표시하는 카드 컴포넌트
 */
import { InvestmentGradeBadge } from "@/entities";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Progress } from "@/shared";

interface InvestmentIndexCardProps {
  investmentIndex: number;
  grade: string;
  recommendation: string;
}

export function InvestmentIndexCard({ investmentIndex, grade, recommendation }: InvestmentIndexCardProps) {
  const getIndexColor = (index: number) => {
    if (index >= 70) return "text-green-600";
    if (index >= 50) return "text-blue-600";
    if (index >= 30) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>투자 지수</CardTitle>
        <CardDescription>AI가 분석한 오늘의 투자 추천 지수입니다.</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex items-baseline gap-3'>
          <div className={`text-5xl font-bold ${getIndexColor(investmentIndex)}`}>{investmentIndex}%</div>
          <InvestmentGradeBadge grade={grade} />
        </div>
        <Progress value={investmentIndex} className='h-3' />
        <p className='text-sm text-muted-foreground'>{recommendation}</p>
      </CardContent>
    </Card>
  );
}
