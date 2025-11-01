/**
 * 감성 분석 결과 타입
 */
export interface SentimentAnalysis {
  /** 뉴스 ID */
  newsId: number;
  /** 감성: positive(긍정), negative(부정), neutral(중립) */
  sentiment: "positive" | "negative" | "neutral";
  /** 신뢰도 (0-100%) */
  confidence: number;
  /** 추출된 키워드 */
  keywords: string[];
  /** 분석 이유 */
  reason: string;
}

/**
 * 분석 결과 요약
 */
export interface AnalysisSummary {
  /** 긍정 뉴스 개수 */
  positive: number;
  /** 부정 뉴스 개수 */
  negative: number;
  /** 중립 뉴스 개수 */
  neutral: number;
}

/**
 * 전체 분석 결과
 */
export interface AnalysisResult {
  /** 분석 날짜 (YYYY-MM-DD) */
  date: string;
  /** 총 뉴스 개수 */
  totalNews: number;
  /** 투자 지수 (0-100%) */
  investmentIndex: number;
  /** 분석 요약 */
  summary: AnalysisSummary;
  /** 주요 키워드 (빈도순 상위 5개) */
  keywords: string[];
  /** 개별 뉴스 분석 결과 */
  newsAnalysis: SentimentAnalysis[];
  /** 분석 완료 시간 */
  analyzedAt: string;
}

/**
 * 감성 분석 진행 상황
 */
export interface AnalysisProgress {
  /** 현재 진행 중인 뉴스 인덱스 */
  current: number;
  /** 전체 뉴스 개수 */
  total: number;
  /** 진행률 (0-100%) */
  percentage: number;
  /** 현재 처리 중인 뉴스 제목 */
  currentTitle?: string;
}
