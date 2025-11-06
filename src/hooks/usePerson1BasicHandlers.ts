import { useCallback } from 'react'
import { createDefaultCoupleHealthInsuranceConfig } from '../../helpers/health-care-insurance'
import type { WithdrawalFormValue } from '../utils/config-storage'
import { createHealthCareConfigUpdate } from './health-care-config-helpers'

/**
 * Custom hook for person1 name and income handlers
 */
export function usePerson1BasicHandlers(
  formValue: WithdrawalFormValue,
  updateFormValue: (value: Partial<WithdrawalFormValue>) => void,
) {
  const handlePerson1NameChange = useCallback(
    (name: string) => {
      updateFormValue(
        createHealthCareConfigUpdate(formValue, {
          coupleConfig: {
            ...(formValue.healthCareInsuranceConfig?.coupleConfig || createDefaultCoupleHealthInsuranceConfig()),
            person1: {
              ...(formValue.healthCareInsuranceConfig?.coupleConfig?.person1 ||
                createDefaultCoupleHealthInsuranceConfig().person1),
              name,
            },
          },
        }),
      )
    },
    [formValue, updateFormValue],
  )

  const handlePerson1OtherIncomeAnnualChange = useCallback(
    (amount: number) => {
      updateFormValue(
        createHealthCareConfigUpdate(formValue, {
          coupleConfig: {
            ...(formValue.healthCareInsuranceConfig?.coupleConfig || createDefaultCoupleHealthInsuranceConfig()),
            person1: {
              ...(formValue.healthCareInsuranceConfig?.coupleConfig?.person1 ||
                createDefaultCoupleHealthInsuranceConfig().person1),
              otherIncomeAnnual: amount,
            },
          },
        }),
      )
    },
    [formValue, updateFormValue],
  )

  return {
    onPerson1NameChange: handlePerson1NameChange,
    onPerson1OtherIncomeAnnualChange: handlePerson1OtherIncomeAnnualChange,
  }
}
