import { useMemo } from 'react'
import type { SparplanElement } from '../utils/sparplan-utils'
import type { WithdrawalConfiguration } from '../utils/config-storage'
import { useSimulation } from '../contexts/useSimulation'
import { convertCoupleToLegacyConfig } from './useWithdrawalCalculations.helpers'
import { useWithdrawalData } from './useWithdrawalData'
import { useComparisonResults } from './useComparisonResults'
import { useSegmentedComparisonResults } from './useSegmentedComparisonResults'

/**
 * Helper to determine the effective life expectancy table based on planning mode and gender
 */
export function getEffectiveLifeExpectancyTable(
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
export function useWithdrawalCalculations(
  elemente: SparplanElement[],
  startOfIndependence: number,
  currentConfig: WithdrawalConfiguration,
  steuerlast: number,
  teilfreistellungsquote: number,
) {
  const {
    planningMode,
    // spouse - used indirectly in couple planning calculations
    statutoryPensionConfig,
    coupleStatutoryPensionConfig,
  } = useSimulation()
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

  const withdrawalData = useWithdrawalData(
    elemente,
    startOfIndependence,
    currentConfig,
    steuerlast,
    teilfreistellungsquote,
    effectiveStatutoryPensionConfig,
  )

  const comparisonResults = useComparisonResults(
    elemente,
    startOfIndependence,
    currentConfig,
    steuerlast,
    teilfreistellungsquote,
    effectiveStatutoryPensionConfig,
    withdrawalData,
  )

  const segmentedComparisonResults = useSegmentedComparisonResults(
    elemente,
    startOfIndependence,
    currentConfig,
    steuerlast,
    effectiveStatutoryPensionConfig,
    withdrawalData,
  )

  return { withdrawalData, comparisonResults, segmentedComparisonResults }
}
