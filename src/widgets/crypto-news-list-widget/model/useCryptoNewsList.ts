/**
 * Crypto News List Widget - Model
 * @description 코인 뉴스 목록 데이터를 관리하는 훅
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

interface UseCryptoNewsListReturn {
  newsData: NewsWithAnalysis[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCryptoNewsList(): UseCryptoNewsListReturn {
  const [newsData, setNewsData] = useState<NewsWithAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCryptoNewsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 코인 뉴스 및 분석 데이터 로드
      const response = await fetch("/api/crypto-news/latest");

      if (!response.ok) {
        if (response.status === 404) {
          setNewsData([]);
          setError("분석된 코인 뉴스가 없습니다. 먼저 코인 뉴스 분석을 실행하세요.");
          return;
        }
        throw new Error("코인 뉴스 데이터 로드 실패");
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        setNewsData([]);
        return;
      }

      const { news, analysis } = result.data;
      const analysisMap = new Map(analysis.newsAnalysis?.map((a: any) => [a.newsId, a]) || []);

      // 뉴스와 분석 결과 병합
      const merged: NewsWithAnalysis[] = news.map((item: NewsItem) => {
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
      console.error("코인 뉴스 데이터 로드 실패:", err);
      setError("코인 뉴스 데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptoNewsData();
  }, []);

  return {
    newsData,
    loading,
    error,
    refetch: fetchCryptoNewsData,
  };
}

export type { NewsWithAnalysis };
