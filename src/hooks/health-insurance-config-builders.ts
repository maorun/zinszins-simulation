import {
  createDefaultHealthCareInsuranceConfig,
  type HealthCareInsuranceConfig,
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

/**
 * Create person 1 config with defaults
 */
function createPerson1Config(values: HealthCareInsuranceFormValues, birthYear?: number) {
  return {
    name: values.person1Name || 'Person 1',
    birthYear: birthYear || 1980,
    withdrawalShare: values.person1WithdrawalShare || 0.5,
    otherIncomeAnnual: values.person1OtherIncomeAnnual || 0,
    additionalCareInsuranceForChildless: values.person1AdditionalCareInsuranceForChildless || false,
  }
}

/**
 * Create person 2 config with defaults
 */
function createPerson2Config(values: HealthCareInsuranceFormValues, spouseBirthYear?: number) {
  return {
    name: values.person2Name || 'Person 2',
    birthYear: spouseBirthYear || 1980,
    withdrawalShare: values.person2WithdrawalShare || 0.5,
    otherIncomeAnnual: values.person2OtherIncomeAnnual || 0,
    additionalCareInsuranceForChildless: values.person2AdditionalCareInsuranceForChildless || false,
  }
}

/**
 * Create family insurance thresholds with defaults
 */
function createFamilyInsuranceThresholds(values: HealthCareInsuranceFormValues) {
  return {
    regularEmploymentLimit: values.familyInsuranceThresholdRegular || 505,
    miniJobLimit: values.familyInsuranceThresholdMiniJob || 538,
    year: 2025,
  }
}

/**
 * Create health insurance config for couple planning mode
 * Extracted to reduce complexity in useHealthInsurancePreviewCalculation
 */
export function createCouplePreviewConfig(
  values: HealthCareInsuranceFormValues,
  birthYear?: number,
  spouseBirthYear?: number,
): HealthCareInsuranceConfig {
  return {
    ...createDefaultHealthCareInsuranceConfig(),
    planningMode: 'couple' as const,
    insuranceType: values.insuranceType,
    statutoryHealthInsuranceRate: values.statutoryHealthInsuranceRate,
    statutoryCareInsuranceRate: values.statutoryCareInsuranceRate,
    statutoryMinimumIncomeBase: values.statutoryMinimumIncomeBase,
    statutoryMaximumIncomeBase: values.statutoryMaximumIncomeBase,
    coupleConfig: {
      strategy: values.coupleStrategy || 'optimize',
      familyInsuranceThresholds: createFamilyInsuranceThresholds(values),
      person1: createPerson1Config(values, birthYear),
      person2: createPerson2Config(values, spouseBirthYear),
    },
  }
}

/**
 * Create health insurance config for individual planning mode
 * Extracted to reduce complexity in useHealthInsurancePreviewCalculation
 */
export function createIndividualPreviewConfig(values: HealthCareInsuranceFormValues): HealthCareInsuranceConfig {
  return {
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
}
