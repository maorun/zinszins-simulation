import { useMemo } from 'react'
import {
  calculateHealthCareInsuranceForYear,
  calculateCoupleHealthInsuranceForYear,
  createDefaultHealthCareInsuranceConfig,
  type HealthCareInsuranceYearResult,
  type CoupleHealthInsuranceYearResult,
} from '../../helpers/health-care-insurance'

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
        // Create couple config from form values
        const coupleConfig = {
          ...createDefaultHealthCareInsuranceConfig(),
          planningMode: 'couple' as const,
          insuranceType: values.insuranceType,
          statutoryHealthInsuranceRate: values.statutoryHealthInsuranceRate,
          statutoryCareInsuranceRate: values.statutoryCareInsuranceRate,
          statutoryMinimumIncomeBase: values.statutoryMinimumIncomeBase,
          statutoryMaximumIncomeBase: values.statutoryMaximumIncomeBase,
          coupleConfig: {
            strategy: values.coupleStrategy || 'optimize',
            familyInsuranceThresholds: {
              regularEmploymentLimit: values.familyInsuranceThresholdRegular || 505,
              miniJobLimit: values.familyInsuranceThresholdMiniJob || 538,
              year: 2025,
            },
            person1: {
              name: values.person1Name || 'Person 1',
              birthYear: birthYear || 1980,
              withdrawalShare: values.person1WithdrawalShare || 0.5,
              otherIncomeAnnual: values.person1OtherIncomeAnnual || 0,
              additionalCareInsuranceForChildless: values.person1AdditionalCareInsuranceForChildless || false,
            },
            person2: {
              name: values.person2Name || 'Person 2',
              birthYear: spouseBirthYear || 1980,
              withdrawalShare: values.person2WithdrawalShare || 0.5,
              otherIncomeAnnual: values.person2OtherIncomeAnnual || 0,
              additionalCareInsuranceForChildless: values.person2AdditionalCareInsuranceForChildless || false,
            },
          },
        }

        return calculateCoupleHealthInsuranceForYear(coupleConfig, currentYear + 16, withdrawalAmount, 0)
      }
      else {
        // Individual calculation
        const individualConfig = {
          ...createDefaultHealthCareInsuranceConfig(),
          planningMode: 'individual' as const,
          insuranceType: values.insuranceType,
          statutoryHealthInsuranceRate: values.statutoryHealthInsuranceRate,
          statutoryCareInsuranceRate: values.statutoryCareInsuranceRate,
          statutoryMinimumIncomeBase: values.statutoryMinimumIncomeBase,
          statutoryMaximumIncomeBase: values.statutoryMaximumIncomeBase,
          additionalCareInsuranceForChildless: values.additionalCareInsuranceForChildless,
          additionalCareInsuranceAge: values.additionalCareInsuranceAge,
        }

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
