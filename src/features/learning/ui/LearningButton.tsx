/**
 * LearningButton - Feature UI Component
 * @description 학습 데이터를 수동으로 업데이트하는 버튼 컴포넌트
 */
import { Alert, AlertDescription, Button } from "@/shared";

import { useLearning } from "../model/useLearning";

export function LearningButton() {
  const { updating, success, error, learningData, updateLearning } = useLearning();

  return (
    <div className='space-y-4'>
      <Button onClick={updateLearning} disabled={updating} size='lg' variant='outline' className='w-full sm:w-auto'>
        {updating ? "⏳ 학습 중..." : "🧠 학습 데이터 업데이트"}
      </Button>

      {success && learningData && (
        <Alert className='border-green-200 bg-green-50'>
          <AlertDescription className='text-green-800'>
            <div className='space-y-2'>
              <div className='font-semibold'>✅ 학습 데이터가 업데이트되었습니다!</div>
              <div className='text-sm'>
                <p>• 총 사례: {learningData.totalCases}개</p>
                <p>• 성공 사례: {learningData.successCases}개</p>
                <p>• 실패 사례: {learningData.failureCases}개</p>
                <p>• 평균 정확도: {learningData.averageAccuracy.toFixed(1)}%</p>
                <p>• 방향 일치율: {learningData.directionMatchRate.toFixed(1)}%</p>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className='border-red-200 bg-red-50'>
          <AlertDescription className='text-red-800'>⚠️ {error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
