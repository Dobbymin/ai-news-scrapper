/**
 * Accuracy Widget - Model Hook
 * @description 정확도 데이터를 관리하는 훅
 */
import { useEffect, useState } from "react";

import type { AccuracyLog } from "@/entities/accuracy";

import type { AccuracyRecord } from "./types";

interface UseAccuracyDataReturn {
  accuracyData: AccuracyRecord[];
  averageAccuracy: number;
  directionMatchRate: number;
  averageErrorRate: number;
  loading: boolean;
  error: string | null;
}

/**
 * AccuracyLog를 AccuracyRecord로 변환
 */
function transformAccuracyLog(log: AccuracyLog): AccuracyRecord {
  // direction 매핑: positive/negative/neutral -> bullish/bearish/neutral
  const directionMap: Record<string, "bullish" | "bearish" | "neutral"> = {
    positive: "bullish",
    negative: "bearish",
    neutral: "neutral",
  };

  return {
    date: log.date,
    predictedIndex: log.prediction.index,
    predictedDirection: directionMap[log.prediction.direction] || "neutral",
    actualBTC: log.actual.crypto.btc,
    actualETH: log.actual.crypto.eth,
    actualKOSPI: log.actual.stock.kospi,
    actualKOSDAQ: log.actual.stock.kosdaq,
    accuracy: log.accuracy,
    directionMatch: log.isCorrect,
    errorRate: log.errorRate,
  };
}

export function useAccuracyData(): UseAccuracyDataReturn {
  const [accuracyData, setAccuracyData] = useState<AccuracyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAccuracyData() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/accuracy/logs?limit=30");
        if (!response.ok) {
          throw new Error("정확도 데이터를 불러오는데 실패했습니다.");
        }

        const logs: AccuracyLog[] = await response.json();
        const transformedData = logs.map(transformAccuracyLog);
        setAccuracyData(transformedData);
      } catch (err) {
        console.error("정확도 데이터 로드 실패:", err);
        setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
        setAccuracyData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAccuracyData();
  }, []);

  const averageAccuracy =
    accuracyData.length > 0 ? accuracyData.reduce((sum, record) => sum + record.accuracy, 0) / accuracyData.length : 0;

  const directionMatchRate =
    accuracyData.length > 0 ? (accuracyData.filter((r) => r.directionMatch).length / accuracyData.length) * 100 : 0;

  const averageErrorRate =
    accuracyData.length > 0 ? accuracyData.reduce((sum, r) => sum + r.errorRate, 0) / accuracyData.length : 0;

  return {
    accuracyData,
    averageAccuracy,
    directionMatchRate,
    averageErrorRate,
    loading,
    error,
  };
}
