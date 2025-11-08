import { fetchLatestAnalysis } from "../apis";

export const HeroSection = async () => {
  const analysis = await fetchLatestAnalysis();

  return (
    <section className='space-y-4'>
      <h2 className='text-3xl font-bold tracking-tight'>API 명세서</h2>
      <p className='text-muted-foreground'>
        AI News Trader의 공개 REST API를 통해 최신 크립토 뉴스와 감성 분석 결과를 프로그램에서 직접 활용할 수 있습니다.
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
            최근 분석({analysis.data.date}): 뉴스 {analysis.data.totalNews}건 · 투자 지수{" "}
            {analysis.data.investmentIndex}%
          </p>
        </div>
      )}
    </section>
  );
};
