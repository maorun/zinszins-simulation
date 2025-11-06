import type { WithdrawalFormValue, WithdrawalReturnMode } from '../utils/config-storage'
import type { MultiAssetPortfolioConfig } from '../../helpers/multi-asset-portfolio'
import { WithdrawalReturnModeConfiguration } from './WithdrawalReturnModeConfiguration'
import { WithdrawalStrategySelector } from './WithdrawalStrategySelector'
import { WithdrawalFrequencyConfiguration } from './WithdrawalFrequencyConfiguration'
import { InflationConfiguration } from './InflationConfiguration'
import { VariablePercentWithdrawalConfiguration } from './VariablePercentWithdrawalConfiguration'
import { MonthlyFixedWithdrawalConfiguration } from './MonthlyFixedWithdrawalConfiguration'
import { DynamicWithdrawalConfiguration } from './DynamicWithdrawalConfiguration'
import { RMDWithdrawalConfiguration } from './rmd-withdrawal/RMDWithdrawalConfiguration'
import { KapitalerhaltConfiguration } from './KapitalerhaltConfiguration'
import { BucketStrategyConfigurationForm } from './bucket-strategy/BucketStrategyConfigurationForm'

interface SingleStrategyConfigParams {
  formValue: WithdrawalFormValue
  startOfIndependence: number
  globalEndOfLife: number
  withdrawalReturnMode: WithdrawalReturnMode
  withdrawalAverageReturn: number
  withdrawalStandardDeviation: number
  withdrawalRandomSeed: number | undefined
  withdrawalVariableReturns: Record<number, number>
  withdrawalMultiAssetConfig: MultiAssetPortfolioConfig
  onConfigUpdate: (updates: Record<string, unknown>) => void
  onFormValueUpdate: (updates: Partial<WithdrawalFormValue>) => void
  onStrategyChange: (strategy: string) => void
  onWithdrawalMultiAssetConfigChange: (config: MultiAssetPortfolioConfig) => void
  dispatchEnd: (val: [number, number]) => void
}

function useWithdrawalReturnModeConfiguration(params: SingleStrategyConfigParams) {
  const {
    withdrawalReturnMode,
    withdrawalAverageReturn,
    withdrawalStandardDeviation,
    withdrawalRandomSeed,
    withdrawalVariableReturns,
    formValue,
    startOfIndependence,
    globalEndOfLife,
    withdrawalMultiAssetConfig,
    onConfigUpdate,
    onFormValueUpdate,
    onWithdrawalMultiAssetConfigChange,
  } = params

  return {
    withdrawalReturnMode,
    withdrawalAverageReturn,
    withdrawalStandardDeviation,
    withdrawalRandomSeed,
    withdrawalVariableReturns,
    formValueRendite: formValue.rendite,
    startOfIndependence,
    globalEndOfLife,
    withdrawalMultiAssetConfig,
    onWithdrawalReturnModeChange: (mode: WithdrawalReturnMode) => onConfigUpdate({ withdrawalReturnMode: mode }),
    onWithdrawalAverageReturnChange: (value: number) => onConfigUpdate({ withdrawalAverageReturn: value }),
    onWithdrawalStandardDeviationChange: (value: number) => onConfigUpdate({ withdrawalStandardDeviation: value }),
    onWithdrawalRandomSeedChange: (value: number | undefined) => onConfigUpdate({ withdrawalRandomSeed: value }),
    onWithdrawalVariableReturnsChange: (returns: Record<number, number>) =>
      onConfigUpdate({ withdrawalVariableReturns: returns }),
    onFormValueRenditeChange: (rendite: number) => onFormValueUpdate({ ...formValue, rendite }),
    onWithdrawalMultiAssetConfigChange,
  }
}

