/**
 * 시장 데이터 및 정확도 타입 정의
 *
 * 코인/주식 시장의 실제 데이터와 정확도 검증을 위한 타입
 */

/**
 * 암호화폐 시장 데이터
 */
export interface CryptoMarketData {
  /** 비트코인(BTC) 24시간 등락률 (%) */
  btc: number;

  /** 이더리움(ETH) 24시간 등락률 (%) */
  eth: number;

  /** 주요 알트코인 평균 등락률 (%) */
  avgAltcoin?: number;
}

/**
 * 주식 시장 데이터
 */
export interface StockMarketData {
  /** 코스피 전일 대비 등락률 (%) */
  kospi: number;

  /** 코스닥 전일 대비 등락률 (%) */
  kosdaq: number;

  /** 거래량 (선택) */
  volume?: number;

  /** 외국인 순매수 (선택) */
  foreignBuying?: number;
}

/**
 * 전체 시장 데이터
 */
export interface MarketData {
  /** 데이터 수집 날짜 (YYYY-MM-DD) */
  date: string;

  /** 암호화폐 시장 데이터 */
  crypto: CryptoMarketData;

  /** 주식 시장 데이터 */
  stock: StockMarketData;

  /** 데이터 수집 시간 (ISO 8601) */
  collectedAt: string;
}

/**
 * 예측 데이터
 */
export interface PredictionData {
  /** 투자 지수 (0-100) */
  index: number;

  /** 예측 방향 */
  direction: "positive" | "negative" | "neutral";

  /** 예측 날짜 */
  date: string;
}

/**
 * 정확도 로그
 */
export interface AccuracyLog {
  /** 검증 날짜 */
  date: string;

  /** 정확도 (0-100) */
  accuracy: number;

  /** 예측 데이터 */
  prediction: PredictionData;

  /** 실제 시장 데이터 */
  actual: MarketData;

  /** 예측 성공 여부 */
  isCorrect: boolean;

  /** 오차율 (%) */
  errorRate: number;

  /** 검증 시간 (ISO 8601) */
  verifiedAt: string;
}

/**
 * 시장 데이터 수집 결과
 */
export interface MarketDataCollectionResult {
  /** 수집 성공 여부 */
  success: boolean;

  /** 수집된 데이터 */
  data?: MarketData;

  /** 에러 메시지 (실패 시) */
  error?: string;

  /** 부분 실패 정보 */
  partialFailure?: {
    crypto?: boolean;
    stock?: boolean;
  };
}
