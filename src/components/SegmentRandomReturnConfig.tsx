import type { RandomReturnConfig } from '../../helpers/random-returns'
import { AverageReturnSlider } from './segment-return-config/AverageReturnSlider'
import { StandardDeviationSlider } from './segment-return-config/StandardDeviationSlider'
import { RandomSeedInput } from './segment-return-config/RandomSeedInput'

interface RandomReturnConfigProps {
  segmentId: string
  randomConfig: RandomReturnConfig | undefined
  onRandomConfigChange: (config: RandomReturnConfig) => void
}

export function SegmentRandomReturnConfig({
  segmentId,
  randomConfig,
  onRandomConfigChange,
}: RandomReturnConfigProps) {
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

      <RandomSeedInput
        segmentId={segmentId}
        seed={seed}
        onSeedChange={handleSeedChange}
      />
    </>
  )
}
