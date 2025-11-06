import { StatutoryInsuranceConfig } from './StatutoryInsuranceConfig'
import { PrivateInsuranceConfig } from './PrivateInsuranceConfig'
import { CoupleConfiguration } from './CoupleConfiguration'
import { AdditionalCareInsurance } from './AdditionalCareInsurance'

interface ConfigurationSectionsProps {
  planningMode: 'individual' | 'couple'
  insuranceType: 'statutory' | 'private'
  // Statutory insurance props
  includeEmployerContribution: boolean
  statutoryHealthInsuranceRate: number
  statutoryCareInsuranceRate: number
  statutoryMinimumIncomeBase: number
  statutoryMaximumIncomeBase: number
  onIncludeEmployerContributionChange: (include: boolean) => void
  onStatutoryMinimumIncomeBaseChange: (amount: number) => void
  onStatutoryMaximumIncomeBaseChange: (amount: number) => void
  // Private insurance props
  privateHealthInsuranceMonthly: number
  privateCareInsuranceMonthly: number
  privateInsuranceInflationRate: number
  onPrivateHealthInsuranceMonthlyChange: (amount: number) => void
  onPrivateCareInsuranceMonthlyChange: (amount: number) => void
  onPrivateInsuranceInflationRateChange: (rate: number) => void
  // Couple configuration props (optional)
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
  onCoupleStrategyChange?: (strategy: 'individual' | 'family' | 'optimize') => void
  onFamilyInsuranceThresholdRegularChange?: (amount: number) => void
  onFamilyInsuranceThresholdMiniJobChange?: (amount: number) => void
  onPerson1NameChange?: (name: string) => void
  onPerson1WithdrawalShareChange?: (share: number) => void
  onPerson1OtherIncomeAnnualChange?: (amount: number) => void
  onPerson1AdditionalCareInsuranceForChildlessChange?: (enabled: boolean) => void
  onPerson2NameChange?: (name: string) => void
  onPerson2WithdrawalShareChange?: (share: number) => void
  onPerson2OtherIncomeAnnualChange?: (amount: number) => void
  onPerson2AdditionalCareInsuranceForChildlessChange?: (enabled: boolean) => void
  // Additional care insurance for individual mode
  additionalCareInsuranceForChildless: boolean
  additionalCareInsuranceAge: number
  onAdditionalCareInsuranceForChildlessChange: (enabled: boolean) => void
  onAdditionalCareInsuranceAgeChange: (age: number) => void
}

/**
 * Renders statutory insurance configuration section
 */
function renderStatutorySection(props: ConfigurationSectionsProps) {
  if (props.insuranceType !== 'statutory') {
    return null
  }

  return (
    <StatutoryInsuranceConfig
      includeEmployerContribution={props.includeEmployerContribution}
      statutoryHealthInsuranceRate={props.statutoryHealthInsuranceRate}
      statutoryCareInsuranceRate={props.statutoryCareInsuranceRate}
      statutoryMinimumIncomeBase={props.statutoryMinimumIncomeBase}
      statutoryMaximumIncomeBase={props.statutoryMaximumIncomeBase}
      onIncludeEmployerContributionChange={props.onIncludeEmployerContributionChange}
      onStatutoryMinimumIncomeBaseChange={props.onStatutoryMinimumIncomeBaseChange}
      onStatutoryMaximumIncomeBaseChange={props.onStatutoryMaximumIncomeBaseChange}
    />
  )
}

/**
 * Renders private insurance configuration section
 */
function renderPrivateSection(props: ConfigurationSectionsProps) {
  if (props.insuranceType !== 'private') {
    return null
  }

  return (
    <PrivateInsuranceConfig
      privateHealthInsuranceMonthly={props.privateHealthInsuranceMonthly}
      privateCareInsuranceMonthly={props.privateCareInsuranceMonthly}
      privateInsuranceInflationRate={props.privateInsuranceInflationRate}
      onPrivateHealthInsuranceMonthlyChange={props.onPrivateHealthInsuranceMonthlyChange}
      onPrivateCareInsuranceMonthlyChange={props.onPrivateCareInsuranceMonthlyChange}
      onPrivateInsuranceInflationRateChange={props.onPrivateInsuranceInflationRateChange}
    />
  )
}

/**
 * Default values for couple configuration
 */
const COUPLE_CONFIG_DEFAULTS = {
  coupleStrategy: 'optimize' as const,
  familyInsuranceThresholdRegular: 505,
  familyInsuranceThresholdMiniJob: 538,
  person1Name: '',
  person1WithdrawalShare: 0.5,
  person1OtherIncomeAnnual: 0,
  person1AdditionalCareInsuranceForChildless: false,
  person2Name: '',
  person2WithdrawalShare: 0.5,
  person2OtherIncomeAnnual: 0,
  person2AdditionalCareInsuranceForChildless: false,
}

/**
 * Applies default values for person 1 configuration
 */
function applyPerson1Defaults(props: ConfigurationSectionsProps) {
  return {
    person1Name: props.person1Name ?? COUPLE_CONFIG_DEFAULTS.person1Name,
    person1WithdrawalShare: props.person1WithdrawalShare ?? COUPLE_CONFIG_DEFAULTS.person1WithdrawalShare,
    person1OtherIncomeAnnual: props.person1OtherIncomeAnnual ?? COUPLE_CONFIG_DEFAULTS.person1OtherIncomeAnnual,
    person1AdditionalCareInsuranceForChildless:
      props.person1AdditionalCareInsuranceForChildless ??
      COUPLE_CONFIG_DEFAULTS.person1AdditionalCareInsuranceForChildless,
  }
}

