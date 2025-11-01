/**
 * News List Widget - Model
 * @description 뉴스 목록 데이터를 관리하는 훅
 */
import { useEffect, useState } from "react";

import type { SentimentType } from "@/entities/analysis";

interface NewsItem {
  id: number;
  title: string;
  source: string;
  publishedAt: string;
  url: string;
}

interface NewsWithAnalysis extends NewsItem {
  sentiment: SentimentType;
  confidence: number;
  keywords: string[];
}

interface UseNewsListReturn {
  newsData: NewsWithAnalysis[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useNewsList(): UseNewsListReturn {
  const [newsData, setNewsData] = useState<NewsWithAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNewsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 뉴스 원본 데이터 로드
      const newsRes = await fetch("/api/news/latest");
      const news: NewsItem[] = newsRes.ok ? await newsRes.json() : [];

      // 분석 데이터 로드
      const analysisRes = await fetch("/api/analysis/latest");
      if (!analysisRes.ok) {
        setNewsData([]);
        return;
      }

      const analysis = await analysisRes.json();
      const analysisMap = new Map(analysis.newsAnalysis?.map((a: any) => [a.newsId, a]) || []);

      // 뉴스와 분석 결과 병합
      const merged: NewsWithAnalysis[] = news.map((item) => {
        const analysisItem = analysisMap.get(item.id) as any;
        return {
          ...item,
          sentiment: (analysisItem?.sentiment as SentimentType) || "neutral",
          confidence: analysisItem?.confidence || 0,
          keywords: analysisItem?.keywords || [],
        };
      });

      setNewsData(merged);
    } catch (err) {
      console.error("뉴스 데이터 로드 실패:", err);
      setError("뉴스 데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsData();
  }, []);

  return {
    newsData,
    loading,
    error,
    refetch: fetchNewsData,
  };
}

export type { NewsWithAnalysis };
