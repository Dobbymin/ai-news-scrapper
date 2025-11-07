/**
 * CryptoScraperButton - Feature UI Component
 * @description 코인 뉴스 크롤링 및 분석을 실행하는 버튼 컴포넌트
 */
import { Alert, AlertDescription, Button } from "@/shared";

import { useCryptoNewsScraper } from "../model/useCryptoNewsScraper";

export function CryptoScraperButton() {
  const { scraping, success, error, runScraping } = useCryptoNewsScraper();

  return (
    <div className='space-y-4'>
      <Button onClick={runScraping} disabled={scraping} size='lg' variant='outline' className='w-full sm:w-auto'>
        {scraping ? "⏳ 수집 및 분석 중..." : "🪙 오늘 코인 뉴스 수집"}
      </Button>

      {success && (
        <Alert className='border-green-200 bg-green-50'>
          <AlertDescription className='text-green-800'>
            ✅ 코인 뉴스 수집 및 분석이 완료되었습니다! 페이지를 새로고침합니다...
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className='border-red-200 bg-red-50'>
          <AlertDescription className='text-red-800'>⚠️ {error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
