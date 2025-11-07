# 자동 학습 시스템

AI News Trader의 자동 학습 시스템은 매일 정확도를 분석하고 학습 데이터를 업데이트하여 예측 성능을 지속적으로 개선합니다.

## 📚 개요

자동 학습 시스템은 3단계 파이프라인으로 구성됩니다:

1. **시장 데이터 수집**: 오늘의 실제 시장 결과(암호화폐, 주식)를 수집
2. **정확도 계산**: 어제의 AI 예측과 오늘의 실제 결과를 비교
3. **학습 데이터 업데이트**: 성공/실패 패턴을 분석하여 학습 데이터 생성

## 🚀 실행 방법

### 1. 수동 실행 (로컬)

#### 전체 파이프라인 실행

```bash
# 서버가 실행 중이어야 합니다
pnpm start

# 다른 터미널에서
pnpm learning
```

#### 개별 API 호출

```bash
# 1. 시장 데이터 수집
curl -X POST http://localhost:3000/api/market/scrape

# 2. 정확도 계산
curl -X POST http://localhost:3000/api/accuracy/calculate

# 3. 학습 데이터 업데이트
curl -X POST http://localhost:3000/api/learning/update
```

### 2. 웹 UI에서 실행

1. 정확도 페이지(`/accuracy`)로 이동
2. "🧠 학습 데이터 업데이트" 버튼 클릭
3. 학습 결과 확인

### 3. 자동 실행 (GitHub Actions)

#### 설정 방법

1. GitHub 저장소 Settings → Secrets and variables → Actions
2. `GEMINI_API_KEY` 추가

#### 실행 스케줄

- **자동**: 매일 오후 4시 (KST) 실행
- **수동**: GitHub Actions 탭에서 "Run workflow" 클릭

#### Workflow 파일

`.github/workflows/daily-learning.yml`

## 📊 학습 데이터 구조

### 성공 사례 (SuccessCase)

```typescript
{
  date: "2025-11-01",
  accuracy: 85.5,
  investmentIndex: 75,
  keywords: ["비트코인", "상승", "호재"],
  positiveRatio: 70,
  avgConfidence: 82,
  newsCount: 20
}
```

### 실패 사례 (FailureCase)

```typescript
{
  date: "2025-10-30",
  accuracy: 45.2,
  investmentIndex: 60,
  predictedDirection: "positive",
  actualDirection: "negative",
  errorPattern: "과도한 낙관",
  keywords: ["규제", "불확실성"]
}
```

### 키워드 패턴 (KeywordPattern)

```typescript
{
  keyword: "비트코인",
  frequency: 45,
  successRate: 78,
  avgAccuracy: 82.5
}
```

## 🧠 학습 메커니즘

### 1. 패턴 인식

- 성공 사례에서 공통 패턴 추출
- 실패 사례에서 위험 신호 식별
- 키워드와 시장 반응의 상관관계 학습

### 2. 정확도 계산

```
정확도 = 100 - |예측 지수 - 실제 변동률|
```

- 방향 일치: 예측 방향과 실제 방향이 같은지
- 오차율: 예측 값과 실제 값의 차이

### 3. 학습 데이터 활용

- **현재**: 패턴 분석 및 개선 영역 식별
- **향후**: AI 프롬프트 개선, 가중치 조정

## 📁 저장 위치

```
data/
├── accuracy/          # 정확도 로그
│   └── accuracy-2025-11-01.json
├── learning/          # 학습 데이터
│   └── learning-data.json
└── market/           # 시장 데이터
    └── market-2025-11-02.json
```

## 🔧 API 엔드포인트

### POST /api/market/scrape

시장 데이터 수집

**응답**:

```json
{
  "success": true,
  "data": {
    "date": "2025-11-02",
    "crypto": { "btc": 2.5, "eth": 1.8 },
    "stock": { "kospi": 1.2, "kosdaq": 0.8 }
  }
}
```

### POST /api/accuracy/calculate

정확도 계산 (어제 예측 vs 오늘 실제)

**응답**:

```json
{
  "success": true,
  "data": {
    "date": "2025-11-01",
    "accuracy": 85.5,
    "isCorrect": true,
    "errorRate": 14.5
  }
}
```

### POST /api/learning/update

학습 데이터 업데이트

**응답**:

```json
{
  "success": true,
  "data": {
    "totalCases": 15,
    "successCases": 10,
    "failureCases": 5,
    "averageAccuracy": 78.5,
    "directionMatchRate": 80.0
  }
}
```

## 📈 성능 모니터링

### 메트릭

- **평균 정확도**: 전체 예측의 평균 정확도
- **방향 일치율**: 예측 방향이 실제와 일치한 비율
- **평균 오차율**: 예측 값과 실제 값의 평균 오차
- **성공/실패 비율**: 성공 사례 대비 실패 사례

### 개선 영역

학습 시스템이 자동으로 식별하는 영역:

- 방향 예측 정확도가 낮을 때
- 전체 정확도가 목표치 이하일 때
- 실패 사례가 성공 사례보다 많을 때

## 🎯 향후 개선 계획

1. **Few-shot Learning**: 학습 데이터를 AI 프롬프트에 포함
2. **가중치 조정**: 키워드 패턴 기반 감성 분석 가중치 자동 조정
3. **트렌드 학습**: 시간대별 패턴 학습
4. **자동 알림**: 정확도 저하 시 알림

## ⚠️ 주의사항

- 학습 데이터는 최소 7일 이상 수집 권장
- 시장 데이터는 매일 수집되어야 정확도 계산 가능
- GitHub Actions 실행 시 GEMINI_API_KEY 필수

## 🤝 기여

학습 알고리즘 개선 제안은 언제나 환영합니다!
