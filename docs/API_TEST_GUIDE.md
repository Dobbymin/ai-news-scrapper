# 코인 뉴스 API 테스트 가이드

## API 엔드포인트

**Base URL**: `https://ai-news-scrapper.vercel.app`

---

## 1. 커맨드라인 (curl)

### 최신 코인 뉴스 조회

```bash
curl 'https://ai-news-scrapper.vercel.app/api/crypto-news/raw?type=news&date=latest'
```

### 최신 분석 결과 조회

```bash
curl 'https://ai-news-scrapper.vercel.app/api/crypto-news/raw?type=analysis&date=latest'
```

### 특정 날짜 조회

```bash
curl 'https://ai-news-scrapper.vercel.app/api/crypto-news/raw?type=news&date=2025-11-07'
```

### 예쁘게 출력 (jq 사용)

```bash
# 뉴스 제목만 추출
curl -s 'https://ai-news-scrapper.vercel.app/api/crypto-news/raw?type=news&date=latest' \
  | jq -r '.data[] | .title'

# 투자 지수 확인
curl -s 'https://ai-news-scrapper.vercel.app/api/crypto-news/raw?type=analysis&date=latest' \
  | jq -r '.data | "투자지수: \(.investmentIndex)%, 긍정: \(.summary.positive), 부정: \(.summary.negative)"'
```

---

## 2. Python

### 기본 사용

```python
import requests

# 최신 뉴스 조회
response = requests.get('https://ai-news-scrapper.vercel.app/api/crypto-news/raw?type=news&date=latest')
data = response.json()

if data['success']:
    news_list = data['data']
    print(f"뉴스 개수: {len(news_list)}")
    for news in news_list[:3]:  # 처음 3개만
        print(f"- {news['title']}")
        print(f"  URL: {news['url']}\n")
else:
    print(f"에러: {data.get('message')}")
```

### 분석 결과 활용

```python
import requests

response = requests.get('https://ai-news-scrapper.vercel.app/api/crypto-news/raw?type=analysis&date=latest')
data = response.json()

if data['success']:
    analysis = data['data']

    print(f"📊 투자 지수: {analysis['investmentIndex']}%")
    print(f"📈 긍정 뉴스: {analysis['summary']['positive']}개")
    print(f"📉 부정 뉴스: {analysis['summary']['negative']}개")
    print(f"📄 중립 뉴스: {analysis['summary']['neutral']}개")
    print(f"🔑 주요 키워드: {', '.join(analysis['keywords'])}")

    # 투자 판단
    if analysis['investmentIndex'] >= 60:
        print("✅ 긍정적 시장 분위기")
    elif analysis['investmentIndex'] <= 40:
        print("⚠️ 부정적 시장 분위기")
    else:
        print("➖ 중립적 시장 분위기")
```

### Pandas DataFrame으로 변환

```python
import requests
import pandas as pd

response = requests.get('https://ai-news-scrapper.vercel.app/api/crypto-news/raw?type=news&date=latest')
data = response.json()

if data['success']:
    df = pd.DataFrame(data['data'])
    print(df[['title', 'source', 'publishedAt']].head())

    # CSV 저장
    df.to_csv('crypto_news.csv', index=False, encoding='utf-8-sig')
    print("\n✅ crypto_news.csv 저장 완료")
```

---

## 3. JavaScript (브라우저)

### Fetch API

```javascript
// 최신 뉴스 조회
async function fetchCryptoNews() {
  const response = await fetch("https://ai-news-scrapper.vercel.app/api/crypto-news/raw?type=news&date=latest");
  const data = await response.json();

  if (data.success) {
    console.log(`뉴스 개수: ${data.data.length}`);
    data.data.forEach((news) => {
      console.log(`${news.title} - ${news.url}`);
    });
  }
}

fetchCryptoNews();
```

### 투자 지수 기반 알림

```javascript
async function checkInvestmentIndex() {
  const response = await fetch("https://ai-news-scrapper.vercel.app/api/crypto-news/raw?type=analysis&date=latest");
  const data = await response.json();

  if (data.success) {
    const { investmentIndex, summary, keywords } = data.data;

    console.log(`투자 지수: ${investmentIndex}%`);
    console.log(`긍정: ${summary.positive}, 부정: ${summary.negative}, 중립: ${summary.neutral}`);
    console.log(`키워드: ${keywords.join(", ")}`);

    if (investmentIndex >= 70) {
      alert("🚀 매우 긍정적인 시장!");
    } else if (investmentIndex <= 30) {
      alert("⚠️ 매우 부정적인 시장!");
    }
  }
}

checkInvestmentIndex();
```

---

## 4. React 컴포넌트