export function SingleStrategyConfigSection(params: SingleStrategyConfigParams) {
  const { formValue, startOfIndependence, globalEndOfLife, onFormValueUpdate, onStrategyChange, dispatchEnd } = params

  const withdrawalReturnModeProps = useWithdrawalReturnModeConfiguration(params)

  return (
    <div>
      {/* Withdrawal Return Configuration */}
      <WithdrawalReturnModeConfiguration {...withdrawalReturnModeProps} />

      <WithdrawalStrategySelector
        strategie={formValue.strategie}
        onStrategyChange={(strategy) => {
          dispatchEnd([startOfIndependence, globalEndOfLife])
          onFormValueUpdate({ strategie: strategy })
          onStrategyChange(strategy)
        }}
      />

      {/* Withdrawal frequency configuration */}
      <WithdrawalFrequencyConfiguration
        frequency={formValue.withdrawalFrequency}
        onFrequencyChange={(frequency) => {
          onFormValueUpdate({ withdrawalFrequency: frequency })
        }}
      />

      {/* General inflation controls for all strategies */}
      <InflationConfiguration
        inflationAktiv={formValue.inflationAktiv}
        inflationsrate={formValue.inflationsrate}
        onInflationActiveChange={(active) => {
          onFormValueUpdate({ ...formValue, inflationAktiv: active })
        }}
        onInflationRateChange={(rate) => {
          dispatchEnd([startOfIndependence, globalEndOfLife])
          onFormValueUpdate({ inflationsrate: rate })
        }}
      />

      {/* Strategy-specific configurations */}
      <StrategySpecificConfigs formValue={formValue} onFormValueUpdate={onFormValueUpdate} />
    </div>
  )
}

interface StrategySpecificConfigsProps {
  formValue: WithdrawalFormValue
  onFormValueUpdate: (updates: Partial<WithdrawalFormValue>) => void
}

/**
 * Render configuration for variabel_prozent strategy
 */
function VariablePercentConfig({ formValue, onFormValueUpdate }: StrategySpecificConfigsProps) {
  return (
    <VariablePercentWithdrawalConfiguration
      variabelProzent={formValue.variabelProzent}
      onVariablePercentChange={(percent) => onFormValueUpdate({ variabelProzent: percent })}
    />
  )
}

/**
 * Render configuration for monatlich_fest strategy
 */
function MonthlyFixedConfig({ formValue, onFormValueUpdate }: StrategySpecificConfigsProps) {
  return (
    <MonthlyFixedWithdrawalConfiguration
      monatlicheBetrag={formValue.monatlicheBetrag}
      guardrailsAktiv={formValue.guardrailsAktiv}
      guardrailsSchwelle={formValue.guardrailsSchwelle}
      onMonthlyAmountChange={(amount) => {
        if (amount) onFormValueUpdate({ ...formValue, monatlicheBetrag: amount })
      }}
      onGuardrailsActiveChange={(checked) => onFormValueUpdate({ ...formValue, guardrailsAktiv: checked })}
      onGuardrailsThresholdChange={(threshold) => onFormValueUpdate({ guardrailsSchwelle: threshold })}
    />
  )
}

function StrategySpecificConfigs({ formValue, onFormValueUpdate }: StrategySpecificConfigsProps) {
  const strategy = formValue.strategie

  switch (strategy) {
    case 'variabel_prozent':
      return <VariablePercentConfig formValue={formValue} onFormValueUpdate={onFormValueUpdate} />
    case 'monatlich_fest':
      return <MonthlyFixedConfig formValue={formValue} onFormValueUpdate={onFormValueUpdate} />
    case 'dynamisch':
      return <DynamicWithdrawalConfiguration formValue={formValue} />
    case 'rmd':
      return <RMDWithdrawalConfiguration formValue={formValue} updateFormValue={onFormValueUpdate} />
    case 'kapitalerhalt':
      return <KapitalerhaltConfiguration formValue={formValue} updateFormValue={onFormValueUpdate} />
    case 'bucket_strategie':
      return (
        <BucketStrategyConfigurationForm
          bucketConfig={formValue.bucketConfig}
          onBucketConfigChange={(config) => onFormValueUpdate({ ...formValue, bucketConfig: config })}
        />
      )
    default:
      return null
  }
}
