import { MultiAssetPortfolioConfiguration } from './MultiAssetPortfolioConfiguration'
import type { WithdrawalReturnMode } from '../utils/config-storage'
import type { MultiAssetPortfolioConfig } from '../../helpers/multi-asset-portfolio'
import {
  FixedReturnConfig,
  RandomReturnConfig,
  VariableReturnConfig,
  ReturnModeSelector,
} from './withdrawal-return-configs'

interface WithdrawalReturnModeConfigurationProps {
  withdrawalReturnMode: WithdrawalReturnMode
  withdrawalAverageReturn: number
  withdrawalStandardDeviation: number
  withdrawalRandomSeed: number | undefined
  withdrawalVariableReturns: Record<number, number>
  formValueRendite: number
  startOfIndependence: number
  globalEndOfLife: number
  withdrawalMultiAssetConfig: MultiAssetPortfolioConfig
  onWithdrawalReturnModeChange: (mode: WithdrawalReturnMode) => void
  onWithdrawalAverageReturnChange: (value: number) => void
  onWithdrawalStandardDeviationChange: (value: number) => void
  onWithdrawalRandomSeedChange: (value: number | undefined) => void
  onWithdrawalVariableReturnsChange: (returns: Record<number, number>) => void
  onFormValueRenditeChange: (rendite: number) => void
  onWithdrawalMultiAssetConfigChange: (config: MultiAssetPortfolioConfig) => void
}

export function WithdrawalReturnModeConfiguration({
  withdrawalReturnMode,
  withdrawalAverageReturn,
  withdrawalStandardDeviation,
  withdrawalRandomSeed,
  withdrawalVariableReturns,
  formValueRendite,
  startOfIndependence,
  globalEndOfLife,
  withdrawalMultiAssetConfig,
  onWithdrawalReturnModeChange,
  onWithdrawalAverageReturnChange,
  onWithdrawalStandardDeviationChange,
  onWithdrawalRandomSeedChange,
  onWithdrawalVariableReturnsChange,
  onFormValueRenditeChange,
  onWithdrawalMultiAssetConfigChange,
}: WithdrawalReturnModeConfigurationProps) {
  return (
    <>
      <ReturnModeSelector
        withdrawalReturnMode={withdrawalReturnMode}
        onWithdrawalReturnModeChange={onWithdrawalReturnModeChange}
      />

      {withdrawalReturnMode === 'fixed' && (
        <FixedReturnConfig
          formValueRendite={formValueRendite}
          onFormValueRenditeChange={onFormValueRenditeChange}
        />
      )}

      {withdrawalReturnMode === 'random' && (
        <RandomReturnConfig
          withdrawalAverageReturn={withdrawalAverageReturn}
          withdrawalStandardDeviation={withdrawalStandardDeviation}
          withdrawalRandomSeed={withdrawalRandomSeed}
          onWithdrawalAverageReturnChange={onWithdrawalAverageReturnChange}
          onWithdrawalStandardDeviationChange={onWithdrawalStandardDeviationChange}
          onWithdrawalRandomSeedChange={onWithdrawalRandomSeedChange}
        />
      )}

      {withdrawalReturnMode === 'variable' && (
        <VariableReturnConfig
          withdrawalVariableReturns={withdrawalVariableReturns}
          startOfIndependence={startOfIndependence}
          globalEndOfLife={globalEndOfLife}
          onWithdrawalVariableReturnsChange={onWithdrawalVariableReturnsChange}
        />
      )}

      {withdrawalReturnMode === 'multiasset' && (
        <MultiAssetPortfolioConfiguration
          values={withdrawalMultiAssetConfig}
          onChange={onWithdrawalMultiAssetConfigChange}
          nestingLevel={0}
        />
      )}
    </>
  )
}
