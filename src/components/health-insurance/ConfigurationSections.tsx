import { StatutoryInsuranceConfig } from './StatutoryInsuranceConfig'
import { PrivateInsuranceConfig } from './PrivateInsuranceConfig'
import { CoupleConfiguration } from './CoupleConfiguration'
import { AdditionalCareInsurance } from './AdditionalCareInsurance'

interface ConfigurationSectionsProps {
  planningMode: 'individual' | 'couple'
  insuranceType: 'statutory' | 'private'
  includeEmployerContribution: boolean
  statutoryHealthInsuranceRate: number
  statutoryCareInsuranceRate: number
  statutoryMinimumIncomeBase: number
  statutoryMaximumIncomeBase: number
  onIncludeEmployerContributionChange: (include: boolean) => void
  onStatutoryMinimumIncomeBaseChange: (amount: number) => void
  onStatutoryMaximumIncomeBaseChange: (amount: number) => void
  privateHealthInsuranceMonthly: number
  privateCareInsuranceMonthly: number
  privateInsuranceInflationRate: number
  onPrivateHealthInsuranceMonthlyChange: (amount: number) => void
  onPrivateCareInsuranceMonthlyChange: (amount: number) => void
  onPrivateInsuranceInflationRateChange: (rate: number) => void
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
  additionalCareInsuranceForChildless: boolean
  additionalCareInsuranceAge: number
  onAdditionalCareInsuranceForChildlessChange: (enabled: boolean) => void
  onAdditionalCareInsuranceAgeChange: (age: number) => void
}

function StatutorySection(props: ConfigurationSectionsProps) {
  if (props.insuranceType !== 'statutory') return null
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

function PrivateSection(props: ConfigurationSectionsProps) {
  if (props.insuranceType !== 'private') return null
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

const getCoupleConfigProps = (props: ConfigurationSectionsProps) => {
  const {
    coupleStrategy = 'optimize',
    familyInsuranceThresholdRegular = 505,
    familyInsuranceThresholdMiniJob = 538,
    person1Name = '',
    person1WithdrawalShare = 0.5,
    person1OtherIncomeAnnual = 0,
    person1AdditionalCareInsuranceForChildless = false,
    person2Name = '',
    person2WithdrawalShare = 0.5,
    person2OtherIncomeAnnual = 0,
    person2AdditionalCareInsuranceForChildless = false,
    onCoupleStrategyChange,
    onFamilyInsuranceThresholdRegularChange,
    onFamilyInsuranceThresholdMiniJobChange,
    onPerson1NameChange,
    onPerson1WithdrawalShareChange,
    onPerson1OtherIncomeAnnualChange,
    onPerson1AdditionalCareInsuranceForChildlessChange,
    onPerson2NameChange,
    onPerson2WithdrawalShareChange,
    onPerson2OtherIncomeAnnualChange,
    onPerson2AdditionalCareInsuranceForChildlessChange,
  } = props

  return {
    coupleStrategy,
    familyInsuranceThresholdRegular,
    familyInsuranceThresholdMiniJob,
    person1Name,
    person1WithdrawalShare,
    person1OtherIncomeAnnual,
    person1AdditionalCareInsuranceForChildless,
    person2Name,
    person2WithdrawalShare,
    person2OtherIncomeAnnual,
    person2AdditionalCareInsuranceForChildless,
    onCoupleStrategyChange: onCoupleStrategyChange!,
    onFamilyInsuranceThresholdRegularChange: onFamilyInsuranceThresholdRegularChange!,
    onFamilyInsuranceThresholdMiniJobChange: onFamilyInsuranceThresholdMiniJobChange!,
    onPerson1NameChange: onPerson1NameChange!,
    onPerson1WithdrawalShareChange: onPerson1WithdrawalShareChange!,
    onPerson1OtherIncomeAnnualChange: onPerson1OtherIncomeAnnualChange!,
    onPerson1AdditionalCareInsuranceForChildlessChange:
      onPerson1AdditionalCareInsuranceForChildlessChange!,
    onPerson2NameChange: onPerson2NameChange!,
    onPerson2WithdrawalShareChange: onPerson2WithdrawalShareChange!,
    onPerson2OtherIncomeAnnualChange: onPerson2OtherIncomeAnnualChange!,
    onPerson2AdditionalCareInsuranceForChildlessChange:
      onPerson2AdditionalCareInsuranceForChildlessChange!,
  }
}

function CoupleSection(props: ConfigurationSectionsProps) {
  if (
    props.planningMode !== 'couple'
    || props.insuranceType !== 'statutory'
    || !props.onCoupleStrategyChange
  ) {
    return null
  }
  return <CoupleConfiguration {...getCoupleConfigProps(props)} />
}

function IndividualCareSection(props: ConfigurationSectionsProps) {
  if (props.planningMode !== 'individual') return null
  return (
    <AdditionalCareInsurance
      additionalCareInsuranceForChildless={props.additionalCareInsuranceForChildless}
      additionalCareInsuranceAge={props.additionalCareInsuranceAge}
      onAdditionalCareInsuranceForChildlessChange={props.onAdditionalCareInsuranceForChildlessChange}
      onAdditionalCareInsuranceAgeChange={props.onAdditionalCareInsuranceAgeChange}
    />
  )
}

export function ConfigurationSections(props: ConfigurationSectionsProps) {
  return (
    <>
      <StatutorySection {...props} />
      <PrivateSection {...props} />
      <CoupleSection {...props} />
      <IndividualCareSection {...props} />
    </>
  )
}
