import puppeteer, { Browser, Page } from "puppeteer";

import { StockMarketData } from "@/entities/accuracy";

import { withRetry } from "@/shared/api/error-handler";

/**
 * 네이버 증권 크롤러
 *
 * 코스피, 코스닥의 전일 대비 등락률을 수집합니다.
 */

/**
 * 크롤링 설정
 */
const SCRAPER_CONFIG = {
  /** 네이버 증권 시장지표 페이지 */
  BASE_URL: "https://finance.naver.com/sise/",

  /** User-Agent */
  USER_AGENT: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",

  /** 타임아웃 (ms) */
  TIMEOUT: 30000,
};

/**
 * 브라우저 초기화
 */
async function initBrowser(): Promise<Browser> {
  return await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
}

/**
 * 네이버 증권에서 주식 시장 데이터 추출
 */
async function extractStockData(page: Page): Promise<StockMarketData> {
  // 네이버 증권 시장지표 페이지 접속
  await page.goto(SCRAPER_CONFIG.BASE_URL, {
    waitUntil: "domcontentloaded",
    timeout: SCRAPER_CONFIG.TIMEOUT,
  });

  // 페이지 로딩 대기
  await page.waitForSelector("#KOSPI_now", { timeout: 5000 }).catch(() => {
    console.warn("KOSPI 셀렉터 대기 실패, 계속 진행...");
  });

  // 시장 데이터 추출
  const stockData = await page.evaluate(() => {
    // 코스피 등락률 추출
    const kospiChangeElement = document.querySelector("#KOSPI_change") || document.querySelector(".kospi .change_rate");
    let kospiText = kospiChangeElement?.textContent?.trim() || "0";
    // "+" 또는 "-" 제거하고 숫자만 추출
    kospiText = kospiText.replace(/[+\s]/g, "").replace("%", "");
    const kospi = parseFloat(kospiText);

    // 코스닥 등락률 추출
    const kosdaqChangeElement =
      document.querySelector("#KOSDAQ_change") || document.querySelector(".kosdaq .change_rate");
    let kosdaqText = kosdaqChangeElement?.textContent?.trim() || "0";
    kosdaqText = kosdaqText.replace(/[+\s]/g, "").replace("%", "");
    const kosdaq = parseFloat(kosdaqText);

    // 거래량 추출 (선택)
    const volumeElement = document.querySelector(".kospi .volume") || document.querySelector("#KOSPI_volume");
    const volumeText = volumeElement?.textContent?.trim() || "0";
    const volume = parseFloat(volumeText.replace(/,/g, ""));

    return {
      kospi: isNaN(kospi) ? 0 : kospi,
      kosdaq: isNaN(kosdaq) ? 0 : kosdaq,
      volume: isNaN(volume) ? undefined : volume,
    };
  });

  return stockData;
}

/**
 * 주식 시장 데이터 수집 (메인 함수)
 *
 * @returns 주식 시장 데이터
 *
 * @example
 * const stockData = await scrapeStockMarket();
 * console.log(`코스피: ${stockData.kospi}%`);
 */
export async function scrapeStockMarket(): Promise<StockMarketData> {
  console.log("주식 시장 데이터 수집 시작...");

  let browser: Browser | null = null;

  try {
    browser = await initBrowser();
    const page = await browser.newPage();

    // User-Agent 설정
    await page.setUserAgent(SCRAPER_CONFIG.USER_AGENT);

    // 불필요한 리소스 차단
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      const resourceType = request.resourceType();
      if (["image", "stylesheet", "font", "media"].includes(resourceType)) {
        request.abort();
      } else {
        request.continue();
      }
    });

    // 데이터 추출 (재시도 로직 포함)
    const data = await withRetry(async () => await extractStockData(page), {
      maxRetries: 3,
      retryDelay: 2000,
      context: {
        type: "NAVER_FINANCE_SCRAPE",
        url: SCRAPER_CONFIG.BASE_URL,
      },
    });

    console.log("주식 시장 데이터 수집 완료");
    return data;
  } catch (error) {
    console.error("주식 시장 데이터 수집 실패:", error);
    throw new Error("주식 시장 데이터를 가져올 수 없습니다.");
  } finally {
    if (browser) {
      await browser.close();
      console.log("브라우저 종료");
    }
  }
}

/**
 * 주식 시장 요약 출력
 */
export function printStockSummary(data: StockMarketData): void {
  console.log("\n=== 주식 시장 현황 ===");
  console.log(`코스피(KOSPI): ${data.kospi > 0 ? "+" : ""}${data.kospi}%`);
  console.log(`코스닥(KOSDAQ): ${data.kosdaq > 0 ? "+" : ""}${data.kosdaq}%`);
  if (data.volume) {
    console.log(`거래량: ${data.volume.toLocaleString()}`);
  }

  const avgChange = (data.kospi + data.kosdaq) / 2;
  const trend = avgChange > 0 ? "상승 ↑" : avgChange < 0 ? "하락 ↓" : "보합 →";
  console.log(`전체 트렌드: ${trend}`);
  console.log("====================\n");
}

/**
 * 주식 시장 휴장일 확인
 *
 * @returns 휴장일 여부
 */
export function isMarketClosed(): boolean {
  const now = new Date();
  const day = now.getDay();

  // 주말 (토요일: 6, 일요일: 0)
  if (day === 0 || day === 6) {
    return true;
  }

  // 추가: 공휴일 체크 로직 (향후 구현)

  return false;
}
