import type { RandomReturnConfig } from '../utils/random-returns'
import { AverageReturnSlider } from './segment-return-config/AverageReturnSlider'
import { StandardDeviationSlider } from './segment-return-config/StandardDeviationSlider'
import { RandomSeedInput } from './segment-return-config/RandomSeedInput'
import { useSegmentRandomReturnHandlers } from './hooks/useSegmentRandomReturnHandlers'

interface RandomReturnConfigProps {
  segmentId: string
  randomConfig: RandomReturnConfig | undefined
  onRandomConfigChange: (config: RandomReturnConfig) => void
}

export function SegmentRandomReturnConfig({ segmentId, randomConfig, onRandomConfigChange }: RandomReturnConfigProps) {
  const { averageReturn, standardDeviation, seed, handleAverageReturnChange, handleStdDevChange, handleSeedChange } =
    useSegmentRandomReturnHandlers({ randomConfig, onRandomConfigChange })

  return (
    <>
      <AverageReturnSlider
        segmentId={segmentId}
        averageReturn={averageReturn}
        onAverageReturnChange={handleAverageReturnChange}
      />

      <StandardDeviationSlider
        segmentId={segmentId}
        standardDeviation={standardDeviation}
        onStandardDeviationChange={handleStdDevChange}
      />

      <RandomSeedInput segmentId={segmentId} seed={seed} onSeedChange={handleSeedChange} />
    </>
  )
}
