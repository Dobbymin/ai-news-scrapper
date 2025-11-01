/**
 * Week 2 통합 테스트
 * 
 * @description
 * Week 2의 모든 기능을 통합 테스트합니다:
 * 1. 뉴스 감성 분석
 * 2. 투자 지수 계산
 * 3. 정확도 검증
 * 4. 학습 데이터 생성
 * 
 * 실행 방법:
 * pnpm tsx src/server/ai/test-week2-integration.ts
 */

import { loadNews, loadMarketData, loadAnalysis } from '../storage/json-store.server';
import { analyzeAndCalculate, printSimpleSummary } from './analyze-and-calculate.server';
import { createAccuracyLog, getAccuracyFeedback } from '../utils/calculate-accuracy.server';
import { saveAccuracyLog } from '../storage/json-store.server';
import type { AnalysisProgress } from '@/entities/analysis';

/**
 * 시간 측정 헬퍼
 */
function measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; time: number }> {
  return new Promise(async (resolve) => {
    const start = Date.now();
    const result = await fn();
    const time = Date.now() - start;
    resolve({ result, time });
  });
}

/**
 * Step 1: 뉴스 데이터 확인
 */
async function step1CheckNewsData(): Promise<boolean> {
  console.log('\n📋 Step 1: 뉴스 데이터 확인');
  console.log('━'.repeat(50));
  
  try {
    const newsList = await loadNews();
    
    if (newsList.length === 0) {
      console.log('❌ 저장된 뉴스가 없습니다.');
      console.log('💡 먼저 뉴스 크롤링을 실행하세요:');
      console.log('   pnpm tsx src/server/scraper/test-scraper.ts');
      return false;
    }
    
    console.log(`✅ 뉴스 데이터: ${newsList.length}개`);
    console.log(`   최신 뉴스: ${newsList[0].title.substring(0, 50)}...`);
    
    return true;
  } catch (error) {
    console.error('❌ 뉴스 데이터 확인 실패:', error);
    return false;
  }
}

/**
 * Step 2: 시장 데이터 확인
 */
async function step2CheckMarketData(): Promise<boolean> {
  console.log('\n📈 Step 2: 시장 데이터 확인');
  console.log('━'.repeat(50));
  
  try {
    const marketData = await loadMarketData();
    
    if (!marketData) {
      console.log('❌ 저장된 시장 데이터가 없습니다.');
      console.log('💡 먼저 시장 데이터 수집을 실행하세요:');
      console.log('   pnpm tsx src/server/scraper/test-market-scraper.ts');
      return false;
    }
    
    console.log(`✅ 시장 데이터: ${marketData.date}`);
    console.log(`   BTC: ${marketData.crypto.btc}%`);
    console.log(`   ETH: ${marketData.crypto.eth}%`);
    console.log(`   KOSPI: ${marketData.stock.kospi}%`);
    console.log(`   KOSDAQ: ${marketData.stock.kosdaq}%`);
    
    return true;
  } catch (error) {
    console.error('❌ 시장 데이터 확인 실패:', error);
    return false;
  }
}

/**
 * Step 3: AI 감성 분석 및 투자 지수 계산
 */
async function step3AnalyzeAndCalculate(): Promise<boolean> {
  console.log('\n🤖 Step 3: AI 감성 분석 및 투자 지수 계산');
  console.log('━'.repeat(50));
  console.log('⚠️  실제 Gemini API를 호출합니다. 시간이 소요될 수 있습니다.');
  console.log('━'.repeat(50));
  
  try {
    // 이미 분석 결과가 있는지 확인
    const existingAnalysis = await loadAnalysis();
    
    if (existingAnalysis) {
      console.log('\n✅ 분석 결과가 이미 존재합니다.');
      printSimpleSummary(existingAnalysis);
      return true;
    }
    
    // 진행 상황 콜백
    const onProgress = (progress: AnalysisProgress) => {
      console.log(
        `⏳ 분석 진행: ${progress.current}/${progress.total} (${progress.percentage}%)`
      );
    };
    
    // 분석 실행
    const { result, time } = await measureTime(() =>
      analyzeAndCalculate(new Date(), onProgress)
    );
    
    console.log(`\n⏱️  소요 시간: ${(time / 1000).toFixed(2)}초`);
    
    // 결과 출력
    printSimpleSummary(result);
    
    return true;
  } catch (error) {
    console.error('❌ 분석 실패:', error);
    return false;
  }
}

/**
 * Step 4: 정확도 검증
 */
