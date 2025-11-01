import { saveErrorLog } from "@/server/storage/json-store.server";

/**
 * 에러 핸들러
 *
 * 크롤링 및 API 호출 시 발생하는 에러를 처리하고
 * 3회 재시도 로직을 제공합니다.
 */

/**
 * 에러 타입 정의
 */
export type ErrorType =
  | "NETWORK_ERROR" // 네트워크 연결 오류
  | "TIMEOUT_ERROR" // 타임아웃
  | "PARSE_ERROR" // 파싱 오류
  | "API_ERROR" // API 호출 오류
  | "VALIDATION_ERROR" // 데이터 검증 오류
  | "UNKNOWN_ERROR"; // 알 수 없는 오류

/**
 * 재시도 옵션
 */
export interface RetryOptions {
  /** 최대 재시도 횟수 (기본값: 3) */
  maxRetries?: number;

  /** 재시도 간격 (ms, 기본값: 1000) */
  retryDelay?: number;

  /** 지수 백오프 사용 여부 (기본값: true) */
  useExponentialBackoff?: boolean;

  /** 로그 저장 여부 (기본값: true) */
  saveLog?: boolean;

  /** 에러 컨텍스트 */
  context?: {
    type: string;
    url?: string;
  };
}

/**
 * 에러 타입 감지
 */
export function detectErrorType(error: unknown): ErrorType {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes("network") || message.includes("fetch")) {
      return "NETWORK_ERROR";
    }
    if (message.includes("timeout")) {
      return "TIMEOUT_ERROR";
    }
    if (message.includes("parse") || message.includes("json")) {
      return "PARSE_ERROR";
    }
    if (message.includes("api") || message.includes("request")) {
      return "API_ERROR";
    }
    if (message.includes("validation") || message.includes("invalid")) {
      return "VALIDATION_ERROR";
    }
  }

  return "UNKNOWN_ERROR";
}

/**
 * 재시도 가능한 에러인지 확인
 */
export function isRetryableError(errorType: ErrorType): boolean {
  return ["NETWORK_ERROR", "TIMEOUT_ERROR", "API_ERROR"].includes(errorType);
}

/**
 * 대기 시간 계산 (지수 백오프)
 */
function calculateDelay(attempt: number, baseDelay: number, useExponentialBackoff: boolean): number {
  if (useExponentialBackoff) {
    // 1초, 2초, 4초...
    return baseDelay * Math.pow(2, attempt - 1);
  }
  return baseDelay;
}

/**
 * 대기 함수
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 재시도 로직을 포함한 함수 실행
 *
 * @param fn 실행할 비동기 함수
 * @param options 재시도 옵션
 * @returns 함수 실행 결과
 *
 * @example
 * const result = await withRetry(
 *   async () => await scrapeNews(),
 *   {
 *     maxRetries: 3,
 *     context: { type: 'NAVER_NEWS_SCRAPE' }
 *   }
 * );
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    useExponentialBackoff = true,
    saveLog = true,
    context = { type: "UNKNOWN" },
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 함수 실행
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const errorType = detectErrorType(lastError);

      console.error(`[Attempt ${attempt}/${maxRetries}] ${errorType}:`, lastError.message);

      // 에러 로그 저장
      if (saveLog) {
        await saveErrorLog(lastError, {
          ...context,
          timestamp: new Date().toISOString(),
        });
      }

      // 재시도 가능한 에러인지 확인
      if (!isRetryableError(errorType)) {
        console.error("재시도 불가능한 에러입니다.");
        throw lastError;
      }

      // 마지막 시도였다면 에러 던지기
      if (attempt === maxRetries) {
        console.error("모든 재시도 실패");
        throw lastError;
      }

      // 대기 후 재시도
      const delay = calculateDelay(attempt, retryDelay, useExponentialBackoff);
      console.log(`${delay}ms 후 재시도...`);
      await sleep(delay);
    }
  }

  // 여기 도달하면 안 되지만 타입스크립트를 위해
  throw lastError || new Error("알 수 없는 에러");
}

/**
 * 에러 메시지 포맷팅
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }
  return String(error);
}

/**
 * 에러 스택 트레이스 추출
 */
export function getErrorStack(error: unknown): string {
  if (error instanceof Error && error.stack) {
    return error.stack;
  }
  return "Stack trace not available";
}
