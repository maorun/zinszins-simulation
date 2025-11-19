import { useMemo } from 'react'
import type { SparplanElement } from '../utils/sparplan-utils'
import type { StatutoryPensionConfig } from '../../helpers/statutory-pension'
import type { WithdrawalConfiguration, ComparisonStrategy } from '../utils/config-storage'
import { useSimulation } from '../contexts/useSimulation'
import { calculateComparisonStrategy } from './useWithdrawalCalculations.helpers'
import type { WithdrawalData, CalculateComparisonStrategyParams } from './useWithdrawalCalculations.types'
import { getEffectiveLifeExpectancyTable } from './useWithdrawalCalculations'

/**
 * Extract simulation context values needed for comparison calculations
 */
function useComparisonSimulationValues() {
  const {
    steuerReduzierenEndkapitalEntspharphase,
    grundfreibetragAktiv,
    grundfreibetragBetrag,
    endOfLife,
    lifeExpectancyTable,
    customLifeExpectancy,
    planningMode,
    gender,
    birthYear,
    guenstigerPruefungAktiv,
    personalTaxRate,
  } = useSimulation()

  return useMemo(() => ({
    steuerReduzierenEndkapitalEntspharphase,
    grundfreibetragAktiv,
    grundfreibetragBetrag,
    endOfLife,
    lifeExpectancyTable,
    customLifeExpectancy,
    planningMode,
    gender,
    birthYear,
    guenstigerPruefungAktiv,
    personalTaxRate,
  }), [
    steuerReduzierenEndkapitalEntspharphase,
    grundfreibetragAktiv,
    grundfreibetragBetrag,
    endOfLife,
    lifeExpectancyTable,
    customLifeExpectancy,
    planningMode,
    gender,
    birthYear,
    guenstigerPruefungAktiv,
    personalTaxRate,
  ])
}

/**
 * Build parameters for calculating a comparison strategy
 */
function buildComparisonStrategyParams(
  strategy: ComparisonStrategy,
  params: {
    elemente: SparplanElement[]
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
  },
): CalculateComparisonStrategyParams {
  return {
    strategy,
    elements: params.elemente,
    startOfIndependence: params.startOfIndependence,
    endOfLife: params.endOfLife,
    steuerlast: params.steuerlast,
    teilfreistellungsquote: params.teilfreistellungsquote,
    planningMode: params.planningMode,
    grundfreibetragAktiv: params.grundfreibetragAktiv,
    grundfreibetragBetrag: params.grundfreibetragBetrag,
    einkommensteuersatz: params.einkommensteuersatz,
    steuerReduzierenEndkapitalEntspharphase: params.steuerReduzierenEndkapitalEntspharphase,
    effectiveStatutoryPensionConfig: params.effectiveStatutoryPensionConfig,
    otherIncomeConfig: params.otherIncomeConfig,
    healthCareInsuranceConfig: params.healthCareInsuranceConfig,
    birthYear: params.birthYear,
    customLifeExpectancy: params.customLifeExpectancy,
    lifeExpectancyTable: params.lifeExpectancyTable,
    gender: params.gender,
    guenstigerPruefungAktiv: params.guenstigerPruefungAktiv,
    personalTaxRate: params.personalTaxRate,
    getEffectiveLifeExpectancyTable: () =>
      getEffectiveLifeExpectancyTable(params.lifeExpectancyTable, params.planningMode, params.gender),
  }
}

/**
 * Calculate comparison results for all strategies
 */
function calculateAllComparisonResults(
  strategies: ComparisonStrategy[],
  params: {
    elemente: SparplanElement[]
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
  },
) {
  return strategies.map(strategy => calculateComparisonStrategy(buildComparisonStrategyParams(strategy, params)))
}

/**
 * Build parameters object for comparison calculations from all input sources
 */
function buildComparisonParams(
  elemente: SparplanElement[],
  startOfIndependence: number,
  currentConfig: WithdrawalConfiguration,
  steuerlast: number,
  teilfreistellungsquote: number,
  effectiveStatutoryPensionConfig: StatutoryPensionConfig | null | undefined,
  simulationValues: ReturnType<typeof useComparisonSimulationValues>,
) {
  const { formValue, otherIncomeConfig } = currentConfig
  const {
    steuerReduzierenEndkapitalEntspharphase,
    grundfreibetragAktiv,
    grundfreibetragBetrag,
    endOfLife,
    lifeExpectancyTable,
    customLifeExpectancy,
    planningMode,
    gender,
    birthYear,
    guenstigerPruefungAktiv,
    personalTaxRate,
  } = simulationValues

  return {
    elemente,
    startOfIndependence,
    endOfLife,
    steuerlast,
    teilfreistellungsquote,
    planningMode: planningMode || 'individual',
    grundfreibetragAktiv,
    grundfreibetragBetrag,
    einkommensteuersatz: formValue.einkommensteuersatz,
    steuerReduzierenEndkapitalEntspharphase,
    effectiveStatutoryPensionConfig: effectiveStatutoryPensionConfig || null,
    otherIncomeConfig,
    healthCareInsuranceConfig: formValue.healthCareInsuranceConfig,
    birthYear,
    customLifeExpectancy,
    lifeExpectancyTable,
    gender,
    guenstigerPruefungAktiv,
    personalTaxRate,
  }
}

export function useComparisonResults(
  elemente: SparplanElement[],
  startOfIndependence: number,
  currentConfig: WithdrawalConfiguration,
  steuerlast: number,
  teilfreistellungsquote: number,
  effectiveStatutoryPensionConfig: StatutoryPensionConfig | null | undefined,
  withdrawalData: WithdrawalData,
) {
  const simulationValues = useComparisonSimulationValues()
  const { useComparisonMode, comparisonStrategies } = currentConfig

  const comparisonResults = useMemo(
    () => {
      if (!useComparisonMode || !withdrawalData) return []

      const params = buildComparisonParams(
        elemente,
        startOfIndependence,
        currentConfig,
        steuerlast,
        teilfreistellungsquote,
        effectiveStatutoryPensionConfig,
        simulationValues,
      )

      return calculateAllComparisonResults(comparisonStrategies, params)
    },
    // Individual properties tracked instead of the whole object for better memoization
    [
      useComparisonMode,
      withdrawalData,
      comparisonStrategies,
      elemente,
      startOfIndependence,
      currentConfig,
      steuerlast,
      teilfreistellungsquote,
      effectiveStatutoryPensionConfig,
      simulationValues,
    ],
  )

  return comparisonResults
}
