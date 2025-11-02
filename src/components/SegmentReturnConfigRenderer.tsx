import { SegmentFixedReturnConfig } from './SegmentFixedReturnConfig'
import { SegmentRandomReturnConfig } from './SegmentRandomReturnConfig'
import { SegmentVariableReturnConfig } from './SegmentVariableReturnConfig'
import { MultiAssetPortfolioConfiguration } from './MultiAssetPortfolioConfiguration'
import { createDefaultMultiAssetConfig } from '../../helpers/multi-asset-portfolio'
import type { ReturnConfiguration } from '../../helpers/random-returns'

interface SegmentReturnConfigRendererProps {
  segmentId: string
  startYear: number
  endYear: number
  returnConfig: ReturnConfiguration
  onReturnConfigChange: (config: ReturnConfiguration) => void
}

function renderFixedConfig(
  returnConfig: ReturnConfiguration,
  onReturnConfigChange: (config: ReturnConfiguration) => void,
) {
  if (returnConfig.mode !== 'fixed') return null
  return (
    <SegmentFixedReturnConfig
      fixedRate={returnConfig.fixedRate}
      onFixedRateChange={rate =>
        onReturnConfigChange({ mode: 'fixed', fixedRate: rate })}
    />
  )
}

function renderRandomConfig(
  segmentId: string,
  returnConfig: ReturnConfiguration,
  onReturnConfigChange: (config: ReturnConfiguration) => void,
) {
  if (returnConfig.mode !== 'random') return null
  return (
    <SegmentRandomReturnConfig
      segmentId={segmentId}
      randomConfig={returnConfig.randomConfig}
      onRandomConfigChange={config =>
        onReturnConfigChange({ mode: 'random', randomConfig: config })}
    />
  )
}

function renderVariableConfig(
  startYear: number,
  endYear: number,
  returnConfig: ReturnConfiguration,
  onReturnConfigChange: (config: ReturnConfiguration) => void,
) {
  if (returnConfig.mode !== 'variable') return null
  return (
    <SegmentVariableReturnConfig
      startYear={startYear}
      endYear={endYear}
      variableConfig={returnConfig.variableConfig}
      onVariableConfigChange={config =>
        onReturnConfigChange({ mode: 'variable', variableConfig: config })}
    />
  )
}

function renderMultiAssetConfig(
  returnConfig: ReturnConfiguration,
  onReturnConfigChange: (config: ReturnConfiguration) => void,
) {
  if (returnConfig.mode !== 'multiasset') return null
  return (
    <div className="mb-4">
      <MultiAssetPortfolioConfiguration
        values={returnConfig.multiAssetConfig || createDefaultMultiAssetConfig()}
        onChange={newConfig =>
          onReturnConfigChange({
            mode: 'multiasset',
            multiAssetConfig: newConfig,
          })}
        nestingLevel={1}
      />
    </div>
  )
}

export function SegmentReturnConfigRenderer({
  segmentId,
  startYear,
  endYear,
  returnConfig,
  onReturnConfigChange,
}: SegmentReturnConfigRendererProps) {
  return (
    <>
      {renderFixedConfig(returnConfig, onReturnConfigChange)}
      {renderRandomConfig(segmentId, returnConfig, onReturnConfigChange)}
      {renderVariableConfig(startYear, endYear, returnConfig, onReturnConfigChange)}
      {renderMultiAssetConfig(returnConfig, onReturnConfigChange)}
    </>
  )
}
