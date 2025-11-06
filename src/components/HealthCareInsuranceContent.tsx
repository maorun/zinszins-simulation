import type { WithdrawalFormValue } from '../utils/config-storage'
import {
  HealthCareInsuranceConfiguration,
  type HealthCareInsuranceChangeHandlers,
} from './HealthCareInsuranceConfiguration'
import { buildHealthCareInsuranceValues } from './health-care-insurance-values-builder'

interface HealthCareInsuranceContentProps {
  formValue: WithdrawalFormValue
  planningMode: 'individual' | 'couple'
  startOfIndependence: number
  birthYear: number | undefined
  spouseBirthYear: number | undefined
  currentWithdrawalAmount: number | undefined
  onHealthCareInsuranceChange: HealthCareInsuranceChangeHandlers
}

/**
 * Renders the health care insurance configuration section
 */
export function HealthCareInsuranceContent({
  formValue,
  planningMode,
  startOfIndependence,
  birthYear,
  spouseBirthYear,
  currentWithdrawalAmount,
  onHealthCareInsuranceChange,
}: HealthCareInsuranceContentProps) {
  return (
    <div className="mb-6">
      <HealthCareInsuranceConfiguration
        {...buildHealthCareInsuranceValues({
          formValue,
          planningMode,
          startOfIndependence,
          birthYear,
          spouseBirthYear,
        })}
        onChange={onHealthCareInsuranceChange}
        currentWithdrawalAmount={currentWithdrawalAmount}
      />
    </div>
  )
}
