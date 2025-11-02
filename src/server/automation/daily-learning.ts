/**
 * 자동 학습 파이프라인
 * 
 * 이 스크립트는 매일 실행되어야 합니다:
 * 1. 시장 데이터 수집 (오늘의 실제 결과)
 * 2. 정확도 계산 (어제의 예측 vs 오늘의 실제)
 * 3. 학습 데이터 업데이트
 * 
 * 실행 방법:
 * - 수동: pnpm tsx src/server/automation/daily-learning.ts
 * - GitHub Actions: .github/workflows/daily-learning.yml
 * - Cron: 매일 오후 4시 (시장 마감 후) 실행 권장
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function runDailyLearning() {
  console.log("🚀 일일 자동 학습 파이프라인 시작");
  console.log("━".repeat(50));
  console.log(`📅 실행 시간: ${new Date().toISOString()}`);
  console.log("");

  try {
    // Step 1: 시장 데이터 수집
    console.log("📈 Step 1: 시장 데이터 수집");
    const marketResponse = await fetch(`${API_BASE_URL}/api/market/scrape`, {
      method: "POST",
    });

    if (!marketResponse.ok) {
      const error = await marketResponse.json();
      console.error("❌ 시장 데이터 수집 실패:", error);
      throw new Error("시장 데이터 수집 실패");
    }

    const marketData = await marketResponse.json();
    console.log("✅ 시장 데이터 수집 완료");
    console.log(`  - BTC: ${marketData.data.crypto.btc}%`);
    console.log(`  - ETH: ${marketData.data.crypto.eth}%`);
    console.log(`  - KOSPI: ${marketData.data.stock.kospi}%`);
    console.log(`  - KOSDAQ: ${marketData.data.stock.kosdaq}%`);
    console.log("");

    // Step 2: 정확도 계산
    console.log("📊 Step 2: 정확도 계산");
    const accuracyResponse = await fetch(`${API_BASE_URL}/api/accuracy/calculate`, {
      method: "POST",
    });

    if (!accuracyResponse.ok) {
      const error = await accuracyResponse.json();
      console.error("❌ 정확도 계산 실패:", error);
      // 정확도 계산 실패는 치명적이지 않을 수 있음 (어제 데이터 없을 수 있음)
      console.log("⚠️ 정확도 계산을 건너뜁니다.");
    } else {
      const accuracyData = await accuracyResponse.json();
      console.log("✅ 정확도 계산 완료");
      console.log(`  - 날짜: ${accuracyData.data.date}`);
      console.log(`  - 정확도: ${accuracyData.data.accuracy}%`);
      console.log(`  - 방향 일치: ${accuracyData.data.directionMatch ? "✅" : "❌"}`);
      console.log("");

      // Step 3: 학습 데이터 업데이트
      console.log("🧠 Step 3: 학습 데이터 업데이트");
      const learningResponse = await fetch(`${API_BASE_URL}/api/learning/update`, {
        method: "POST",
      });

      if (!learningResponse.ok) {
        const error = await learningResponse.json();
        console.error("❌ 학습 데이터 업데이트 실패:", error);
        throw new Error("학습 데이터 업데이트 실패");
      }

      const learningData = await learningResponse.json();
      console.log("✅ 학습 데이터 업데이트 완료");
      console.log(`  - 총 사례: ${learningData.data.totalCases}개`);
      console.log(`  - 성공 사례: ${learningData.data.successCases}개`);
      console.log(`  - 실패 사례: ${learningData.data.failureCases}개`);
      console.log(`  - 평균 정확도: ${learningData.data.averageAccuracy}%`);
      console.log(`  - 방향 일치율: ${learningData.data.directionMatchRate}%`);
    }

    console.log("");
    console.log("━".repeat(50));
    console.log("🎉 일일 자동 학습 파이프라인 완료!");

    process.exit(0);
  } catch (error) {
    console.error("");
    console.error("━".repeat(50));
    console.error("❌ 파이프라인 실행 실패:", error);
    console.error("");
    process.exit(1);
  }
}

// 실행
runDailyLearning();
