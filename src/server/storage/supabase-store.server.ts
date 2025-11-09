import type { AnalysisResult } from "@/entities/analysis";
import type { News } from "@/entities/news";

import { getSupabaseClient } from "./supabase-client.server";

/**
 * Supabase 기반 코인 뉴스 스토리지
 *
 * @description
 * 코인 뉴스 크롤링 결과와 분석 데이터를 Supabase 데이터베이스에 저장/조회합니다.
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
 * 코인 뉴스를 Supabase에 저장
 *
 * @param news 저장할 뉴스 배열
 * @param date 저장 날짜 (기본값: 오늘)
 * @returns 저장된 뉴스 개수
 */
export async function saveCryptoNewsToSupabase(news: News[], date: Date = new Date()): Promise<number> {
  const supabase = getSupabaseClient();
  const dateStr = formatDate(date);

  console.log(`💾 Supabase에 코인 뉴스 저장 시작 (${dateStr}): ${news.length}건`);

  // 0) 이미 오늘 저장된 데이터가 있는지 사전 확인
  const { data: existingCheck } = await supabase.from("crypto_news").select("id").eq("date", dateStr).limit(1);

  if (existingCheck && existingCheck.length > 0) {
    console.log(`ℹ️  오늘(${dateStr})은 이미 최신 코인 뉴스가 저장되어 있습니다. 저장을 건너뜁니다.`);
    return 0;
  }

  // 1) 기존 데이터 삭제 (동일 날짜)
  const { error: deleteError } = await supabase.from("crypto_news").delete().eq("date", dateStr);

  if (deleteError) {
    console.error("❌ 기존 뉴스 삭제 실패:", deleteError);
    throw new Error(`Supabase 기존 뉴스 삭제 실패: ${deleteError.message}`);
  }

  // 2) 새 데이터 삽입
  const rows = news.map((item) => ({
    news_id: item.id,
    title: item.title,
    content: item.content,
    url: item.url,
    published_at: item.publishedAt,
    source: item.source,
    scraped_at: item.scrapedAt,
    date: dateStr,
  }));

  const { data, error } = await supabase.from("crypto_news").insert(rows).select();

  if (error) {
    // URL 전역 유니크 제약으로 인한 중복(23505)일 경우, 친절한 메시지 출력 후 스킵
    if ((error as any).code === "23505") {
      const { data: latestDateRow } = await supabase
        .from("crypto_news")
        .select("date")
        .order("date", { ascending: false })
        .limit(1)
        .single();

      const latestDate = latestDateRow?.date ?? "알 수 없음";
      console.log(`ℹ️  중복 URL로 인해 오늘(${dateStr}) 데이터는 별도 저장하지 않습니다.`);
      console.log(`   └ 최신 저장 날짜: ${latestDate}`);
      console.log(
        `   └ 힌트: 'UNIQUE (url)' 제약으로 동일 URL은 1회만 저장됩니다. 일자별 스냅샷이 필요하면 (date, url) 복합 유니크로 전환하세요.`,
      );
      return 0;
    }

    console.error("❌ 코인 뉴스 저장 실패:", error);
    throw new Error(`Supabase 코인 뉴스 저장 실패: ${error.message}`);
  }

  console.log(`✅ Supabase 저장 완료: ${data?.length || 0}건`);
  return data?.length || 0;
}

/**
 * Supabase에서 코인 뉴스 로드
 *
 * @param date 로드할 날짜 (기본값: 오늘)
 * @returns 뉴스 배열 (없으면 빈 배열)
 */
