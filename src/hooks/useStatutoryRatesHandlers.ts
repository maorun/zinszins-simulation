import { useCallback } from 'react'
import { createDefaultHealthCareInsuranceConfig } from '../../helpers/health-care-insurance'
import type { WithdrawalFormValue } from '../utils/config-storage'

/**
 * Custom hook for statutory insurance rates configuration handlers
 */
export function useStatutoryRatesHandlers(
  formValue: WithdrawalFormValue,
  updateFormValue: (value: Partial<WithdrawalFormValue>) => void,
) {
  const handleStatutoryHealthInsuranceRateChange = useCallback(
    (rate: number) => {
      updateFormValue({
        healthCareInsuranceConfig: {
          ...(formValue.healthCareInsuranceConfig || createDefaultHealthCareInsuranceConfig()),
          statutoryHealthInsuranceRate: rate,
        },
      })
    },
    [formValue.healthCareInsuranceConfig, updateFormValue],
  )

  const handleStatutoryCareInsuranceRateChange = useCallback(
    (rate: number) => {
      updateFormValue({
        healthCareInsuranceConfig: {
          ...(formValue.healthCareInsuranceConfig || createDefaultHealthCareInsuranceConfig()),
          statutoryCareInsuranceRate: rate,
        },
      })
    },
    [formValue.healthCareInsuranceConfig, updateFormValue],
  )

  return {
    onStatutoryHealthInsuranceRateChange: handleStatutoryHealthInsuranceRateChange,
    onStatutoryCareInsuranceRateChange: handleStatutoryCareInsuranceRateChange,
  }
}
