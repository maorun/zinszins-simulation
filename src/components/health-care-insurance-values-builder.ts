import type { WithdrawalFormValue } from '../utils/config-storage'

interface BuildHealthCareValuesParams {
  formValue: WithdrawalFormValue
  planningMode: 'individual' | 'couple'
  startOfIndependence: number
  birthYear: number | undefined
  spouseBirthYear: number | undefined
}

function buildBasicInsuranceValues(config: WithdrawalFormValue['healthCareInsuranceConfig'], planningMode: 'individual' | 'couple') {
  return {
    enabled: config?.enabled ?? true,
    planningMode: planningMode,
    insuranceType: config?.insuranceType || 'statutory',
    includeEmployerContribution: config?.includeEmployerContribution ?? true,
  }
}

/**
 * Get value with fallback to default
 */
function getValueOrDefault<T>(value: T | undefined, defaultValue: T): T {
  return value ?? defaultValue
}

const DEFAULT_STATUTORY_INSURANCE_VALUES = {
  rate: 14.6,
  careRate: 3.05,
  minBase: 13230,
  maxBase: 62550,
}

function buildStatutoryInsuranceValues(config: WithdrawalFormValue['healthCareInsuranceConfig']) {
  const defaults = DEFAULT_STATUTORY_INSURANCE_VALUES
  return {
    statutoryHealthInsuranceRate: getValueOrDefault(config?.statutoryHealthInsuranceRate, defaults.rate),
    statutoryCareInsuranceRate: getValueOrDefault(config?.statutoryCareInsuranceRate, defaults.careRate),
    statutoryMinimumIncomeBase: getValueOrDefault(config?.statutoryMinimumIncomeBase, defaults.minBase),
    statutoryMaximumIncomeBase: getValueOrDefault(config?.statutoryMaximumIncomeBase, defaults.maxBase),
  }
}

function buildPrivateInsuranceValues(config: WithdrawalFormValue['healthCareInsuranceConfig']) {
  return {
    privateHealthInsuranceMonthly: config?.privateHealthInsuranceMonthly || 400,
    privateCareInsuranceMonthly: config?.privateCareInsuranceMonthly || 100,
    privateInsuranceInflationRate: config?.privateInsuranceInflationRate || 2,
  }
}

function buildRetirementAndCareValues(
  config: WithdrawalFormValue['healthCareInsuranceConfig'],
  startOfIndependence: number,
) {
  return {
    retirementStartYear: config?.retirementStartYear || startOfIndependence,
    additionalCareInsuranceForChildless: config?.additionalCareInsuranceForChildless || false,
    additionalCareInsuranceAge: config?.additionalCareInsuranceAge || 23,
  }
}

function buildCoupleStrategyValues(config: WithdrawalFormValue['healthCareInsuranceConfig']) {
  const coupleConfig = config?.coupleConfig
  const thresholds = coupleConfig?.familyInsuranceThresholds

  return {
    coupleStrategy: coupleConfig?.strategy,
    familyInsuranceThresholdRegular: thresholds?.regularEmploymentLimit,
    familyInsuranceThresholdMiniJob: thresholds?.miniJobLimit,
  }
}

function buildPerson1Values(config: WithdrawalFormValue['healthCareInsuranceConfig']) {
  const person1 = config?.coupleConfig?.person1
  return {
    person1Name: person1?.name,
    person1WithdrawalShare: person1?.withdrawalShare,
    person1OtherIncomeAnnual: person1?.otherIncomeAnnual,
    person1AdditionalCareInsuranceForChildless: person1?.additionalCareInsuranceForChildless,
  }
}

function buildPerson2Values(config: WithdrawalFormValue['healthCareInsuranceConfig']) {
  const person2 = config?.coupleConfig?.person2
  return {
    person2Name: person2?.name,
    person2WithdrawalShare: person2?.withdrawalShare,
    person2OtherIncomeAnnual: person2?.otherIncomeAnnual,
    person2AdditionalCareInsuranceForChildless: person2?.additionalCareInsuranceForChildless,
  }
}

export function buildHealthCareInsuranceValues(params: BuildHealthCareValuesParams) {
  const { formValue, planningMode, startOfIndependence, birthYear, spouseBirthYear } = params
  const config = formValue.healthCareInsuranceConfig

  return {
    values: {
      ...buildBasicInsuranceValues(config, planningMode),
      ...buildStatutoryInsuranceValues(config),
      ...buildPrivateInsuranceValues(config),
      ...buildRetirementAndCareValues(config, startOfIndependence),
      ...buildCoupleStrategyValues(config),
      ...buildPerson1Values(config),
      ...buildPerson2Values(config),
    },
    birthYear,
    spouseBirthYear,
    planningMode,
  }
}
