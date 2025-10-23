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
 * Groups all insurance configuration sections based on insurance type and planning mode
 */
// eslint-disable-next-line complexity -- UI routing logic requires multiple conditional section renders
export function ConfigurationSections(props: ConfigurationSectionsProps) {
  const {
    planningMode,
    insuranceType,
    includeEmployerContribution,
    statutoryHealthInsuranceRate,
    statutoryCareInsuranceRate,
    statutoryMinimumIncomeBase,
    statutoryMaximumIncomeBase,
    onIncludeEmployerContributionChange,
    onStatutoryMinimumIncomeBaseChange,
    onStatutoryMaximumIncomeBaseChange,
    privateHealthInsuranceMonthly,
    privateCareInsuranceMonthly,
    privateInsuranceInflationRate,
    onPrivateHealthInsuranceMonthlyChange,
    onPrivateCareInsuranceMonthlyChange,
    onPrivateInsuranceInflationRateChange,
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
    additionalCareInsuranceForChildless,
    additionalCareInsuranceAge,
    onAdditionalCareInsuranceForChildlessChange,
    onAdditionalCareInsuranceAgeChange,
  } = props

  const isStatutory = insuranceType === 'statutory'
  const isPrivate = insuranceType === 'private'
  const isCouple = planningMode === 'couple'
  const isIndividual = planningMode === 'individual'
  const showCoupleConfig = isCouple && isStatutory && onCoupleStrategyChange
  const showIndividualCare = isIndividual

  return (
    <>
      {isStatutory && (
        <StatutoryInsuranceConfig
          includeEmployerContribution={includeEmployerContribution}
          statutoryHealthInsuranceRate={statutoryHealthInsuranceRate}
          statutoryCareInsuranceRate={statutoryCareInsuranceRate}
          statutoryMinimumIncomeBase={statutoryMinimumIncomeBase}
          statutoryMaximumIncomeBase={statutoryMaximumIncomeBase}
          onIncludeEmployerContributionChange={onIncludeEmployerContributionChange}
          onStatutoryMinimumIncomeBaseChange={onStatutoryMinimumIncomeBaseChange}
          onStatutoryMaximumIncomeBaseChange={onStatutoryMaximumIncomeBaseChange}
        />
      )}

      {isPrivate && (
        <PrivateInsuranceConfig
          privateHealthInsuranceMonthly={privateHealthInsuranceMonthly}
          privateCareInsuranceMonthly={privateCareInsuranceMonthly}
          privateInsuranceInflationRate={privateInsuranceInflationRate}
          onPrivateHealthInsuranceMonthlyChange={onPrivateHealthInsuranceMonthlyChange}
          onPrivateCareInsuranceMonthlyChange={onPrivateCareInsuranceMonthlyChange}
          onPrivateInsuranceInflationRateChange={onPrivateInsuranceInflationRateChange}
        />
      )}

      {showCoupleConfig && (
        <CoupleConfiguration
          coupleStrategy={coupleStrategy}
          familyInsuranceThresholdRegular={familyInsuranceThresholdRegular}
          familyInsuranceThresholdMiniJob={familyInsuranceThresholdMiniJob}
          person1Name={person1Name}
          person1WithdrawalShare={person1WithdrawalShare}
          person1OtherIncomeAnnual={person1OtherIncomeAnnual}
          person1AdditionalCareInsuranceForChildless={person1AdditionalCareInsuranceForChildless}
          person2Name={person2Name}
          person2WithdrawalShare={person2WithdrawalShare}
          person2OtherIncomeAnnual={person2OtherIncomeAnnual}
          person2AdditionalCareInsuranceForChildless={person2AdditionalCareInsuranceForChildless}
          onCoupleStrategyChange={onCoupleStrategyChange}
          onFamilyInsuranceThresholdRegularChange={onFamilyInsuranceThresholdRegularChange!}
          onFamilyInsuranceThresholdMiniJobChange={onFamilyInsuranceThresholdMiniJobChange!}
          onPerson1NameChange={onPerson1NameChange!}
          onPerson1WithdrawalShareChange={onPerson1WithdrawalShareChange!}
          onPerson1OtherIncomeAnnualChange={onPerson1OtherIncomeAnnualChange!}
          onPerson1AdditionalCareInsuranceForChildlessChange={
            onPerson1AdditionalCareInsuranceForChildlessChange!
          }
          onPerson2NameChange={onPerson2NameChange!}
          onPerson2WithdrawalShareChange={onPerson2WithdrawalShareChange!}
          onPerson2OtherIncomeAnnualChange={onPerson2OtherIncomeAnnualChange!}
          onPerson2AdditionalCareInsuranceForChildlessChange={
            onPerson2AdditionalCareInsuranceForChildlessChange!
          }
        />
      )}

      {showIndividualCare && (
        <AdditionalCareInsurance
          additionalCareInsuranceForChildless={additionalCareInsuranceForChildless}
          additionalCareInsuranceAge={additionalCareInsuranceAge}
          onAdditionalCareInsuranceForChildlessChange={onAdditionalCareInsuranceForChildlessChange}
          onAdditionalCareInsuranceAgeChange={onAdditionalCareInsuranceAgeChange}
        />
      )}
    </>
  )
}
