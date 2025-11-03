import {
  createDefaultHealthCareInsuranceConfig,
  type HealthCareInsuranceConfig,
} from '../../helpers/health-care-insurance'
import type { WithdrawalFormValue } from '../utils/config-storage'

/**
 * Helper to create health care insurance config update
 */
export function createHealthCareConfigUpdate(
  formValue: WithdrawalFormValue,
  updates: Partial<HealthCareInsuranceConfig>,
): Partial<WithdrawalFormValue> {
  return {
    healthCareInsuranceConfig: {
      ...(formValue.healthCareInsuranceConfig || createDefaultHealthCareInsuranceConfig()),
      ...updates,
    },
  }
}