async function step4VerifyAccuracy(): Promise<boolean> {
  console.log('\n🎯 Step 4: 정확도 검증');
  console.log('━'.repeat(50));
  
  try {
    // 분석 결과 로드
    const analysisResult = await loadAnalysis();
    if (!analysisResult) {
      console.log('❌ 분석 결과가 없습니다.');
      return false;
    }
    
    // 시장 데이터 로드
    const marketData = await loadMarketData();
    if (!marketData) {
      console.log('❌ 시장 데이터가 없습니다.');
      return false;
    }
    
    // 정확도 로그 생성
    const accuracyLog = createAccuracyLog(analysisResult, marketData);
    
    console.log('\n📊 정확도 검증 결과:');
    console.log(`  - 예측 지수: ${accuracyLog.prediction.index}%`);
    console.log(`  - 예측 방향: ${accuracyLog.prediction.direction}`);
    console.log(`  - 실제 등락률: BTC ${marketData.crypto.btc}%, ETH ${marketData.crypto.eth}%`);
    console.log(`  - 실제 등락률: KOSPI ${marketData.stock.kospi}%, KOSDAQ ${marketData.stock.kosdaq}%`);
    console.log(`  - 정확도: ${accuracyLog.accuracy}%`);
    console.log(`  - 방향 일치: ${accuracyLog.isCorrect ? '✅' : '❌'}`);
    console.log(`  - 오차율: ${accuracyLog.errorRate}%`);
    
    console.log(`\n💬 피드백: ${getAccuracyFeedback(accuracyLog)}`);
    
    // 저장
    await saveAccuracyLog(accuracyLog);
    console.log('\n✅ 정확도 로그 저장 완료');
    
    return true;
  } catch (error) {
    console.error('❌ 정확도 검증 실패:', error);
    return false;
  }
}

/**
 * 메인 통합 테스트 실행
 */
async function main() {
  console.log('\n' + '═'.repeat(50));
  console.log('🚀 Week 2 통합 테스트 시작');
  console.log('═'.repeat(50));
  
  // API 키 확인
  if (!process.env.GEMINI_API_KEY) {
    console.error('\n❌ GEMINI_API_KEY가 설정되지 않았습니다.');
    console.error('📝 .env.local 파일에 API 키를 추가하세요:');
    console.error('   GEMINI_API_KEY=your_api_key_here');
    console.error('\n📌 API 키 발급: https://makersuite.google.com/app/apikey');
    process.exit(1);
  }
  
  const results = {
    step1: false,
    step2: false,
    step3: false,
    step4: false,
  };
  
  // Step 1: 뉴스 데이터 확인
  results.step1 = await step1CheckNewsData();
  if (!results.step1) {
    console.log('\n⚠️  Step 1 실패 - 테스트 중단');
    process.exit(1);
  }
  
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // Step 2: 시장 데이터 확인
  results.step2 = await step2CheckMarketData();
  if (!results.step2) {
    console.log('\n⚠️  Step 2 실패 - 테스트 중단');
    process.exit(1);
  }
  
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // Step 3: AI 감성 분석 및 투자 지수 계산
  results.step3 = await step3AnalyzeAndCalculate();
  if (!results.step3) {
    console.log('\n⚠️  Step 3 실패 - 테스트 중단');
    process.exit(1);
  }
  
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // Step 4: 정확도 검증
  results.step4 = await step4VerifyAccuracy();
  
  // 최종 결과
  console.log('\n' + '═'.repeat(50));
  console.log('🏁 Week 2 통합 테스트 완료');
  console.log('═'.repeat(50));
  
  console.log('\n📊 테스트 결과:');
  console.log(`  ✅ Step 1: 뉴스 데이터 확인 - ${results.step1 ? '성공' : '실패'}`);
  console.log(`  ✅ Step 2: 시장 데이터 확인 - ${results.step2 ? '성공' : '실패'}`);
  console.log(`  ✅ Step 3: AI 분석 및 지수 계산 - ${results.step3 ? '성공' : '실패'}`);
  console.log(`  ✅ Step 4: 정확도 검증 - ${results.step4 ? '성공' : '실패'}`);
  
  const successCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;
  
  console.log(`\n📈 성공률: ${successCount}/${totalCount} (${((successCount / totalCount) * 100).toFixed(1)}%)`);
  
  if (successCount === totalCount) {
    console.log('\n🎉 Week 2 통합 테스트 완료!');
    console.log('\n📝 생성된 파일:');
    console.log('  - data/analysis/analysis-YYYY-MM-DD.json (분석 결과)');
    console.log('  - data/accuracy/accuracy-YYYY-MM-DD.json (정확도 로그)');
    console.log('\n🎯 다음 단계:');
    console.log('  - Week 3: 웹 UI 개발 (Next.js)');
    console.log('  - Week 4: 통합 및 배포');
  } else {
    console.log('\n⚠️  일부 테스트 실패 - 로그를 확인하세요.');
    process.exit(1);
  }
}

// 테스트 실행
main().catch((error) => {
  console.error('\n💥 예상치 못한 오류:', error);
  process.exit(1);
});
