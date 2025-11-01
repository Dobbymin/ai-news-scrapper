/**
 * AccuracyChart - Widget UI Component
 * @description 정확도 추이를 라인 차트로 표시하는 컴포넌트
 */
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { AccuracyRecord } from "../model/types";

/**
 * AccuracyChart - Widget UI Component
 * @description 정확도 추이를 라인 차트로 표시하는 컴포넌트
 */

interface AccuracyChartProps {
  data: AccuracyRecord[];
}

export function AccuracyChart({ data }: AccuracyChartProps) {
  // 최근 10개 데이터만 표시 (역순으로 정렬)
  const chartData = [...data]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-10)
    .map((record) => ({
      date: new Date(record.date).toLocaleDateString("ko-KR", {
        month: "short",
        day: "numeric",
      }),
      정확도: record.accuracy,
      오차율: record.errorRate,
    }));

  if (chartData.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>정확도 추이</CardTitle>
        <CardDescription>최근 {chartData.length}일간의 예측 정확도 변화를 확인하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='date' />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type='monotone' dataKey='정확도' stroke='#10b981' strokeWidth={2} activeDot={{ r: 8 }} />
            <Line type='monotone' dataKey='오차율' stroke='#ef4444' strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
