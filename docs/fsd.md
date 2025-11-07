아래 구조는 공유해준 글의 원칙(자연스러운 경계, REST처럼 예측 가능한 조합, 점진적 도입, 팀 컨벤션 고정)을 그대로 녹여,
Next.js App Router와 FSD를 충돌 없이 함께 쓰도록 정리한 최종안입니다. 파일 경계는 Layer + Slice + Segment 조합으로 예측
가능하며, 명명 규칙도 반영했습니다.

### 핵심 원칙 요약

- 경계 기준: 데이터(읽기·순수) → Entities, 행동/변경(쓰기·상태) → Features, 조립/레이아웃 → Widgets, 범용 재사용 →
  Shared.
- REST처럼 예측 가능: layer/slice/segment 패턴 고정 (예: features/news-scraping/api/scrape-news.ts).
- 점진 도입: 최소 구조 → entities/features 분리 → widgets 추출 → 필요시 독립 app 확장.
- 팀 컨벤션: 레이어 이름(app, shared, entities, features, widgets)은 변경하지 않고, segment 이름(ui, model, api, lib,
  config)을 고정.

---

## 폴더 구조 (Next.js App Router + FSD, 명명 규칙 반영)

- Next.js 라우팅 예약 파일(page.tsx, layout.tsx)은 반드시 지켜야 하므로, 페이지 구현 본체는 PascalCase 컴포넌트로 분리해
  가져옵니다.
- UI/컴포넌트 .tsx는 PascalCase, 순수 함수·API .ts는 kebab-case, Hook은 camelCase, 서버 전용은 \*.server.ts.

