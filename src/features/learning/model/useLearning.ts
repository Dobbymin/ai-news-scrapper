/**
 * Learning Feature - Model
 * @description 학습 데이터 업데이트 훅
 */
import { useState } from "react";

interface UseLearningReturn {
  updating: boolean;
  success: boolean;
  error: string | null;
  learningData: {
    totalCases: number;
    successCases: number;
    failureCases: number;
    averageAccuracy: number;
    directionMatchRate: number;
  } | null;
  updateLearning: () => Promise<void>;
}

export function useLearning(): UseLearningReturn {
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [learningData, setLearningData] = useState<UseLearningReturn["learningData"]>(null);

  const updateLearning = async () => {
    try {
      setUpdating(true);
      setError(null);
      setSuccess(false);
      setLearningData(null);

      const response = await fetch("/api/learning/update", {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || result.error || "학습 데이터 업데이트에 실패했습니다.");
      }

      setSuccess(true);
      setLearningData(result.data);

      // 3초 후 상태 초기화
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("학습 데이터 업데이트 실패:", err);
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setUpdating(false);
    }
  };

  return {
    updating,
    success,
    error,
    learningData,
    updateLearning,
  };
}
