/**
 * 통합 분석 파이프라인
 * 
 * @description
 * 뉴스 로드 → 감성 분석 → 투자 지수 계산 → 결과 저장
 * 모든 단계를 하나의 파이프라인으로 통합
 */

import type { AnalysisResult, AnalysisProgress } from '@/entities/analysis';
import { loadNews } from '../storage/json-store.server';
import { saveAnalysis } from '../storage/json-store.server';
import {
  analyzeNewsArray,
  summarizeAnalysis,
  extractTopKeywords,
} from './sentiment-analyzer.server';
import {
  calculateInvestmentIndex,
  getInvestmentGrade,
  getInvestmentRecommendation,
} from '../utils/calculate-investment-index.server';

/**
 * 전체 분석 프로세스 실행
 * 
 * @param date 분석할 날짜 (기본값: 오늘)
 * @param onProgress 진행 상황 콜백
 * @returns 분석 결과
 */
export async function analyzeAndCalculate(
  date: Date = new Date(),
  onProgress?: (progress: AnalysisProgress) => void
): Promise<AnalysisResult> {
  console.log('\n🚀 전체 분석 프로세스 시작');
  console.log('━'.repeat(50));
  
  // Step 1: 뉴스 로드
  console.log('📥 Step 1: 뉴스 데이터 로드');
  const newsList = await loadNews(date);
  
  if (newsList.length === 0) {
    throw new Error('저장된 뉴스가 없습니다. 먼저 뉴스 크롤링을 실행하세요.');
  }
  
  console.log(`✅ ${newsList.length}개 뉴스 로드 완료`);
  
  // Step 2: 감성 분석
  console.log('\n📊 Step 2: 감성 분석 실행');
  const newsAnalysis = await analyzeNewsArray(newsList, onProgress);
  
  // Step 3: 결과 요약
  console.log('\n📋 Step 3: 결과 요약');
  const summary = summarizeAnalysis(newsAnalysis);
  console.log(`  - 긍정: ${summary.positive}개`);
  console.log(`  - 부정: ${summary.negative}개`);
  console.log(`  - 중립: ${summary.neutral}개`);
  
  // Step 4: 키워드 추출
  console.log('\n🔑 Step 4: 주요 키워드 추출');
  const keywords = extractTopKeywords(newsAnalysis, 5);
  console.log(`  - 키워드: ${keywords.join(', ')}`);
  
  // Step 5: 투자 지수 계산
  console.log('\n📈 Step 5: 투자 지수 계산');
  const investmentIndex = calculateInvestmentIndex(newsAnalysis);
  const grade = getInvestmentGrade(investmentIndex);
  const recommendation = getInvestmentRecommendation(investmentIndex);
  
  console.log(`  - 투자 지수: ${investmentIndex}%`);
  console.log(`  - 등급: ${grade}`);
  console.log(`  - 추천: ${recommendation}`);
  
  // Step 6: 결과 구조화
  const dateStr = date.toISOString().split('T')[0];
  const result: AnalysisResult = {
    date: dateStr,
    totalNews: newsList.length,
    investmentIndex,
    summary,
    keywords,
    newsAnalysis,
    analyzedAt: new Date().toISOString(),
  };
  
  // Step 7: 결과 저장
  console.log('\n💾 Step 6: 결과 저장');
  const filePath = await saveAnalysis(result, date);
  console.log(`✅ 저장 완료: ${filePath}`);
  
  console.log('━'.repeat(50));
  console.log('🎉 전체 분석 프로세스 완료!\n');
  
  return result;
}

/**
 * 분석 결과 출력 헬퍼
 * 
 * @param result 분석 결과
 */
export function printAnalysisResult(result: AnalysisResult): void {
  console.log('\n' + '═'.repeat(50));
  console.log('📊 분석 결과 요약');
  console.log('═'.repeat(50));
  
  console.log(`\n📅 분석 날짜: ${result.date}`);
  console.log(`📰 총 뉴스: ${result.totalNews}개`);
  
  console.log('\n📈 투자 지수');
  console.log(`  - 지수: ${result.investmentIndex}%`);
  console.log(`  - 등급: ${getInvestmentGrade(result.investmentIndex)}`);
  console.log(`  - 추천: ${getInvestmentRecommendation(result.investmentIndex)}`);
  
  console.log('\n📊 감성 분석 요약');
  const total = result.totalNews;
  console.log(`  - 긍정: ${result.summary.positive}개 (${((result.summary.positive / total) * 100).toFixed(1)}%)`);
  console.log(`  - 부정: ${result.summary.negative}개 (${((result.summary.negative / total) * 100).toFixed(1)}%)`);
  console.log(`  - 중립: ${result.summary.neutral}개 (${((result.summary.neutral / total) * 100).toFixed(1)}%)`);
  
  console.log('\n🔑 주요 키워드');
  console.log(`  ${result.keywords.join(' | ')}`);
  
  console.log('\n⏰ 분석 완료 시간');
  console.log(`  ${result.analyzedAt}`);
  
  console.log('\n' + '═'.repeat(50) + '\n');
}

/**
 * 간단한 분석 요약 출력
 * 
 * @param result 분석 결과
 */
export function printSimpleSummary(result: AnalysisResult): void {
  console.log('\n📊 투자 지수 요약');
  console.log('━'.repeat(50));
  console.log(`날짜: ${result.date} | 뉴스: ${result.totalNews}개`);
  console.log(`투자 지수: ${result.investmentIndex}% (${getInvestmentGrade(result.investmentIndex)})`);
  console.log(`긍정: ${result.summary.positive}개 | 부정: ${result.summary.negative}개 | 중립: ${result.summary.neutral}개`);
  console.log(`키워드: ${result.keywords.join(', ')}`);
  console.log('━'.repeat(50) + '\n');
}
