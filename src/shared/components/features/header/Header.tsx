import { NavButton } from "../../common";

export const Header = () => {
  return (
    <header className='border-b'>
      <div className='container mx-auto px-4 py-4'>
        <nav className='flex items-center justify-between'>
          <div className='flex items-center gap-8'>
            <h1 className='text-2xl font-bold'>AI News Trader</h1>
            <NavButton />
          </div>
          <div className='flex items-center gap-2'>
            <span className='rounded bg-amber-100 px-2 py-1 text-[10px] font-medium text-amber-700'>
              배포 환경: 크롤링 비활성화
            </span>
          </div>
        </nav>
      </div>
    </header>
  );
};
