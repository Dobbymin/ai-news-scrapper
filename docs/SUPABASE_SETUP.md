# Supabase 설정 가이드

## 개요
코인 뉴스 크롤링 결과와 분석 데이터를 Supabase PostgreSQL 데이터베이스에 저장합니다.
- JSON 파일 대신 클라우드 DB 사용으로 확장성 확보
- RLS(Row Level Security)로 공개 읽기 API 제공
- GitHub Actions에서 자동 저장, Vercel API에서 즉시 조회

---

## 1. Supabase 프로젝트 생성

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. "New Project" 클릭
3. 프로젝트 이름, 데이터베이스 비밀번호 설정
4. Region 선택 (추천: Northeast Asia - Tokyo)
5. 프로젝트 생성 완료 대기 (~2분)

---

## 2. 환경 변수 설정

### 로컬 개발 (`.env.local`)
```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**값 가져오는 방법**:
1. Supabase Dashboard → 프로젝트 선택
2. Settings → API
3. "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
4. "anon public" → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. "service_role" (보안 키) → `SUPABASE_SERVICE_ROLE_KEY`

### Vercel 배포
Vercel Dashboard → Project Settings → Environment Variables에 추가:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### GitHub Actions
GitHub Repository → Settings → Secrets and variables → Actions → New repository secret:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY` (기존)

---

## 3. 데이터베이스 마이그레이션

Supabase는 MCP 서버를 통해 이미 마이그레이션이 적용되었습니다.
수동으로 확인하려면:

1. Supabase Dashboard → SQL Editor
2. 다음 쿼리 실행:
```sql
-- 테이블 확인
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('crypto_news', 'crypto_analysis');

-- 데이터 확인
SELECT COUNT(*) FROM crypto_news;
SELECT * FROM crypto_analysis ORDER BY date DESC LIMIT 5;
```

### 테이블 스키마

**crypto_news** (코인 뉴스)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGSERIAL | 기본 키 |
| news_id | INTEGER | 뉴스 ID |
| title | TEXT | 제목 |
| content | TEXT | 본문 |
| url | TEXT | URL (UNIQUE) |
| published_at | TIMESTAMPTZ | 게시 시각 |
| source | TEXT | 출처 (블록미디어) |
| scraped_at | TIMESTAMPTZ | 크롤링 시각 |
| date | DATE | 날짜 (인덱스) |
| created_at | TIMESTAMPTZ | 생성 시각 |

**crypto_analysis** (분석 결과)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGSERIAL | 기본 키 |
| date | DATE | 날짜 (UNIQUE) |
| total_news | INTEGER | 뉴스 개수 |
| investment_index | NUMERIC(5,2) | 투자 지수 |
| positive_count | INTEGER | 긍정 뉴스 수 |
| negative_count | INTEGER | 부정 뉴스 수 |
| neutral_count | INTEGER | 중립 뉴스 수 |
| keywords | JSONB | 주요 키워드 배열 |
| news_analysis | JSONB | 감성 분석 상세 |
| analyzed_at | TIMESTAMPTZ | 분석 시각 |
| created_at | TIMESTAMPTZ | 생성 시각 |

---

## 4. RLS (Row Level Security) 정책

### 읽기 (공개)
- **정책**: `Allow public read access`
- **대상**: `anon` (익명 사용자)
- **효과**: 누구나 `SELECT` 가능 (API에서 조회)

### 쓰기 (제한)
- **정책**: `Allow service role insert/update`
- **대상**: `service_role` (서버 전용)
- **효과**: 크롤링 스크립트만 `INSERT/UPDATE` 가능

---

## 5. 데이터 흐름

```
GitHub Actions (매일 10시 KST)
  └─> 블록미디어 크롤링 (20건)
  └─> Gemini API 감성 분석
  └─> Supabase INSERT (crypto_news, crypto_analysis)

Vercel API (실시간)
  └─> GET /api/crypto-news/raw?type=news&date=latest
  └─> Supabase SELECT (RLS 통과)
  └─> JSON 응답 반환
```

---

## 6. API 사용 예시

### 최신 뉴스 조회
```bash
curl 'https://ai-news-scrapper.vercel.app/api/crypto-news/raw?type=news&date=latest'
```

### 최신 분석 결과
```bash
curl 'https://ai-news-scrapper.vercel.app/api/crypto-news/raw?type=analysis&date=latest'
```

### 특정 날짜
```bash
curl 'https://ai-news-scrapper.vercel.app/api/crypto-news/raw?type=news&date=2025-11-07'
```

---

## 7. 로컬 테스트

```bash
# 환경 변수 설정 확인
cat .env.local

# 크롤링 스크립트 실행 (Supabase에 저장)
pnpm cron:crypto

# Supabase에서 데이터 확인
# Dashboard → Table Editor → crypto_news, crypto_analysis
```

---

## 8. 트러블슈팅

### "Supabase 환경 변수가 설정되지 않았습니다"
→ `.env.local` 파일에 3개 키가 모두 있는지 확인
→ 서버 재시작 (`pnpm dev` 종료 후 재실행)

### "RLS policy violation"
→ 서버 코드에서 `getSupabaseClient()` (service_role) 사용 확인
→ 클라이언트에서는 `getSupabaseAnonClient()` 사용

### "duplicate key value violates unique constraint"
→ 동일 URL 뉴스 재삽입 시도
→ 기존 코드는 자동으로 같은 날짜 데이터 삭제 후 재삽입

### GitHub Actions 실패
→ Repository Secrets에 3개 Supabase 키 + GEMINI_API_KEY 확인
→ Actions 로그에서 환경 변수 마스킹 여부 확인

---

## 9. 마이그레이션 히스토리

| 날짜 | 마이그레이션 | 설명 |
|------|-------------|------|
| 2025-11-08 | create_crypto_news_tables | 초기 테이블 및 RLS 정책 생성 |

---

## 10. 추가 개선 아이디어

- **Full-text Search**: PostgreSQL `tsvector`로 뉴스 본문 검색
- **Materialized View**: 일별 집계 뷰 생성으로 API 속도 향상
- **Edge Functions**: Supabase Edge Functions로 크롤링 직접 실행
- **Realtime Subscriptions**: 새 뉴스 삽입 시 실시간 알림

---

## 참고 링크
- [Supabase 공식 문서](https://supabase.com/docs)
- [RLS 가이드](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgREST API](https://supabase.com/docs/guides/api)
