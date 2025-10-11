import type { WithdrawalSegment } from '../utils/segmented-withdrawal'
import type {
  WithdrawalStrategy,
  BucketSubStrategy,
  RMDConfig,
} from '../../helpers/withdrawal'

interface StrategyInitParams {
  strategy: WithdrawalStrategy
  currentSegment: WithdrawalSegment
}

interface StrategyDefaultsResult {
  monthlyConfig?: {
    monthlyAmount: number
    enableGuardrails: boolean
    guardrailsThreshold: number
  }
  customPercentage?: number
  dynamicConfig?: {
    baseWithdrawalRate: number
    upperThresholdReturn: number
    upperThresholdAdjustment: number
    lowerThresholdReturn: number
    lowerThresholdAdjustment: number
  }
  bucketConfig?: {
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
  rmdConfig?: RMDConfig
}

export function getStrategyDefaults(params: StrategyInitParams): StrategyDefaultsResult {
  const { strategy, currentSegment } = params
  const defaults: StrategyDefaultsResult = {}

  if (strategy === 'monatlich_fest' && !currentSegment.monthlyConfig) {
    defaults.monthlyConfig = {
      monthlyAmount: 2000,
      enableGuardrails: false,
      guardrailsThreshold: 0.10,
    }
  }

  if (strategy === 'variabel_prozent' && currentSegment.customPercentage === undefined) {
    defaults.customPercentage = 0.05
  }

  if (strategy === 'dynamisch' && !currentSegment.dynamicConfig) {
    defaults.dynamicConfig = {
      baseWithdrawalRate: 0.04,
      upperThresholdReturn: 0.08,
      upperThresholdAdjustment: 0.05,
      lowerThresholdReturn: 0.02,
      lowerThresholdAdjustment: -0.05,
    }
  }

  if (strategy === 'bucket_strategie' && !currentSegment.bucketConfig) {
    defaults.bucketConfig = {
      initialCashCushion: 20000,
      refillThreshold: 5000,
      refillPercentage: 0.5,
      baseWithdrawalRate: 0.04,
      subStrategy: '4prozent',
      variabelProzent: 4,
      monatlicheBetrag: 2000,
      dynamischBasisrate: 4,
      dynamischObereSchwell: 8,
      dynamischObereAnpassung: 5,
      dynamischUntereSchwell: 2,
      dynamischUntereAnpassung: -5,
    }
  }

  if (strategy === 'rmd' && !currentSegment.rmdConfig) {
    defaults.rmdConfig = {
      startAge: 65,
      lifeExpectancyTable: 'german_2020_22',
      customLifeExpectancy: undefined,
    }
  }

  return defaults
}
