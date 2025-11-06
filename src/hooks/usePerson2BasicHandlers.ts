import { useCallback } from 'react'
import { createDefaultCoupleHealthInsuranceConfig } from '../../helpers/health-care-insurance'
import type { WithdrawalFormValue } from '../utils/config-storage'
import { createHealthCareConfigUpdate } from './health-care-config-helpers'

/**
 * Custom hook for person2 name and income handlers
 */
export function usePerson2BasicHandlers(
  formValue: WithdrawalFormValue,
  updateFormValue: (value: Partial<WithdrawalFormValue>) => void,
) {
  const handlePerson2NameChange = useCallback(
    (name: string) => {
      updateFormValue(
        createHealthCareConfigUpdate(formValue, {
          coupleConfig: {
            ...(formValue.healthCareInsuranceConfig?.coupleConfig || createDefaultCoupleHealthInsuranceConfig()),
            person2: {
              ...(formValue.healthCareInsuranceConfig?.coupleConfig?.person2 ||
                createDefaultCoupleHealthInsuranceConfig().person2),
              name,
            },
          },
        }),
      )
    },
    [formValue, updateFormValue],
  )

  const handlePerson2OtherIncomeAnnualChange = useCallback(
    (amount: number) => {
      updateFormValue(
        createHealthCareConfigUpdate(formValue, {
          coupleConfig: {
            ...(formValue.healthCareInsuranceConfig?.coupleConfig || createDefaultCoupleHealthInsuranceConfig()),
            person2: {
              ...(formValue.healthCareInsuranceConfig?.coupleConfig?.person2 ||
                createDefaultCoupleHealthInsuranceConfig().person2),
              otherIncomeAnnual: amount,
            },
          },
        }),
      )
    },
    [formValue, updateFormValue],
  )

  return {
    onPerson2NameChange: handlePerson2NameChange,
    onPerson2OtherIncomeAnnualChange: handlePerson2OtherIncomeAnnualChange,
  }
}
