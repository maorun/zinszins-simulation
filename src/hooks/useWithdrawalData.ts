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
import {
  buildSegmentedWithdrawalResult,
  buildSingleStrategyWithdrawalResult,
} from './useWithdrawalCalculations.helpers'
import { getEffectiveLifeExpectancyTable } from './useWithdrawalCalculations'

// eslint-disable-next-line max-lines-per-function -- Hook is complex, further splitting harms readability.
export function useWithdrawalData(
  elemente: SparplanElement[],
  startOfIndependence: number,
  currentConfig: WithdrawalConfiguration,
  steuerlast: number,
  teilfreistellungsquote: number,
  effectiveStatutoryPensionConfig: StatutoryPensionConfig | null | undefined,
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
    birthYear,
    guenstigerPruefungAktiv,
    personalTaxRate,
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
    otherIncomeConfig,
  } = currentConfig

  // eslint-disable-next-line max-lines-per-function -- Calculation logic is complex and self-contained.
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
  }, [
    elemente,
    startOfIndependence,
    endOfLife,
    formValue,
    effectiveStatutoryPensionConfig,
    birthYear,
    lifeExpectancyTable,
    customLifeExpectancy,
    grundfreibetragAktiv,
    grundfreibetragBetrag,
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
    guenstigerPruefungAktiv,
    personalTaxRate,
  ])

  return withdrawalData
}
