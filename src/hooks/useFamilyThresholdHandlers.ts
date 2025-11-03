import { useCallback } from 'react'
import {
  createDefaultCoupleHealthInsuranceConfig,
  createDefaultFamilyInsuranceThresholds,
} from '../../helpers/health-care-insurance'
import type { WithdrawalFormValue } from '../utils/config-storage'
import { createHealthCareConfigUpdate } from './health-care-config-helpers'

/**
 * Custom hook for family insurance threshold handlers
 */
export function useFamilyThresholdHandlers(
  formValue: WithdrawalFormValue,
  updateFormValue: (value: Partial<WithdrawalFormValue>) => void,
) {
  const handleFamilyInsuranceThresholdRegularChange = useCallback(
    (amount: number) => {
      updateFormValue(
        createHealthCareConfigUpdate(formValue, {
          coupleConfig: {
            ...(formValue.healthCareInsuranceConfig?.coupleConfig
              || createDefaultCoupleHealthInsuranceConfig()),
            familyInsuranceThresholds: {
              ...(formValue.healthCareInsuranceConfig?.coupleConfig?.familyInsuranceThresholds
                || createDefaultFamilyInsuranceThresholds()),
              regularEmploymentLimit: amount,
            },
          },
        }),
      )
    },
    [formValue, updateFormValue],
  )

  const handleFamilyInsuranceThresholdMiniJobChange = useCallback(
    (amount: number) => {
      updateFormValue(
        createHealthCareConfigUpdate(formValue, {
          coupleConfig: {
            ...(formValue.healthCareInsuranceConfig?.coupleConfig
              || createDefaultCoupleHealthInsuranceConfig()),
            familyInsuranceThresholds: {
              ...(formValue.healthCareInsuranceConfig?.coupleConfig?.familyInsuranceThresholds
                || createDefaultFamilyInsuranceThresholds()),
              miniJobLimit: amount,
            },
          },
        }),
      )
    },
    [formValue, updateFormValue],
  )

  return {
    onFamilyInsuranceThresholdRegularChange: handleFamilyInsuranceThresholdRegularChange,
    onFamilyInsuranceThresholdMiniJobChange: handleFamilyInsuranceThresholdMiniJobChange,
  }
}
