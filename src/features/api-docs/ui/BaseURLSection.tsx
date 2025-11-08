export const BaseURLSection = () => {
  return (
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
  );
};
