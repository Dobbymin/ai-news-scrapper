/**
 * 코인 뉴스 분석 파이프라인
 *
 * @description
 * 코인 뉴스 로드 → 감성 분석 → 투자 지수 계산 → 결과 저장
 */
import type { AnalysisProgress, AnalysisResult } from "@/entities/analysis";
import type { News } from "@/entities/news";

import {
  loadCryptoNewsFromSupabase,
  saveCryptoAnalysisToSupabase,
} from "../storage/supabase-store.server";
import {
  calculateInvestmentIndex,
  getInvestmentGrade,
  getInvestmentRecommendation,
} from "../utils/calculate-investment-index.server";

import { analyzeNewsArray, extractTopKeywords, summarizeAnalysis } from "./sentiment-analyzer.server";

/**
 * 코인 뉴스 전체 분석 프로세스 실행
 *
 * @param newsData 분석할 뉴스 데이터 (없으면 저장된 파일에서 로드)
 * @param date 분석할 날짜 (기본값: 오늘)
 * @param onProgress 진행 상황 콜백
 * @returns 분석 결과
 */
export async function analyzeCryptoNews(
  newsData?: News[],
  date: Date = new Date(),
  onProgress?: (progress: AnalysisProgress) => void,
): Promise<AnalysisResult> {
  console.log("\n🪙 코인 뉴스 분석 프로세스 시작");
  console.log("━".repeat(50));
  console.log(`🔍 전달받은 newsData: ${newsData ? newsData.length : "undefined"}개`);

  // Step 1: 코인 뉴스 로드 (데이터가 주어지지 않은 경우에만)
  let newsList: News[];
  if (newsData && newsData.length > 0) {
    console.log("📥 Step 1: 전달받은 코인 뉴스 데이터 사용");
    newsList = newsData;
  } else {
    console.log("📥 Step 1: Supabase에서 코인 뉴스 데이터 로드");
    newsList = await loadCryptoNewsFromSupabase(date);

    if (newsList.length === 0) {
      throw new Error("저장된 코인 뉴스가 없습니다. 먼저 코인 뉴스 크롤링을 실행하세요.");
    }
  }

  console.log(`✅ ${newsList.length}개 코인 뉴스 로드 완료`);

  // Step 2: 감성 분석
  console.log("\n📊 Step 2: 감성 분석 실행");
  const newsAnalysis = await analyzeNewsArray(newsList, onProgress);

  // Step 3: 결과 요약
  console.log("\n📋 Step 3: 결과 요약");
  const summary = summarizeAnalysis(newsAnalysis);
  console.log(`  - 긍정: ${summary.positive}개`);
  console.log(`  - 부정: ${summary.negative}개`);
  console.log(`  - 중립: ${summary.neutral}개`);

  // Step 4: 키워드 추출
  console.log("\n🔑 Step 4: 주요 키워드 추출");
  const keywords = extractTopKeywords(newsAnalysis, 5);
  console.log(`  - 키워드: ${keywords.join(", ")}`);

  // Step 5: 투자 지수 계산
  console.log("\n📈 Step 5: 투자 지수 계산");
  const investmentIndex = calculateInvestmentIndex(newsAnalysis);
  const grade = getInvestmentGrade(investmentIndex);
  const recommendation = getInvestmentRecommendation(investmentIndex);

  console.log(`  - 투자 지수: ${investmentIndex}%`);
  console.log(`  - 등급: ${grade}`);
  console.log(`  - 추천: ${recommendation}`);

  // Step 6: 결과 구조화
  const dateStr = date.toISOString().split("T")[0];
  const result: AnalysisResult = {
    date: dateStr,
    totalNews: newsList.length,
    investmentIndex,
    summary,
    keywords,
    newsAnalysis,
    analyzedAt: new Date().toISOString(),
  };

  // Step 7: Supabase에 결과 저장
  console.log("\n💾 Step 7: Supabase에 결과 저장");
  await saveCryptoAnalysisToSupabase(result, date);
  console.log(`✅ 저장 완료`);

  console.log("━".repeat(50));
  console.log("🎉 코인 뉴스 분석 프로세스 완료!\n");

  return result;
}