```
ai-news-trader/
├── app/                                         # Next.js App Router (라우팅 전용)
│   ├── (dashboard)/
│   │   ├── layout.tsx                           # Next 예약 파일: 대시보드 레이아웃 래퍼
│   │   ├── page.tsx                             # Next 예약 파일: 메인 라우트 래퍼 (MainPage를 import)
│   │   ├── news/
│   │   │   └── page.tsx                         # NewsListPage를 import
│   │   ├── accuracy/
│   │   │   └── page.tsx                         # AccuracyPage를 import
│   │   └── settings/
│   │       └── page.tsx                         # SettingsPage를 import
│   └── globals.css
│
├── src/
│   ├── pages/                                   # 페이지 본체(조립 단위, PascalCase Component)
│   │   ├── MainPage.tsx
│   │   ├── NewsListPage.tsx
│   │   ├── AccuracyPage.tsx
│   │   └── SettingsPage.tsx
│   │
│   ├── shared/                                  # 프로젝트 안팎 재사용(범용) 레이어
│   │   ├── ui/                                  # 공통 UI Kit (PascalCase)
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Progress.tsx
│   │   │   ├── Table.tsx
│   │   │   └── Alert.tsx
│   │   ├── lib/                                 # 순수 유틸 (kebab-case)
│   │   │   ├── date-utils.ts
│   │   │   ├── format-utils.ts
│   │   │   └── number-utils.ts
│   │   ├── hooks/                               # 범용 훅 (camelCase)
│   │   │   ├── useLocalStorage.ts
│   │   │   ├── useDebounce.ts
│   │   │   └── useAsync.ts
│   │   ├── api/                                 # 공통 API 클라이언트/에러 래퍼 (kebab-case)
│   │   │   ├── api-client.ts
│   │   │   └── error-handler.ts
│   │   └── config/                              # 전역 상수/환경
│   │       ├── env.ts
│   │       └── constants.ts
│   │
│   ├── entities/                                # 도메인 데이터(읽기·순수·렌더링 전용)
│   │   ├── news/
│   │   │   ├── model/
│   │   │   │   ├── types.ts
│   │   │   │   └── news-schema.ts
│   │   │   └── ui/
│   │   │       └── NewsCard.tsx                 # 읽기 전용, 핸들러 없음
│   │   ├── analysis/
│   │   │   ├── model/
│   │   │   │   ├── types.ts
│   │   │   │   └── analysis-schema.ts
│   │   │   └── ui/
│   │   │       └── SentimentBadge.tsx
│   │   └── accuracy/
│   │       ├── model/
│   │       │   ├── types.ts
│   │       │   └── accuracy-schema.ts
│   │       └── ui/
│   │           └── AccuracyBadge.tsx
│   │
│   ├── features/                                 # 사용자 행동/변경(쓰기·상태·스토어)
│   │   ├── news-scraping/
│   │   │   ├── ui/
│   │   │   │   ├── ScrapeButton.tsx
│   │   │   │   └── ScrapeProgress.tsx
│   │   │   ├── model/
│   │   │   │   └── useScrape.ts                 # camelCase 훅
│   │   │   └── api/
│   │   │       └── scrape-news.ts               # kebab-case API 호출 래퍼
│   │   ├── ai-analysis/
│   │   │   ├── ui/
│   │   │   │   ├── AnalyzeButton.tsx
│   │   │   │   └── AnalysisResult.tsx
│   │   │   ├── model/
│   │   │   │   └── useAnalysis.ts
│   │   │   └── api/
│   │   │       └── analyze-news.ts
│   │   └── accuracy-check/
│   │       ├── ui/
│   │       │   ├── CheckButton.tsx
│   │       │   └── AccuracyResult.tsx
│   │       ├── model/
│   │       │   └── useAccuracy.ts
│   │       └── api/
│   │           └── check-accuracy.ts
│   │
│   ├── widgets/                                  # 조립·레이아웃(붙였다 뗐다 가능한 독립 블록)
│   │   ├── investment-dashboard/
│   │   │   ├── ui/
│   │   │   │   ├── InvestmentIndexCard.tsx
│   │   │   │   ├── SentimentPieChart.tsx
│   │   │   │   └── InvestmentDashboard.tsx
│   │   │   └── model/
│   │   │       └── useDashboardData.ts
│   │   ├── news-list-widget/
│   │   │   ├── ui/
│   │   │   │   ├── NewsTable.tsx
│   │   │   │   ├── NewsFilter.tsx
│   │   │   │   └── NewsListWidget.tsx
│   │   │   └── model/
│   │   │       └── useNewsList.ts
│   │   └── accuracy-trend-widget/
│   │       ├── ui/
│   │       │   ├── AccuracyLineChart.tsx
│   │       │   ├── AccuracyStats.tsx
│   │       │   └── AccuracyTrendWidget.tsx
│   │       └── model/
│   │           └── useAccuracyTrend.ts
│   │
│   ├── server/                                   # 서버 전용(명시적 경계, *.server.ts)
│   │   ├── scraper/
│   │   │   ├── scraper-naver-news.server.ts
│   │   │   ├── scraper-coinness.server.ts
│   │   │   └── scraper-naver-finance.server.ts
│   │   ├── ai/
│   │   │   ├── gemini-client.server.ts
│   │   │   └── sentiment-analyzer.server.ts
│   │   ├── storage/
│   │   │   ├── json-store.server.ts
│   │   │   └── news-repository.server.ts
│   │   └── utils/
│   │       ├── calculate-investment-index.server.ts   # kebab-case 순수/계산
│   │       └── calculate-accuracy.server.ts
│   │
│   └── routes/                                    # 라우트 래퍼용 컴포넌트(선택)
│       ├── MainRoute.tsx
│       ├── NewsListRoute.tsx
│       ├── AccuracyRoute.tsx
│       └── SettingsRoute.tsx
│
├── data/
│   ├── news/
│   ├── analysis/
│   ├── accuracy-log.json
│   └── learning-data.json
├── public/
├── .env.local
├── .env.example
├── next.config.js
├── tsconfig.json
├── tailwind.config.ts
├── package.json
└── README.md
```

---

## 경계 체크리스트(실전 적용)

