import type { WithdrawalFormValue } from '../utils/config-storage'
import { useCoupleStrategyHandlers } from './useCoupleStrategyHandlers'
import { usePerson1Handlers } from './usePerson1Handlers'
import { usePerson2Handlers } from './usePerson2Handlers'

/**
 * Custom hook for couple-specific health insurance configuration handlers
 * Composes handlers for couple strategy, person1, and person2 configurations
 */
export function useCoupleHealthCareHandlers(
  formValue: WithdrawalFormValue,
  updateFormValue: (value: Partial<WithdrawalFormValue>) => void,
) {
  const strategyHandlers = useCoupleStrategyHandlers(formValue, updateFormValue)
  const person1Handlers = usePerson1Handlers(formValue, updateFormValue)
  const person2Handlers = usePerson2Handlers(formValue, updateFormValue)

  return {
    ...strategyHandlers,
    ...person1Handlers,
    ...person2Handlers,
  }
}
