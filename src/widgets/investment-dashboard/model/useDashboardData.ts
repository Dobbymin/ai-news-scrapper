/**
 * Investment Dashboard Widget - Model
 * @description 대시보드 데이터를 관리하는 훅
 */

import { useEffect, useState } from "react";
import type { AnalysisData } from "@/entities/analysis";

interface UseDashboardDataReturn {
  analysisData: AnalysisData | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDashboardData(): UseDashboardDataReturn {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 분석 데이터 로드
      const analysisRes = await fetch("/api/analysis/latest");
      if (analysisRes.ok) {
        const data = await analysisRes.json();
        setAnalysisData(data);
      }

      // 정확도 데이터 로드
      const accuracyRes = await fetch("/api/accuracy/logs?limit=1");
      if (accuracyRes.ok) {
        const logs = await accuracyRes.json();
        if (logs && logs.length > 0) {
          setAccuracy(logs[0].accuracy);
        }
      }
    } catch (err) {
      console.error("데이터 로드 실패:", err);
      setError("데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    analysisData,
    accuracy,
    loading,
    error,
    refetch: fetchData,
  };
}
