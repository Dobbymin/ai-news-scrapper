import type { AccuracyLog, MarketData, PredictionData } from "@/entities/accuracy";
import type { AnalysisResult } from "@/entities/analysis";

/**
 * 정확도 계산 유틸리티
 *
 * @description
 * AI 예측(투자 지수)과 실제 시장 데이터를 비교하여 정확도를 계산합니다.
 * - 예측 방향과 실제 방향 비교
 * - 오차율 계산
 * - 학습 데이터 생성
 */

/**
 * 투자 지수에서 예측 방향 결정
 * @param investmentIndex 투자 지수 (0-100)
 * @returns 예측 방향
 */
export function determinePredictionDirection(investmentIndex: number): "positive" | "negative" | "neutral" {
  if (investmentIndex >= 60) {
    return "positive"; // 상승 예측
  } else if (investmentIndex <= 40) {
    return "negative"; // 하락 예측
  } else {
    return "neutral"; // 중립 (예측 안 함)
  }
}

/**
 * 시장 데이터에서 실제 방향 계산
 * @param marketData 실제 시장 데이터
 * @returns 실제 방향
 */
export function determineActualDirection(marketData: MarketData): "positive" | "negative" | "neutral" {
  // 암호화폐 평균 등락률
  const cryptoAvg = (marketData.crypto.btc + marketData.crypto.eth) / 2;

  // 주식 평균 등락률
  const stockAvg = (marketData.stock.kospi + marketData.stock.kosdaq) / 2;

  // 전체 평균 등락률
  const overallAvg = (cryptoAvg + stockAvg) / 2;

  if (overallAvg >= 1.0) {
    return "positive"; // 1% 이상 상승
  } else if (overallAvg <= -1.0) {
    return "negative"; // 1% 이상 하락
  } else {
    return "neutral"; // 미세한 변동 (중립)
  }
}

/**
 * 오차율 계산
 *
 * @param investmentIndex 투자 지수 (0-100)
 * @param marketData 실제 시장 데이터
 * @returns 오차율 (%)
 */
export function calculateErrorRate(investmentIndex: number, marketData: MarketData): number {
  // 암호화폐 평균 등락률
  const cryptoAvg = (marketData.crypto.btc + marketData.crypto.eth) / 2;

  // 주식 평균 등락률
  const stockAvg = (marketData.stock.kospi + marketData.stock.kosdaq) / 2;

  // 전체 평균 등락률 (-100 ~ +100)
  const overallAvg = (cryptoAvg + stockAvg) / 2;

  // 등락률을 0-100 스케일로 변환 (50이 중립)
  // 예: +10% → 60, -10% → 40
  const actualIndex = 50 + overallAvg * 5; // 10%당 5포인트 변화

  // 오차율 계산
  const errorRate = Math.abs(investmentIndex - actualIndex);

  // 0-100 범위로 클리핑
  return Math.min(100, Math.max(0, Math.round(errorRate * 10) / 10));
}

/**
 * 정확도 계산
 *
 * @param investmentIndex 투자 지수 (0-100)
 * @param marketData 실제 시장 데이터
 * @returns 정확도 (0-100)
 */
export function calculateAccuracy(investmentIndex: number, marketData: MarketData): number {
  const predictionDirection = determinePredictionDirection(investmentIndex);
  const actualDirection = determineActualDirection(marketData);
  const errorRate = calculateErrorRate(investmentIndex, marketData);

  // 방향 일치 여부
  const isDirectionCorrect = predictionDirection === actualDirection;

  // 정확도 계산
  let accuracy: number;

  if (predictionDirection === "neutral") {
    // 중립 예측의 경우: 실제로 중립이면 70점, 아니면 30점
    accuracy = actualDirection === "neutral" ? 70 : 30;
  } else if (isDirectionCorrect) {
    // 방향이 일치하면: 100 - 오차율
    accuracy = Math.max(50, 100 - errorRate);
  } else {
    // 방향이 틀리면: 오차율 기반 낮은 점수
    accuracy = Math.max(0, 50 - errorRate);
  }

  return Math.round(accuracy * 10) / 10;
}

/**
 * 정확도 로그 생성
 *
 * @param analysisResult 분석 결과
 * @param marketData 실제 시장 데이터
 * @returns 정확도 로그
 */
export function createAccuracyLog(analysisResult: AnalysisResult, marketData: MarketData): AccuracyLog {
  const predictionDirection = determinePredictionDirection(analysisResult.investmentIndex);
  const actualDirection = determineActualDirection(marketData);
  const errorRate = calculateErrorRate(analysisResult.investmentIndex, marketData);
  const accuracy = calculateAccuracy(analysisResult.investmentIndex, marketData);
  const isCorrect = predictionDirection === actualDirection;

  const prediction: PredictionData = {
    index: analysisResult.investmentIndex,
    direction: predictionDirection,
    date: analysisResult.date,
  };

  return {
    date: analysisResult.date,
    accuracy,
    prediction,
    actual: marketData,
    isCorrect,
    errorRate,
    verifiedAt: new Date().toISOString(),
  };
}

/**
 * 정확도 등급 산출
 *
 * @param accuracy 정확도 (0-100)
 * @returns 등급 문자열
 */
export function getAccuracyGrade(accuracy: number): string {
  if (accuracy >= 90) return "S (최상)";
  if (accuracy >= 80) return "A (우수)";
  if (accuracy >= 70) return "B (양호)";
  if (accuracy >= 60) return "C (보통)";
  if (accuracy >= 50) return "D (미흡)";
  return "F (불량)";
}

/**
 * 정확도 피드백 메시지 생성
 *
 * @param accuracyLog 정확도 로그
 * @returns 피드백 메시지
 */
export function getAccuracyFeedback(accuracyLog: AccuracyLog): string {
  const { accuracy, isCorrect, prediction, actual } = accuracyLog;

  if (accuracy >= 80) {
    return `예측이 매우 정확했습니다! (${accuracy}%) 방향: ${prediction.direction} → ${determineActualDirection(actual)}`;
  } else if (accuracy >= 60) {
    return `예측이 비교적 정확했습니다. (${accuracy}%) 오차율을 더 줄일 필요가 있습니다.`;
  } else if (isCorrect) {
    return `방향은 맞췄지만 정확도가 낮습니다. (${accuracy}%) 투자 지수 보정이 필요합니다.`;
  } else {
    return `예측이 틀렸습니다. (${accuracy}%) 분석 로직 개선이 필요합니다.`;
  }
}

/**
 * 누적 정확도 계산
 *
 * @param accuracyLogs 정확도 로그 배열
 * @returns 평균 정확도
 */
export function calculateAverageAccuracy(accuracyLogs: AccuracyLog[]): number {
  if (accuracyLogs.length === 0) {
    return 0;
  }

  const sum = accuracyLogs.reduce((acc, log) => acc + log.accuracy, 0);
  return Math.round((sum / accuracyLogs.length) * 10) / 10;
}

/**
 * 방향 정확도 계산 (맞춘 횟수 / 전체 횟수)
 *
 * @param accuracyLogs 정확도 로그 배열
 * @returns 방향 정확도 (%)
 */
export function calculateDirectionAccuracy(accuracyLogs: AccuracyLog[]): number {
  if (accuracyLogs.length === 0) {
    return 0;
  }

  const correctCount = accuracyLogs.filter((log) => log.isCorrect).length;
  return Math.round((correctCount / accuracyLogs.length) * 1000) / 10;
}
