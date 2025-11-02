/**
 * AI Analysis Feature - Model
 * @description AI 뉴스 분석 실행 훅
 */
import { useState } from "react";

interface UseAnalysisReturn {
  analyzing: boolean;
  success: boolean;
  error: string | null;
  runAnalysis: () => Promise<void>;
}

export function useAnalysis(): UseAnalysisReturn {
  const [analyzing, setAnalyzing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    try {
      setAnalyzing(true);
      setError(null);
      setSuccess(false);

      // 뉴스 수집 + 분석 일괄 실행 API 호출
      const response = await fetch("/api/news/scrape-and-analyze", {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "뉴스 수집/분석 실행에 실패했습니다.");
      }

      setSuccess(true);

      // 3초 후 페이지 새로고침
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (err) {
      console.error("분석 실행 실패:", err);
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setAnalyzing(false);
    }
  };

  return {
    analyzing,
    success,
    error,
    runAnalysis,
  };
}