```tsx
import { useEffect, useState } from 'react';

interface CryptoNews {
  id: number;
  title: string;
  url: string;
  publishedAt: string;
  source: string;
}

export function CryptoNewsFeed() {
  const [news, setNews] = useState<CryptoNews[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://ai-news-scrapper.vercel.app/api/crypto-news/raw?type=news&date=latest')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setNews(data.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>로딩 중...</p>;

  return (
    <div>
      <h2>최신 코인 뉴스 ({news.length}건)</h2>
      <ul>
        {news.map(item => (
          <li key={item.id}>
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              {item.title}
            </a>
            <small> - {new Date(item.publishedAt).toLocaleDateString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 5. Node.js (백엔드)

### Express.js 프록시

```javascript
const express = require("express");
const axios = require("axios");

const app = express();

app.get("/crypto-news", async (req, res) => {
  try {
    const response = await axios.get("https://ai-news-scrapper.vercel.app/api/crypto-news/raw?type=news&date=latest");
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
```

### 주기적 데이터 수집 (Cron)

```javascript
const cron = require("node-cron");
const axios = require("axios");

// 매일 11시에 데이터 수집 (GitHub Actions 실행 1시간 후)
cron.schedule("0 11 * * *", async () => {
  console.log("🔄 코인 뉴스 데이터 수집 시작...");

  const newsRes = await axios.get("https://ai-news-scrapper.vercel.app/api/crypto-news/raw?type=news&date=latest");

  const analysisRes = await axios.get(
    "https://ai-news-scrapper.vercel.app/api/crypto-news/raw?type=analysis&date=latest",
  );

  if (newsRes.data.success && analysisRes.data.success) {
    console.log(`✅ 뉴스 ${newsRes.data.data.length}건, 투자지수 ${analysisRes.data.data.investmentIndex}%`);

    // 여기에 Slack/Discord 알림, DB 저장 등 추가 로직
  }
});
```

---

## 6. Google Sheets (Apps Script)

```javascript
function importCryptoNews() {
  const url = "https://ai-news-scrapper.vercel.app/api/crypto-news/raw?type=news&date=latest";
  const response = UrlFetchApp.fetch(url);
  const data = JSON.parse(response.getContentText());

  if (data.success) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("코인뉴스");
    sheet.clear();

    // 헤더
    sheet.appendRow(["제목", "URL", "출처", "게시일"]);

    // 데이터
    data.data.forEach((news) => {
      sheet.appendRow([news.title, news.url, news.source, new Date(news.publishedAt).toLocaleString()]);
    });

    Logger.log(`✅ ${data.data.length}건 뉴스 가져오기 완료`);
  }
}

// 트리거 설정: 매일 12시 자동 실행
```

---

## 7. Postman 테스트

### Collection 설정

1. New Request
2. Method: GET
3. URL: `https://ai-news-scrapper.vercel.app/api/crypto-news/raw`
4. Params:
   - `type`: `news` 또는 `analysis`
   - `date`: `latest` 또는 `YYYY-MM-DD`
5. Send

### 자동화 테스트 스크립트

```javascript
// Tests 탭에 추가
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Response has success field", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.success).to.eql(true);
});

pm.test("Data is not empty", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.data.length).to.be.above(0);
});
```

---

## 8. 응답 스키마

### 뉴스 응답 (`type=news`)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "비트코인 10만달러 붕괴...",
      "content": "...",
      "url": "https://www.blockmedia.co.kr/archives/...",
      "publishedAt": "2025-11-07T18:49:09.975+00:00",
      "source": "블록미디어",
      "scrapedAt": "2025-11-07T18:49:09.975+00:00"
    }
  ]
}
```

### 분석 응답 (`type=analysis`)

```json
{
  "success": true,
  "data": {
    "date": "2025-11-07",
    "totalNews": 20,
    "investmentIndex": 57.6,
    "summary": {
      "positive": 8,
      "negative": 5,
      "neutral": 7
    },
    "keywords": ["암호화폐", "기관 투자", "비트코인"],
    "newsAnalysis": [...],
    "analyzedAt": "2025-11-07T18:50:00.000Z"
  }
}
```

---

## 9. 에러 응답

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

---

## 10. 사용 사례

### 📊 대시보드

- 투자 지수 그래프 시각화
- 긍정/부정/중립 비율 차트
- 주요 키워드 워드 클라우드

### 📱 알림 봇

- 투자 지수 70% 이상 → Slack 알림
- 부정 뉴스 급증 → Discord 경고
- 매일 요약 → 텔레그램 전송

### 📈 트레이딩 참고

- 투자 지수 기반 매매 신호
- 뉴스 감성 분석 지표
- 키워드 트렌드 분석

### 🔍 리서치

- 일별 감성 변화 추적
- 코인별 언급량 분석
- 시장 심리 시계열 데이터

---

## 참고 링크

- **API 가이드**: [docs/API_GUIDE.md](./API_GUIDE.md)
- **Supabase 설정**: [docs/SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- **GitHub Actions**: [.github/workflows/crypto-news-cron.yml](../.github/workflows/crypto-news-cron.yml)
