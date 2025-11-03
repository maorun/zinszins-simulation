import { useCallback } from 'react'
import { createDefaultCoupleHealthInsuranceConfig } from '../../helpers/health-care-insurance'
import type { WithdrawalFormValue } from '../utils/config-storage'
import { createHealthCareConfigUpdate } from './health-care-config-helpers'
import { useFamilyThresholdHandlers } from './useFamilyThresholdHandlers'

/**
 * Custom hook for couple strategy configuration handler
 */
export function useCoupleStrategyHandlers(
  formValue: WithdrawalFormValue,
  updateFormValue: (value: Partial<WithdrawalFormValue>) => void,
) {
  const familyThresholdHandlers = useFamilyThresholdHandlers(formValue, updateFormValue)

  const handleCoupleStrategyChange = useCallback(
    (strategy: 'individual' | 'family' | 'optimize') => {
      updateFormValue(
        createHealthCareConfigUpdate(formValue, {
          coupleConfig: {
            ...(formValue.healthCareInsuranceConfig?.coupleConfig
              || createDefaultCoupleHealthInsuranceConfig()),
            strategy,
          },
        }),
      )
    },
    [formValue, updateFormValue],
  )

  return {
    onCoupleStrategyChange: handleCoupleStrategyChange,
    ...familyThresholdHandlers,
  }
}
