/**
 * AnalyzeButton - Feature UI Component
 * @description AI 뉴스 분석을 실행하는 버튼 컴포넌트
 */

import { Alert, AlertDescription, Button } from "@/shared";
import { useAnalysis } from "../model/useAnalysis";

export function AnalyzeButton() {
  const { analyzing, success, error, runAnalysis } = useAnalysis();

  return (
    <div className="space-y-4">
      <Button onClick={runAnalysis} disabled={analyzing} size="lg" className="w-full sm:w-auto">
        {analyzing ? "⏳ 분석 중..." : "📰 오늘 뉴스 수집"}
      </Button>

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            ✅ 분석이 완료되었습니다! 페이지를 새로고침합니다...
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">⚠️ {error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
