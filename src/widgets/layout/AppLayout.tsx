import Link from "next/link";

import { Footer, Header } from "@/shared";

type Props = {
  children: React.ReactNode;
};

export default function AppLayout({ children }: Props) {
  return (
    <div className='min-h-screen bg-background'>
      {/* 네비게이션 헤더 */}
      <Header />

      {/* 메인 콘텐츠 */}
      <main className='container mx-auto px-4 py-8'>{children}</main>

      {/* 푸터 */}
      <Footer />
    </div>
  );
}
