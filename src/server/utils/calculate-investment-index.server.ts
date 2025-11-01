import type { SentimentAnalysis } from "@/entities/analysis";

/**
 * 투자 지수 계산 로직
 *
 * @description
 * 감성 분석 결과를 기반으로 투자 지수를 계산합니다.
 * - 기본 공식: (긍정 뉴스 수 / 전체 뉴스 수) × 100
 * - 가중치: 신뢰도 70% 이상 → 1.5배
 * - 최종 지수: 0-100% (소수점 첫째자리)
 */

/**
 * 신뢰도 가중치 기준
 */
const HIGH_CONFIDENCE_THRESHOLD = 70;
const HIGH_CONFIDENCE_WEIGHT = 1.5;

/**
 * 투자 지수 계산
 *
 * @param analyses 감성 분석 결과 배열
 * @returns 투자 지수 (0-100, 소수점 첫째자리)
 */
export function calculateInvestmentIndex(analyses: SentimentAnalysis[]): number {
  if (analyses.length === 0) {
    return 0;
  }

  let positiveScore = 0;
  let negativeScore = 0;
  let totalWeight = 0;

  // 각 뉴스에 가중치 적용
  for (const analysis of analyses) {
    // 신뢰도에 따른 가중치
    const weight = analysis.confidence >= HIGH_CONFIDENCE_THRESHOLD ? HIGH_CONFIDENCE_WEIGHT : 1.0;

    if (analysis.sentiment === "positive") {
      positiveScore += weight;
    } else if (analysis.sentiment === "negative") {
      negativeScore += weight;
    }
    // neutral은 가중치에서 제외

    totalWeight += weight;
  }

  // 투자 지수 계산: (긍정 점수 - 부정 점수) / 전체 가중치 × 100
  // 범위: -100 ~ +100을 0 ~ 100으로 정규화
  const rawIndex = totalWeight > 0 ? ((positiveScore - negativeScore) / totalWeight) * 100 : 0;
  const normalizedIndex = (rawIndex + 100) / 2; // -100~100 → 0~100

  // 0-100 범위로 클리핑 및 소수점 첫째자리로 반올림
  return Math.round(Math.max(0, Math.min(100, normalizedIndex)) * 10) / 10;
}

/**
 * 단순 투자 지수 계산 (가중치 없이)
 *
 * @param analyses 감성 분석 결과 배열
 * @returns 투자 지수 (0-100, 소수점 첫째자리)
 */
export function calculateSimpleInvestmentIndex(analyses: SentimentAnalysis[]): number {
  if (analyses.length === 0) {
    return 0;
  }

  const positiveCount = analyses.filter((a) => a.sentiment === "positive").length;
  const index = (positiveCount / analyses.length) * 100;

  return Math.round(index * 10) / 10;
}

/**
 * 투자 지수 등급 계산
 *
 * @param index 투자 지수 (0-100)
 * @returns 등급 문자열
 */
export function getInvestmentGrade(index: number): string {
  if (index >= 80) return "A+ (매우 긍정적)";
  if (index >= 70) return "A (긍정적)";
  if (index >= 60) return "B+ (다소 긍정적)";
  if (index >= 50) return "B (중립)";
  if (index >= 40) return "C+ (다소 부정적)";
  if (index >= 30) return "C (부정적)";
  return "D (매우 부정적)";
}

/**
 * 투자 추천 메시지 생성
 *
 * @param index 투자 지수 (0-100)
 * @returns 추천 메시지
 */
export function getInvestmentRecommendation(index: number): string {
  if (index >= 70) {
    return "시장 분위기가 매우 긍정적입니다. 투자 검토를 권장합니다.";
  }
  if (index >= 55) {
    return "시장 분위기가 다소 긍정적입니다. 신중한 투자를 고려할 수 있습니다.";
  }
  if (index >= 45) {
    return "시장 분위기가 중립적입니다. 관망하며 추가 정보를 수집하세요.";
  }
  if (index >= 30) {
    return "시장 분위기가 다소 부정적입니다. 투자에 신중을 기하세요.";
  }
  return "시장 분위기가 매우 부정적입니다. 투자를 보류하는 것을 권장합니다.";
}

/**
 * 신뢰도 높은 뉴스만 필터링
 *
 * @param analyses 감성 분석 결과 배열
 * @param threshold 신뢰도 임계값 (기본값: 70)
 * @returns 필터링된 분석 결과
 */
export function filterHighConfidenceNews(
  analyses: SentimentAnalysis[],
  threshold: number = HIGH_CONFIDENCE_THRESHOLD,
): SentimentAnalysis[] {
  return analyses.filter((a) => a.confidence >= threshold);
}

/**
 * 감성별 평균 신뢰도 계산
 *
 * @param analyses 감성 분석 결과 배열
 * @returns 감성별 평균 신뢰도
 */
export function calculateAverageConfidenceBySentiment(analyses: SentimentAnalysis[]): {
  positive: number;
  negative: number;
  neutral: number;
} {
  const positiveAnalyses = analyses.filter((a) => a.sentiment === "positive");
  const negativeAnalyses = analyses.filter((a) => a.sentiment === "negative");
  const neutralAnalyses = analyses.filter((a) => a.sentiment === "neutral");

  const avgPositive =
    positiveAnalyses.length > 0
      ? positiveAnalyses.reduce((sum, a) => sum + a.confidence, 0) / positiveAnalyses.length
      : 0;

  const avgNegative =
    negativeAnalyses.length > 0
      ? negativeAnalyses.reduce((sum, a) => sum + a.confidence, 0) / negativeAnalyses.length
      : 0;

  const avgNeutral =
    neutralAnalyses.length > 0 ? neutralAnalyses.reduce((sum, a) => sum + a.confidence, 0) / neutralAnalyses.length : 0;

  return {
    positive: Math.round(avgPositive * 10) / 10,
    negative: Math.round(avgNegative * 10) / 10,
    neutral: Math.round(avgNeutral * 10) / 10,
  };
}
