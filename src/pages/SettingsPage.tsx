"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";

/**
 * 설정 페이지
 * @description Gemini API 키, 크롤링 설정, 테마 등을 관리
 */
export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("AIzaSy...HIDDEN");
  const [crawlCount, setCrawlCount] = useState(20);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // TODO: 실제 저장 로직
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleExport = (format: "json" | "csv") => {
    // TODO: 실제 내보내기 로직
    alert(`${format.toUpperCase()} 형식으로 내보내기`);
  };

  return (
    <div className="space-y-8">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">설정</h1>
        <p className="text-muted-foreground mt-2">
          AI News Trader의 설정을 관리하세요.
        </p>
      </div>

      {/* 저장 성공 알림 */}
      {saved && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">
            ✓ 설정이 성공적으로 저장되었습니다.
          </AlertDescription>
        </Alert>
      )}

      {/* API 설정 */}
      <Card>
        <CardHeader>
          <CardTitle>Gemini API 설정</CardTitle>
          <CardDescription>
            Google Gemini API 키를 입력하세요.{" "}
            <a
              href="https://ai.google.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              API 키 발급받기 →
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">API 키</label>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="AIzaSy..."
              />
              <Button onClick={handleSave}>저장</Button>
            </div>
            <p className="text-xs text-muted-foreground">
              ⚠️ API 키는 로컬에 암호화되어 저장됩니다.
            </p>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">API 상태</div>
                <div className="text-xs text-muted-foreground">
                  Gemini API 연결 상태
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">
                ✓ 연결됨
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 크롤링 설정 */}
      <Card>
        <CardHeader>
          <CardTitle>크롤링 설정</CardTitle>
          <CardDescription>
            뉴스 크롤링 개수와 주기를 설정하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              뉴스 개수: {crawlCount}개
            </label>
            <input
              type="range"
              min="10"
              max="50"
              step="5"
              value={crawlCount}
              onChange={(e) => setCrawlCount(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>10개</span>
              <span>50개</span>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">자동 크롤링</div>
                <div className="text-xs text-muted-foreground">
                  Phase 2에서 지원 예정
                </div>
              </div>
              <Badge variant="outline">Coming Soon</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 테마 설정 */}
      <Card>
        <CardHeader>
          <CardTitle>테마 설정</CardTitle>
          <CardDescription>다크 모드 또는 라이트 모드를 선택하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              onClick={() => setTheme("light")}
              className="flex-1"
            >
              ☀️ 라이트 모드
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              onClick={() => setTheme("dark")}
              className="flex-1"
            >
              🌙 다크 모드
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 데이터 관리 */}
      <Card>
        <CardHeader>
          <CardTitle>데이터 관리</CardTitle>
          <CardDescription>
            분석 데이터를 백업하거나 내보내기하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleExport("json")}
              className="flex-1"
            >
              📄 JSON 내보내기
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport("csv")}
              className="flex-1"
            >
              📊 CSV 내보내기
            </Button>
          </div>

          <div className="pt-4 border-t">
            <div className="space-y-2">
              <div className="text-sm font-medium text-destructive">
                위험 구역
              </div>
              <Button variant="destructive" className="w-full">
                🗑️ 모든 데이터 삭제
              </Button>
              <p className="text-xs text-muted-foreground">
                ⚠️ 이 작업은 되돌릴 수 없습니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">버전</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">저장 경로</span>
            <span className="font-medium">data/</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">GitHub</span>
            <a
              href="https://github.com/Dobbymin/ai-news-scrapper"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline"
            >
              Repository →
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
