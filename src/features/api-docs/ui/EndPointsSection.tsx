import { CodeBox } from "../components";

export const EndPointsSection = () => {
  return (
    <section className='space-y-4'>
      <h3 className='text-xl font-semibold'>엔드포인트</h3>
      <div className='space-y-6'>
        <div className='space-y-3'>
          <div className='flex items-center gap-3'>
            <p className='rounded-xs bg-gray-200 px-2 py-0.5 text-sm font-bold tracking-wide text-red-400 uppercase'>
              GET
            </p>
            <h4 className='text-sm font-bold tracking-wide'>/api/crypto-news/raw</h4>
          </div>
          <p className='text-sm text-muted-foreground'>최신 혹은 특정 날짜의 뉴스 또는 분석 결과를 조회합니다.</p>
          <table className='w-full border-collapse text-sm'>
            <thead>
              <tr className='border-b bg-muted/40'>
                <th className='p-2 text-left font-medium'>Query</th>
                <th className='p-2 text-left font-medium'>설명</th>
                <th className='p-2 text-left font-medium'>예시</th>
              </tr>
            </thead>
            <tbody>
              <tr className='border-b'>
                <td className='p-2'>
                  <code>type</code>
                </td>
                <td className='p-2'>news | analysis</td>
                <td className='p-2'>
                  <code>?type=news</code>
                </td>
              </tr>
              <tr className='border-b'>
                <td className='p-2'>
                  <code>date</code>
                </td>
                <td className='p-2'>YYYY-MM-DD | latest</td>
                <td className='p-2'>
                  <code>?date=latest</code>
                </td>
              </tr>
            </tbody>
          </table>
          <CodeBox>{`# 최신 뉴스 20건
curl "https://ai-news-scrapper.vercel.app/api/crypto-news/raw?type=news&date=latest"

# 최신 분석 결과
curl "https://ai-news-scrapper.vercel.app/api/crypto-news/raw?type=analysis&date=latest"

# 특정 날짜(예: 2025-11-07) 뉴스
curl "https://ai-news-scrapper.vercel.app/api/crypto-news/raw?type=news&date=2025-11-07"`}</CodeBox>
        </div>
      </div>
    </section>
  );
};