export async function loadCryptoNewsFromSupabase(date: Date = new Date()): Promise<News[]> {
  const supabase = getSupabaseClient();
  const dateStr = formatDate(date);

  const { data, error } = await supabase
    .from("crypto_news")
    .select("*")
    .eq("date", dateStr)
    .order("news_id", { ascending: true });

  if (error) {
    console.error("❌ 코인 뉴스 로드 실패:", error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  // DB 형식 → News 엔티티로 변환
  return data.map((row) => ({
    id: row.news_id,
    title: row.title,
    content: row.content,
    url: row.url,
    publishedAt: row.published_at,
    source: row.source,
    scrapedAt: row.scraped_at,
  }));
}

/**
 * 최신 코인 뉴스 로드
 *
 * @returns 가장 최근 날짜의 뉴스 배열
 */
export async function loadLatestCryptoNewsFromSupabase(): Promise<News[]> {
  const supabase = getSupabaseClient();

  // 가장 최근 날짜 조회
  const { data: dateData, error: dateError } = await supabase
    .from("crypto_news")
    .select("date")
    .order("date", { ascending: false })
    .limit(1)
    .single();

  if (dateError || !dateData) {
    console.warn("⚠️  최신 코인 뉴스 날짜 조회 실패:", dateError);
    return [];
  }

  const latestDate = dateData.date;

  // 해당 날짜의 뉴스 조회
  const { data, error } = await supabase
    .from("crypto_news")
    .select("*")
    .eq("date", latestDate)
    .order("news_id", { ascending: true });

  if (error) {
    console.error("❌ 최신 코인 뉴스 로드 실패:", error);
    return [];
  }

  return (
    data?.map((row) => ({
      id: row.news_id,
      title: row.title,
      content: row.content,
      url: row.url,
      publishedAt: row.published_at,
      source: row.source,
      scrapedAt: row.scraped_at,
    })) || []
  );
}

/**
 * 코인 뉴스 분석 결과를 Supabase에 저장
 *
 * @param analysis 저장할 분석 결과
 * @param date 저장 날짜 (기본값: 오늘)
 */
export async function saveCryptoAnalysisToSupabase(analysis: AnalysisResult, date: Date = new Date()): Promise<void> {
  const supabase = getSupabaseClient();
  const dateStr = formatDate(date);

  console.log(`💾 Supabase에 분석 결과 저장 시작 (${dateStr})`);

  const row = {
    date: dateStr,
    total_news: analysis.totalNews,
    investment_index: analysis.investmentIndex,
    positive_count: analysis.summary.positive,
    negative_count: analysis.summary.negative,
    neutral_count: analysis.summary.neutral,
    keywords: analysis.keywords,
    news_analysis: analysis.newsAnalysis,
    analyzed_at: analysis.analyzedAt,
  };

  // Upsert (insert or update)
  const { error } = await supabase.from("crypto_analysis").upsert(row, {
    onConflict: "date",
  });

  if (error) {
    console.error("❌ 분석 결과 저장 실패:", error);
    throw new Error(`Supabase 분석 결과 저장 실패: ${error.message}`);
  }

  console.log(`✅ Supabase 분석 결과 저장 완료`);
}

/**
 * Supabase에서 코인 뉴스 분석 결과 로드
 *
 * @param date 로드할 날짜 (기본값: 오늘)
 * @returns 분석 결과 (없으면 null)
 */
export async function loadCryptoAnalysisFromSupabase(date: Date = new Date()): Promise<AnalysisResult | null> {
  const supabase = getSupabaseClient();
  const dateStr = formatDate(date);

  const { data, error } = await supabase.from("crypto_analysis").select("*").eq("date", dateStr).single();

  if (error || !data) {
    return null;
  }

  // DB 형식 → AnalysisResult 엔티티로 변환
  return {
    date: data.date,
    totalNews: data.total_news,
    investmentIndex: data.investment_index,
    summary: {
      positive: data.positive_count,
      negative: data.negative_count,
      neutral: data.neutral_count,
    },
    keywords: data.keywords as string[],
    newsAnalysis: data.news_analysis as any[],
    analyzedAt: data.analyzed_at,
  };
}

/**
 * 최신 코인 뉴스 분석 결과 로드
 *
 * @returns 가장 최근 분석 결과 (없으면 null)
 */
export async function loadLatestCryptoAnalysisFromSupabase(): Promise<AnalysisResult | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("crypto_analysis")
    .select("*")
    .order("date", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    console.warn("⚠️  최신 분석 결과 조회 실패:", error);
    return null;
  }

  return {
    date: data.date,
    totalNews: data.total_news,
    investmentIndex: data.investment_index,
    summary: {
      positive: data.positive_count,
      negative: data.negative_count,
      neutral: data.neutral_count,
    },
    keywords: data.keywords as string[],
    newsAnalysis: data.news_analysis as any[],
    analyzedAt: data.analyzed_at,
  };
}

/**
 * 사용 가능한 날짜 목록 조회
 *
 * @returns YYYY-MM-DD 형식의 날짜 배열 (최신순)
 */
export async function listCryptoNewsDatesFromSupabase(): Promise<string[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("crypto_news")
    .select("date")
    .order("date", { ascending: false })
    .limit(100);

  if (error) {
    console.error("❌ 날짜 목록 조회 실패:", error);
    return [];
  }

  // 중복 제거
  const uniqueDates = Array.from(new Set(data?.map((row) => row.date) || []));
  return uniqueDates;
}
