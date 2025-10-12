import type { WithdrawalFormValue, WithdrawalReturnMode } from '../utils/config-storage'
import type { MultiAssetPortfolioConfig } from '../../helpers/multi-asset-portfolio'
import { WithdrawalReturnModeConfiguration } from './WithdrawalReturnModeConfiguration'
import { WithdrawalStrategySelector } from './WithdrawalStrategySelector'
import { WithdrawalFrequencyConfiguration } from './WithdrawalFrequencyConfiguration'
import { InflationConfiguration } from './InflationConfiguration'
import { VariablePercentWithdrawalConfiguration } from './VariablePercentWithdrawalConfiguration'
import { MonthlyFixedWithdrawalConfiguration } from './MonthlyFixedWithdrawalConfiguration'
import { DynamicWithdrawalConfiguration } from './DynamicWithdrawalConfiguration'
import { RMDWithdrawalConfiguration } from './RMDWithdrawalConfiguration'
import { KapitalerhaltConfiguration } from './KapitalerhaltConfiguration'
import { BucketStrategyConfigurationForm } from './BucketStrategyConfigurationForm'

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

export function SingleStrategyConfigSection({
  formValue,
  startOfIndependence,
  globalEndOfLife,
  withdrawalReturnMode,
  withdrawalAverageReturn,
  withdrawalStandardDeviation,
  withdrawalRandomSeed,
  withdrawalVariableReturns,
  withdrawalMultiAssetConfig,
  onConfigUpdate,
  onFormValueUpdate,
  onStrategyChange,
  onWithdrawalMultiAssetConfigChange,
  dispatchEnd,
}: SingleStrategyConfigParams) {
  return (
    <div>
      {/* Withdrawal Return Configuration */}
      <WithdrawalReturnModeConfiguration
        withdrawalReturnMode={withdrawalReturnMode}
        withdrawalAverageReturn={withdrawalAverageReturn}
        withdrawalStandardDeviation={withdrawalStandardDeviation}
        withdrawalRandomSeed={withdrawalRandomSeed}
        withdrawalVariableReturns={withdrawalVariableReturns}
        formValueRendite={formValue.rendite}
        startOfIndependence={startOfIndependence}
        globalEndOfLife={globalEndOfLife}
        withdrawalMultiAssetConfig={withdrawalMultiAssetConfig}
        onWithdrawalReturnModeChange={(mode) => {
          onConfigUpdate({ withdrawalReturnMode: mode })
        }}
        onWithdrawalAverageReturnChange={(value) => {
          onConfigUpdate({ withdrawalAverageReturn: value })
        }}
        onWithdrawalStandardDeviationChange={(value) => {
          onConfigUpdate({ withdrawalStandardDeviation: value })
        }}
        onWithdrawalRandomSeedChange={(value) => {
          onConfigUpdate({ withdrawalRandomSeed: value })
        }}
        onWithdrawalVariableReturnsChange={(returns) => {
          onConfigUpdate({ withdrawalVariableReturns: returns })
        }}
        onFormValueRenditeChange={(rendite) => {
          onFormValueUpdate({ ...formValue, rendite })
        }}
        onWithdrawalMultiAssetConfigChange={onWithdrawalMultiAssetConfigChange}
      />

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
      <StrategySpecificConfigs
        formValue={formValue}
        onFormValueUpdate={onFormValueUpdate}
      />
    </div>
  )
}

interface StrategySpecificConfigsProps {
  formValue: WithdrawalFormValue
  onFormValueUpdate: (updates: Partial<WithdrawalFormValue>) => void
}

function StrategySpecificConfigs({
  formValue,
  onFormValueUpdate,
}: StrategySpecificConfigsProps) {
  const strategy = formValue.strategie

  if (strategy === 'variabel_prozent') {
    return (
      <VariablePercentWithdrawalConfiguration
        variabelProzent={formValue.variabelProzent}
        onVariablePercentChange={(percent) => {
          onFormValueUpdate({ variabelProzent: percent })
        }}
      />
    )
  }

  if (strategy === 'monatlich_fest') {
    return (
      <MonthlyFixedWithdrawalConfiguration
        monatlicheBetrag={formValue.monatlicheBetrag}
        guardrailsAktiv={formValue.guardrailsAktiv}
        guardrailsSchwelle={formValue.guardrailsSchwelle}
        onMonthlyAmountChange={(amount) => {
          if (amount) onFormValueUpdate({ ...formValue, monatlicheBetrag: amount })
        }}
        onGuardrailsActiveChange={(checked) => {
          onFormValueUpdate({ ...formValue, guardrailsAktiv: checked })
        }}
        onGuardrailsThresholdChange={(threshold) => {
          onFormValueUpdate({ guardrailsSchwelle: threshold })
        }}
      />
    )
  }

  if (strategy === 'dynamisch') {
    return <DynamicWithdrawalConfiguration formValue={formValue} />
  }

  if (strategy === 'rmd') {
    return (
      <RMDWithdrawalConfiguration
        formValue={formValue}
        updateFormValue={onFormValueUpdate}
      />
    )
  }

  if (strategy === 'kapitalerhalt') {
    return (
      <KapitalerhaltConfiguration
        formValue={formValue}
        updateFormValue={onFormValueUpdate}
      />
    )
  }

  if (strategy === 'bucket_strategie') {
    return (
      <BucketStrategyConfigurationForm
        bucketConfig={formValue.bucketConfig}
        onBucketConfigChange={(config) => {
          onFormValueUpdate({ ...formValue, bucketConfig: config })
        }}
      />
    )
  }

  return null
}
