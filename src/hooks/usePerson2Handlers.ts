import type { WithdrawalFormValue } from '../utils/config-storage'
import { usePerson2BasicHandlers } from './usePerson2BasicHandlers'
import { usePerson2AdvancedHandlers } from './usePerson2AdvancedHandlers'

/**
 * Custom hook for person2 configuration handlers
 * Composes basic and advanced handlers for person2
 */
export function usePerson2Handlers(
  formValue: WithdrawalFormValue,
  updateFormValue: (value: Partial<WithdrawalFormValue>) => void,
) {
  const basicHandlers = usePerson2BasicHandlers(formValue, updateFormValue)
  const advancedHandlers = usePerson2AdvancedHandlers(formValue, updateFormValue)

  return {
    ...basicHandlers,
    ...advancedHandlers,
  }
}
