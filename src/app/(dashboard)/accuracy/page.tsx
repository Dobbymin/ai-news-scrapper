"use client";

import { AccuracyWidget } from "@/widgets/accuracy-widget";

/**
 * 정확도 검토 페이지
 * @description AI 예측과 실제 시장 결과를 비교하여 정확도를 표시
 */
export default function Accuracy() {
  return (
    <div className="space-y-8">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">정확도 검토</h1>
        <p className="text-muted-foreground mt-2">
          AI 예측과 실제 시장 결과를 비교하여 정확도를 확인하세요.
        </p>
      </div>

      {/* 정확도 위젯 */}
      <AccuracyWidget />
    </div>
  );
}
