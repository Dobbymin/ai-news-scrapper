import fs from "fs/promises";
import path from "path";

import { News, NewsArraySchema } from "@/entities/news";
import type { AnalysisResult } from "@/entities/analysis";
import { AnalysisResultSchema } from "@/entities/analysis";

/**
 * JSON 파일 저장소
 *
 * 뉴스 데이터를 로컬 파일 시스템에 JSON 형식으로 저장하고 로드합니다.
 * 파일명 규칙: {type}-YYYY-MM-DD.json
 */

/**
 * 데이터 디렉토리 기본 경로
 */
const DATA_DIR = path.join(process.cwd(), "data");

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
 * 디렉토리가 없으면 생성
 */
async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * 뉴스 데이터를 JSON 파일로 저장
 *
 * @param news 저장할 뉴스 배열
 * @param date 저장 날짜 (기본값: 오늘)
 * @returns 저장된 파일 경로
 */
export async function saveNews(news: News[], date: Date = new Date()): Promise<string> {
  // 유효성 검증
  const validated = NewsArraySchema.parse(news);

  // 파일 경로 생성
  const dateStr = formatDate(date);
  const newsDir = path.join(DATA_DIR, "news");
  const filePath = path.join(newsDir, `news-${dateStr}.json`);

  // 디렉토리 확인 및 생성
  await ensureDirectory(newsDir);

  // JSON 파일 저장
  await fs.writeFile(filePath, JSON.stringify(validated, null, 2), "utf-8");

  return filePath;
}

/**
 * JSON 파일에서 뉴스 데이터 로드
 *
 * @param date 로드할 날짜 (기본값: 오늘)
 * @returns 뉴스 배열 (파일이 없으면 빈 배열)
 */
export async function loadNews(date: Date = new Date()): Promise<News[]> {
  try {
    const dateStr = formatDate(date);
    const filePath = path.join(DATA_DIR, "news", `news-${dateStr}.json`);

    // 파일 읽기
    const content = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(content);

    // 유효성 검증
    return NewsArraySchema.parse(data);
  } catch (error) {
    // 파일이 없거나 에러 발생 시 빈 배열 반환
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

/**
 * 특정 날짜의 뉴스 파일이 존재하는지 확인
 *
 * @param date 확인할 날짜
 * @returns 파일 존재 여부
 */
export async function newsExists(date: Date = new Date()): Promise<boolean> {
  try {
    const dateStr = formatDate(date);
    const filePath = path.join(DATA_DIR, "news", `news-${dateStr}.json`);
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 에러 로그 저장
 *
 * @param error 에러 객체
 * @param context 에러 발생 컨텍스트
 */
export async function saveErrorLog(
  error: Error,
  context: {
    type: string;
    url?: string;
    timestamp?: string;
  },
): Promise<void> {
  const errorDir = path.join(DATA_DIR, "error-logs");
  await ensureDirectory(errorDir);

  const timestamp = context.timestamp || new Date().toISOString();
  const dateStr = formatDate(new Date(timestamp));
  const filePath = path.join(errorDir, `error-${dateStr}.log`);

  const logEntry = `
[${timestamp}] ${context.type}
URL: ${context.url || "N/A"}
Error: ${error.message}
Stack: ${error.stack}
---
`;

  await fs.appendFile(filePath, logEntry, "utf-8");
}

/**
 * 일반 데이터를 JSON 파일로 저장 (범용)
 *
 * @param data 저장할 데이터
 * @param subDir 하위 디렉토리명
 * @param fileName 파일명
 */
export async function saveJson<T>(data: T, subDir: string, fileName: string): Promise<string> {
  const targetDir = path.join(DATA_DIR, subDir);
  await ensureDirectory(targetDir);

  const filePath = path.join(targetDir, fileName);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");

  return filePath;
}

/**
 * JSON 파일에서 데이터 로드 (범용)
 *
 * @param subDir 하위 디렉토리명
 * @param fileName 파일명
 * @returns 로드된 데이터 (파일이 없으면 null)
 */
export async function loadJson<T>(subDir: string, fileName: string): Promise<T | null> {
  try {
    const filePath = path.join(DATA_DIR, subDir, fileName);
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

/**
 * 분석 결과를 JSON 파일로 저장
 *
 * @param analysis 저장할 분석 결과
 * @param date 저장 날짜 (기본값: 오늘)
 * @returns 저장된 파일 경로
 */
export async function saveAnalysis(
  analysis: AnalysisResult,
  date: Date = new Date()
): Promise<string> {
  // 유효성 검증
  const validated = AnalysisResultSchema.parse(analysis);

  // 파일 경로 생성
  const dateStr = formatDate(date);
  const fileName = `analysis-${dateStr}.json`;

  return saveJson(validated, "analysis", fileName);
}

/**
 * 분석 결과를 JSON 파일에서 로드
 *
 * @param date 로드할 날짜 (기본값: 오늘)
 * @returns 분석 결과 (파일이 없으면 null)
 */
export async function loadAnalysis(date: Date = new Date()): Promise<AnalysisResult | null> {
  const dateStr = formatDate(date);
  const fileName = `analysis-${dateStr}.json`;

  return loadJson<AnalysisResult>("analysis", fileName);
}

/**
 * 특정 날짜의 분석 결과가 존재하는지 확인
 *
 * @param date 확인할 날짜 (기본값: 오늘)
 * @returns 존재 여부
 */
export async function analysisExists(date: Date = new Date()): Promise<boolean> {
  const analysis = await loadAnalysis(date);
  return analysis !== null;
}
