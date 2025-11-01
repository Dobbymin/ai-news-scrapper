import { z } from "zod";

/**
 * 뉴스 Zod 스키마
 *
 * 런타임에서 뉴스 데이터의 유효성을 검증하고
 * 타입 안전성을 보장합니다.
 */
export const NewsSchema = z.object({
  id: z.number().positive("ID는 양수여야 합니다"),

  title: z.string().min(1, "제목은 필수입니다").max(100, "제목은 최대 100자입니다"),

  content: z.string().min(1, "본문은 필수입니다").max(1000, "본문은 최대 1000자입니다"),

  url: z.string().url("유효한 URL이어야 합니다"),

  publishedAt: z.string().datetime("ISO 8601 형식이어야 합니다"),

  source: z.string().min(1, "언론사는 필수입니다"),

  scrapedAt: z.string().datetime("ISO 8601 형식이어야 합니다"),
});

/**
 * 뉴스 배열 스키마
 */
export const NewsArraySchema = z.array(NewsSchema);

/**
 * 뉴스 수집 결과 스키마
 */
export const NewsCollectionResultSchema = z.object({
  success: z.boolean(),
  count: z.number().nonnegative(),
  data: NewsArraySchema,
  savedPath: z.string().optional(),
  error: z.string().optional(),
});

/**
 * 크롤링 진행 상황 스키마
 */
export const ScrapeProgressSchema = z.object({
  current: z.number().nonnegative(),
  total: z.number().positive(),
  percentage: z.number().min(0).max(100),
  estimatedTime: z.number().positive().optional(),
});

// 타입 추론
export type NewsSchemaType = z.infer<typeof NewsSchema>;
export type NewsArraySchemaType = z.infer<typeof NewsArraySchema>;
export type NewsCollectionResultSchemaType = z.infer<typeof NewsCollectionResultSchema>;
export type ScrapeProgressSchemaType = z.infer<typeof ScrapeProgressSchema>;
