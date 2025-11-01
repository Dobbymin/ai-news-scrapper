/**
 * NewsFilter - Widget UI Component
 * @description 뉴스 감성 필터 컴포넌트
 */
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared";

import type { SentimentType } from "@/entities/analysis";

interface NewsFilterProps {
  filter: SentimentType | "all";
  onFilterChange: (filter: SentimentType | "all") => void;
  counts: {
    all: number;
    positive: number;
    negative: number;
    neutral: number;
  };
}

export function NewsFilter({ filter, onFilterChange, counts }: NewsFilterProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>필터</CardTitle>
        <CardDescription>감성별로 뉴스를 필터링하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex gap-2'>
          <Button variant={filter === "all" ? "default" : "outline"} onClick={() => onFilterChange("all")}>
            전체 ({counts.all})
          </Button>
          <Button
            variant={filter === "positive" ? "default" : "outline"}
            onClick={() => onFilterChange("positive")}
            className={filter === "positive" ? "bg-green-600 hover:bg-green-700" : ""}
          >
            긍정 ({counts.positive})
          </Button>
          <Button
            variant={filter === "negative" ? "default" : "outline"}
            onClick={() => onFilterChange("negative")}
            className={filter === "negative" ? "bg-red-600 hover:bg-red-700" : ""}
          >
            부정 ({counts.negative})
          </Button>
          <Button
            variant={filter === "neutral" ? "default" : "outline"}
            onClick={() => onFilterChange("neutral")}
            className={filter === "neutral" ? "bg-gray-600 hover:bg-gray-700" : ""}
          >
            중립 ({counts.neutral})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
