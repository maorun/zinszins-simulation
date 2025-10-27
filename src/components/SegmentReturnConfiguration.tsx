import { Label } from './ui/label'
import { RadioTileGroup, RadioTile } from './ui/radio-tile'
import { SegmentFixedReturnConfig } from './SegmentFixedReturnConfig'
import { SegmentRandomReturnConfig } from './SegmentRandomReturnConfig'
import { SegmentVariableReturnConfig } from './SegmentVariableReturnConfig'
import { MultiAssetPortfolioConfiguration } from './MultiAssetPortfolioConfiguration'
import { createDefaultMultiAssetConfig } from '../../helpers/multi-asset-portfolio'
import type { ReturnConfiguration } from '../../helpers/random-returns'

export type WithdrawalReturnMode = 'fixed' | 'random' | 'variable' | 'multiasset'

interface SegmentReturnConfigurationProps {
  segmentId: string
  startYear: number
  endYear: number
  returnConfig: ReturnConfiguration
  onReturnConfigChange: (config: ReturnConfiguration) => void
}

const getReturnModeFromConfig = (returnConfig: ReturnConfiguration): WithdrawalReturnMode => {
  return returnConfig.mode as WithdrawalReturnMode
}

const handleModeChange = (
  mode: WithdrawalReturnMode,
  returnConfig: ReturnConfiguration,
  onReturnConfigChange: (config: ReturnConfiguration) => void,
) => {
  switch (mode) {
    case 'fixed':
      onReturnConfigChange({ mode: 'fixed', fixedRate: 0.05 })
      break
    case 'random':
      onReturnConfigChange({
        mode: 'random',
        randomConfig: { averageReturn: 0.05, standardDeviation: 0.12, seed: undefined },
      })
      break
    case 'variable':
      onReturnConfigChange({ mode: 'variable', variableConfig: { yearlyReturns: {} } })
      break
    case 'multiasset':
      onReturnConfigChange({
        mode: 'multiasset',
        multiAssetConfig:
          returnConfig.mode === 'multiasset'
            ? returnConfig.multiAssetConfig
            : createDefaultMultiAssetConfig(),
      })
      break
  }
}

function ReturnModeSelector({
  currentMode,
  onModeChange,
}: {
  currentMode: WithdrawalReturnMode
  onModeChange: (mode: WithdrawalReturnMode) => void
}) {
  return (
    <div className="mb-4 space-y-2">
      <Label>Rendite-Modus</Label>
      <RadioTileGroup
        value={currentMode}
        onValueChange={value => onModeChange(value as WithdrawalReturnMode)}
      >
        <RadioTile value="fixed" label="Feste Rendite">
          Konstante jährliche Rendite für diese Phase
        </RadioTile>
        <RadioTile value="random" label="Zufällige Rendite">
          Monte Carlo Simulation mit Volatilität
        </RadioTile>
        <RadioTile value="variable" label="Variable Rendite">
          Jahr-für-Jahr konfigurierbare Renditen
        </RadioTile>
        <RadioTile value="multiasset" label="Multi-Asset Portfolio">
          Diversifiziertes Portfolio mit automatischem Rebalancing
        </RadioTile>
      </RadioTileGroup>
    </div>
  )
}

function renderReturnConfig(props: SegmentReturnConfigurationProps) {
  const { segmentId, startYear, endYear, returnConfig, onReturnConfigChange } = props

  switch (returnConfig.mode) {
    case 'fixed':
      return (
        <SegmentFixedReturnConfig
          fixedRate={returnConfig.fixedRate}
          onFixedRateChange={rate => onReturnConfigChange({ mode: 'fixed', fixedRate: rate })}
        />
      )
    case 'random':
      return (
        <SegmentRandomReturnConfig
          segmentId={segmentId}
          randomConfig={returnConfig.randomConfig}
          onRandomConfigChange={config =>
            onReturnConfigChange({ mode: 'random', randomConfig: config })}
        />
      )
    case 'variable':
      return (
        <SegmentVariableReturnConfig
          startYear={startYear}
          endYear={endYear}
          variableConfig={returnConfig.variableConfig}
          onVariableConfigChange={config =>
            onReturnConfigChange({ mode: 'variable', variableConfig: config })}
        />
      )
    case 'multiasset':
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
    default:
      return null
  }
}

export function SegmentReturnConfiguration(props: SegmentReturnConfigurationProps) {
  const { returnConfig, onReturnConfigChange } = props
  const currentMode = getReturnModeFromConfig(returnConfig)
  const onModeChange = (mode: WithdrawalReturnMode) =>
    handleModeChange(mode, returnConfig, onReturnConfigChange)

  return (
    <>
      <ReturnModeSelector currentMode={currentMode} onModeChange={onModeChange} />
      {renderReturnConfig(props)}
    </>
  )
}
