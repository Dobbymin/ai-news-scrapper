/**
 * KeywordsCard - Widget UI Component
 * @description 주요 키워드를 표시하는 카드 컴포넌트
 */
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared";

interface KeywordsCardProps {
  keywords: string[];
  totalNews?: number;
}

export function KeywordsCard({ keywords, totalNews }: KeywordsCardProps) {
  // 키워드 빈도 추정 (실제로는 서버에서 제공하는 것이 이상적)
  const getKeywordSize = (index: number) => {
    if (index === 0) return "text-lg font-semibold";
    if (index === 1) return "text-base font-medium";
    return "text-sm";
  };

  const getKeywordColor = (index: number) => {
    if (index === 0) return "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-300";
    if (index === 1) return "bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200";
    return "border-gray-300";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔑 주요 키워드</CardTitle>
        <CardDescription>
          {totalNews ? `${totalNews}개 뉴스에서 추출한 핵심 키워드` : "뉴스에서 자주 언급된 키워드"}
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* 키워드 배지 */}
        <div className='flex flex-wrap gap-2'>
          {keywords.length > 0 ? (
            keywords.map((keyword, index) => (
              <Badge key={keyword} variant='outline' className={`px-3 py-1 ${getKeywordSize(index)} ${getKeywordColor(index)}`}>
                {keyword}
              </Badge>
            ))
          ) : (
            <p className='text-sm text-muted-foreground'>키워드가 없습니다.</p>
          )}
        </div>

        {/* 인사이트 정보 */}
        {keywords.length > 0 && (
          <div className='space-y-2 border-t pt-4 text-sm text-muted-foreground'>
            <div className='flex items-center gap-2'>
              <span className='text-base'>💡</span>
              <span>상위 키워드일수록 더 많은 뉴스에서 언급되었습니다.</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-base'>📈</span>
              <span>이 키워드들이 현재 시장의 주요 관심사를 나타냅니다.</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-base'>🔍</span>
              <span>키워드를 클릭하면 관련 뉴스를 더 볼 수 있습니다. (향후 기능)</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
