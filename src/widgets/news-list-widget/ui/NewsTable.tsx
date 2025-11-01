/**
 * NewsTable - Widget UI Component
 * @description 뉴스 목록 테이블 컴포넌트
 */
import {
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

import { SentimentBadge } from "@/entities/analysis";

import type { NewsWithAnalysis } from "../model/useNewsList";

interface NewsTableProps {
  newsData: NewsWithAnalysis[];
}

export function NewsTable({ newsData }: NewsTableProps) {
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
    <Card>
      <CardHeader>
        <CardTitle>분석 결과</CardTitle>
        <CardDescription>{newsData.length}개의 뉴스가 표시됩니다.</CardDescription>
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
            {newsData.map((news) => (
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
                  <SentimentBadge sentiment={news.sentiment} />
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
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
