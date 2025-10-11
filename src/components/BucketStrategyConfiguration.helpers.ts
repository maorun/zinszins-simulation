import type { BucketSubStrategy } from '../../helpers/withdrawal'

export interface BucketStrategyFormValues {
  bucketConfig?: {
    initialCashCushion: number
    refillThreshold: number
    refillPercentage: number
    baseWithdrawalRate: number
    subStrategy?: BucketSubStrategy
    variabelProzent?: number
    monatlicheBetrag?: number
    dynamischBasisrate?: number
    dynamischObereSchwell?: number
    dynamischObereAnpassung?: number
    dynamischUntereSchwell?: number
    dynamischUntereAnpassung?: number
  }
}

export interface BucketStrategyConfigValues {
  initialCashCushion: number
  refillThreshold: number
  refillPercentage: number
  baseWithdrawalRate: number
  subStrategy: BucketSubStrategy
  variabelProzent: number
  monatlicheBetrag: number
  dynamischBasisrate: number
  dynamischObereSchwell: number
  dynamischObereAnpassung: number
  dynamischUntereSchwell: number
  dynamischUntereAnpassung: number
}

export interface BucketStrategyChangeHandlers {
  onInitialCashCushionChange: (value: number) => void
  onRefillThresholdChange: (value: number) => void
  onRefillPercentageChange: (value: number) => void
  onBaseWithdrawalRateChange: (value: number) => void
  onSubStrategyChange: (value: BucketSubStrategy) => void
  onVariabelProzentChange: (value: number) => void
  onMonatlicheBetragChange: (value: number) => void
  onDynamischBasisrateChange: (value: number) => void
  onDynamischObereSchwell: (value: number) => void
  onDynamischObereAnpassung: (value: number) => void
  onDynamischUntereSchwell: (value: number) => void
  onDynamischUntereAnpassung: (value: number) => void
}

const DEFAULT_VALUES: BucketStrategyConfigValues = {
  initialCashCushion: 20000,
  refillThreshold: 5000,
  refillPercentage: 0.5,
  baseWithdrawalRate: 0.04,
  subStrategy: '4prozent' as BucketSubStrategy,
  variabelProzent: 4,
  monatlicheBetrag: 2000,
  dynamischBasisrate: 4,
  dynamischObereSchwell: 8,
  dynamischObereAnpassung: 5,
  dynamischUntereSchwell: 2,
  dynamischUntereAnpassung: -5,
}

export function getDefaultValues(): BucketStrategyConfigValues {
  return { ...DEFAULT_VALUES }
}

export function getCurrentValuesFromForm(
  formValue: BucketStrategyFormValues,
): BucketStrategyConfigValues {
  const config = formValue.bucketConfig
  return {
    initialCashCushion: config?.initialCashCushion ?? DEFAULT_VALUES.initialCashCushion,
    refillThreshold: config?.refillThreshold ?? DEFAULT_VALUES.refillThreshold,
    refillPercentage: config?.refillPercentage ?? DEFAULT_VALUES.refillPercentage,
    baseWithdrawalRate: config?.baseWithdrawalRate ?? DEFAULT_VALUES.baseWithdrawalRate,
    subStrategy: config?.subStrategy ?? DEFAULT_VALUES.subStrategy,
    variabelProzent: config?.variabelProzent ?? DEFAULT_VALUES.variabelProzent,
    monatlicheBetrag: config?.monatlicheBetrag ?? DEFAULT_VALUES.monatlicheBetrag,
    dynamischBasisrate: config?.dynamischBasisrate ?? DEFAULT_VALUES.dynamischBasisrate,
    dynamischObereSchwell: config?.dynamischObereSchwell ?? DEFAULT_VALUES.dynamischObereSchwell,
    dynamischObereAnpassung: config?.dynamischObereAnpassung ?? DEFAULT_VALUES.dynamischObereAnpassung,
    dynamischUntereSchwell: config?.dynamischUntereSchwell ?? DEFAULT_VALUES.dynamischUntereSchwell,
    dynamischUntereAnpassung: config?.dynamischUntereAnpassung ?? DEFAULT_VALUES.dynamischUntereAnpassung,
  }
}

export function getCurrentValuesFromDirect(
  values: Partial<BucketStrategyConfigValues>,
): BucketStrategyConfigValues {
  return {
    ...DEFAULT_VALUES,
    ...values,
  }
}

export function createFormUpdateHandler(params: {
  formValue: BucketStrategyFormValues
  updateFormValue: (value: BucketStrategyFormValues) => void
  currentValues: BucketStrategyConfigValues
}) {
  return (updates: Partial<BucketStrategyConfigValues>) => {
    params.updateFormValue({
      ...params.formValue,
      bucketConfig: {
        ...params.currentValues,
        ...updates,
      },
    })
  }
}
