/**
 * Crypto News Scraper Feature - Model
 * @description 코인 뉴스 크롤링 및 분석 실행 훅
 */
import { useRef, useState } from "react";

interface UseCryptoNewsScraperReturn {
  scraping: boolean;
  success: boolean;
  error: string | null;
  runScraping: () => Promise<void>;
}

export function useCryptoNewsScraper(): UseCryptoNewsScraperReturn {
  const [scraping, setScraping] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isRunningRef = useRef(false);

  const runScraping = async () => {
    // 이미 실행 중이면 무시
    if (isRunningRef.current || scraping) {
      console.log("🚫 이미 크롤링이 실행 중입니다.");
      return;
    }

    isRunningRef.current = true;

    try {
      setScraping(true);
      setError(null);
      setSuccess(false);

      console.log("🔵 API 호출 시작");

      // 코인 뉴스 수집 + 분석 일괄 실행 API 호출
      const response = await fetch("/api/crypto-news/scrape-and-analyze", {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "코인 뉴스 수집/분석 실행에 실패했습니다.");
      }

      setSuccess(true);

      // 3초 후 페이지 새로고침
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (err) {
      console.error("코인 뉴스 수집 실패:", err);
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setScraping(false);
      // 1초 후 플래그 해제 (중복 클릭 방지)
      setTimeout(() => {
        isRunningRef.current = false;
      }, 1000);
    }
  };

  return {
    scraping,
    success,
    error,
    runScraping,
  };
}
