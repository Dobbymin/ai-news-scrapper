export const RoadmapSection = () => {
  return (
    <section className='space-y-3'>
      <h3 className='text-xl font-semibold'>로드맵 (예정)</h3>
      <ul className='list-disc space-y-1 pl-5 text-sm text-muted-foreground'>
        <li>Rate Limit 및 API 키 기반 인증</li>
        <li>일자 목록 엔드포인트 (/api/crypto-news/dates)</li>
        <li>키워드 트렌드/감성 변화 시계열 API</li>
        <li>이미지 기반 요약 카드 생성 API</li>
      </ul>
    </section>
  );
};
