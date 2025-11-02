import { SegmentReturnModeSelector } from './SegmentReturnModeSelector'
import { SegmentReturnConfigRenderer } from './SegmentReturnConfigRenderer'
import {
  createReturnConfigForMode,
  getReturnModeFromConfig,
} from './segment-return-config-helpers'
import type { ReturnConfiguration } from '../../helpers/random-returns'

export type WithdrawalReturnMode = 'fixed' | 'random' | 'variable' | 'multiasset'

interface SegmentReturnConfigurationProps {
  segmentId: string
  startYear: number
  endYear: number
  returnConfig: ReturnConfiguration
  onReturnConfigChange: (config: ReturnConfiguration) => void
}

export function SegmentReturnConfiguration({
  segmentId,
  startYear,
  endYear,
  returnConfig,
  onReturnConfigChange,
}: SegmentReturnConfigurationProps) {
  const currentMode = getReturnModeFromConfig(returnConfig)

  const handleModeChange = (mode: WithdrawalReturnMode) => {
    const newConfig = createReturnConfigForMode(mode, returnConfig)
    onReturnConfigChange(newConfig)
  }

  return (
    <>
      <SegmentReturnModeSelector
        currentMode={currentMode}
        onModeChange={handleModeChange}
      />
      <SegmentReturnConfigRenderer
        segmentId={segmentId}
        startYear={startYear}
        endYear={endYear}
        returnConfig={returnConfig}
        onReturnConfigChange={onReturnConfigChange}
      />
    </>
  )
}
