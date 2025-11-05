import type { RandomReturnConfig } from '../../utils/random-returns'

interface UseSegmentRandomReturnHandlersProps {
  randomConfig: RandomReturnConfig | undefined
  onRandomConfigChange: (config: RandomReturnConfig) => void
}

export function useSegmentRandomReturnHandlers({
  randomConfig,
  onRandomConfigChange,
}: UseSegmentRandomReturnHandlersProps) {
  const averageReturn = randomConfig?.averageReturn || 0.05
  const standardDeviation = randomConfig?.standardDeviation ?? 0.12
  const seed = randomConfig?.seed

  const handleAverageReturnChange = (value: number) => {
    onRandomConfigChange({
      averageReturn: value,
      standardDeviation,
      seed,
    })
  }

  const handleStdDevChange = (value: number) => {
    onRandomConfigChange({
      averageReturn,
      standardDeviation: value,
      seed,
    })
  }

  const handleSeedChange = (value: number | undefined) => {
    onRandomConfigChange({
      averageReturn,
      standardDeviation,
      seed: value,
    })
  }

  return {
    averageReturn,
    standardDeviation,
    seed,
    handleAverageReturnChange,
    handleStdDevChange,
    handleSeedChange,
  }
}
