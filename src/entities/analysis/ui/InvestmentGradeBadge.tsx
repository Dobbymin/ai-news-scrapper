/**
 * InvestmentGradeBadge - Entity UI Component
 * @description 투자 등급을 표시하는 읽기 전용 배지 컴포넌트
 */
import { Badge } from "@/shared";

interface InvestmentGradeBadgeProps {
  grade: string;
  className?: string;
}

export function InvestmentGradeBadge({ grade, className }: InvestmentGradeBadgeProps) {
  const getGradeColor = (grade: string) => {
    if (grade.includes("매우 긍정")) return "bg-green-600 text-white hover:bg-green-600";
    if (grade.includes("긍정")) return "bg-green-500 text-white hover:bg-green-500";
    if (grade.includes("중립")) return "bg-gray-500 text-white hover:bg-gray-500";
    if (grade.includes("부정")) return "bg-red-500 text-white hover:bg-red-500";
    return "bg-gray-400 text-white hover:bg-gray-400";
  };

  return <Badge className={`${getGradeColor(grade)} ${className || ""}`}>{grade}</Badge>;
}
