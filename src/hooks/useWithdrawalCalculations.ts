import { useMemo } from 'react'
import type { SparplanElement } from '../utils/sparplan-utils'
import {
  calculateSegmentedWithdrawal,
  getTotalCapitalAtYear,
  calculateWithdrawalDuration,
  type WithdrawalResult,
} from '../../helpers/withdrawal'
import type { SegmentedWithdrawalConfig } from '../utils/segmented-withdrawal'
import type { SegmentedComparisonStrategy, WithdrawalConfiguration } from '../utils/config-storage'
import { useSimulation } from '../contexts/useSimulation'
import { createPlanningModeAwareFreibetragPerYear } from '../utils/freibetrag-calculation'
import type { CoupleStatutoryPensionConfig, StatutoryPensionConfig } from '../../helpers/statutory-pension'
import {
  convertCoupleToLegacyConfig,
  calculateComparisonStrategy,
  buildSegmentedWithdrawalResult,
  buildSingleStrategyWithdrawalResult,
} from './useWithdrawalCalculations.helpers'

/**
 * Helper to determine the effective life expectancy table based on planning mode and gender
 */
function getEffectiveLifeExpectancyTable(
  lifeExpectancyTable: 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom',
  planningMode: 'individual' | 'couple',
  gender?: 'male' | 'female',
): 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom' {
  if (lifeExpectancyTable === 'custom') {
    return 'custom'
  }

  // For individual planning with gender selection, use gender-specific table
  if (planningMode === 'individual' && gender) {
    return gender === 'male' ? 'german_male_2020_22' : 'german_female_2020_22'
  }

  // For couple planning or when no gender is selected, use the selected table
  return lifeExpectancyTable
}

/**
 * Calculate segmented withdrawal for a single comparison strategy
 */
