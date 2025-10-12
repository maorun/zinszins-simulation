import { useMemo } from 'react'
import type { SparplanElement } from '../utils/sparplan-utils'
import {
  calculateWithdrawal,
  calculateSegmentedWithdrawal,
  getTotalCapitalAtYear,
  calculateWithdrawalDuration,
} from '../../helpers/withdrawal'
import type { SegmentedWithdrawalConfig } from '../utils/segmented-withdrawal'
import type { SegmentedComparisonStrategy, WithdrawalConfiguration } from '../utils/config-storage'
import { useSimulation } from '../contexts/useSimulation'
import { createPlanningModeAwareFreibetragPerYear } from '../utils/freibetrag-calculation'
import {
  convertCoupleToLegacyConfig,
  buildWithdrawalReturnConfig,
  buildGrundfreibetragPerYear,
  calculateComparisonStrategy,
} from './useWithdrawalCalculations.helpers'

/**
 * Custom hook for withdrawal calculations
 */
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

    let withdrawalResult

    if (useSegmentedWithdrawal) {
      // Use segmented withdrawal calculation
      const segmentedConfig: SegmentedWithdrawalConfig = {
        segments: withdrawalSegments,
        taxRate: 0.26375,
        freibetragPerYear: undefined, // Use default
        statutoryPensionConfig: effectiveStatutoryPensionConfig || undefined,
      }

      withdrawalResult = calculateSegmentedWithdrawal(
        elemente,
        segmentedConfig,
      )
    }
    else {
      // Use single-strategy withdrawal calculation (backward compatibility)
      // Build return configuration for withdrawal phase
      const withdrawalReturnConfig = buildWithdrawalReturnConfig({
        withdrawalReturnMode,
        withdrawalVariableReturns,
        withdrawalAverageReturn,
        withdrawalStandardDeviation,
        withdrawalRandomSeed,
        withdrawalMultiAssetConfig,
        formValueRendite: formValue.rendite,
      })

      // Calculate withdrawal projections
      const withdrawalCalculation = calculateWithdrawal({
        elements: elemente,
        startYear: startOfIndependence + 1, // Start withdrawals the year after accumulation ends
        endYear: endOfLife,
        strategy: formValue.strategie,
        withdrawalFrequency: formValue.withdrawalFrequency,
        returnConfig: withdrawalReturnConfig,
        taxRate: steuerlast,
        teilfreistellungsquote: teilfreistellungsquote,
        freibetragPerYear: undefined, // freibetragPerYear
        monthlyConfig:
          formValue.strategie === 'monatlich_fest'
            ? {
                monthlyAmount: formValue.monatlicheBetrag,
                enableGuardrails: formValue.guardrailsAktiv,
                guardrailsThreshold: formValue.guardrailsSchwelle / 100,
              }
            : undefined,
        customPercentage:
          formValue.strategie === 'variabel_prozent'
            ? formValue.variabelProzent / 100
            : undefined,
        dynamicConfig:
          formValue.strategie === 'dynamisch'
            ? {
                baseWithdrawalRate: formValue.dynamischBasisrate / 100,
                upperThresholdReturn: formValue.dynamischObereSchwell / 100,
                upperThresholdAdjustment:
                  formValue.dynamischObereAnpassung / 100,
                lowerThresholdReturn: formValue.dynamischUntereSchwell / 100,
                lowerThresholdAdjustment:
                  formValue.dynamischUntereAnpassung / 100,
              }
            : undefined,
        bucketConfig:
          formValue.strategie === 'bucket_strategie' && formValue.bucketConfig
            ? {
                initialCashCushion: formValue.bucketConfig.initialCashCushion,
                refillThreshold: formValue.bucketConfig.refillThreshold,
                refillPercentage: formValue.bucketConfig.refillPercentage,
                baseWithdrawalRate: formValue.bucketConfig.baseWithdrawalRate,
              }
            : undefined,
        rmdConfig:
          formValue.strategie === 'rmd'
            ? {
                startAge: formValue.rmdStartAge,
                lifeExpectancyTable: getEffectiveLifeExpectancyTable(), // Use gender-aware setting
                ...(customLifeExpectancy !== undefined && { customLifeExpectancy }),
              }
            : undefined,
        kapitalerhaltConfig:
          formValue.strategie === 'kapitalerhalt'
            ? {
                nominalReturn: formValue.kapitalerhaltNominalReturn / 100,
                inflationRate: formValue.kapitalerhaltInflationRate / 100,
              }
            : undefined,
        steueroptimierteEntnahmeConfig:
          formValue.strategie === 'steueroptimiert'
            ? {
                baseWithdrawalRate: formValue.steueroptimierteEntnahmeBaseWithdrawalRate,
                targetTaxRate: formValue.steueroptimierteEntnahmeTargetTaxRate,
                optimizationMode: formValue.steueroptimierteEntnahmeOptimizationMode,
                freibetragUtilizationTarget: formValue.steueroptimierteEntnahmeFreibetragUtilizationTarget,
                rebalanceFrequency: formValue.steueroptimierteEntnahmeRebalanceFrequency,
              }
            : undefined,
        enableGrundfreibetrag: grundfreibetragAktiv,
        grundfreibetragPerYear: grundfreibetragAktiv
          ? buildGrundfreibetragPerYear(startOfIndependence, endOfLife, grundfreibetragBetrag)
          : undefined,
        incomeTaxRate: grundfreibetragAktiv
          ? formValue.einkommensteuersatz / 100
          : (guenstigerPruefungAktiv ? personalTaxRate / 100 : undefined),
        inflationConfig: formValue.inflationAktiv
          ? { inflationRate: formValue.inflationsrate / 100 }
          : undefined,
        steuerReduzierenEndkapital: steuerReduzierenEndkapitalEntspharphase,
        statutoryPensionConfig: effectiveStatutoryPensionConfig || undefined,
        otherIncomeConfig,
        healthCareInsuranceConfig: formValue.healthCareInsuranceConfig ? {
          ...formValue.healthCareInsuranceConfig,
          // Ensure the insurance type is explicitly set from the form value
          insuranceType: formValue.healthCareInsuranceConfig.insuranceType || 'statutory',
        } : undefined,
        birthYear: birthYear, // Use birth year from global context
        // Günstigerprüfung settings
        guenstigerPruefungAktiv,
      })
      withdrawalResult = withdrawalCalculation.result
    }

    // Convert to array for table display, sorted by year descending
    const withdrawalArray = Object.entries(withdrawalResult)
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
        // Create segmented configuration for this comparison strategy
        const segmentedConfig: SegmentedWithdrawalConfig = {
          segments: strategy.segments,
          taxRate: steuerlast,
          freibetragPerYear: createPlanningModeAwareFreibetragPerYear(
            startOfIndependence + 1,
            endOfLife,
            planningMode || 'individual', // Use planningMode from global config, fallback to individual
          ),
          statutoryPensionConfig: effectiveStatutoryPensionConfig || undefined,
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
