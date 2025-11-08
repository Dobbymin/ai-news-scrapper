import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";

import type { Metadata } from "next";

import AppLayout from "@/widgets/layout/AppLayout";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI News Trader - 뉴스 기반 투자 분석",
  description: "AI를 활용한 뉴스 감성 분석으로 데이터 기반 투자 의사결정을 지원합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ko'>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
