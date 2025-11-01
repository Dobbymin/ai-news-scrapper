/**
 * SentimentTrendChart - Widget UI Component
 * @description 감성 분석 추이를 파이 차트로 표시
 */
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

/**
 * SentimentTrendChart - Widget UI Component
 * @description 감성 분석 추이를 파이 차트로 표시
 */

interface SentimentTrendChartProps {
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
}

const COLORS = {
  긍정: "#10b981",
  부정: "#ef4444",
  중립: "#6b7280",
};

export function SentimentTrendChart({ positiveCount, negativeCount, neutralCount }: SentimentTrendChartProps) {
  const data = [
    { name: "긍정", value: positiveCount },
    { name: "부정", value: negativeCount },
    { name: "중립", value: neutralCount },
  ].filter((item) => item.value > 0);

  const total = positiveCount + negativeCount + neutralCount;

  if (total === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>감성 분포</CardTitle>
        <CardDescription>뉴스 감성 분석 결과의 분포를 확인하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={300}>
          <PieChart>
            <Pie
              data={data}
              cx='50%'
              cy='50%'
              labelLine={false}
              label={(entry: { name: string; percent: number }) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill='#8884d8'
              dataKey='value'
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
