# 코인 뉴스 API 사용 가이드

## 배포 정보
- **배포 URL**: https://ai-news-scrapper.vercel.app
- **플랫폼**: Vercel
- **자동 업데이트**: 매일 10:00 KST (GitHub Actions)

---

## API 엔드포인트

### 1. 원본 JSON 데이터 조회
외부 프론트엔드/백엔드에서 크롤링 및 분석 결과를 직접 가져올 수 있습니다.

**Endpoint**: `GET /api/crypto-news/raw`

**Query Parameters**:
- `type` (필수): `news` 또는 `analysis`
- `date` (선택): `YYYY-MM-DD` 형식 또는 `latest` (기본값: `latest`)

**예시**:
```bash
# 최신 코인 뉴스 조회
curl 'https://ai-news-scrapper.vercel.app/api/crypto-news/raw?type=news&date=latest'

# 최신 분석 결과 조회
curl 'https://ai-news-scrapper.vercel.app/api/crypto-news/raw?type=analysis&date=latest'

# 특정 날짜 조회
curl 'https://ai-news-scrapper.vercel.app/api/crypto-news/raw?type=news&date=2025-11-07'
```

**Response (news)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "비트코인 10만달러 붕괴...",
      "content": "...",
      "url": "https://www.blockmedia.co.kr/archives/...",
      "publishedAt": "2025-11-07T17:03:06.057Z",
      "source": "블록미디어",
      "scrapedAt": "2025-11-07T17:03:06.059Z"
    }
  ]
}
```

**Response (analysis)**:
```json
{
  "success": true,
  "data": {
    "date": "2025-11-07",
    "totalNews": 20,
    "investmentIndex": 55.3,
    "summary": {
      "positive": 7,
      "negative": 5,
      "neutral": 8
    },
    "keywords": ["비트코인", "코인베이스", "블록체인"],
    "newsAnalysis": [
      {
        "newsId": 1,
        "sentiment": "negative",
        "confidence": 95,
        "keywords": ["비트코인 하락", "매도세"],
        "reason": "..."
      }
    ],
    "analyzedAt": "2025-11-07T17:10:00.000Z"
  }
}
```

---

## CORS 지원
모든 도메인에서 접근 가능합니다 (`Access-Control-Allow-Origin: *`).

**JavaScript (브라우저)**:
```javascript
async function fetchLatestCryptoNews() {
  const res = await fetch(
    'https://ai-news-scrapper.vercel.app/api/crypto-news/raw?type=news&date=latest'
  );
  const json = await res.json();
  if (json.success) {
    console.log('뉴스 개수:', json.data.length);
    console.log('첫 번째 뉴스:', json.data[0]);
  }
}

async function fetchLatestAnalysis() {
  const res = await fetch(
    'https://ai-news-scrapper.vercel.app/api/crypto-news/raw?type=analysis&date=latest'
  );
  const json = await res.json();
  if (json.success) {
    console.log('투자 지수:', json.data.investmentIndex);
    console.log('긍정:', json.data.summary.positive);
    console.log('부정:', json.data.summary.negative);
  }
}
```

**Python**:
```python
import requests

# 최신 뉴스
r = requests.get('https://ai-news-scrapper.vercel.app/api/crypto-news/raw?type=news&date=latest')
news_data = r.json()
print(f"뉴스 개수: {len(news_data['data'])}")

# 최신 분석
r = requests.get('https://ai-news-scrapper.vercel.app/api/crypto-news/raw?type=analysis&date=latest')
analysis = r.json()['data']
print(f"투자 지수: {analysis['investmentIndex']}%")
print(f"주요 키워드: {', '.join(analysis['keywords'])}")
```

**React 예시**:
```typescript
import { useEffect, useState } from 'react';

interface CryptoNews {
  id: number;
  title: string;
  url: string;
  sentiment?: string;
}

export function useCryptoNews() {
  const [news, setNews] = useState<CryptoNews[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://ai-news-scrapper.vercel.app/api/crypto-news/raw?type=news&date=latest')
      .then(res => res.json())
      .then(data => {
        if (data.success) setNews(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return { news, loading };
}
```

---

## 데이터 업데이트 흐름

1. **GitHub Actions** (매일 10시 KST)
   - 블록미디어 20개 뉴스 크롤링
   - Gemini API로 감성 분석 (긍정/중립/부정)
   - `data/crypto-news/crypto-news-YYYY-MM-DD.json` 생성
   - `data/crypto-analysis/crypto-analysis-YYYY-MM-DD.json` 생성
   - Git commit & push

2. **Vercel 자동 재배포**
   - GitHub push 감지 → 자동 재빌드
   - 최신 JSON 파일이 `/api/crypto-news/raw`에 즉시 반영

3. **외부 클라이언트**
   - `date=latest` 쿼리로 항상 최신 데이터 조회 가능

---

## 에러 처리

### 404 (데이터 없음)
```json
{
  "success": false,
  "message": "해당 날짜의 코인 뉴스가 없습니다."
}
```

### 400 (잘못된 요청)
```json
{
  "success": false,
  "message": "type 파라미터는 'news' 또는 'analysis' 여야 합니다."
}
```

### 500 (서버 오류)
```json
{
  "success": false,
  "error": "..."
}
```

---

## 추가 개선 아이디어

### 날짜 목록 API
사용 가능한 날짜 리스트를 제공하는 엔드포인트 추가 가능:
```bash
GET /api/crypto-news/dates
# Response: { "success": true, "dates": ["2025-11-07", "2025-11-06", ...] }
```

### 메트릭 집계 API
최근 N일간의 평균 투자 지수, 감성 추이 등:
```bash
GET /api/crypto-news/metrics?days=7
```

### Webhook 알림
투자 지수가 특정 임계값 이하/이상일 때 Slack/Discord 알림.

---

## 라이선스 및 사용 제한
- 블록미디어 뉴스 출처 명시 필수
- 상업적 용도 시 별도 라이선스 확인 필요
- API 과도한 요청 시 Vercel 서버리스 한도 초과 가능 (캐싱 권장)

---

## 문의
GitHub Issues: https://github.com/Dobbymin/ai-news-scrapper/issues
