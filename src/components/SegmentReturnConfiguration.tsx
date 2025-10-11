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

const getReturnModeFromConfig = (
  returnConfig: ReturnConfiguration,
): WithdrawalReturnMode => {
  if (returnConfig.mode === 'multiasset') {
    return 'multiasset'
  }
  return returnConfig.mode as WithdrawalReturnMode
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
    switch (mode) {
      case 'fixed':
        onReturnConfigChange({ mode: 'fixed', fixedRate: 0.05 })
        break
      case 'random':
        onReturnConfigChange({
          mode: 'random',
          randomConfig: {
            averageReturn: 0.05,
            standardDeviation: 0.12,
            seed: undefined,
          },
        })
        break
      case 'variable':
        onReturnConfigChange({
          mode: 'variable',
          variableConfig: { yearlyReturns: {} },
        })
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

  return (
    <>
      <div className="mb-4 space-y-2">
        <Label>Rendite-Modus</Label>
        <RadioTileGroup
          value={currentMode}
          onValueChange={value => handleModeChange(value as WithdrawalReturnMode)}
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

      {returnConfig.mode === 'fixed' && (
        <SegmentFixedReturnConfig
          fixedRate={returnConfig.fixedRate}
          onFixedRateChange={rate =>
            onReturnConfigChange({ mode: 'fixed', fixedRate: rate })
          }
        />
      )}

      {returnConfig.mode === 'random' && (
        <SegmentRandomReturnConfig
          segmentId={segmentId}
          randomConfig={returnConfig.randomConfig}
          onRandomConfigChange={config =>
            onReturnConfigChange({ mode: 'random', randomConfig: config })
          }
        />
      )}

      {returnConfig.mode === 'variable' && (
        <SegmentVariableReturnConfig
          startYear={startYear}
          endYear={endYear}
          variableConfig={returnConfig.variableConfig}
          onVariableConfigChange={config =>
            onReturnConfigChange({ mode: 'variable', variableConfig: config })
          }
        />
      )}

      {returnConfig.mode === 'multiasset' && (
        <div className="mb-4">
          <MultiAssetPortfolioConfiguration
            values={returnConfig.multiAssetConfig || createDefaultMultiAssetConfig()}
            onChange={newConfig =>
              onReturnConfigChange({
                mode: 'multiasset',
                multiAssetConfig: newConfig,
              })
            }
            nestingLevel={1}
          />
        </div>
      )}
    </>
  )
}
