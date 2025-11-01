import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI News Trader - 뉴스 기반 투자 분석",
  description: "AI를 활용한 뉴스 감성 분석으로 데이터 기반 투자 의사결정을 지원합니다.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen bg-background'>
      {/* 네비게이션 헤더 */}
      <header className='border-b'>
        <div className='container mx-auto px-4 py-4'>
          <nav className='flex items-center justify-between'>
            <div className='flex items-center gap-8'>
              <h1 className='text-2xl font-bold'>AI News Trader</h1>
              <div className='flex gap-4'>
                <a
                  href='/'
                  className='text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
                >
                  대시보드
                </a>
                <a
                  href='/news'
                  className='text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
                >
                  뉴스
                </a>
                <a
                  href='/accuracy'
                  className='text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
                >
                  정확도
                </a>
                <a
                  href='/settings'
                  className='text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
                >
                  설정
                </a>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className='container mx-auto px-4 py-8'>{children}</main>

      {/* 푸터 */}
      <footer className='mt-auto border-t'>
        <div className='container mx-auto px-4 py-6'>
          <p className='text-center text-sm text-muted-foreground'>
            ⚠️ 본 도구는 투자 참고 자료일 뿐이며, 투자 권유가 아닙니다. 투자 판단과 그 결과에 대한 책임은 전적으로
            사용자 본인에게 있습니다.
          </p>
        </div>
      </footer>
    </div>
  );
}
