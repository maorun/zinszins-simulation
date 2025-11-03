import { useCallback } from 'react'
import { createDefaultHealthCareInsuranceConfig } from '../../helpers/health-care-insurance'
import type { WithdrawalFormValue } from '../utils/config-storage'

/**
 * Custom hook for general health insurance configuration handlers
 * Handles: retirement start year, additional care insurance for childless, age
 */
export function useGeneralHealthCareHandlers(
  formValue: WithdrawalFormValue,
  updateFormValue: (value: Partial<WithdrawalFormValue>) => void,
) {
  const handleRetirementStartYearChange = useCallback(
    (year: number) => {
      updateFormValue({
        healthCareInsuranceConfig: {
          ...(formValue.healthCareInsuranceConfig || createDefaultHealthCareInsuranceConfig()),
          retirementStartYear: year,
        },
      })
    },
    [formValue.healthCareInsuranceConfig, updateFormValue],
  )

  const handleAdditionalCareInsuranceForChildlessChange = useCallback(
    (enabled: boolean) => {
      updateFormValue({
        healthCareInsuranceConfig: {
          ...(formValue.healthCareInsuranceConfig || createDefaultHealthCareInsuranceConfig()),
          additionalCareInsuranceForChildless: enabled,
        },
      })
    },
    [formValue.healthCareInsuranceConfig, updateFormValue],
  )

  const handleAdditionalCareInsuranceAgeChange = useCallback(
    (age: number) => {
      updateFormValue({
        healthCareInsuranceConfig: {
          ...(formValue.healthCareInsuranceConfig || createDefaultHealthCareInsuranceConfig()),
          additionalCareInsuranceAge: age,
        },
      })
    },
    [formValue.healthCareInsuranceConfig, updateFormValue],
  )

  return {
    onRetirementStartYearChange: handleRetirementStartYearChange,
    onAdditionalCareInsuranceForChildlessChange: handleAdditionalCareInsuranceForChildlessChange,
    onAdditionalCareInsuranceAgeChange: handleAdditionalCareInsuranceAgeChange,
  }
}