function calculateSegmentedStrategyResult(
  strategy: SegmentedComparisonStrategy,
  elemente: SparplanElement[],
  steuerlast: number,
  startOfIndependence: number,
  endOfLife: number,
  planningMode: 'individual' | 'couple',
  effectiveStatutoryPensionConfig: CoupleStatutoryPensionConfig | StatutoryPensionConfig | null | undefined,
) {
  // Create segmented configuration for this comparison strategy
  const segmentedConfig: SegmentedWithdrawalConfig = {
    segments: strategy.segments,
    taxRate: steuerlast,
    freibetragPerYear: createPlanningModeAwareFreibetragPerYear(
      startOfIndependence + 1,
      endOfLife,
      planningMode || 'individual',
    ),
    statutoryPensionConfig: (effectiveStatutoryPensionConfig as StatutoryPensionConfig) || undefined,
  }

  // Calculate segmented withdrawal for this comparison strategy
  const result = calculateSegmentedWithdrawal(
    elemente,
    segmentedConfig,
  )

  // Get final year capital and total withdrawal
  const finalYear = Math.max(...Object.keys(result).map(Number))
  const finalCapital = result[finalYear]?.endkapital || 0

  // Calculate total withdrawal
  const totalWithdrawal = Object.values(result).reduce(
    (sum, year) => sum + year.entnahme,
    0,
  )
  const totalYears = Object.keys(result).length
  const averageAnnualWithdrawal = totalWithdrawal / totalYears

  // Calculate withdrawal duration
  const duration = calculateWithdrawalDuration(
    result,
    startOfIndependence + 1,
  )

  return {
    strategy,
    finalCapital,
    totalWithdrawal,
    averageAnnualWithdrawal,
    duration: duration ? duration : 'unbegrenzt',
    result, // Include full result for detailed analysis
  }
}
export function useWithdrawalCalculations(
  elemente: SparplanElement[],
  startOfIndependence: number,
  currentConfig: WithdrawalConfiguration,
  steuerlast: number,
  teilfreistellungsquote: number,
) {
  const {
    steuerReduzierenEndkapitalEntspharphase,
    grundfreibetragAktiv,
    grundfreibetragBetrag,
    endOfLife,
    lifeExpectancyTable,
    customLifeExpectancy,
    planningMode,
    gender,
    // spouse - used indirectly in couple planning calculations
    statutoryPensionConfig,
    coupleStatutoryPensionConfig,
    birthYear,
    // Günstigerprüfung settings
    guenstigerPruefungAktiv,
    personalTaxRate,
    // Multi-asset portfolio configuration for withdrawal phase
    withdrawalMultiAssetConfig,
  } = useSimulation()

  const {
    formValue,
    withdrawalReturnMode,
    withdrawalVariableReturns,
    withdrawalAverageReturn,
    withdrawalStandardDeviation,
    withdrawalRandomSeed,
    useSegmentedWithdrawal,
    withdrawalSegments,
    useComparisonMode,
    comparisonStrategies,
    useSegmentedComparisonMode,
    segmentedComparisonStrategies,
    otherIncomeConfig,
  } = currentConfig

  // Convert couple statutory pension config to legacy format for withdrawal calculations
  const effectiveStatutoryPensionConfig = useMemo(() => {
    // Prefer couple config if available, fallback to legacy config
    return coupleStatutoryPensionConfig
      ? convertCoupleToLegacyConfig({
          coupleConfig: coupleStatutoryPensionConfig,
          planningMode,
        })
      : statutoryPensionConfig
  }, [coupleStatutoryPensionConfig, statutoryPensionConfig, planningMode])

  // Calculate withdrawal projections
  const withdrawalData = useMemo(() => {
    if (!elemente || elemente.length === 0) {
      return null
    }

    const startingCapital = getTotalCapitalAtYear(
      elemente,
      startOfIndependence,
    )
    if (startingCapital <= 0) {
      return null
    }

    const effectiveTable = getEffectiveLifeExpectancyTable(lifeExpectancyTable, planningMode, gender)

    let withdrawalResult

    if (useSegmentedWithdrawal) {
      withdrawalResult = buildSegmentedWithdrawalResult({
        elemente,
        withdrawalSegments,
        effectiveStatutoryPensionConfig,
      })
    }
    else {
      withdrawalResult = buildSingleStrategyWithdrawalResult({
        elemente,
        startOfIndependence,
        endOfLife,
        formValue,
        withdrawalReturnMode,
        withdrawalVariableReturns,
        withdrawalAverageReturn,
        withdrawalStandardDeviation,
        withdrawalRandomSeed,
        withdrawalMultiAssetConfig,
        steuerlast,
        teilfreistellungsquote,
        grundfreibetragAktiv,
        grundfreibetragBetrag,
        guenstigerPruefungAktiv,
        personalTaxRate,
        steuerReduzierenEndkapitalEntspharphase,
        effectiveStatutoryPensionConfig,
        otherIncomeConfig,
        birthYear: birthYear || 1990,
        getEffectiveLifeExpectancyTable: () => effectiveTable,
        customLifeExpectancy,
      })
    }

    // Convert to array for table display, sorted by year descending
    const withdrawalArray = Object.entries(withdrawalResult as WithdrawalResult)
      .map(([year, data]) => ({
        year: parseInt(year),
        ...data,
      }))
      .sort((a, b) => b.year - a.year)

    // Calculate withdrawal duration
    const duration = calculateWithdrawalDuration(
      withdrawalResult,
      startOfIndependence + 1,
    )

    return {
      startingCapital,
      withdrawalArray,
      withdrawalResult,
      duration,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Using individual formValue properties
  }, [
    elemente,
    startOfIndependence,
    endOfLife,
    formValue.strategie,
    formValue.withdrawalFrequency,
    formValue.rendite,
    formValue.inflationAktiv,
    formValue.inflationsrate,
    formValue.monatlicheBetrag,
    formValue.guardrailsAktiv,
    formValue.guardrailsSchwelle,
    formValue.variabelProzent,
    formValue.dynamischBasisrate,
    formValue.dynamischObereSchwell,
    formValue.dynamischObereAnpassung,
    formValue.dynamischUntereSchwell,
    formValue.dynamischUntereAnpassung,
    formValue.bucketConfig,
    formValue.rmdStartAge,
    effectiveStatutoryPensionConfig, // Use effective statutory pension config
    birthYear, // Use global birth year
    lifeExpectancyTable, // Use global setting
    customLifeExpectancy, // Use global setting
    formValue.kapitalerhaltNominalReturn,
    formValue.kapitalerhaltInflationRate,
    formValue.steueroptimierteEntnahmeBaseWithdrawalRate,
    formValue.steueroptimierteEntnahmeTargetTaxRate,
    formValue.steueroptimierteEntnahmeOptimizationMode,
    formValue.steueroptimierteEntnahmeFreibetragUtilizationTarget,
    formValue.steueroptimierteEntnahmeRebalanceFrequency,
    grundfreibetragAktiv,
    grundfreibetragBetrag,
    formValue.einkommensteuersatz,
    withdrawalReturnMode,
    withdrawalVariableReturns,
    withdrawalAverageReturn,
    withdrawalStandardDeviation,
    withdrawalRandomSeed,
    withdrawalMultiAssetConfig,
    useSegmentedWithdrawal,
    withdrawalSegments,
    steuerlast,
    teilfreistellungsquote,
    steuerReduzierenEndkapitalEntspharphase,
    planningMode,
    gender,
    otherIncomeConfig,
    formValue.healthCareInsuranceConfig,
    guenstigerPruefungAktiv,
    personalTaxRate,
  ])

  // Calculate comparison results for each strategy
  const comparisonResults = useMemo(() => {
    // Helper function to determine the effective life expectancy table based on planning mode and gender
    const getEffectiveLifeExpectancyTable = (): 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom' => {
      if (lifeExpectancyTable === 'custom') {
        return 'custom'
      }

      // For individual planning with gender selection, use gender-specific table
      if (planningMode === 'individual' && gender) {
        return gender === 'male' ? 'german_male_2020_22' : 'german_female_2020_22'
      }

      // For couple planning or when no gender is selected, use the selected table
      return lifeExpectancyTable
    }

    if (!useComparisonMode || !withdrawalData) {
      return []
    }

    const results = comparisonStrategies.map(strategy =>
      calculateComparisonStrategy({
        strategy,
        elements: elemente,
        startOfIndependence,
        endOfLife,
        steuerlast,
        teilfreistellungsquote,
        planningMode: planningMode || 'individual',
        grundfreibetragAktiv,
        grundfreibetragBetrag,
        einkommensteuersatz: formValue.einkommensteuersatz,
        steuerReduzierenEndkapitalEntspharphase,
        effectiveStatutoryPensionConfig,
        otherIncomeConfig,
        healthCareInsuranceConfig: formValue.healthCareInsuranceConfig,
        birthYear,
        customLifeExpectancy,
        lifeExpectancyTable,
        gender,
        guenstigerPruefungAktiv,
        personalTaxRate,
        getEffectiveLifeExpectancyTable,
      }),
    )

    return results
  }, [
    useComparisonMode,
    withdrawalData,
    comparisonStrategies,
    elemente,
    startOfIndependence,
    endOfLife,
    steuerlast,
    teilfreistellungsquote,
    grundfreibetragAktiv,
    grundfreibetragBetrag,
    formValue.einkommensteuersatz,
    effectiveStatutoryPensionConfig, // Use effective statutory pension config
    birthYear, // Use global birth year
    customLifeExpectancy,
    lifeExpectancyTable,
    steuerReduzierenEndkapitalEntspharphase,
    planningMode,
    gender,
    otherIncomeConfig,
    formValue.healthCareInsuranceConfig,
    guenstigerPruefungAktiv,
    personalTaxRate,
  ])

  // Calculate segmented comparison results for each segmented strategy
  const segmentedComparisonResults = useMemo(() => {
    if (!useSegmentedComparisonMode || !withdrawalData) {
      return []
    }

    const results = (segmentedComparisonStrategies || []).map((strategy: SegmentedComparisonStrategy) => {
      try {
        return calculateSegmentedStrategyResult(
          strategy,
          elemente,
          steuerlast,
          startOfIndependence,
          endOfLife,
          planningMode || 'individual',
          effectiveStatutoryPensionConfig,
        )
      }
      catch (error) {
        console.error(
          `Error calculating segmented withdrawal for strategy ${strategy.name}:`,
          error,
        )
        return {
          strategy,
          finalCapital: 0,
          totalWithdrawal: 0,
          averageAnnualWithdrawal: 0,
          duration: 'Fehler',
          result: {},
        }
      }
    })

    return results
  }, [
    useSegmentedComparisonMode,
    withdrawalData,
    segmentedComparisonStrategies,
    elemente,
    startOfIndependence,
    endOfLife,
    steuerlast,
    planningMode, // Add planningMode dependency for freibetrag calculation
    effectiveStatutoryPensionConfig, // Use effective statutory pension config
  ])

  return {
    withdrawalData,
    comparisonResults,
    segmentedComparisonResults,
  }
}
