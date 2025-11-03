import { useCallback } from 'react'
import { createDefaultHealthCareInsuranceConfig } from '../../helpers/health-care-insurance'
import type { WithdrawalFormValue } from '../utils/config-storage'

/**
 * Custom hook for private health insurance configuration handlers
 * Handles: health insurance monthly, care insurance monthly, inflation rate
 */
export function usePrivateInsuranceHandlers(
  formValue: WithdrawalFormValue,
  updateFormValue: (value: Partial<WithdrawalFormValue>) => void,
) {
  const handlePrivateHealthInsuranceMonthlyChange = useCallback(
    (amount: number) => {
      updateFormValue({
        healthCareInsuranceConfig: {
          ...(formValue.healthCareInsuranceConfig || createDefaultHealthCareInsuranceConfig()),
          privateHealthInsuranceMonthly: amount,
        },
      })
    },
    [formValue.healthCareInsuranceConfig, updateFormValue],
  )

  const handlePrivateCareInsuranceMonthlyChange = useCallback(
    (amount: number) => {
      updateFormValue({
        healthCareInsuranceConfig: {
          ...(formValue.healthCareInsuranceConfig || createDefaultHealthCareInsuranceConfig()),
          privateCareInsuranceMonthly: amount,
        },
      })
    },
    [formValue.healthCareInsuranceConfig, updateFormValue],
  )

  const handlePrivateInsuranceInflationRateChange = useCallback(
    (rate: number) => {
      updateFormValue({
        healthCareInsuranceConfig: {
          ...(formValue.healthCareInsuranceConfig || createDefaultHealthCareInsuranceConfig()),
          privateInsuranceInflationRate: rate,
        },
      })
    },
    [formValue.healthCareInsuranceConfig, updateFormValue],
  )

  return {
    onPrivateHealthInsuranceMonthlyChange: handlePrivateHealthInsuranceMonthlyChange,
    onPrivateCareInsuranceMonthlyChange: handlePrivateCareInsuranceMonthlyChange,
    onPrivateInsuranceInflationRateChange: handlePrivateInsuranceInflationRateChange,
  }
}
