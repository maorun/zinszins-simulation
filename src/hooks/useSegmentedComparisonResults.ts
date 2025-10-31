import { useMemo } from 'react'
import type { SparplanElement } from '../utils/sparplan-utils'
import {
  calculateSegmentedWithdrawal,
  calculateWithdrawalDuration,
  type WithdrawalResultElement,
} from '../../helpers/withdrawal'
import type { SegmentedWithdrawalConfig } from '../utils/segmented-withdrawal'
import type { SegmentedComparisonStrategy, WithdrawalConfiguration } from '../utils/config-storage'
import { useSimulation } from '../contexts/useSimulation'
import { createPlanningModeAwareFreibetragPerYear } from '../utils/freibetrag-calculation'
import type { CoupleStatutoryPensionConfig, StatutoryPensionConfig } from '../../helpers/statutory-pension'
import type { WithdrawalData } from './useWithdrawalCalculations.types'

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
    (sum, year: WithdrawalResultElement) => sum + year.entnahme,
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

export function useSegmentedComparisonResults(
  elemente: SparplanElement[],
  startOfIndependence: number,
  currentConfig: WithdrawalConfiguration,
  steuerlast: number,
  effectiveStatutoryPensionConfig: StatutoryPensionConfig | null | undefined,
  withdrawalData: WithdrawalData,
) {
  const { endOfLife, planningMode } = useSimulation()

  const { useSegmentedComparisonMode, segmentedComparisonStrategies } = currentConfig

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

  return segmentedComparisonResults
}
