import { useMemo } from 'react'
import type { SparplanElement } from '../utils/sparplan-utils'
import {
  getTotalCapitalAtYear,
  calculateWithdrawalDuration,
  type WithdrawalResult,
} from '../../helpers/withdrawal'
import type { WithdrawalConfiguration } from '../utils/config-storage'
import { useSimulation } from '../contexts/useSimulation'
import type { StatutoryPensionConfig } from '../../helpers/statutory-pension'
import type { MultiAssetPortfolioConfig } from '../../helpers/multi-asset-portfolio'
import {
  buildSegmentedWithdrawalResult,
  buildSingleStrategyWithdrawalResult,
} from './useWithdrawalCalculations.helpers'
import { getEffectiveLifeExpectancyTable } from './useWithdrawalCalculations'

/**
 * Calculate starting capital and return null if invalid
 */
function getStartingCapital(
  elemente: SparplanElement[],
  startOfIndependence: number,
): number | null {
  if (!elemente || elemente.length === 0) {
    return null
  }

  const startingCapital = getTotalCapitalAtYear(elemente, startOfIndependence)
  if (startingCapital <= 0) {
    return null
  }

  return startingCapital
}

/**
 * Convert withdrawal result to sorted array for display
 */
function convertWithdrawalResultToArray(withdrawalResult: WithdrawalResult) {
  return Object.entries(withdrawalResult)
    .map(([year, data]) => ({
      year: parseInt(year),
      ...data,
    }))
    .sort((a, b) => b.year - a.year)
}

/**
 * Parameters for building withdrawal result
 */
type BuildWithdrawalResultParams = {
  useSegmentedWithdrawal: boolean
  elemente: SparplanElement[]
  withdrawalSegments: WithdrawalConfiguration['withdrawalSegments']
  effectiveStatutoryPensionConfig: StatutoryPensionConfig | null | undefined
  startOfIndependence: number
  endOfLife: number
  formValue: WithdrawalConfiguration['formValue']
  withdrawalReturnMode: WithdrawalConfiguration['withdrawalReturnMode']
  withdrawalVariableReturns: WithdrawalConfiguration['withdrawalVariableReturns']
  withdrawalAverageReturn: number
  withdrawalStandardDeviation: number
  withdrawalRandomSeed: number | undefined
  withdrawalMultiAssetConfig: MultiAssetPortfolioConfig | undefined
  steuerlast: number
  teilfreistellungsquote: number
  grundfreibetragAktiv: boolean
  grundfreibetragBetrag: number
  guenstigerPruefungAktiv: boolean
  personalTaxRate: number
  steuerReduzierenEndkapitalEntspharphase: boolean
  otherIncomeConfig: WithdrawalConfiguration['otherIncomeConfig']
  birthYear: number
  effectiveTable: 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom'
  customLifeExpectancy: number | undefined
}

/**
 * Compute withdrawal data from result
 */
function computeWithdrawalData(
  withdrawalResult: WithdrawalResult,
  startingCapital: number,
  startOfIndependence: number,
) {
  const withdrawalArray = convertWithdrawalResultToArray(withdrawalResult)
  const duration = calculateWithdrawalDuration(withdrawalResult, startOfIndependence + 1)

  return {
    startingCapital,
    withdrawalArray,
    withdrawalResult,
    duration,
  }
}

/**
 * Build withdrawal result based on configuration
 */
function buildWithdrawalResult(params: BuildWithdrawalResultParams): WithdrawalResult {
  if (params.useSegmentedWithdrawal) {
    return buildSegmentedWithdrawalResult({
      elemente: params.elemente,
      withdrawalSegments: params.withdrawalSegments,
      effectiveStatutoryPensionConfig: params.effectiveStatutoryPensionConfig,
    })
  }

  return buildSingleStrategyWithdrawalResult({
    elemente: params.elemente,
    startOfIndependence: params.startOfIndependence,
    endOfLife: params.endOfLife,
    formValue: params.formValue,
    withdrawalReturnMode: params.withdrawalReturnMode,
    withdrawalVariableReturns: params.withdrawalVariableReturns,
    withdrawalAverageReturn: params.withdrawalAverageReturn,
    withdrawalStandardDeviation: params.withdrawalStandardDeviation,
    withdrawalRandomSeed: params.withdrawalRandomSeed,
    withdrawalMultiAssetConfig: params.withdrawalMultiAssetConfig,
    steuerlast: params.steuerlast,
    teilfreistellungsquote: params.teilfreistellungsquote,
    grundfreibetragAktiv: params.grundfreibetragAktiv,
    grundfreibetragBetrag: params.grundfreibetragBetrag,
    guenstigerPruefungAktiv: params.guenstigerPruefungAktiv,
    personalTaxRate: params.personalTaxRate,
    steuerReduzierenEndkapitalEntspharphase: params.steuerReduzierenEndkapitalEntspharphase,
    effectiveStatutoryPensionConfig: params.effectiveStatutoryPensionConfig,
    otherIncomeConfig: params.otherIncomeConfig,
    birthYear: params.birthYear,
    getEffectiveLifeExpectancyTable: () => params.effectiveTable,
    customLifeExpectancy: params.customLifeExpectancy,
  })
}

