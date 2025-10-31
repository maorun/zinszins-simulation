import { useMemo } from 'react'
import type { SparplanElement } from '../utils/sparplan-utils'
import type { SegmentedComparisonStrategy, WithdrawalConfiguration } from '../utils/config-storage'
import { useSimulation } from '../contexts/useSimulation'
import type { StatutoryPensionConfig } from '../../helpers/statutory-pension'
import type { WithdrawalData } from './useWithdrawalCalculations.types'
import { calculateSegmentedStrategyResult } from './useWithdrawalCalculations.helpers'

function safelyCalculateSegmentedStrategy(
  strategy: SegmentedComparisonStrategy,
  elemente: SparplanElement[],
  steuerlast: number,
  startOfIndependence: number,
  endOfLife: number,
  planningMode: 'individual' | 'couple',
  effectiveStatutoryPensionConfig: StatutoryPensionConfig | null | undefined,
) {
  try {
    return calculateSegmentedStrategyResult(
      strategy,
      elemente,
      steuerlast,
      startOfIndependence,
      endOfLife,
      planningMode,
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

  return useMemo(() => {
    if (!useSegmentedComparisonMode || !withdrawalData) return []
    return (segmentedComparisonStrategies || []).map(strategy =>
      safelyCalculateSegmentedStrategy(
        strategy,
        elemente,
        steuerlast,
        startOfIndependence,
        endOfLife,
        planningMode || 'individual',
        effectiveStatutoryPensionConfig,
      ),
    )
  }, [
    useSegmentedComparisonMode,
    withdrawalData,
    segmentedComparisonStrategies,
    elemente,
    startOfIndependence,
    endOfLife,
    steuerlast,
    planningMode,
    effectiveStatutoryPensionConfig,
  ])
}
