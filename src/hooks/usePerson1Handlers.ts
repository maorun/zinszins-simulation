import type { WithdrawalFormValue } from '../utils/config-storage'
import { usePerson1BasicHandlers } from './usePerson1BasicHandlers'
import { usePerson1AdvancedHandlers } from './usePerson1AdvancedHandlers'

/**
 * Custom hook for person1 configuration handlers
 * Composes basic and advanced handlers for person1
 */
export function usePerson1Handlers(
  formValue: WithdrawalFormValue,
  updateFormValue: (value: Partial<WithdrawalFormValue>) => void,
) {
  const basicHandlers = usePerson1BasicHandlers(formValue, updateFormValue)
  const advancedHandlers = usePerson1AdvancedHandlers(formValue, updateFormValue)

  return {
    ...basicHandlers,
    ...advancedHandlers,
  }
}
