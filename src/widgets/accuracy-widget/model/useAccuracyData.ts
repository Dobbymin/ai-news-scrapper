/**
 * Accuracy Widget - Model Hook
 * @description 정확도 데이터를 관리하는 훅
 */
import { useState } from "react";

import type { AccuracyRecord } from "./types";

// TODO: 실제 API 연동 시 교체
const mockAccuracy: AccuracyRecord[] = [
  {
    date: "2025-11-01",
    predictedIndex: 55,
    predictedDirection: "neutral",
    actualBTC: 0.46,
    actualETH: 0.05,
    actualKOSPI: 0,
    actualKOSDAQ: 0,
    accuracy: 70,
    directionMatch: true,
    errorRate: 4.4,
  },
  {
    date: "2025-10-31",
    predictedIndex: 72,
    predictedDirection: "bullish",
    actualBTC: 2.3,
    actualETH: 1.8,
    actualKOSPI: 0.5,
    actualKOSDAQ: 0.8,
    accuracy: 85,
    directionMatch: true,
    errorRate: 2.1,
  },
  {
    date: "2025-10-30",
    predictedIndex: 45,
    predictedDirection: "bearish",
    actualBTC: -1.2,
    actualETH: -0.8,
    actualKOSPI: -0.3,
    actualKOSDAQ: -0.5,
    accuracy: 78,
    directionMatch: true,
    errorRate: 3.5,
  },
];

interface UseAccuracyDataReturn {
  accuracyData: AccuracyRecord[];
  averageAccuracy: number;
  directionMatchRate: number;
  averageErrorRate: number;
}

export function useAccuracyData(): UseAccuracyDataReturn {
  const [accuracyData] = useState<AccuracyRecord[]>(mockAccuracy);

  const averageAccuracy = accuracyData.reduce((sum, record) => sum + record.accuracy, 0) / accuracyData.length;

  const directionMatchRate = (accuracyData.filter((r) => r.directionMatch).length / accuracyData.length) * 100;

  const averageErrorRate = accuracyData.reduce((sum, r) => sum + r.errorRate, 0) / accuracyData.length;

  return {
    accuracyData,
    averageAccuracy,
    directionMatchRate,
    averageErrorRate,
  };
}
