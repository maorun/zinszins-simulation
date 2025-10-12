/**
 * Type definitions for useWithdrawalCalculations hook
 */

import type { WithdrawalConfiguration } from '../utils/config-storage'
import type { CoupleStatutoryPensionConfig, StatutoryPensionConfig } from '../../helpers/statutory-pension'

/**
 * Parameters for converting couple statutory pension config to legacy format
 */
export interface ConvertCoupleToLegacyConfigParams {
  coupleConfig: CoupleStatutoryPensionConfig
  planningMode: 'individual' | 'couple'
}

/**
 * Parameters for building return configuration for withdrawal phase
 */
export interface BuildWithdrawalReturnConfigParams {
  withdrawalReturnMode: WithdrawalConfiguration['withdrawalReturnMode']
  withdrawalVariableReturns: WithdrawalConfiguration['withdrawalVariableReturns']
  withdrawalAverageReturn: number
  withdrawalStandardDeviation: number
  withdrawalRandomSeed?: number
  withdrawalMultiAssetConfig: WithdrawalConfiguration['withdrawalMultiAssetConfig']
  formValueRendite: number
}

/**
 * Parameters for calculating a single comparison strategy
 */
export interface CalculateComparisonStrategyParams {
  strategy: WithdrawalConfiguration['comparisonStrategies'][0]
  elements: Array<import('../utils/sparplan-utils').SparplanElement>
  startOfIndependence: number
  endOfLife: number
  steuerlast: number
  teilfreistellungsquote: number
  planningMode: 'individual' | 'couple'
  grundfreibetragAktiv: boolean
  grundfreibetragBetrag: number
  einkommensteuersatz: number
  steuerReduzierenEndkapitalEntspharphase: boolean
  effectiveStatutoryPensionConfig: StatutoryPensionConfig | null
  otherIncomeConfig: WithdrawalConfiguration['otherIncomeConfig']
  healthCareInsuranceConfig: WithdrawalConfiguration['formValue']['healthCareInsuranceConfig']
  birthYear: number | undefined
  customLifeExpectancy: number | undefined
  lifeExpectancyTable: 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom'
  gender?: 'male' | 'female'
  guenstigerPruefungAktiv: boolean
  personalTaxRate: number
  getEffectiveLifeExpectancyTable: () => 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom'
}

/**
 * Result from calculating a single comparison strategy
 */
export interface ComparisonStrategyResult {
  strategy: WithdrawalConfiguration['comparisonStrategies'][0]
  finalCapital: number
  totalWithdrawal: number
  averageAnnualWithdrawal: number
  duration: number | 'unbegrenzt' | 'Fehler'
}

/**
 * Parameters for calculating a segmented comparison strategy
 */
export interface CalculateSegmentedComparisonParams {
  strategy: WithdrawalConfiguration['segmentedComparisonStrategies'][0]
  elements: Array<import('../utils/sparplan-utils').SparplanElement>
  startOfIndependence: number
  endOfLife: number
  steuerlast: number
  planningMode: 'individual' | 'couple'
  effectiveStatutoryPensionConfig: StatutoryPensionConfig | null
}

/**
 * Result from calculating a segmented comparison strategy
 */
export interface SegmentedComparisonResult {
  strategy: WithdrawalConfiguration['segmentedComparisonStrategies'][0]
  finalCapital: number
  totalWithdrawal: number
  averageAnnualWithdrawal: number
  duration: number | 'unbegrenzt' | 'Fehler'
  result: Record<number, unknown>
}
