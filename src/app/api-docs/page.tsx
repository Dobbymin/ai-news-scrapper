import React from "react";

export const dynamic = "force-dynamic";

function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className='overflow-auto rounded-md border bg-muted/40 p-4 text-xs leading-relaxed whitespace-pre-wrap'>
      <code>{children}</code>
    </pre>
  );
}

async function fetchLatestAnalysis(): Promise<{ investmentIndex: number; totalNews: number; date: string } | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "https://ai-news-scrapper.vercel.app"}/api/crypto-news/raw?type=analysis&date=latest`,
      { next: { revalidate: 300 } },
    );
    const json = await res.json();
    if (json.success) {
      return {
        investmentIndex: json.data.investmentIndex,
        totalNews: json.data.totalNews,
        date: json.data.date,
      };
    }
  } catch (e) {
    return null;
  }
  return null;
}

export default async function ApiDocsPage() {
  const analysis = await fetchLatestAnalysis();

  return (
    <div className='space-y-10'>
      {/* Hero Section */}
      <section className='space-y-4'>
        <h2 className='text-3xl font-bold tracking-tight'>API 명세서</h2>
        <p className='text-muted-foreground'>
          AI News Trader의 공개 REST API를 통해 최신 크립토 뉴스와 감성 분석 결과를 프로그램에서 직접 활용할 수
          있습니다.
        </p>
        <div className='space-y-1 rounded-md border bg-amber-50 p-4 text-sm text-amber-800'>
          <p className='font-semibold'>⚠️ 배포된 웹사이트(Vercel)에서는 크롤링 기능이 비활성화되어 있습니다.</p>
          <p className='text-amber-700'>
            GitHub Actions 스케줄링(매일 10:00 KST)으로 데이터가 수집·분석되어 Supabase에 저장된 후 API로 제공됩니다.
          </p>
        </div>
        {analysis && (
          <div className='rounded-md border bg-primary/5 p-4 text-sm'>
            <p>
              최근 분석({analysis.date}): 뉴스 {analysis.totalNews}건 · 투자 지수 {analysis.investmentIndex}%
            </p>
          </div>
        )}
      </section>

      {/* Base URL */}
      <section className='space-y-3'>
        <h3 className='text-xl font-semibold'>기본 정보</h3>
        <div className='grid gap-2 text-sm'>
          <div>
            <span className='font-medium'>Base URL: </span>
            <code className='rounded bg-muted px-1 py-0.5'>https://ai-news-scrapper.vercel.app</code>
          </div>
          <div>
            <span className='font-medium'>인증: </span>현재는 공개 읽기 전용 (Rate Limit 적용 예정)
          </div>
          <div>
            <span className='font-medium'>포맷: </span>모든 응답은 JSON 반환
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section className='space-y-4'>
        <h3 className='text-xl font-semibold'>엔드포인트</h3>
        <div className='space-y-6'>
          <div className='space-y-2'>
            <h4 className='text-sm font-bold tracking-wide uppercase'>GET /api/crypto-news/raw</h4>
            <p className='text-sm text-muted-foreground'>최신 혹은 특정 날짜의 뉴스 또는 분석 결과를 조회합니다.</p>
            <table className='w-full border-collapse text-sm'>
              <thead>
                <tr className='border-b bg-muted/40'>
                  <th className='px-2 py-1 text-left font-medium'>Query</th>
                  <th className='px-2 py-1 text-left font-medium'>설명</th>
                  <th className='px-2 py-1 text-left font-medium'>예시</th>
                </tr>
              </thead>
              <tbody>
                <tr className='border-b'>
                  <td className='px-2 py-1'>
                    <code>type</code>
                  </td>
                  <td className='px-2 py-1'>news | analysis</td>
                  <td className='px-2 py-1'>
                    <code>?type=news</code>
                  </td>
                </tr>
                <tr className='border-b'>
                  <td className='px-2 py-1'>
                    <code>date</code>
                  </td>
                  <td className='px-2 py-1'>YYYY-MM-DD | latest</td>
                  <td className='px-2 py-1'>
                    <code>?date=latest</code>
                  </td>
                </tr>
              </tbody>
            </table>
            <Code>{`# 최신 뉴스 20건
