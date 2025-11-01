/**
 * 정확도 검증 및 학습 데이터 생성 테스트
 * 
 * 실행 방법:
 * pnpm tsx src/server/ai/test-accuracy.ts
 */

import { loadAnalysis } from '../storage/json-store.server';
import { loadMarketData } from '../storage/json-store.server';
import {
  saveAccuracyLog,
  loadAccuracyLog,
  loadAllAccuracyLogs,
  saveLearningData,
} from '../storage/json-store.server';
import {
  calculateAccuracy,
  createAccuracyLog,
  getAccuracyGrade,
  getAccuracyFeedback,
  calculateAverageAccuracy,
  calculateDirectionAccuracy,
  determinePredictionDirection,
  determineActualDirection,
} from '../utils/calculate-accuracy.server';
import {
  createLearningData,
  printLearningData,
} from '../utils/learning-data.server';

/**
 * 테스트 1: 정확도 계산 로직
 */
async function testAccuracyCalculation() {
  console.log('\n🧪 테스트 1: 정확도 계산 로직');
  console.log('━'.repeat(50));
  
  try {
    // 샘플 데이터 생성
    const sampleMarketData = {
      date: '2025-11-01',
      crypto: {
        btc: 2.5,
        eth: 1.8,
      },
      stock: {
        kospi: 1.2,
        kosdaq: 0.8,
      },
      collectedAt: new Date().toISOString(),
    };
    
    // 다양한 투자 지수로 테스트
    const testCases = [
      { index: 80, description: '강한 긍정 예측' },
      { index: 45, description: '약한 부정 예측' },
      { index: 52, description: '중립 예측' },
      { index: 65, description: '보통 긍정 예측' },
    ];
    
    console.log('\n📊 정확도 계산 테스트:\n');
    
    for (const testCase of testCases) {
      const predictionDir = determinePredictionDirection(testCase.index);
      const actualDir = determineActualDirection(sampleMarketData);
      const accuracy = calculateAccuracy(testCase.index, sampleMarketData);
      const grade = getAccuracyGrade(accuracy);
      
      console.log(`${testCase.description} (지수: ${testCase.index})`);
      console.log(`  - 예측 방향: ${predictionDir}`);
      console.log(`  - 실제 방향: ${actualDir}`);
      console.log(`  - 정확도: ${accuracy}% (${grade})`);
      console.log('');
    }
    
    return true;
  } catch (error) {
    console.error('❌ 정확도 계산 테스트 실패:', error);
    return false;
  }
}

/**
 * 테스트 2: 정확도 로그 생성 및 저장
 */
async function testAccuracyLogCreation() {
  console.log('\n🧪 테스트 2: 정확도 로그 생성 및 저장');
  console.log('━'.repeat(50));
  
  try {
    // 분석 결과 로드
    const analysisResult = await loadAnalysis();
    if (!analysisResult) {
      console.log('❌ 분석 결과가 없습니다. 먼저 분석을 실행하세요.');
      return false;
    }
    
    // 시장 데이터 로드
    const marketData = await loadMarketData();
    if (!marketData) {
      console.log('❌ 시장 데이터가 없습니다. 먼저 시장 데이터를 수집하세요.');
      return false;
    }
    
    console.log(`\n📊 분석 결과: ${analysisResult.date}`);
    console.log(`  - 투자 지수: ${analysisResult.investmentIndex}%`);
    console.log(`  - 뉴스 개수: ${analysisResult.totalNews}개`);
    
    console.log(`\n📈 시장 데이터: ${marketData.date}`);
    console.log(`  - BTC: ${marketData.crypto.btc}%`);
    console.log(`  - ETH: ${marketData.crypto.eth}%`);
    console.log(`  - KOSPI: ${marketData.stock.kospi}%`);
    console.log(`  - KOSDAQ: ${marketData.stock.kosdaq}%`);
    
    // 정확도 로그 생성
    const accuracyLog = createAccuracyLog(analysisResult, marketData);
    
    console.log(`\n✅ 정확도 로그 생성 완료:`);
    console.log(`  - 정확도: ${accuracyLog.accuracy}% (${getAccuracyGrade(accuracyLog.accuracy)})`);
    console.log(`  - 예측 방향: ${accuracyLog.prediction.direction}`);
    console.log(`  - 실제 방향: ${determineActualDirection(accuracyLog.actual)}`);
    console.log(`  - 방향 일치: ${accuracyLog.isCorrect ? '✅' : '❌'}`);
    console.log(`  - 오차율: ${accuracyLog.errorRate}%`);
    console.log(`\n💬 피드백: ${getAccuracyFeedback(accuracyLog)}`);
    
    // 저장
    const filePath = await saveAccuracyLog(accuracyLog);
    console.log(`\n💾 저장 완료: ${filePath}`);
    
    // 로드 확인
    const loadedLog = await loadAccuracyLog();
    console.log(`✅ 로드 확인: ${loadedLog ? '성공' : '실패'}`);
    
    return true;
  } catch (error) {
    console.error('❌ 정확도 로그 생성 실패:', error);
    return false;
  }
}

