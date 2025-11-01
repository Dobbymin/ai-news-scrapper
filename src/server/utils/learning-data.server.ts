import type { AccuracyLog } from "@/entities/accuracy";
import type { AnalysisResult, SentimentAnalysis } from "@/entities/analysis";
import type { News } from "@/entities/news";

/**
 * 학습 데이터 타입
 */
export interface LearningData {
  /** 학습 데이터 생성 날짜 */
  createdAt: string;

  /** 총 학습 사례 수 */
  totalCases: number;

  /** 성공 사례 (정확했던 예측) */
  successCases: SuccessCase[];

  /** 실패 사례 (틀린 예측) */
  failureCases: FailureCase[];

  /** 키워드 패턴 분석 */
  keywordPatterns: KeywordPattern[];

  /** 학습 요약 */
  summary: LearningSummary;
}

/**
 * 성공 사례
 */
export interface SuccessCase {
  /** 날짜 */
  date: string;

  /** 정확도 */
  accuracy: number;

  /** 투자 지수 */
  investmentIndex: number;

  /** 주요 키워드 */
  keywords: string[];

  /** 긍정 뉴스 비율 */
  positiveRatio: number;

  /** 평균 신뢰도 */
  avgConfidence: number;

  /** 뉴스 개수 */
  newsCount: number;
}

/**
 * 실패 사례
 */
export interface FailureCase {
  /** 날짜 */
  date: string;

  /** 정확도 */
  accuracy: number;

  /** 투자 지수 */
  investmentIndex: number;

  /** 예측 방향 */
  predictedDirection: string;

  /** 실제 방향 */
  actualDirection: string;

  /** 오류 패턴 */
  errorPattern: string;

  /** 주요 키워드 */
  keywords: string[];
}

/**
 * 키워드 패턴
 */
export interface KeywordPattern {
  /** 키워드 */
  keyword: string;

  /** 등장 횟수 */
  frequency: number;

  /** 성공률 (%) */
  successRate: number;

  /** 평균 정확도 */
  avgAccuracy: number;
}

/**
 * 학습 요약
 */
export interface LearningSummary {
  /** 전체 평균 정확도 */
  avgAccuracy: number;

  /** 방향 정확도 (%) */
  directionAccuracy: number;

  /** 성공 사례 수 */
  successCount: number;

  /** 실패 사례 수 */
  failureCount: number;

  /** 가장 정확했던 키워드 TOP 5 */
  topKeywords: string[];

  /** 개선이 필요한 영역 */
  improvementAreas: string[];
}

/**
 * 성공 사례 추출
 */
export function extractSuccessCases(
  accuracyLogs: AccuracyLog[],
  analysisResults: AnalysisResult[],
  threshold: number = 70,
): SuccessCase[] {
  return accuracyLogs
    .filter((log) => log.accuracy >= threshold)
    .map((log) => {
      const analysis = analysisResults.find((a) => a.date === log.date);

      if (!analysis) {
        throw new Error(`Analysis result not found for date: ${log.date}`);
      }

      const positiveCount = analysis.summary.positive;
      const totalNews = analysis.totalNews;
      const positiveRatio = Math.round((positiveCount / totalNews) * 100);

      // 평균 신뢰도 계산
      const avgConfidence =
        analysis.newsAnalysis.reduce((sum, a) => sum + a.confidence, 0) / analysis.newsAnalysis.length;

      return {
        date: log.date,
        accuracy: log.accuracy,
        investmentIndex: log.prediction.index,
        keywords: analysis.keywords,
        positiveRatio,
        avgConfidence: Math.round(avgConfidence * 10) / 10,
        newsCount: totalNews,
      };
    });
}

/**
 * 실패 사례 추출
 */
export function extractFailureCases(
  accuracyLogs: AccuracyLog[],
  analysisResults: AnalysisResult[],
  threshold: number = 60,
): FailureCase[] {
  return accuracyLogs
    .filter((log) => log.accuracy < threshold)
    .map((log) => {
      const analysis = analysisResults.find((a) => a.date === log.date);

      if (!analysis) {
        throw new Error(`Analysis result not found for date: ${log.date}`);
      }

      // 오류 패턴 분석
      let errorPattern = "";
      if (!log.isCorrect) {
        errorPattern = "방향 예측 실패";
      } else {
        errorPattern = "오차율 높음";
      }

      return {
        date: log.date,
        accuracy: log.accuracy,
        investmentIndex: log.prediction.index,
        predictedDirection: log.prediction.direction,
        actualDirection: determineActualDirection(log.actual),
        errorPattern,
        keywords: analysis.keywords,
      };
    });
}

/**
 * 실제 방향 계산 헬퍼
 */
