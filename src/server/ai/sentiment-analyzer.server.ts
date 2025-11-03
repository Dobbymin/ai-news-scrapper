import type { AnalysisProgress, SentimentAnalysis } from "@/entities/analysis";
import type { News } from "@/entities/news";

import { loadLearningData } from "../storage/json-store.server";
import type { LearningData } from "../utils/learning-data.server";

import { generateContent, manageRateLimit, parseJsonResponse } from "./gemini-client.server";

/**
 * 감성 분석기
 *
 * @description
 * Gemini API를 사용하여 뉴스 감성 분석을 수행합니다.
 * - Few-shot Learning으로 정확도 향상
 * - 배치 처리로 요청 최적화
 * - 진행 상황 콜백 지원
 */

/**
 * Few-shot Learning 예시 생성
 * @param learningData 학습 데이터
 * @returns Few-shot 예시 문자열
 */
function createFewShotExamples(learningData: LearningData | null): string {
  if (!learningData || learningData.successCases.length === 0) {
    // 학습 데이터가 없으면 기본 예시 사용
    return `
[예시 1]
제목: "한국은행, 기준금리 0.25%p 인하"
분석:
{
  "sentiment": "positive",
  "confidence": 90,
  "keywords": ["금리 인하", "유동성 증가", "투자 심리"],
  "reason": "금리 인하는 유동성 증가를 유발하여 주식과 암호화폐 시장에 긍정적 영향을 미칩니다."
}

[예시 2]
제목: "미국 SEC, 암호화폐 규제 강화 방침"
분석:
{
  "sentiment": "negative",
  "confidence": 85,
  "keywords": ["SEC", "규제 강화", "암호화폐"],
  "reason": "규제 강화는 암호화폐 시장 참여자들의 불안감을 증가시켜 단기 하락 압력으로 작용합니다."
}

[예시 3]
제목: "삼성전자, 신제품 발표회 개최"
분석:
{
  "sentiment": "neutral",
  "confidence": 60,
  "keywords": ["삼성전자", "신제품"],
  "reason": "신제품 발표는 일반적인 기업 활동으로 시장 전체에 미치는 영향은 제한적입니다."
}`;
  }

  // 학습 데이터에서 성공률이 높은 사례 선택
  const topSuccessCases = learningData.successCases.sort((a, b) => b.accuracy - a.accuracy).slice(0, 3);

  if (topSuccessCases.length === 0) {
    // 성공 사례가 없으면 기본 예시 사용
    return createFewShotExamples(null);
  }

  // 성공 사례를 예시로 변환
  const examples = topSuccessCases
    .map((successCase, index) => {
      const sentiment =
        successCase.investmentIndex >= 60 ? "positive" : successCase.investmentIndex <= 40 ? "negative" : "neutral";

      return `
[학습된 성공 패턴 ${index + 1} - 정확도 ${successCase.accuracy}%]
키워드: ${successCase.keywords.join(", ")}
투자 지수: ${successCase.investmentIndex}%
결과: ${sentiment} 예측 성공 (실제 시장도 ${sentiment === "positive" ? "상승" : sentiment === "negative" ? "하락" : "중립"})`;
    })
    .join("\n");

  return `
[AI가 학습한 성공 패턴]
${examples}

위 성공 패턴을 참고하여 아래 기본 예시를 활용하세요.

[예시 1]
제목: "한국은행, 기준금리 0.25%p 인하"
분석:
{
  "sentiment": "positive",
  "confidence": 90,
  "keywords": ["금리 인하", "유동성 증가", "투자 심리"],
  "reason": "금리 인하는 유동성 증가를 유발하여 주식과 암호화폐 시장에 긍정적 영향을 미칩니다."
}

[예시 2]
제목: "미국 SEC, 암호화폐 규제 강화 방침"
분석:
{
  "sentiment": "negative",
  "confidence": 85,
  "keywords": ["SEC", "규제 강화", "암호화폐"],
  "reason": "규제 강화는 암호화폐 시장 참여자들의 불안감을 증가시켜 단기 하락 압력으로 작용합니다."
}

[예시 3]
제목: "삼성전자, 신제품 발표회 개최"
분석:
{
  "sentiment": "neutral",
  "confidence": 60,
  "keywords": ["삼성전자", "신제품"],
  "reason": "신제품 발표는 일반적인 기업 활동으로 시장 전체에 미치는 영향은 제한적입니다."
}`;
}

/**
 * 감성 분석 프롬프트 생성
 * @param news 분석할 뉴스
 * @param learningData 학습 데이터 (Few-shot Learning용)
 * @returns 프롬프트 문자열
 */
function createSentimentPrompt(news: News, learningData: LearningData | null = null): string {
  const fewShotExamples = createFewShotExamples(learningData);

  return `
당신은 금융 시장 전문 분석가입니다. 다음 뉴스를 분석하여 코인 및 주식 시장에 미칠 영향을 판단하세요.

[분석 기준]
- positive(긍정): 금리 인하, 실적 개선, 규제 완화, 긍정적 전망 등
- negative(부정): 금리 인상, 실적 악화, 규제 강화, 부정적 전망 등  
- neutral(중립): 시장에 직접적 영향이 없는 단순 정보성 뉴스

${fewShotExamples}

[분석할 뉴스]
제목: ${news.title}
본문: ${news.content}
출처: ${news.source}

위 뉴스를 분석하여 아래 JSON 형식으로 응답하세요. 반드시 JSON만 출력하세요.
{
  "sentiment": "positive/negative/neutral",
  "confidence": 0-100,
  "keywords": ["키워드1", "키워드2", "키워드3"],
  "reason": "분석 이유 (한 문장으로)"
}
`.trim();
}

