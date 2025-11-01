import puppeteer, { Browser, Page } from "puppeteer";

import { CryptoMarketData } from "@/entities/accuracy";

import { withRetry } from "@/shared/api/error-handler";

/**
 * 코인니스 크롤러
 *
 * 주요 암호화폐(비트코인, 이더리움)의 24시간 등락률을 수집합니다.
 */

/**
 * 크롤링 설정
 */
const SCRAPER_CONFIG = {
  /** 코인 시세 API 엔드포인트 (바이낸스) */
  BINANCE_API: "https://api.binance.com/api/v3/ticker/24hr",

  /** User-Agent */
  USER_AGENT: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",

  /** 타임아웃 (ms) */
  TIMEOUT: 10000,
};

/**
 * 바이낸스 API를 통한 암호화폐 등락률 조회
 *
 * 코인니스 사이트 크롤링 대신 공식 API를 사용하여
 * 더 안정적이고 빠르게 데이터를 수집합니다.
 */
async function fetchCryptoDataFromAPI(): Promise<CryptoMarketData> {
  try {
    // BTC 데이터 조회
    const btcResponse = await fetch(`${SCRAPER_CONFIG.BINANCE_API}?symbol=BTCUSDT`);
    const btcData = await btcResponse.json();
    const btcChange = parseFloat(btcData.priceChangePercent);

    // ETH 데이터 조회
    const ethResponse = await fetch(`${SCRAPER_CONFIG.BINANCE_API}?symbol=ETHUSDT`);
    const ethData = await ethResponse.json();
    const ethChange = parseFloat(ethData.priceChangePercent);

    // 주요 알트코인 조회 (상위 10개 평균)
    const altcoins = ["BNBUSDT", "SOLUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT"];
    const altcoinChanges: number[] = [];

    for (const symbol of altcoins) {
      try {
        const response = await fetch(`${SCRAPER_CONFIG.BINANCE_API}?symbol=${symbol}`);
        const data = await response.json();
        altcoinChanges.push(parseFloat(data.priceChangePercent));
      } catch (error) {
        console.warn(`알트코인 ${symbol} 조회 실패:`, error);
      }
    }

    const avgAltcoin =
      altcoinChanges.length > 0 ? altcoinChanges.reduce((a, b) => a + b, 0) / altcoinChanges.length : 0;

    return {
      btc: Number(btcChange.toFixed(2)),
      eth: Number(ethChange.toFixed(2)),
      avgAltcoin: Number(avgAltcoin.toFixed(2)),
    };
  } catch (error) {
    console.error("바이낸스 API 조회 실패:", error);
    throw new Error("암호화폐 데이터 조회 실패");
  }
}

/**
 * Puppeteer를 통한 코인니스 크롤링 (대체 방법)
 *
 * API가 실패할 경우를 대비한 백업 크롤러
 */
async function scrapeCoinness(): Promise<CryptoMarketData> {
  let browser: Browser | null = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setUserAgent(SCRAPER_CONFIG.USER_AGENT);

    // 코인니스 메인 페이지 접속
    await page.goto("https://coinness.com/", {
      waitUntil: "domcontentloaded",
      timeout: SCRAPER_CONFIG.TIMEOUT,
    });

    // 코인 가격 정보 추출
    const cryptoData = await page.evaluate(() => {
      // 비트코인 등락률 추출 (예시 셀렉터 - 실제 사이트 구조에 따라 수정 필요)
      const btcElement =
        document.querySelector('[data-symbol="BTC"] .change-percent') || document.querySelector(".btc-change");
      const btcText = btcElement?.textContent?.trim() || "0%";
      const btc = parseFloat(btcText.replace("%", ""));

      // 이더리움 등락률 추출
      const ethElement =
        document.querySelector('[data-symbol="ETH"] .change-percent') || document.querySelector(".eth-change");
      const ethText = ethElement?.textContent?.trim() || "0%";
      const eth = parseFloat(ethText.replace("%", ""));

      return {
        btc: isNaN(btc) ? 0 : btc,
        eth: isNaN(eth) ? 0 : eth,
        avgAltcoin: 0, // 코인니스에서는 개별 조회 필요
      };
    });

    return cryptoData;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * 암호화폐 시장 데이터 수집 (메인 함수)
 *
 * 1차: 바이낸스 API 사용
 * 2차: 코인니스 크롤링 (API 실패 시)
 *
 * @returns 암호화폐 시장 데이터
 *
 * @example
 * const cryptoData = await scrapeCryptoMarket();
 * console.log(`BTC: ${cryptoData.btc}%`);
 */
export async function scrapeCryptoMarket(): Promise<CryptoMarketData> {
  console.log("암호화폐 시장 데이터 수집 시작...");

  try {
    // 1차 시도: 바이낸스 API
    console.log("바이낸스 API 조회 중...");
    const data = await withRetry(async () => await fetchCryptoDataFromAPI(), {
      maxRetries: 2,
      retryDelay: 1000,
      context: { type: "BINANCE_API" },
    });

    console.log("암호화폐 데이터 수집 완료 (API)");
    return data;
  } catch (apiError) {
    console.warn("바이낸스 API 실패, 코인니스 크롤링 시도...");

    try {
      // 2차 시도: 코인니스 크롤링
      const data = await withRetry(async () => await scrapeCoinness(), {
        maxRetries: 3,
        retryDelay: 2000,
        context: { type: "COINNESS_SCRAPE" },
      });

      console.log("암호화폐 데이터 수집 완료 (크롤링)");
      return data;
    } catch (scrapeError) {
      console.error("모든 암호화폐 데이터 수집 방법 실패");
      throw new Error("암호화폐 시장 데이터를 가져올 수 없습니다.");
    }
  }
}

/**
 * 암호화폐 시장 요약 출력
 */
export function printCryptoSummary(data: CryptoMarketData): void {
  console.log("\n=== 암호화폐 시장 현황 ===");
  console.log(`비트코인(BTC): ${data.btc > 0 ? "+" : ""}${data.btc}%`);
  console.log(`이더리움(ETH): ${data.eth > 0 ? "+" : ""}${data.eth}%`);
  if (data.avgAltcoin !== undefined) {
    console.log(`알트코인 평균: ${data.avgAltcoin > 0 ? "+" : ""}${data.avgAltcoin}%`);
  }

  const avgChange = (data.btc + data.eth) / 2;
  const trend = avgChange > 0 ? "상승 ↑" : avgChange < 0 ? "하락 ↓" : "보합 →";
  console.log(`전체 트렌드: ${trend}`);
  console.log("========================\n");
}
