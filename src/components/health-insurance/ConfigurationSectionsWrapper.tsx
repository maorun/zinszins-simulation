import { ConfigurationSections } from './ConfigurationSections'
import type { HealthCareInsuranceChangeHandlers } from '../HealthCareInsuranceConfiguration'

interface HealthCareInsuranceFormValues {
  enabled: boolean
  planningMode: 'individual' | 'couple'
  insuranceType: 'statutory' | 'private'
  includeEmployerContribution: boolean
  statutoryHealthInsuranceRate: number
  statutoryCareInsuranceRate: number
  statutoryMinimumIncomeBase: number
  statutoryMaximumIncomeBase: number
  privateHealthInsuranceMonthly: number
  privateCareInsuranceMonthly: number
  privateInsuranceInflationRate: number
  retirementStartYear: number
  additionalCareInsuranceForChildless: boolean
  additionalCareInsuranceAge: number
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

interface ConfigurationSectionsWrapperProps {
  values: HealthCareInsuranceFormValues
  onChange: HealthCareInsuranceChangeHandlers
  planningMode: 'individual' | 'couple'
}

function extractStatutoryProps(values: HealthCareInsuranceFormValues, onChange: HealthCareInsuranceChangeHandlers) {
  return {
    includeEmployerContribution: values.includeEmployerContribution,
    statutoryHealthInsuranceRate: values.statutoryHealthInsuranceRate,
    statutoryCareInsuranceRate: values.statutoryCareInsuranceRate,
    statutoryMinimumIncomeBase: values.statutoryMinimumIncomeBase,
    statutoryMaximumIncomeBase: values.statutoryMaximumIncomeBase,
    onIncludeEmployerContributionChange: onChange.onIncludeEmployerContributionChange,
    onStatutoryMinimumIncomeBaseChange: onChange.onStatutoryMinimumIncomeBaseChange,
    onStatutoryMaximumIncomeBaseChange: onChange.onStatutoryMaximumIncomeBaseChange,
  }
}

function extractPrivateProps(values: HealthCareInsuranceFormValues, onChange: HealthCareInsuranceChangeHandlers) {
  return {
    privateHealthInsuranceMonthly: values.privateHealthInsuranceMonthly,
    privateCareInsuranceMonthly: values.privateCareInsuranceMonthly,
    privateInsuranceInflationRate: values.privateInsuranceInflationRate,
    onPrivateHealthInsuranceMonthlyChange: onChange.onPrivateHealthInsuranceMonthlyChange,
    onPrivateCareInsuranceMonthlyChange: onChange.onPrivateCareInsuranceMonthlyChange,
    onPrivateInsuranceInflationRateChange: onChange.onPrivateInsuranceInflationRateChange,
  }
}

function extractCoupleProps(values: HealthCareInsuranceFormValues, onChange: HealthCareInsuranceChangeHandlers) {
  return {
    coupleStrategy: values.coupleStrategy,
    familyInsuranceThresholdRegular: values.familyInsuranceThresholdRegular,
    familyInsuranceThresholdMiniJob: values.familyInsuranceThresholdMiniJob,
    person1Name: values.person1Name,
    person1WithdrawalShare: values.person1WithdrawalShare,
    person1OtherIncomeAnnual: values.person1OtherIncomeAnnual,
    person1AdditionalCareInsuranceForChildless: values.person1AdditionalCareInsuranceForChildless,
    person2Name: values.person2Name,
    person2WithdrawalShare: values.person2WithdrawalShare,
    person2OtherIncomeAnnual: values.person2OtherIncomeAnnual,
    person2AdditionalCareInsuranceForChildless: values.person2AdditionalCareInsuranceForChildless,
    onCoupleStrategyChange: onChange.onCoupleStrategyChange,
    onFamilyInsuranceThresholdRegularChange: onChange.onFamilyInsuranceThresholdRegularChange,
    onFamilyInsuranceThresholdMiniJobChange: onChange.onFamilyInsuranceThresholdMiniJobChange,
    onPerson1NameChange: onChange.onPerson1NameChange,
    onPerson1WithdrawalShareChange: onChange.onPerson1WithdrawalShareChange,
    onPerson1OtherIncomeAnnualChange: onChange.onPerson1OtherIncomeAnnualChange,
    onPerson1AdditionalCareInsuranceForChildlessChange: onChange.onPerson1AdditionalCareInsuranceForChildlessChange,
    onPerson2NameChange: onChange.onPerson2NameChange,
    onPerson2WithdrawalShareChange: onChange.onPerson2WithdrawalShareChange,
    onPerson2OtherIncomeAnnualChange: onChange.onPerson2OtherIncomeAnnualChange,
    onPerson2AdditionalCareInsuranceForChildlessChange: onChange.onPerson2AdditionalCareInsuranceForChildlessChange,
  }
}

/**
 * Wrapper component that maps values and handlers to ConfigurationSections.
 * This component exists solely for prop mapping to comply with max-lines-per-function.
 */
export function ConfigurationSectionsWrapper({ values, onChange, planningMode }: ConfigurationSectionsWrapperProps) {
  const commonProps = {
    planningMode,
    insuranceType: values.insuranceType,
    additionalCareInsuranceForChildless: values.additionalCareInsuranceForChildless,
    additionalCareInsuranceAge: values.additionalCareInsuranceAge,
    onAdditionalCareInsuranceForChildlessChange: onChange.onAdditionalCareInsuranceForChildlessChange,
    onAdditionalCareInsuranceAgeChange: onChange.onAdditionalCareInsuranceAgeChange,
  }

  return (
    <ConfigurationSections
      {...commonProps}
      {...extractStatutoryProps(values, onChange)}
      {...extractPrivateProps(values, onChange)}
      {...extractCoupleProps(values, onChange)}
    />
  )
}
