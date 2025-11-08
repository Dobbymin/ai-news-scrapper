import { CodeBox } from "../components";

export const ResponseExamplesSection = () => {
  return (
    <section className='space-y-4'>
      <h3 className='text-xl font-semibold'>응답 예시</h3>
      <div className='grid gap-6 md:grid-cols-2'>
        <div className='space-y-2'>
          <h4 className='text-sm font-medium'>뉴스 응답</h4>
          <CodeBox>{`{
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
}`}</CodeBox>
        </div>
        <div className='space-y-2'>
          <h4 className='text-sm font-medium'>분석 응답</h4>
          <CodeBox>{`{
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
}`}</CodeBox>
        </div>
      </div>
    </section>
  );

  {
    /* Quick Usage */
  }
};
