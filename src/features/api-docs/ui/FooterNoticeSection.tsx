export const FooterNoticeSection = () => {
  return (
    <section className='space-y-2'>
      <div className='rounded-md border bg-muted/40 p-4 text-xs leading-relaxed text-muted-foreground'>
        본 API는 투자 참고용이며, 응답 지표(투자 지수 등)는 실제 수익을 보장하지 않습니다. 자동화 트레이딩에 직접 활용
        시 추가적인 검증 절차를 반드시 수행하세요.
      </div>
    </section>
  );
};
