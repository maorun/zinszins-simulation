import { useMemo } from 'react'
import {
  calculateHealthCareInsuranceForYear,
  calculateCoupleHealthInsuranceForYear,
  type HealthCareInsuranceYearResult,
  type CoupleHealthInsuranceYearResult,
} from '../../helpers/health-care-insurance'
import {
  createCouplePreviewConfig,
  createIndividualPreviewConfig,
} from './health-insurance-config-builders'

interface HealthCareInsuranceFormValues {
  enabled: boolean
  insuranceType: 'statutory' | 'private'
  statutoryHealthInsuranceRate: number
  statutoryCareInsuranceRate: number
  statutoryMinimumIncomeBase: number
  statutoryMaximumIncomeBase: number
  additionalCareInsuranceForChildless: boolean
  additionalCareInsuranceAge: number
  // Couple-specific fields
  coupleStrategy?: 'individual' | 'family' | 'optimize'
  familyInsuranceThresholdRegular?: number
  familyInsuranceThresholdMiniJob?: number
  person1Name?: string
  person1WithdrawalShare?: number
  person1OtherIncomeAnnual?: number
  person1AdditionalCareInsuranceForChildless?: boolean
  person2Name?: string
  person2WithdrawalShare?: number
  person2OtherIncomeAnnual?: number
  person2AdditionalCareInsuranceForChildless?: boolean
}

interface UseHealthInsurancePreviewCalculationParams {
  values: HealthCareInsuranceFormValues
  planningMode: 'individual' | 'couple'
  birthYear?: number
  spouseBirthYear?: number
  currentWithdrawalAmount?: number
}

/**
 * Custom hook for calculating health insurance preview costs
 * Handles both individual and couple scenarios
 */
export function useHealthInsurancePreviewCalculation({
  values,
  planningMode,
  birthYear,
  spouseBirthYear,
  currentWithdrawalAmount,
}: UseHealthInsurancePreviewCalculationParams): {
  previewResults: HealthCareInsuranceYearResult | CoupleHealthInsuranceYearResult | null
  withdrawalAmount: number
} {
  const currentYear = new Date().getFullYear()
  const withdrawalAmount = currentWithdrawalAmount || 30000

  const previewResults = useMemo(() => {
    if (!values.enabled) return null

    try {
      if (planningMode === 'couple') {
        const coupleConfig = createCouplePreviewConfig(values, birthYear, spouseBirthYear)
        return calculateCoupleHealthInsuranceForYear(coupleConfig, currentYear + 16, withdrawalAmount, 0)
      }
      else {
        const individualConfig = createIndividualPreviewConfig(values)
        return calculateHealthCareInsuranceForYear(
          individualConfig,
          currentYear + 16,
          withdrawalAmount,
          0,
          (birthYear || 1980) + 16,
        )
      }
    }
    catch (error) {
      console.error('Error calculating health insurance preview:', error)
      return null
    }
  }, [
    values,
    planningMode,
    birthYear,
    spouseBirthYear,
    currentYear,
    withdrawalAmount,
  ])

  return {
    previewResults,
    withdrawalAmount,
  }
}
