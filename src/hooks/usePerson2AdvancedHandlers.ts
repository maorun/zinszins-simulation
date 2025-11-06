import { useCallback } from 'react'
import {
  createDefaultCoupleHealthInsuranceConfig,
  type CoupleHealthInsuranceConfig,
} from '../../helpers/health-care-insurance'
import type { WithdrawalFormValue } from '../utils/config-storage'
import { createHealthCareConfigUpdate } from './health-care-config-helpers'

/**
 * Helper to get or create couple config with defaults
 */
function getCoupleConfigOrDefault(formValue: WithdrawalFormValue): CoupleHealthInsuranceConfig {
  return formValue.healthCareInsuranceConfig?.coupleConfig || createDefaultCoupleHealthInsuranceConfig()
}

/**
 * Custom hook for person2 withdrawal share and care insurance handlers
 */
export function usePerson2AdvancedHandlers(
  formValue: WithdrawalFormValue,
  updateFormValue: (value: Partial<WithdrawalFormValue>) => void,
) {
  const handlePerson2WithdrawalShareChange = useCallback(
    (share: number) => {
      const coupleConfig = getCoupleConfigOrDefault(formValue)
      const defaults = createDefaultCoupleHealthInsuranceConfig()

      const updatedCoupleConfig: CoupleHealthInsuranceConfig = {
        ...coupleConfig,
        person1: {
          ...(coupleConfig.person1 || defaults.person1),
          withdrawalShare: 1 - share,
        },
        person2: {
          ...(coupleConfig.person2 || defaults.person2),
          withdrawalShare: share,
        },
      }

      updateFormValue(createHealthCareConfigUpdate(formValue, { coupleConfig: updatedCoupleConfig }))
    },
    [formValue, updateFormValue],
  )

  const handlePerson2AdditionalCareInsuranceForChildlessChange = useCallback(
    (enabled: boolean) => {
      updateFormValue(
        createHealthCareConfigUpdate(formValue, {
          coupleConfig: {
            ...(formValue.healthCareInsuranceConfig?.coupleConfig || createDefaultCoupleHealthInsuranceConfig()),
            person2: {
              ...(formValue.healthCareInsuranceConfig?.coupleConfig?.person2 ||
                createDefaultCoupleHealthInsuranceConfig().person2),
              additionalCareInsuranceForChildless: enabled,
            },
          },
        }),
      )
    },
    [formValue, updateFormValue],
  )

  return {
    onPerson2WithdrawalShareChange: handlePerson2WithdrawalShareChange,
    onPerson2AdditionalCareInsuranceForChildlessChange: handlePerson2AdditionalCareInsuranceForChildlessChange,
  }
}
