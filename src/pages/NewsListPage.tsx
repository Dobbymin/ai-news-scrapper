"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared";

type SentimentType = "positive" | "negative" | "neutral";

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

/**
 * 뉴스 목록 페이지
 * @description 수집된 뉴스 리스트와 감성 분석 결과를 표시
 */
export default function NewsListPage() {
  const [filter, setFilter] = useState<SentimentType | "all">("all");
  const [newsData, setNewsData] = useState<NewsWithAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNewsData();
  }, []);

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

  const filteredNews = filter === "all" ? newsData : newsData.filter((news) => news.sentiment === filter);

  const getSentimentBadge = (sentiment: SentimentType) => {
    const config = {
      positive: { label: "긍정", className: "bg-green-100 text-green-800 hover:bg-green-100" },
      negative: { label: "부정", className: "bg-red-100 text-red-800 hover:bg-red-100" },
      neutral: { label: "중립", className: "bg-gray-100 text-gray-800 hover:bg-gray-100" },
    };
    return config[sentiment];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ko-KR", {
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <div className='space-y-4 text-center'>
          <div className='text-2xl'>⏳</div>
          <p className='text-muted-foreground'>뉴스 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Alert className='border-red-200 bg-red-50'>
        <AlertDescription className='text-red-800'>⚠️ {error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className='space-y-8'>
      {/* 페이지 헤더 */}
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>뉴스 목록</h1>
        <p className='mt-2 text-muted-foreground'>AI가 분석한 뉴스와 감성 분석 결과를 확인하세요.</p>
      </div>

      {newsData.length === 0 && (
        <Alert>
          <AlertDescription>📰 아직 분석된 뉴스가 없습니다.</AlertDescription>
        </Alert>
      )}

      {newsData.length > 0 && (
        <>
          {/* 필터 버튼 */}
          <Card>
            <CardHeader>
              <CardTitle>필터</CardTitle>
              <CardDescription>감성별로 뉴스를 필터링하세요.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex gap-2'>
                <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
                  전체 ({newsData.length})
                </Button>
                <Button
                  variant={filter === "positive" ? "default" : "outline"}
                  onClick={() => setFilter("positive")}
                  className={filter === "positive" ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  긍정 ({newsData.filter((n) => n.sentiment === "positive").length})
                </Button>
                <Button
                  variant={filter === "negative" ? "default" : "outline"}
                  onClick={() => setFilter("negative")}
                  className={filter === "negative" ? "bg-red-600 hover:bg-red-700" : ""}
                >
                  부정 ({newsData.filter((n) => n.sentiment === "negative").length})
                </Button>
                <Button
                  variant={filter === "neutral" ? "default" : "outline"}
                  onClick={() => setFilter("neutral")}
                  className={filter === "neutral" ? "bg-gray-600 hover:bg-gray-700" : ""}
                >
                  중립 ({newsData.filter((n) => n.sentiment === "neutral").length})
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* 뉴스 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>분석 결과</CardTitle>
          <CardDescription>{filteredNews.length}개의 뉴스가 표시됩니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[50%]'>제목</TableHead>
                <TableHead>감성</TableHead>
                <TableHead>신뢰도</TableHead>
                <TableHead>출처</TableHead>
                <TableHead>작성일</TableHead>
                <TableHead className='text-right'>링크</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNews.map((news) => {
                const badge = getSentimentBadge(news.sentiment);
                return (
                  <TableRow key={news.id}>
                    <TableCell className='font-medium'>
                      <div className='space-y-1'>
                        <div className='line-clamp-2'>{news.title}</div>
                        <div className='flex flex-wrap gap-1'>
                          {news.keywords.map((keyword) => (
                            <Badge key={keyword} variant='outline' className='text-xs'>
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={badge.className}>{badge.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className='space-y-1'>
                        <div className='text-sm font-medium'>{news.confidence}%</div>
                        <Progress value={news.confidence} className='h-1.5' />
                      </div>
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>{news.source}</TableCell>
                    <TableCell className='text-sm text-muted-foreground'>{formatDate(news.publishedAt)}</TableCell>
                    <TableCell className='text-right'>
                      <Button size='sm' variant='outline' asChild>
                        <a href={news.url} target='_blank' rel='noopener noreferrer'>
                          원문 →
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