/**
 * 단일 뉴스 감성 분석
 * @param news 분석할 뉴스
 * @param learningData 학습 데이터 (Few-shot Learning용)
 * @returns 감성 분석 결과
 */
export async function analyzeSingleNews(
  news: News,
  learningData: LearningData | null = null,
): Promise<SentimentAnalysis> {
  console.log(`📊 뉴스 분석 중: [${news.id}] ${news.title}`);

  const prompt = createSentimentPrompt(news, learningData);
  const response = await generateContent(prompt);

  // JSON 응답 파싱
  interface GeminiResponse {
    sentiment: "positive" | "negative" | "neutral";
    confidence: number;
    keywords: string[];
    reason: string;
  }

  const parsed = parseJsonResponse<GeminiResponse>(response);

  // 유효성 검증
  if (!["positive", "negative", "neutral"].includes(parsed.sentiment)) {
    throw new Error(`Invalid sentiment value: ${parsed.sentiment}`);
  }

  if (parsed.confidence < 0 || parsed.confidence > 100) {
    throw new Error(`Invalid confidence value: ${parsed.confidence}`);
  }

  const result: SentimentAnalysis = {
    newsId: news.id,
    sentiment: parsed.sentiment,
    confidence: parsed.confidence,
    keywords: parsed.keywords.slice(0, 5), // 최대 5개
    reason: parsed.reason,
  };

  console.log(`✅ 분석 완료: ${result.sentiment} (신뢰도: ${result.confidence}%)`);

  return result;
}

/**
 * 배치 뉴스 감성 분석 (Few-shot Learning 적용)
 * @param newsList 분석할 뉴스 배열
 * @param onProgress 진행 상황 콜백
 * @returns 감성 분석 결과 배열
 */
export async function analyzeNewsArray(
  newsList: News[],
  onProgress?: (progress: AnalysisProgress) => void,
): Promise<SentimentAnalysis[]> {
  console.log(`\n📊 감성 분석 시작: 총 ${newsList.length}개 뉴스`);
  console.log("━".repeat(50));

  // 학습 데이터 로드 (Few-shot Learning용)
  let learningData: LearningData | null = null;
  try {
    learningData = await loadLearningData();
    if (learningData) {
      console.log(`🧠 학습 데이터 로드 성공: ${learningData.totalCases}개 사례`);
      console.log(`  - 성공 사례: ${learningData.successCases.length}개`);
      console.log(`  - 평균 정확도: ${learningData.summary.avgAccuracy}%`);
    } else {
      console.log(`📝 학습 데이터 없음 - 기본 예시 사용`);
    }
  } catch (error) {
    console.log(`📝 학습 데이터 로드 실패 - 기본 예시 사용`);
  }

  const results: SentimentAnalysis[] = [];

  for (let i = 0; i < newsList.length; i++) {
    const news = newsList[i];

    // 진행 상황 업데이트
    if (onProgress) {
      onProgress({
        current: i + 1,
        total: newsList.length,
        percentage: Math.round(((i + 1) / newsList.length) * 100),
        currentTitle: news.title,
      });
    }

    try {
      const result = await analyzeSingleNews(news, learningData);
      results.push(result);

      // 요청 한도 관리 (60 요청/분)
      await manageRateLimit(i + 1);
    } catch (error) {
      console.error(`❌ 뉴스 [${news.id}] 분석 실패:`, error);

      // 실패한 경우 neutral로 처리
      results.push({
        newsId: news.id,
        sentiment: "neutral",
        confidence: 0,
        keywords: ["분석 실패"],
        reason: `분석 중 오류 발생: ${error instanceof Error ? error.message : "알 수 없는 오류"}`,
      });
    }
  }

  console.log("━".repeat(50));
  console.log(`✅ 감성 분석 완료: ${results.length}개 뉴스`);

  return results;
}

/**
 * 감성 분석 결과 요약
 * @param analyses 분석 결과 배열
 * @returns 긍정/부정/중립 개수
 */
export function summarizeAnalysis(analyses: SentimentAnalysis[]): {
  positive: number;
  negative: number;
  neutral: number;
} {
  return {
    positive: analyses.filter((a) => a.sentiment === "positive").length,
    negative: analyses.filter((a) => a.sentiment === "negative").length,
    neutral: analyses.filter((a) => a.sentiment === "neutral").length,
  };
}

/**
 * 주요 키워드 추출
 * @param analyses 분석 결과 배열
 * @param topN 상위 N개 키워드 (기본값: 5)
 * @returns 빈도순 키워드 배열
 */
export function extractTopKeywords(analyses: SentimentAnalysis[], topN: number = 5): string[] {
  const keywordCount = new Map<string, number>();

  // 모든 키워드 수집 및 빈도 계산
  for (const analysis of analyses) {
    for (const keyword of analysis.keywords) {
      const normalized = keyword.trim().toLowerCase();
      keywordCount.set(normalized, (keywordCount.get(normalized) || 0) + 1);
    }
  }

  // 빈도순 정렬 및 상위 N개 선택
  return Array.from(keywordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([keyword]) => keyword);
}