- Entities인지? 데이터 중심(읽기·순수), 부작용 없음, 이벤트 핸들러 받지 않음.
- Features인지? “한 가지 주요 사용자 행동”을 캡슐화, 내부 훅·상태·쓰기 중심, 필요한 데이터만 props로 받음.
- Widgets인지? 여러 entities/features를 조합하는 레이아웃·블록, 자체 로직 최소화.
- Shared인지? 프로젝트 간 재사용 가능한 범용(버튼/유틸/범용 훅/환경).

---

## REST처럼 예측 가능한 규칙(팀 컨벤션 고정)

- 경로 패턴: layer/slice/segment/파일명
  - 예) `features/news-scraping/api/scrape-news.ts`
  - 예) `entities/news/ui/NewsCard.tsx`
  - 예) `widgets/investment-dashboard/ui/InvestmentDashboard.tsx`
- Segment 고정: ui(렌더) · model(훅/상태) · api(원격 호출) · lib(순수함수) · config(설정)
- 파일명 규칙:
  - UI/컴포넌트(.tsx): PascalCase → `NewsCard.tsx`, `MainPage.tsx`
  - Hook(.ts): camelCase → `useScrape.ts`, `useNewsList.ts`
  - API/유틸(.ts): kebab-case → `scrape-news.ts`, `date-utils.ts`
  - 서버 전용: `*.server.ts`로 명시 → `gemini-client.server.ts`

---

## Next App Router 호환 패턴

- page.tsx/layout.tsx는 Next 예약 파일로 유지, 내부에서 PascalCase 페이지 본체(`src/pages/MainPage.tsx`)를 import해서
  render.
- 서버 전용 코드는 `src/server/**` 또는 `*.server.ts`로 구분하고, 클라이언트 컴포넌트에서 직접 import 금지.
- 라우트 그룹((dashboard))은 레이아웃/네비 조립만 수행하고, 실제 뷰는 widgets·features·entities를 조립한 `src/pages/*`
  컴포넌트를 사용.

예시: app/(dashboard)/page.tsx

```tsx
import MainPage from '@/src/pages/MainPage';

export default function Page() {
  return <MainPage />;
}
```

---

## 점진적 도입 로드맵

1. 최소 시작

- shared/ui, shared/lib만 두고 pages를 `src/pages/*.tsx`로 구성.
- app/page.tsx는 pages 컴포넌트를 import만.

2. 경계 분리(entities vs features)

- 읽기·순수 컴포넌트/타입은 entities, 액션/상태/쓰기/훅은 features로 이동.

3. 조립 추출(widgets)

- 대시보드, 리스트 등 여러 요소를 엮는 컴포넌트를 widgets로 분리.

4. 서버 경계 강화(server)

- 크롤러, AI, 저장소, 계산 로직을 `*.server.ts`로 옮겨 클라이언트 import 차단.

---

## 실전 가이드(느낌적 기준)

- entities: data/read/pure/render. “원본 그 자체”를 보여주는 컴포넌트.
- features: action/write/mutation/state/store. “한 행동”을 캡슐화.
- widgets: 조립/레이아웃. “붙였다 뗐다” 가능한 독립 블록.
- pages: 라우트 단위의 최종 조립, widgets·features·entities를 배치.

---

## 팀 합의 팁

- “features + auth + ui = ?” 처럼 layer·slice·segment 조합만 보고 각자 떠올리는 파일이 같아질 때까지 용어를 고정합니다.
- 레이어·세그먼트 이름은 바꾸지 않습니다. 예측 가능성이 생산성입니다.
- 논쟁이 생기면 “데이터→화면, 화면→행동, 행동→데이터” 흐름에서 어디에 속하는지로 결론을 냅니다.

이 구조는 App Router 제약을 존중하면서, FSD의 본질(경계·예측·일관성)을 그대로 살립니다. 바로 적용해도 되고, 현재 코드
크기에 맞춰 1→2→3단계로 점진 도입해도 자연스럽게 확장됩니다.