/**
 * 테스트 3: 학습 데이터 생성
 */
async function testLearningDataGeneration() {
  console.log('\n🧪 테스트 3: 학습 데이터 생성');
  console.log('━'.repeat(50));
  
  try {
    // 모든 정확도 로그 로드
    const accuracyLogs = await loadAllAccuracyLogs();
    
    if (accuracyLogs.length === 0) {
      console.log('❌ 정확도 로그가 없습니다. 먼저 정확도 검증을 실행하세요.');
      return false;
    }
    
    console.log(`\n📊 로드된 정확도 로그: ${accuracyLogs.length}개`);
    
    // 분석 결과 로드 (날짜별)
    const analysisResults = [];
    for (const log of accuracyLogs) {
      const dateObj = new Date(log.date);
      const analysis = await loadAnalysis(dateObj);
      if (analysis) {
        analysisResults.push(analysis);
      }
    }
    
    console.log(`📊 로드된 분석 결과: ${analysisResults.length}개`);
    
    if (analysisResults.length === 0) {
      console.log('❌ 분석 결과가 없습니다.');
      return false;
    }
    
    // 학습 데이터 생성
    const learningData = createLearningData(accuracyLogs, analysisResults);
    
    // 출력
    printLearningData(learningData);
    
    // 저장
    const filePath = await saveLearningData(learningData);
    console.log(`💾 학습 데이터 저장 완료: ${filePath}`);
    
    // 통계 정보
    console.log('\n📈 학습 통계:');
    const avgAccuracy = calculateAverageAccuracy(accuracyLogs);
    const directionAccuracy = calculateDirectionAccuracy(accuracyLogs);
    
    console.log(`  - 평균 정확도: ${avgAccuracy}%`);
    console.log(`  - 방향 정확도: ${directionAccuracy}%`);
    console.log(`  - 성공 사례: ${learningData.successCases.length}개`);
    console.log(`  - 실패 사례: ${learningData.failureCases.length}개`);
    
    return true;
  } catch (error) {
    console.error('❌ 학습 데이터 생성 실패:', error);
    return false;
  }
}

/**
 * 메인 테스트 실행
 */
async function main() {
  console.log('🚀 정확도 검증 및 학습 데이터 테스트 시작');
  console.log('━'.repeat(50));
  
  const results = {
    test1: false,
    test2: false,
    test3: false,
  };
  
  // 테스트 1: 정확도 계산 로직
  results.test1 = await testAccuracyCalculation();
  
  // 1초 대기
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // 테스트 2: 정확도 로그 생성 및 저장
  results.test2 = await testAccuracyLogCreation();
  
  // 1초 대기
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // 테스트 3: 학습 데이터 생성
  results.test3 = await testLearningDataGeneration();
  
  // 최종 결과
  console.log('\n' + '━'.repeat(50));
  console.log('🏁 테스트 완료');
  console.log('━'.repeat(50));
  console.log(`✅ 정확도 계산: ${results.test1 ? '성공' : '실패'}`);
  console.log(`✅ 정확도 로그: ${results.test2 ? '성공' : '실패'}`);
  console.log(`✅ 학습 데이터: ${results.test3 ? '성공' : '실패'}`);
  
  const successCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;
  
  console.log(`\n📊 성공률: ${successCount}/${totalCount} (${((successCount / totalCount) * 100).toFixed(1)}%)`);
  
  if (successCount === totalCount) {
    console.log('🎉 모든 테스트 통과!');
  } else {
    console.log('⚠️  일부 테스트 실패');
  }
}

// 테스트 실행
main().catch((error) => {
  console.error('💥 예상치 못한 오류:', error);
  process.exit(1);
});
