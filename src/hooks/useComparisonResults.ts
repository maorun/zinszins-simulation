import { useMemo } from 'react'
import type { SparplanElement } from '../utils/sparplan-utils'
import type { StatutoryPensionConfig } from '../../helpers/statutory-pension'
import type { WithdrawalConfiguration, ComparisonStrategy } from '../utils/config-storage'
import { useSimulation } from '../contexts/useSimulation'
import { calculateComparisonStrategy } from './useWithdrawalCalculations.helpers'
import type { WithdrawalData, CalculateComparisonStrategyParams } from './useWithdrawalCalculations.types'
import { getEffectiveLifeExpectancyTable } from './useWithdrawalCalculations'

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
  return strategies.map(strategy =>
    calculateComparisonStrategy(buildComparisonStrategyParams(strategy, params)),
  )
}

/**
 * Build calculation parameters object from hook inputs
 */
function buildCalculationParams(
  elemente: SparplanElement[],
  startOfIndependence: number,
  steuerlast: number,
  teilfreistellungsquote: number,
  effectiveStatutoryPensionConfig: StatutoryPensionConfig | null | undefined,
  currentConfig: WithdrawalConfiguration,
  simulationContext: ReturnType<typeof useSimulation>,
) {
  return {
    elemente,
    startOfIndependence,
    endOfLife: simulationContext.endOfLife,
    steuerlast,
    teilfreistellungsquote,
    planningMode: simulationContext.planningMode || 'individual' as const,
    grundfreibetragAktiv: simulationContext.grundfreibetragAktiv,
    grundfreibetragBetrag: simulationContext.grundfreibetragBetrag,
    einkommensteuersatz: currentConfig.formValue.einkommensteuersatz,
    steuerReduzierenEndkapitalEntspharphase: simulationContext.steuerReduzierenEndkapitalEntspharphase,
    effectiveStatutoryPensionConfig: effectiveStatutoryPensionConfig || null,
    otherIncomeConfig: currentConfig.otherIncomeConfig,
    healthCareInsuranceConfig: currentConfig.formValue.healthCareInsuranceConfig,
    birthYear: simulationContext.birthYear,
    customLifeExpectancy: simulationContext.customLifeExpectancy,
    lifeExpectancyTable: simulationContext.lifeExpectancyTable,
    gender: simulationContext.gender,
    guenstigerPruefungAktiv: simulationContext.guenstigerPruefungAktiv,
    personalTaxRate: simulationContext.personalTaxRate,
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
  const simulationContext = useSimulation()
  const { useComparisonMode, comparisonStrategies } = currentConfig

  const comparisonResults = useMemo(() => {
    if (!useComparisonMode || !withdrawalData) {
      return []
    }

    const params = buildCalculationParams(
      elemente,
      startOfIndependence,
      steuerlast,
      teilfreistellungsquote,
      effectiveStatutoryPensionConfig,
      currentConfig,
      simulationContext,
    )

    return calculateAllComparisonResults(comparisonStrategies, params)
  }, [
    useComparisonMode,
    withdrawalData,
    comparisonStrategies,
    elemente,
    startOfIndependence,
    steuerlast,
    teilfreistellungsquote,
    effectiveStatutoryPensionConfig,
    currentConfig,
    simulationContext,
  ])

  return comparisonResults
}
