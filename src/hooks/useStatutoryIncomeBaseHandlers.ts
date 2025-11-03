import { useCallback } from 'react'
import { createDefaultHealthCareInsuranceConfig } from '../../helpers/health-care-insurance'
import type { WithdrawalFormValue } from '../utils/config-storage'

/**
 * Custom hook for statutory income base configuration handlers
 */
export function useStatutoryIncomeBaseHandlers(
  formValue: WithdrawalFormValue,
  updateFormValue: (value: Partial<WithdrawalFormValue>) => void,
) {
  const handleStatutoryMinimumIncomeBaseChange = useCallback(
    (amount: number) => {
      updateFormValue({
        healthCareInsuranceConfig: {
          ...(formValue.healthCareInsuranceConfig || createDefaultHealthCareInsuranceConfig()),
          statutoryMinimumIncomeBase: amount,
        },
      })
    },
    [formValue.healthCareInsuranceConfig, updateFormValue],
  )

  const handleStatutoryMaximumIncomeBaseChange = useCallback(
    (amount: number) => {
      updateFormValue({
        healthCareInsuranceConfig: {
          ...(formValue.healthCareInsuranceConfig || createDefaultHealthCareInsuranceConfig()),
          statutoryMaximumIncomeBase: amount,
        },
      })
    },
    [formValue.healthCareInsuranceConfig, updateFormValue],
  )

  return {
    onStatutoryMinimumIncomeBaseChange: handleStatutoryMinimumIncomeBaseChange,
    onStatutoryMaximumIncomeBaseChange: handleStatutoryMaximumIncomeBaseChange,
  }
}
