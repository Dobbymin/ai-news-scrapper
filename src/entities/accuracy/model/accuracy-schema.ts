import { z } from "zod";

/**
 * 시장 데이터 Zod 스키마
 */

export const CryptoMarketDataSchema = z.object({
  btc: z.number().min(-100).max(100),
  eth: z.number().min(-100).max(100),
  avgAltcoin: z.number().min(-100).max(100).optional(),
});

export const StockMarketDataSchema = z.object({
  kospi: z.number().min(-100).max(100),
  kosdaq: z.number().min(-100).max(100),
  volume: z.number().positive().optional(),
  foreignBuying: z.number().optional(),
});

export const MarketDataSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  crypto: CryptoMarketDataSchema,
  stock: StockMarketDataSchema,
  collectedAt: z.string().datetime(),
});

export const PredictionDataSchema = z.object({
  index: z.number().min(0).max(100),
  direction: z.enum(["positive", "negative", "neutral"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const AccuracyLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  accuracy: z.number().min(0).max(100),
  prediction: PredictionDataSchema,
  actual: MarketDataSchema,
  isCorrect: z.boolean(),
  errorRate: z.number().min(0).max(100),
  verifiedAt: z.string().datetime(),
});

export const MarketDataCollectionResultSchema = z.object({
  success: z.boolean(),
  data: MarketDataSchema.optional(),
  error: z.string().optional(),
  partialFailure: z
    .object({
      crypto: z.boolean().optional(),
      stock: z.boolean().optional(),
    })
    .optional(),
});

// 타입 추론
export type CryptoMarketDataSchemaType = z.infer<typeof CryptoMarketDataSchema>;
export type StockMarketDataSchemaType = z.infer<typeof StockMarketDataSchema>;
export type MarketDataSchemaType = z.infer<typeof MarketDataSchema>;
export type PredictionDataSchemaType = z.infer<typeof PredictionDataSchema>;
export type AccuracyLogSchemaType = z.infer<typeof AccuracyLogSchema>;
export type MarketDataCollectionResultSchemaType = z.infer<typeof MarketDataCollectionResultSchema>;
