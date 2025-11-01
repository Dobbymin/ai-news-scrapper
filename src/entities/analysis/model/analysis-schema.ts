import { z } from "zod";

/**
 * 감성 분석 결과 스키마
 */
export const SentimentAnalysisSchema = z.object({
  newsId: z.number().int().positive(),
  sentiment: z.enum(["positive", "negative", "neutral"]),
  confidence: z.number().min(0).max(100),
  keywords: z.array(z.string()).min(1),
  reason: z.string().min(10),
});

/**
 * 분석 요약 스키마
 */
export const AnalysisSummarySchema = z.object({
  positive: z.number().int().nonnegative(),
  negative: z.number().int().nonnegative(),
  neutral: z.number().int().nonnegative(),
});

/**
 * 전체 분석 결과 스키마
 */
export const AnalysisResultSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  totalNews: z.number().int().positive(),
  investmentIndex: z.number().min(0).max(100),
  summary: AnalysisSummarySchema,
  keywords: z.array(z.string()).max(10),
  newsAnalysis: z.array(SentimentAnalysisSchema),
  analyzedAt: z.string().datetime(),
});

/**
 * 분석 결과 배열 스키마
 */
export const AnalysisResultArraySchema = z.array(AnalysisResultSchema);

/**
 * 감성 분석 진행 상황 스키마
 */
export const AnalysisProgressSchema = z.object({
  current: z.number().int().nonnegative(),
  total: z.number().int().positive(),
  percentage: z.number().min(0).max(100),
  currentTitle: z.string().optional(),
});
