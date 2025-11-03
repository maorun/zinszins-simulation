import type { WithdrawalFormValue } from '../utils/config-storage'
import { useStatutoryRatesHandlers } from './useStatutoryRatesHandlers'
import { useStatutoryIncomeBaseHandlers } from './useStatutoryIncomeBaseHandlers'

/**
 * Custom hook for statutory health insurance configuration handlers
 * Composes rate and income base handlers
 */
export function useStatutoryInsuranceHandlers(
  formValue: WithdrawalFormValue,
  updateFormValue: (value: Partial<WithdrawalFormValue>) => void,
) {
  const ratesHandlers = useStatutoryRatesHandlers(formValue, updateFormValue)
  const incomeBaseHandlers = useStatutoryIncomeBaseHandlers(formValue, updateFormValue)

  return {
    ...ratesHandlers,
    ...incomeBaseHandlers,
  }
}
