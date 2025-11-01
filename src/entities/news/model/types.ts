/**
 * 뉴스 엔티티 타입 정의
 *
 * 네이버 뉴스 크롤링 결과를 표현하는 도메인 타입
 */

export interface News {
  /** 뉴스 고유 ID (순번) */
  id: number;

  /** 뉴스 제목 (최대 100자) */
  title: string;

  /** 뉴스 본문 (첫 300자 또는 전체) */
  content: string;

  /** 뉴스 원문 URL */
  url: string;

  /** 게시 시간 (ISO 8601 형식) */
  publishedAt: string;

  /** 언론사 */
  source: string;

  /** 크롤링된 시간 (ISO 8601 형식) */
  scrapedAt: string;
}

/**
 * 뉴스 수집 결과 타입
 */
export interface NewsCollectionResult {
  /** 수집 성공 여부 */
  success: boolean;

  /** 수집된 뉴스 개수 */
  count: number;

  /** 수집된 뉴스 배열 */
  data: News[];

  /** 저장된 파일 경로 */
  savedPath?: string;

  /** 에러 메시지 (실패 시) */
  error?: string;
}

/**
 * 크롤링 진행 상황 타입
 */
export interface ScrapeProgress {
  /** 현재 수집 개수 */
  current: number;

  /** 목표 수집 개수 */
  total: number;

  /** 진행률 (0-100) */
  percentage: number;

  /** 예상 소요 시간 (초) */
  estimatedTime?: number;
}