/**
 * Applies default values for person 2 configuration
 */
function applyPerson2Defaults(props: ConfigurationSectionsProps) {
  return {
    person2Name: props.person2Name ?? COUPLE_CONFIG_DEFAULTS.person2Name,
    person2WithdrawalShare: props.person2WithdrawalShare ?? COUPLE_CONFIG_DEFAULTS.person2WithdrawalShare,
    person2OtherIncomeAnnual: props.person2OtherIncomeAnnual ?? COUPLE_CONFIG_DEFAULTS.person2OtherIncomeAnnual,
    person2AdditionalCareInsuranceForChildless:
      props.person2AdditionalCareInsuranceForChildless ??
      COUPLE_CONFIG_DEFAULTS.person2AdditionalCareInsuranceForChildless,
  }
}

/**
 * Applies default values for general couple configuration
 */
function applyGeneralCoupleDefaults(props: ConfigurationSectionsProps) {
  return {
    coupleStrategy: props.coupleStrategy ?? COUPLE_CONFIG_DEFAULTS.coupleStrategy,
    familyInsuranceThresholdRegular:
      props.familyInsuranceThresholdRegular ?? COUPLE_CONFIG_DEFAULTS.familyInsuranceThresholdRegular,
    familyInsuranceThresholdMiniJob:
      props.familyInsuranceThresholdMiniJob ?? COUPLE_CONFIG_DEFAULTS.familyInsuranceThresholdMiniJob,
  }
}

/**
 * Renders couple configuration section (only for statutory insurance in couple mode)
 */
function renderCoupleSection(props: ConfigurationSectionsProps) {
  const shouldShow =
    props.planningMode === 'couple' && props.insuranceType === 'statutory' && props.onCoupleStrategyChange

  if (!shouldShow) {
    return null
  }

  const generalDefaults = applyGeneralCoupleDefaults(props)
  const person1Defaults = applyPerson1Defaults(props)
  const person2Defaults = applyPerson2Defaults(props)

  return (
    <CoupleConfiguration
      coupleStrategy={generalDefaults.coupleStrategy}
      familyInsuranceThresholdRegular={generalDefaults.familyInsuranceThresholdRegular}
      familyInsuranceThresholdMiniJob={generalDefaults.familyInsuranceThresholdMiniJob}
      person1Name={person1Defaults.person1Name}
      person1WithdrawalShare={person1Defaults.person1WithdrawalShare}
      person1OtherIncomeAnnual={person1Defaults.person1OtherIncomeAnnual}
      person1AdditionalCareInsuranceForChildless={person1Defaults.person1AdditionalCareInsuranceForChildless}
      person2Name={person2Defaults.person2Name}
      person2WithdrawalShare={person2Defaults.person2WithdrawalShare}
      person2OtherIncomeAnnual={person2Defaults.person2OtherIncomeAnnual}
      person2AdditionalCareInsuranceForChildless={person2Defaults.person2AdditionalCareInsuranceForChildless}
      onCoupleStrategyChange={props.onCoupleStrategyChange!}
      onFamilyInsuranceThresholdRegularChange={props.onFamilyInsuranceThresholdRegularChange!}
      onFamilyInsuranceThresholdMiniJobChange={props.onFamilyInsuranceThresholdMiniJobChange!}
      onPerson1NameChange={props.onPerson1NameChange!}
      onPerson1WithdrawalShareChange={props.onPerson1WithdrawalShareChange!}
      onPerson1OtherIncomeAnnualChange={props.onPerson1OtherIncomeAnnualChange!}
      onPerson1AdditionalCareInsuranceForChildlessChange={props.onPerson1AdditionalCareInsuranceForChildlessChange!}
      onPerson2NameChange={props.onPerson2NameChange!}
      onPerson2WithdrawalShareChange={props.onPerson2WithdrawalShareChange!}
      onPerson2OtherIncomeAnnualChange={props.onPerson2OtherIncomeAnnualChange!}
      onPerson2AdditionalCareInsuranceForChildlessChange={props.onPerson2AdditionalCareInsuranceForChildlessChange!}
    />
  )
}

/**
 * Renders additional care insurance section (only for individual mode)
 */
function renderIndividualCareSection(props: ConfigurationSectionsProps) {
  if (props.planningMode !== 'individual') {
    return null
  }

  return (
    <AdditionalCareInsurance
      additionalCareInsuranceForChildless={props.additionalCareInsuranceForChildless}
      additionalCareInsuranceAge={props.additionalCareInsuranceAge}
      onAdditionalCareInsuranceForChildlessChange={props.onAdditionalCareInsuranceForChildlessChange}
      onAdditionalCareInsuranceAgeChange={props.onAdditionalCareInsuranceAgeChange}
    />
  )
}

/**
 * Groups all insurance configuration sections based on insurance type and planning mode
 */
export function ConfigurationSections(props: ConfigurationSectionsProps) {
  return (
    <>
      {renderStatutorySection(props)}
      {renderPrivateSection(props)}
      {renderCoupleSection(props)}
      {renderIndividualCareSection(props)}
    </>
  )
}
