#!/bin/bash

# AI News Trader - Docker 실행 스크립트

echo "🐳 AI News Trader Docker 실행 시작..."

# .env.local 파일 확인
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local 파일이 없습니다."
    echo "📝 .env.example 파일을 복사하여 .env.local을 생성합니다..."
    cp .env.example .env.local
    echo "✅ .env.local 파일이 생성되었습니다."
    echo "⚙️  .env.local 파일을 열어 GEMINI_API_KEY를 입력해주세요."
    exit 1
fi

# GEMINI_API_KEY 확인
if ! grep -q "GEMINI_API_KEY=.*[^_]" .env.local; then
    echo "⚠️  GEMINI_API_KEY가 설정되지 않았습니다."
    echo "⚙️  .env.local 파일을 열어 GEMINI_API_KEY를 입력해주세요."
    exit 1
fi

# data 디렉토리 생성
echo "📁 데이터 디렉토리 생성 중..."
mkdir -p data/news data/analysis data/accuracy data/learning

# Docker Compose 실행
echo "🚀 Docker Compose 실행 중..."
docker-compose up -d

# 상태 확인
echo ""
echo "✅ Docker 컨테이너가 시작되었습니다!"
echo ""
echo "📊 컨테이너 상태:"
docker-compose ps
echo ""
echo "🌐 브라우저에서 http://localhost:3000 을 열어주세요."
echo ""
echo "📝 로그 확인: docker-compose logs -f"
echo "🛑 중지: docker-compose down"
echo "🔄 재시작: docker-compose restart"
