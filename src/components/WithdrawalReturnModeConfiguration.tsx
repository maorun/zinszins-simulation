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

function ReturnModeContent({ withdrawalReturnMode, ...props }: WithdrawalReturnModeConfigurationProps) {
  if (withdrawalReturnMode === 'fixed') {
    return (
      <FixedReturnConfig
        formValueRendite={props.formValueRendite}
        onFormValueRenditeChange={props.onFormValueRenditeChange}
      />
    )
  }
  if (withdrawalReturnMode === 'random') {
    return (
      <RandomReturnConfig
        withdrawalAverageReturn={props.withdrawalAverageReturn}
        withdrawalStandardDeviation={props.withdrawalStandardDeviation}
        withdrawalRandomSeed={props.withdrawalRandomSeed}
        onWithdrawalAverageReturnChange={props.onWithdrawalAverageReturnChange}
        onWithdrawalStandardDeviationChange={props.onWithdrawalStandardDeviationChange}
        onWithdrawalRandomSeedChange={props.onWithdrawalRandomSeedChange}
      />
    )
  }
  if (withdrawalReturnMode === 'variable') {
    return (
      <VariableReturnConfig
        withdrawalVariableReturns={props.withdrawalVariableReturns}
        startOfIndependence={props.startOfIndependence}
        globalEndOfLife={props.globalEndOfLife}
        onWithdrawalVariableReturnsChange={props.onWithdrawalVariableReturnsChange}
      />
    )
  }
  if (withdrawalReturnMode === 'multiasset') {
    return (
      <MultiAssetPortfolioConfiguration
        values={props.withdrawalMultiAssetConfig}
        onChange={props.onWithdrawalMultiAssetConfigChange}
        nestingLevel={0}
      />
    )
  }
  return null
}

export function WithdrawalReturnModeConfiguration(props: WithdrawalReturnModeConfigurationProps) {
  return (
    <>
      <ReturnModeSelector
        withdrawalReturnMode={props.withdrawalReturnMode}
        onWithdrawalReturnModeChange={props.onWithdrawalReturnModeChange}
      />
      <ReturnModeContent {...props} />
    </>
  )
}
