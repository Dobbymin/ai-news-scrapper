/**
 * NewsCard - Entity UI Component
 * @description 뉴스 항목을 표시하는 읽기 전용 카드 컴포넌트
 */

import { Badge, Card, CardContent } from "@/shared";
import { SentimentBadge, type SentimentType } from "@/entities/analysis";

interface NewsCardProps {
  title: string;
  source: string;
  publishedAt: string;
  url: string;
  sentiment?: SentimentType;
  confidence?: number;
  keywords?: string[];
  onClick?: () => void;
}

export function NewsCard({
  title,
  source,
  publishedAt,
  url,
  sentiment,
  confidence,
  keywords = [],
  onClick,
}: NewsCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ko-KR", {
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={onClick}>
      <CardContent className="space-y-3 pt-6">
        {/* 제목 */}
        <h3 className="font-semibold text-lg line-clamp-2">{title}</h3>

        {/* 감성 분석 결과 */}
        {sentiment && (
          <div className="flex items-center gap-2">
            <SentimentBadge sentiment={sentiment} />
            {confidence && (
              <span className="text-sm text-muted-foreground">신뢰도: {confidence}%</span>
            )}
          </div>
        )}

        {/* 키워드 */}
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {keywords.map((keyword) => (
              <Badge key={keyword} variant="outline" className="text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
        )}

        {/* 메타 정보 */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{source}</span>
          <span>{formatDate(publishedAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
