/**
 * KeywordsCard - Widget UI Component
 * @description 주요 키워드를 표시하는 카드 컴포넌트
 */

import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared";

interface KeywordsCardProps {
  keywords: string[];
}

export function KeywordsCard({ keywords }: KeywordsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>주요 키워드</CardTitle>
        <CardDescription>뉴스에서 자주 언급된 키워드입니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {keywords.length > 0 ? (
            keywords.map((keyword) => (
              <Badge key={keyword} variant="outline" className="text-base px-3 py-1">
                {keyword}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">키워드가 없습니다.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
