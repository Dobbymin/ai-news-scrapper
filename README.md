# 🤖 AI News Trader

**AI 뉴스 기반 투자 분석 시스템**

뉴스 감성 분석으로 데이터 기반 투자 의사결정을 지원하는 AI 투자 비서

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black)](https://nextjs.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.5--flash-yellow)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

---

## 📋 목차

- [프로젝트 소개](#-프로젝트-소개)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [시작하기](#-시작하기)
- [사용 방법](#-사용-방법)
- [프로젝트 구조](#-프로젝트-구조)
- [개발 일정](#-개발-일정)

---

## 🎯 프로젝트 소개

AI News Trader는 실시간 경제 뉴스를 수집·분석하여 코인 및 주식 시장의 감성을 파악하고, AI의 예측 정확도를 지속적으로
개선하는 로컬 기반 투자 분석 도구입니다.

### 핵심 가치

- ⏱️ **시간 절약**: 뉴스 분석 시간 90% 단축 (60분 → 5분)
- 📊 **객관적 분석**: 감정 배제, AI 기반 투자 지수
- 🧠 **지속 학습**: 정확도 검토로 AI 성능 지속 개선
- 💰 **완전 무료**: 로컬 환경, 서버 비용 없음
- 👨‍💻 **개발자 친화**: 오픈소스, 코드 수정 자유

### 작동 원리

```
뉴스 수집 → AI 감성 분석 → 투자 지수 계산 → 실제 시장 결과 비교 → AI 학습
```

---

## ✨ 주요 기능

### 1. 📰 뉴스 크롤링

- 네이버 경제 뉴스 자동 수집
- Puppeteer를 통한 동적 콘텐츠 크롤링
- JSON 파일 기반 저장

### 2. 🤖 AI 감성 분석

- Google Gemini 2.5 Flash API 활용
- 긍정/부정/중립 감성 분류
- 신뢰도 점수 (0-100%)
- 주요 키워드 자동 추출
- **투자 지수 계산** (0-100%)

### 3. 📈 정확도 검증

- 예측 vs 실제 시장 결과 비교
- 방향 일치 여부
- 오차율 계산
- 학습 데이터 누적

### 4. 🎨 웹 UI

- 메인 대시보드: 투자 지수, 감성 분석 요약
- 뉴스 목록: 감성별 필터링
- 정확도 검토: 예측 vs 실제 비교
- 설정: API 키 관리

---

## 🛠️ 기술 스택

### Frontend

- Next.js 16.0.1 (App Router)
- TypeScript 5.x
- TailwindCSS 3.x
- Shadcn/ui
- Recharts

### Backend & AI

- Node.js
- Puppeteer
- Google Gemini AI (gemini-2.5-flash)
- Zod

### Data Storage

- JSON 파일 (로컬 파일 시스템)

---

## 🚀 시작하기

### 방법 1: Docker로 실행 (권장) 🐳

가장 빠르고 쉬운 방법입니다!

#### 1. 필수 요구사항
- Docker & Docker Compose
- Google Gemini API 키 ([발급받기](https://ai.google.dev/))

#### 2. 실행

```bash
# 저장소 클론
git clone https://github.com/Dobbymin/ai-news-scrapper.git
cd ai-news-scrapper

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 열어 GEMINI_API_KEY를 입력하세요

# Docker Compose로 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

#### 3. 접속
브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

#### 4. 중지/재시작
```bash
# 중지
docker-compose down

# 재시작
docker-compose restart

# 컨테이너 상태 확인
docker-compose ps
```

---

### 방법 2: 로컬 개발 환경

#### 1. 필수 요구사항

- Node.js 18.x 이상
- pnpm (권장) 또는 npm
- Google Gemini API 키 ([발급받기](https://ai.google.dev/))

#### 2. 설치

```bash
# 저장소 클론
git clone https://github.com/Dobbymin/ai-news-scrapper.git
cd ai-news-scrapper

# 의존성 설치
pnpm install
```

#### 3. 환경 변수 설정

```bash
# .env.local 파일 생성
cp .env.example .env.local
```

```.env.local
GEMINI_API_KEY=your_api_key_here
```

#### 4. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

---

## 📖 사용 방법

### 1단계: 뉴스 수집

```bash
# 터미널에서 직접 실행
pnpm tsx src/server/scraper/naver-scraper.ts
```

또는 **웹 UI**에서 "📰 오늘 뉴스 수집" 버튼 클릭

### 2단계: AI 분석

웹 UI에서 자동으로 실행됩니다.

### 3단계: 결과 확인

- **메인 대시보드**: 투자 지수 확인
- **뉴스 목록**: 감성 분석 결과
- **정확도 검토**: 예측 정확도

---

## 📂 프로젝트 구조

```
ai-news-trader/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/        # 대시보드 레이아웃 & 페이지
│   │   │   ├── page.tsx        # 메인 대시보드
│   │   │   ├── news/           # 뉴스 목록 페이지
│   │   │   ├── accuracy/       # 정확도 검토 페이지
│   │   │   └── settings/       # 설정 페이지
│   │   └── api/                # API Routes
│   ├── entities/               # 도메인 엔티티 (FSD)
│   │   ├── analysis/           # 분석 관련 엔티티
│   │   └── news/               # 뉴스 관련 엔티티
│   ├── features/               # 기능 단위 (FSD)
│   │   └── ai-analysis/        # AI 분석 트리거
│   ├── widgets/                # 위젯 조합 (FSD)
│   │   ├── investment-dashboard/   # 투자 대시보드
│   │   ├── news-list-widget/       # 뉴스 목록 위젯
│   │   └── accuracy-widget/        # 정확도 위젯
│   ├── shared/                 # 공유 컴포넌트/유틸
│   │   ├── components/         # UI 컴포넌트
│   │   └── utils/              # 유틸리티 함수
│   └── server/                 # 백엔드 로직
│       ├── ai/                 # Gemini AI 통합
│       ├── scraper/            # 뉴스 크롤러
│       └── storage/            # JSON 저장소
├── data/                       # 로컬 JSON 데이터
│   ├── news/                   # 수집된 뉴스
│   ├── analysis/               # AI 분석 결과
│   ├── accuracy/               # 정확도 로그
│   └── learning/               # 학습 데이터
└── docs/                       # 문서
```

### 아키텍처 설계

본 프로젝트는 **FSD (Feature-Sliced Design)** 아키텍처를 따릅니다:

- **Entities**: 도메인 엔티티 (SentimentBadge, NewsCard 등)
- **Features**: 독립적인 기능 단위 (ai-analysis)
- **Widgets**: 여러 엔티티와 기능을 조합한 위젯
- **Shared**: 프로젝트 전체에서 재사용되는 공통 요소

---

## 📅 개발 일정

### ✅ Week 1: 크롤링 시스템 (완료)

- Puppeteer 설치 및 네이버 뉴스 크롤러
- JSON 저장소 구현
- 에러 핸들링

### ✅ Week 2: AI 분석 시스템 (완료)

- Gemini API 연동
- 감성 분석 및 투자 지수 계산
- 정확도 검증

### ✅ Week 3: 웹 UI (완료)

- Next.js 프로젝트 설정
- Shadcn/ui 설치
- 대시보드, 뉴스 목록, 정확도, 설정 페이지

### ✅ Week 4: 통합 및 최적화 (완료)

- API Routes 생성
- 프론트엔드 연동
- 문서화

### ✅ Maintenance: 리팩토링 (완료)

- FSD (Feature-Sliced Design) 아키텍처 적용
- Import 경로 중앙화 (@/shared 통합)
- 코드 재사용성 개선 (92% 코드 감소)
- Pages Router 충돌 해결 (src/pages 폴더 제거)
- 관심사 분리 및 단일 책임 원칙 적용

---

## ⚠️ 면책 조항

**본 도구는 투자 참고 자료일 뿐이며, 투자 권유가 아닙니다.**  
투자 판단과 그 결과에 대한 책임은 전적으로 사용자 본인에게 있습니다.

---

## 📝 라이선스

MIT License

---

## 🤝 기여

기여는 언제나 환영합니다!

---

<div align="center">

**Made with ❤️ by [Dobbymin](https://github.com/Dobbymin)**

</div>
