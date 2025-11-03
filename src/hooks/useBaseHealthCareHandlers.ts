import { useCallback } from 'react'
import { createDefaultHealthCareInsuranceConfig } from '../../helpers/health-care-insurance'
import type { WithdrawalFormValue } from '../utils/config-storage'

/**
 * Custom hook for base health care insurance configuration handlers
 * Handles: enabled, insurance type, and employer contribution settings
 */
export function useBaseHealthCareHandlers(
  formValue: WithdrawalFormValue,
  updateFormValue: (value: Partial<WithdrawalFormValue>) => void,
) {
  const handleEnabledChange = useCallback(
    (enabled: boolean) => {
      updateFormValue({
        healthCareInsuranceConfig: {
          ...(formValue.healthCareInsuranceConfig || createDefaultHealthCareInsuranceConfig()),
          enabled,
        },
      })
    },
    [formValue.healthCareInsuranceConfig, updateFormValue],
  )

  const handleInsuranceTypeChange = useCallback(
    (insuranceType: 'statutory' | 'private') => {
      updateFormValue({
        healthCareInsuranceConfig: {
          ...(formValue.healthCareInsuranceConfig || createDefaultHealthCareInsuranceConfig()),
          insuranceType,
        },
      })
    },
    [formValue.healthCareInsuranceConfig, updateFormValue],
  )

  const handleIncludeEmployerContributionChange = useCallback(
    (includeEmployerContribution: boolean) => {
      updateFormValue({
        healthCareInsuranceConfig: {
          ...(formValue.healthCareInsuranceConfig || createDefaultHealthCareInsuranceConfig()),
          includeEmployerContribution,
        },
      })
    },
    [formValue.healthCareInsuranceConfig, updateFormValue],
  )

  return {
    onEnabledChange: handleEnabledChange,
    onInsuranceTypeChange: handleInsuranceTypeChange,
    onIncludeEmployerContributionChange: handleIncludeEmployerContributionChange,
  }
}
