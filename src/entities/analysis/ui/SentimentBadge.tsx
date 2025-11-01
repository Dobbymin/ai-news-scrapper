/**
 * SentimentBadge - Entity UI Component
 * @description 감성 분석 결과를 표시하는 읽기 전용 배지 컴포넌트
 */
import { Badge } from "@/shared";

export type SentimentType = "positive" | "negative" | "neutral";

interface SentimentBadgeProps {
  sentiment: SentimentType;
  className?: string;
}

export function SentimentBadge({ sentiment, className }: SentimentBadgeProps) {
  const config = {
    positive: {
      label: "긍정",
      className: "bg-green-100 text-green-800 hover:bg-green-100",
    },
    negative: {
      label: "부정",
      className: "bg-red-100 text-red-800 hover:bg-red-100",
    },
    neutral: {
      label: "중립",
      className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    },
  };

  const { label, className: badgeClassName } = config[sentiment];

  return <Badge className={`${badgeClassName} ${className || ""}`}>{label}</Badge>;
}