curl "https://ai-news-scrapper.vercel.app/api/crypto-news/raw?type=news&date=latest"

# 최신 분석 결과
curl "https://ai-news-scrapper.vercel.app/api/crypto-news/raw?type=analysis&date=latest"

# 특정 날짜(예: 2025-11-07) 뉴스
curl "https://ai-news-scrapper.vercel.app/api/crypto-news/raw?type=news&date=2025-11-07"`}</Code>
          </div>
        </div>
      </section>

      {/* Response Examples */}
      <section className='space-y-4'>
        <h3 className='text-xl font-semibold'>응답 예시</h3>
        <div className='grid gap-6 md:grid-cols-2'>
          <div className='space-y-2'>
            <h4 className='text-sm font-medium'>뉴스 응답</h4>
            <Code>{`{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "비트코인 10만달러 붕괴...",
      "content": "...",
      "url": "https://www.blockmedia.co.kr/archives/...",
      "publishedAt": "2025-11-07T18:49:09.975+00:00",
      "source": "블록미디어",
      "scrapedAt": "2025-11-07T18:49:09.975+00:00"
    }
  ]
}`}</Code>
          </div>
          <div className='space-y-2'>
            <h4 className='text-sm font-medium'>분석 응답</h4>
            <Code>{`{
  "success": true,
  "data": {
    "date": "2025-11-07",
    "totalNews": 20,
    "investmentIndex": 57.6,
    "summary": {
      "positive": 8,
      "negative": 5,
      "neutral": 7
    },
    "keywords": ["암호화폐", "기관 투자", "비트코인"],
    "newsAnalysis": [...],
    "analyzedAt": "2025-11-07T18:50:00.000Z"
  }
}`}</Code>
          </div>
        </div>
      </section>

      {/* Quick Usage */}
      <section className='space-y-4'>
        <h3 className='text-xl font-semibold'>빠른 사용 예시</h3>
        <h4 className='text-sm font-medium'>JavaScript (브라우저)</h4>
        <Code>{`async function fetchLatestAnalysis() {
  const res = await fetch('https://ai-news-scrapper.vercel.app/api/crypto-news/raw?type=analysis&date=latest');
  const data = await res.json();
  if (data.success) {
    console.log('투자 지수:', data.data.investmentIndex + '%');
  }
}`}</Code>
        <h4 className='text-sm font-medium'>Python</h4>
        <Code>{`import requests
r = requests.get('https://ai-news-scrapper.vercel.app/api/crypto-news/raw?type=news&date=latest')
print('뉴스 개수:', len(r.json()['data']))`}</Code>
      </section>

      {/* Roadmap */}
      <section className='space-y-3'>
        <h3 className='text-xl font-semibold'>로드맵 (예정)</h3>
        <ul className='list-disc space-y-1 pl-5 text-sm text-muted-foreground'>
          <li>Rate Limit 및 API 키 기반 인증</li>
          <li>일자 목록 엔드포인트 (/api/crypto-news/dates)</li>
          <li>키워드 트렌드/감성 변화 시계열 API</li>
          <li>이미지 기반 요약 카드 생성 API</li>
        </ul>
      </section>

      {/* Footer Notice */}
      <section className='space-y-2'>
        <div className='rounded-md border bg-muted/40 p-4 text-xs leading-relaxed text-muted-foreground'>
          본 API는 투자 참고용이며, 응답 지표(투자 지수 등)는 실제 수익을 보장하지 않습니다. 자동화 트레이딩에 직접 활용
          시 추가적인 검증 절차를 반드시 수행하세요.
        </div>
      </section>
    </div>
  );
}
