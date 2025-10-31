import { useMemo } from 'react'
import type { SparplanElement } from '../utils/sparplan-utils'
import type { StatutoryPensionConfig } from '../../helpers/statutory-pension'
import type { WithdrawalConfiguration } from '../utils/config-storage'
import { useSimulation } from '../contexts/useSimulation'
import { calculateComparisonStrategy } from './useWithdrawalCalculations.helpers'
import type { WithdrawalData } from './useWithdrawalCalculations.types'
import { getEffectiveLifeExpectancyTable } from './useWithdrawalCalculations'

// eslint-disable-next-line max-lines-per-function
export function useComparisonResults(
  elemente: SparplanElement[],
  startOfIndependence: number,
  currentConfig: WithdrawalConfiguration,
  steuerlast: number,
  teilfreistellungsquote: number,
  effectiveStatutoryPensionConfig: StatutoryPensionConfig | null | undefined,
  withdrawalData: WithdrawalData,
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
  } = useSimulation()

  const {
    formValue,
    useComparisonMode,
    comparisonStrategies,
    otherIncomeConfig,
  } = currentConfig

  const comparisonResults = useMemo(() => {
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
        effectiveStatutoryPensionConfig: effectiveStatutoryPensionConfig || null,
        otherIncomeConfig,
        healthCareInsuranceConfig: formValue.healthCareInsuranceConfig,
        birthYear,
        customLifeExpectancy,
        lifeExpectancyTable,
        gender,
        guenstigerPruefungAktiv,
        personalTaxRate,
        getEffectiveLifeExpectancyTable: () => getEffectiveLifeExpectancyTable(lifeExpectancyTable, planningMode || 'individual', gender),
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

  return comparisonResults
}
