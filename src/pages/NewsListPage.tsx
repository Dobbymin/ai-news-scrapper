"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Progress } from "@/shared/components/ui/progress";

type SentimentType = "positive" | "negative" | "neutral";

interface NewsItem {
  id: number;
  title: string;
  source: string;
  publishedAt: string;
  sentiment: SentimentType;
  confidence: number;
  keywords: string[];
  url: string;
}

// 임시 데이터
const mockNews: NewsItem[] = [
  {
    id: 1,
    title: "젠슨 황 \"삼성전자·SK하이닉스 모두 필요해…뛰어난 역량의 파트너들\"",
    source: "한국경제",
    publishedAt: "2025-11-01T08:00:00Z",
    sentiment: "positive",
    confidence: 95,
    keywords: ["젠슨 황", "엔비디아", "삼성전자"],
    url: "https://news.naver.com",
  },
  {
    id: 2,
    title: "뉴욕 증시, 아마존·애플 호실적에 동반 상승 마감",
    source: "연합뉴스",
    publishedAt: "2025-11-01T07:30:00Z",
    sentiment: "positive",
    confidence: 95,
    keywords: ["뉴욕 증시", "아마존", "애플"],
    url: "https://news.naver.com",
  },
  {
    id: 3,
    title: "구직자 10명 중 8명, 중소기업 지원 아예 안 한다",
    source: "한국경제",
    publishedAt: "2025-11-01T06:00:00Z",
    sentiment: "negative",
    confidence: 85,
    keywords: ["구직", "중소기업", "고용"],
    url: "https://news.naver.com",
  },
];

/**
 * 뉴스 목록 페이지
 * @description 수집된 뉴스 리스트와 감성 분석 결과를 표시
 */
export default function NewsListPage() {
  const [filter, setFilter] = useState<SentimentType | "all">("all");

  const filteredNews =
    filter === "all"
      ? mockNews
      : mockNews.filter((news) => news.sentiment === filter);

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

  return (
    <div className="space-y-8">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">뉴스 목록</h1>
        <p className="text-muted-foreground mt-2">
          AI가 분석한 뉴스와 감성 분석 결과를 확인하세요.
        </p>
      </div>

      {/* 필터 버튼 */}
      <Card>
        <CardHeader>
          <CardTitle>필터</CardTitle>
          <CardDescription>감성별로 뉴스를 필터링하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              전체 ({mockNews.length})
            </Button>
            <Button
              variant={filter === "positive" ? "default" : "outline"}
              onClick={() => setFilter("positive")}
              className={
                filter === "positive"
                  ? "bg-green-600 hover:bg-green-700"
                  : ""
              }
            >
              긍정 ({mockNews.filter((n) => n.sentiment === "positive").length})
            </Button>
            <Button
              variant={filter === "negative" ? "default" : "outline"}
              onClick={() => setFilter("negative")}
              className={
                filter === "negative" ? "bg-red-600 hover:bg-red-700" : ""
              }
            >
              부정 ({mockNews.filter((n) => n.sentiment === "negative").length})
            </Button>
            <Button
              variant={filter === "neutral" ? "default" : "outline"}
              onClick={() => setFilter("neutral")}
              className={
                filter === "neutral" ? "bg-gray-600 hover:bg-gray-700" : ""
              }
            >
              중립 ({mockNews.filter((n) => n.sentiment === "neutral").length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 뉴스 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>분석 결과</CardTitle>
          <CardDescription>
            {filteredNews.length}개의 뉴스가 표시됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">제목</TableHead>
                <TableHead>감성</TableHead>
                <TableHead>신뢰도</TableHead>
                <TableHead>출처</TableHead>
                <TableHead>작성일</TableHead>
                <TableHead className="text-right">링크</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNews.map((news) => {
                const badge = getSentimentBadge(news.sentiment);
                return (
                  <TableRow key={news.id}>
                    <TableCell className="font-medium">
                      <div className="space-y-1">
                        <div className="line-clamp-2">{news.title}</div>
                        <div className="flex gap-1 flex-wrap">
                          {news.keywords.map((keyword) => (
                            <Badge key={keyword} variant="outline" className="text-xs">
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
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {news.confidence}%
                        </div>
                        <Progress value={news.confidence} className="h-1.5" />
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {news.source}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(news.publishedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                      >
                        <a
                          href={news.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
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