/**
 * Hook to prepare withdrawal calculation parameters from simulation context
 */
function useWithdrawalCalculationParams(
  elemente: SparplanElement[],
  startOfIndependence: number,
  currentConfig: WithdrawalConfiguration,
  steuerlast: number,
  teilfreistellungsquote: number,
  effectiveStatutoryPensionConfig: StatutoryPensionConfig | null | undefined,
) {
  const simulationContext = useSimulation()
  return {
    elemente,
    startOfIndependence,
    effectiveStatutoryPensionConfig,
    steuerlast,
    teilfreistellungsquote,
    steuerReduzierenEndkapitalEntspharphase: simulationContext.steuerReduzierenEndkapitalEntspharphase,
    grundfreibetragAktiv: simulationContext.grundfreibetragAktiv,
    grundfreibetragBetrag: simulationContext.grundfreibetragBetrag,
    endOfLife: simulationContext.endOfLife,
    lifeExpectancyTable: simulationContext.lifeExpectancyTable,
    customLifeExpectancy: simulationContext.customLifeExpectancy,
    planningMode: simulationContext.planningMode,
    gender: simulationContext.gender,
    birthYear: simulationContext.birthYear,
    guenstigerPruefungAktiv: simulationContext.guenstigerPruefungAktiv,
    personalTaxRate: simulationContext.personalTaxRate,
    withdrawalMultiAssetConfig: simulationContext.withdrawalMultiAssetConfig,
    formValue: currentConfig.formValue,
    withdrawalReturnMode: currentConfig.withdrawalReturnMode,
    withdrawalVariableReturns: currentConfig.withdrawalVariableReturns,
    withdrawalAverageReturn: currentConfig.withdrawalAverageReturn,
    withdrawalStandardDeviation: currentConfig.withdrawalStandardDeviation,
    withdrawalRandomSeed: currentConfig.withdrawalRandomSeed,
    useSegmentedWithdrawal: currentConfig.useSegmentedWithdrawal,
    withdrawalSegments: currentConfig.withdrawalSegments,
    otherIncomeConfig: currentConfig.otherIncomeConfig,
  }
}

/**
 * Build parameters for withdrawal result calculation
 */
function buildWithdrawalResultParams(
  params: ReturnType<typeof useWithdrawalCalculationParams>,
  effectiveTable: 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom',
): BuildWithdrawalResultParams {
  return {
    useSegmentedWithdrawal: params.useSegmentedWithdrawal,
    elemente: params.elemente,
    withdrawalSegments: params.withdrawalSegments,
    effectiveStatutoryPensionConfig: params.effectiveStatutoryPensionConfig,
    startOfIndependence: params.startOfIndependence,
    endOfLife: params.endOfLife,
    formValue: params.formValue,
    withdrawalReturnMode: params.withdrawalReturnMode,
    withdrawalVariableReturns: params.withdrawalVariableReturns,
    withdrawalAverageReturn: params.withdrawalAverageReturn,
    withdrawalStandardDeviation: params.withdrawalStandardDeviation,
    withdrawalRandomSeed: params.withdrawalRandomSeed,
    withdrawalMultiAssetConfig: params.withdrawalMultiAssetConfig,
    steuerlast: params.steuerlast,
    teilfreistellungsquote: params.teilfreistellungsquote,
    grundfreibetragAktiv: params.grundfreibetragAktiv,
    grundfreibetragBetrag: params.grundfreibetragBetrag,
    guenstigerPruefungAktiv: params.guenstigerPruefungAktiv,
    personalTaxRate: params.personalTaxRate,
    steuerReduzierenEndkapitalEntspharphase: params.steuerReduzierenEndkapitalEntspharphase,
    otherIncomeConfig: params.otherIncomeConfig,
    birthYear: params.birthYear || 1990,
    effectiveTable,
    customLifeExpectancy: params.customLifeExpectancy,
  }
}

export function useWithdrawalData(
  elemente: SparplanElement[],
  startOfIndependence: number,
  currentConfig: WithdrawalConfiguration,
  steuerlast: number,
  teilfreistellungsquote: number,
  effectiveStatutoryPensionConfig: StatutoryPensionConfig | null | undefined,
) {
  const params = useWithdrawalCalculationParams(
    elemente,
    startOfIndependence,
    currentConfig,
    steuerlast,
    teilfreistellungsquote,
    effectiveStatutoryPensionConfig,
  )

  const withdrawalData = useMemo(() => {
    const startingCapital = getStartingCapital(params.elemente, params.startOfIndependence)
    if (startingCapital === null) {
      return null
    }

    const effectiveTable = getEffectiveLifeExpectancyTable(
      params.lifeExpectancyTable,
      params.planningMode,
      params.gender,
    )

    const withdrawalResultParams = buildWithdrawalResultParams(params, effectiveTable)
    const withdrawalResult = buildWithdrawalResult(withdrawalResultParams)

    return computeWithdrawalData(
      withdrawalResult,
      startingCapital,
      params.startOfIndependence,
    )
  }, [params])

  return withdrawalData
}
