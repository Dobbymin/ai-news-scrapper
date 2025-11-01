/**
 * Accuracy Widget - Model Types
 * @description 정확도 검토 관련 타입 정의
 */

export interface AccuracyRecord {
  date: string;
  predictedIndex: number;
  predictedDirection: "bullish" | "bearish" | "neutral";
  actualBTC: number;
  actualETH: number;
  actualKOSPI: number;
  actualKOSDAQ: number;
  accuracy: number;
  directionMatch: boolean;
  errorRate: number;
}

export type PredictionDirection = "bullish" | "bearish" | "neutral";
