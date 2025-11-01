import { MarketData, MarketDataCollectionResult } from "@/entities/accuracy";

import { saveJson } from "../storage/json-store.server";

import { printCryptoSummary, scrapeCryptoMarket } from "./scraper-coinness.server";
import { isMarketClosed, printStockSummary, scrapeStockMarket } from "./scraper-naver-finance.server";

/**
 * 시장 데이터 통합 크롤러
 *
 * 암호화폐와 주식 시장 데이터를 통합 수집합니다.
 */

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷팅
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 전체 시장 데이터 수집
 *
 * 암호화폐와 주식 시장 데이터를 순차적으로 수집합니다.
 * 한 쪽이 실패해도 다른 쪽 데이터는 수집을 계속합니다.
 *
 * @param date 수집 날짜 (기본값: 오늘)
 * @returns 시장 데이터 수집 결과
 *
 * @example
 * const result = await scrapeAllMarketData();
 * if (result.success) {
 *   console.log(result.data);
 * }
 */
export async function scrapeAllMarketData(date: Date = new Date()): Promise<MarketDataCollectionResult> {
  console.log("\n=== 전체 시장 데이터 수집 시작 ===\n");

  const dateStr = formatDate(date);
  let cryptoData = null;
  let stockData = null;
  let cryptoFailed = false;
  let stockFailed = false;

  // 1. 암호화폐 시장 데이터 수집
  try {
    cryptoData = await scrapeCryptoMarket();
    printCryptoSummary(cryptoData);
  } catch (error) {
    console.error("❌ 암호화폐 데이터 수집 실패:", error);
    cryptoFailed = true;
  }

  // 2. 주식 시장 데이터 수집
  try {
    // 주말/공휴일 체크
    if (isMarketClosed()) {
      console.warn("⚠️  주식 시장이 휴장입니다. (주말 또는 공휴일)");
      stockFailed = true;
    } else {
      stockData = await scrapeStockMarket();
      printStockSummary(stockData);
    }
  } catch (error) {
    console.error("❌ 주식 시장 데이터 수집 실패:", error);
    stockFailed = true;
  }

  // 3. 결과 처리
  if (cryptoFailed && stockFailed) {
    // 둘 다 실패
    return {
      success: false,
      error: "모든 시장 데이터 수집 실패",
      partialFailure: {
        crypto: true,
        stock: true,
      },
    };
  }

  if (cryptoFailed || stockFailed) {
    // 부분 실패
    console.warn("⚠️  일부 시장 데이터 수집 실패");
  }

  // 수집된 데이터로 MarketData 구성
  const marketData: MarketData = {
    date: dateStr,
    crypto: cryptoData || { btc: 0, eth: 0, avgAltcoin: 0 },
    stock: stockData || { kospi: 0, kosdaq: 0 },
    collectedAt: new Date().toISOString(),
  };

  console.log("=== 전체 시장 데이터 수집 완료 ===\n");

  return {
    success: true,
    data: marketData,
    partialFailure:
      cryptoFailed || stockFailed
        ? {
            crypto: cryptoFailed,
            stock: stockFailed,
          }
        : undefined,
  };
}

/**
 * 시장 데이터 수집 및 저장
 *
 * @param date 수집 날짜 (기본값: 오늘)
 * @returns 저장된 파일 경로
 *
 * @example
 * const filePath = await collectAndSaveMarketData();
 * console.log(`저장 완료: ${filePath}`);
 */
export async function collectAndSaveMarketData(date: Date = new Date()): Promise<string> {
  // 데이터 수집
  const result = await scrapeAllMarketData(date);

  if (!result.success || !result.data) {
    throw new Error(result.error || "시장 데이터 수집 실패");
  }

  // JSON 저장
  const dateStr = formatDate(date);
  const fileName = `market-${dateStr}.json`;
  const filePath = await saveJson(result.data, "market", fileName);

  console.log(`✅ 시장 데이터 저장 완료: ${filePath}`);

  return filePath;
}

/**
 * 시장 전체 평균 등락률 계산
 *
 * @param marketData 시장 데이터
 * @returns 전체 평균 등락률 (%)
 */
export function calculateOverallMarketChange(marketData: MarketData): number {
  const cryptoAvg = (marketData.crypto.btc + marketData.crypto.eth) / 2;
  const stockAvg = (marketData.stock.kospi + marketData.stock.kosdaq) / 2;

  return Number(((cryptoAvg + stockAvg) / 2).toFixed(2));
}

/**
 * 시장 트렌드 판단
 *
 * @param marketData 시장 데이터
 * @returns 트렌드 ('positive', 'negative', 'neutral')
 */
export function determineMarketTrend(marketData: MarketData): "positive" | "negative" | "neutral" {
  const avgChange = calculateOverallMarketChange(marketData);

  if (avgChange >= 1) return "positive";
  if (avgChange <= -1) return "negative";
  return "neutral";
}

/**
 * 시장 데이터 요약 출력
 */
export function printMarketSummary(marketData: MarketData): void {
  console.log("\n╔════════════════════════════════════╗");
  console.log("║     전체 시장 데이터 요약          ║");
  console.log("╚════════════════════════════════════╝");
  console.log(`📅 날짜: ${marketData.date}`);
  console.log("\n💰 암호화폐:");
  console.log(`   BTC: ${marketData.crypto.btc > 0 ? "+" : ""}${marketData.crypto.btc}%`);
  console.log(`   ETH: ${marketData.crypto.eth > 0 ? "+" : ""}${marketData.crypto.eth}%`);
  console.log("\n📊 주식:");
  console.log(`   KOSPI: ${marketData.stock.kospi > 0 ? "+" : ""}${marketData.stock.kospi}%`);
  console.log(`   KOSDAQ: ${marketData.stock.kosdaq > 0 ? "+" : ""}${marketData.stock.kosdaq}%`);

  const avgChange = calculateOverallMarketChange(marketData);
  const trend = determineMarketTrend(marketData);
  const trendEmoji = trend === "positive" ? "📈" : trend === "negative" ? "📉" : "➡️";

  console.log(`\n${trendEmoji} 전체 평균: ${avgChange > 0 ? "+" : ""}${avgChange}%`);
  console.log(`📍 트렌드: ${trend === "positive" ? "상승" : trend === "negative" ? "하락" : "보합"}`);
  console.log("════════════════════════════════════\n");
}