function determineActualDirection(marketData: any): string {
  const cryptoAvg = (marketData.crypto.btc + marketData.crypto.eth) / 2;
  const stockAvg = (marketData.stock.kospi + marketData.stock.kosdaq) / 2;
  const overallAvg = (cryptoAvg + stockAvg) / 2;

  if (overallAvg >= 1.0) return "positive";
  if (overallAvg <= -1.0) return "negative";
  return "neutral";
}

/**
 * 키워드 패턴 분석
 */
export function analyzeKeywordPatterns(
  accuracyLogs: AccuracyLog[],
  analysisResults: AnalysisResult[],
): KeywordPattern[] {
  const keywordMap = new Map<string, { total: number; accuracySum: number; successCount: number }>();

  for (const log of accuracyLogs) {
    const analysis = analysisResults.find((a) => a.date === log.date);
    if (!analysis) continue;

    for (const keyword of analysis.keywords) {
      if (!keywordMap.has(keyword)) {
        keywordMap.set(keyword, { total: 0, accuracySum: 0, successCount: 0 });
      }

      const data = keywordMap.get(keyword)!;
      data.total++;
      data.accuracySum += log.accuracy;
      if (log.accuracy >= 70) {
        data.successCount++;
      }
    }
  }

  // 키워드 패턴 배열 생성 및 정렬
  return Array.from(keywordMap.entries())
    .map(([keyword, data]) => ({
      keyword,
      frequency: data.total,
      successRate: Math.round((data.successCount / data.total) * 1000) / 10,
      avgAccuracy: Math.round((data.accuracySum / data.total) * 10) / 10,
    }))
    .sort((a, b) => b.successRate - a.successRate);
}

/**
 * 학습 데이터 생성
 */
export function createLearningData(accuracyLogs: AccuracyLog[], analysisResults: AnalysisResult[]): LearningData {
  const successCases = extractSuccessCases(accuracyLogs, analysisResults);
  const failureCases = extractFailureCases(accuracyLogs, analysisResults);
  const keywordPatterns = analyzeKeywordPatterns(accuracyLogs, analysisResults);

  // 전체 평균 정확도
  const avgAccuracy = accuracyLogs.reduce((sum, log) => sum + log.accuracy, 0) / accuracyLogs.length;

  // 방향 정확도
  const directionAccuracy = (accuracyLogs.filter((log) => log.isCorrect).length / accuracyLogs.length) * 100;

  // TOP 5 키워드
  const topKeywords = keywordPatterns.slice(0, 5).map((p) => p.keyword);

  // 개선 영역 분석
  const improvementAreas: string[] = [];
  if (directionAccuracy < 70) {
    improvementAreas.push("방향 예측 정확도 개선 필요");
  }
  if (avgAccuracy < 70) {
    improvementAreas.push("전체 정확도 향상 필요");
  }
  if (failureCases.length > successCases.length) {
    improvementAreas.push("실패 사례가 성공 사례보다 많음 - 분석 로직 재검토");
  }

  const summary: LearningSummary = {
    avgAccuracy: Math.round(avgAccuracy * 10) / 10,
    directionAccuracy: Math.round(directionAccuracy * 10) / 10,
    successCount: successCases.length,
    failureCount: failureCases.length,
    topKeywords,
    improvementAreas,
  };

  return {
    createdAt: new Date().toISOString(),
    totalCases: accuracyLogs.length,
    successCases,
    failureCases,
    keywordPatterns,
    summary,
  };
}

/**
 * 학습 데이터 출력
 */
export function printLearningData(data: LearningData): void {
  console.log("\n" + "═".repeat(50));
  console.log("📚 학습 데이터 분석 결과");
  console.log("═".repeat(50));

  console.log(`\n📊 요약`);
  console.log(`  - 총 사례: ${data.totalCases}개`);
  console.log(`  - 성공 사례: ${data.summary.successCount}개`);
  console.log(`  - 실패 사례: ${data.summary.failureCount}개`);
  console.log(`  - 평균 정확도: ${data.summary.avgAccuracy}%`);
  console.log(`  - 방향 정확도: ${data.summary.directionAccuracy}%`);

  console.log(`\n🏆 TOP 5 키워드`);
  data.keywordPatterns.slice(0, 5).forEach((pattern, index) => {
    console.log(
      `  ${index + 1}. ${pattern.keyword} (등장: ${pattern.frequency}회, 성공률: ${pattern.successRate}%, 평균: ${pattern.avgAccuracy}%)`,
    );
  });

  if (data.summary.improvementAreas.length > 0) {
    console.log(`\n⚠️  개선 필요 영역`);
    data.summary.improvementAreas.forEach((area, index) => {
      console.log(`  ${index + 1}. ${area}`);
    });
  }

  console.log("\n" + "═".repeat(50) + "\n");
}
