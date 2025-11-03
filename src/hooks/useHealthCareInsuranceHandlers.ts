import type { WithdrawalFormValue } from '../utils/config-storage'
import { useBaseHealthCareHandlers } from './useBaseHealthCareHandlers'
import { useStatutoryInsuranceHandlers } from './useStatutoryInsuranceHandlers'
import { usePrivateInsuranceHandlers } from './usePrivateInsuranceHandlers'
import { useGeneralHealthCareHandlers } from './useGeneralHealthCareHandlers'
import { useCoupleHealthCareHandlers } from './useCoupleHealthCareHandlers'

/**
 * Custom hook to manage health care insurance configuration handlers
 * Composes specialized handler hooks for better maintainability
 */
export function useHealthCareInsuranceHandlers(
  formValue: WithdrawalFormValue,
  updateFormValue: (value: Partial<WithdrawalFormValue>) => void,
) {
  const baseHandlers = useBaseHealthCareHandlers(formValue, updateFormValue)
  const statutoryHandlers = useStatutoryInsuranceHandlers(formValue, updateFormValue)
  const privateHandlers = usePrivateInsuranceHandlers(formValue, updateFormValue)
  const generalHandlers = useGeneralHealthCareHandlers(formValue, updateFormValue)
  const coupleHandlers = useCoupleHealthCareHandlers(formValue, updateFormValue)

  return {
    ...baseHandlers,
    ...statutoryHandlers,
    ...privateHandlers,
    ...generalHandlers,
    ...coupleHandlers,
  }
}
