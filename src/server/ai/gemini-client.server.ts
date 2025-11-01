import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Gemini API 클라이언트
 *
 * @description
 * Google Gemini API를 사용하여 뉴스 감성 분석을 수행합니다.
 * - 모델: gemini-2.5-flash
 * - 요청 한도: 15 요청/분 (무료 티어)
 * - 자동 재시도: 3회 (지수 백오프)
 */

let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

/**
 * API 키 검증 및 로드
 */
function loadApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    throw new Error("GEMINI_API_KEY가 설정되지 않았습니다. .env.local 파일을 확인하세요.");
  }

  return apiKey;
}

/**
 * Gemini 클라이언트 초기화
 */
export function initGeminiClient() {
  if (genAI && model) {
    return model;
  }

  const apiKey = loadApiKey();
  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  console.log("✅ Gemini API 클라이언트 초기화 완료");
  return model;
}

/**
 * Gemini 모델 가져오기
 */
export function getGeminiModel() {
  if (!model) {
    return initGeminiClient();
  }
  return model;
}

/**
 * 요청 한도 관리를 위한 딜레이 함수
 * @param ms 대기 시간 (밀리초)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Gemini API 요청 래퍼 (재시도 로직 포함)
 *
 * @param prompt 프롬프트
 * @param maxRetries 최대 재시도 횟수 (기본값: 3)
 * @returns 생성된 텍스트
 */
export async function generateContent(prompt: string, maxRetries: number = 3): Promise<string> {
  const model = getGeminiModel();

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      if (!text || text.trim() === "") {
        throw new Error("Gemini API returned empty response");
      }

      return text;
    } catch (error) {
      console.error(`❌ Gemini API 요청 실패 (시도 ${attempt}/${maxRetries}):`, error);

      if (attempt === maxRetries) {
        throw new Error(
          `Gemini API 요청이 ${maxRetries}회 실패했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`,
        );
      }

      // 지수 백오프: 1초, 2초, 4초
      const waitTime = Math.pow(2, attempt - 1) * 1000;
      console.log(`⏳ ${waitTime / 1000}초 후 재시도...`);
      await delay(waitTime);
    }
  }

  throw new Error("Unexpected error in generateContent");
}

/**
 * 요청 한도 관리 (60 요청/분)
 * @param requestCount 현재 요청 수
 */
export async function manageRateLimit(requestCount: number) {
  // 60 요청/분 = 1초에 1개
  // 안전하게 1.5초 간격으로 요청
  if (requestCount > 0 && requestCount % 10 === 0) {
    console.log(`⏳ 요청 한도 관리: ${requestCount}개 요청 완료, 잠시 대기...`);
    await delay(1500);
  }
}

/**
 * JSON 응답 파싱 헬퍼
 * @param text Gemini API 응답 텍스트
 * @returns 파싱된 JSON 객체
 */
export function parseJsonResponse<T>(text: string): T {
  try {
    // 마크다운 코드 블록 제거 (```json ... ```)
    let cleaned = text.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    return JSON.parse(cleaned) as T;
  } catch (error) {
    console.error("❌ JSON 파싱 실패:", text);
    throw new Error(`JSON 파싱 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`);
  }
}
