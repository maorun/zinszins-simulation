import type { ReactNode } from 'react'
import { CollapsibleCard, CollapsibleCardContent, CollapsibleCardHeader } from '../ui/collapsible-card'
import { InsuranceTypeSelection } from './InsuranceTypeSelection'
import { RetirementStartYearDisplay } from './RetirementStartYearDisplay'
import { CoupleModeBanner } from './CoupleModeBanner'
import { ConfigurationSectionsWrapper } from './ConfigurationSectionsWrapper'
import { EnabledToggle } from './EnabledToggle'
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

interface HealthCareInsuranceCardProps {
  values: HealthCareInsuranceFormValues
  onChange: HealthCareInsuranceChangeHandlers
  planningMode: 'individual' | 'couple'
  birthYear?: number
  spouseBirthYear?: number
  costPreviewElement: ReactNode
}

export function HealthCareInsuranceCard({
  values,
  onChange,
  planningMode,
  birthYear,
  spouseBirthYear,
  costPreviewElement,
}: HealthCareInsuranceCardProps) {
  return (
    <CollapsibleCard>
      <CollapsibleCardHeader>
        🏥 Kranken- und Pflegeversicherung
        <span className="text-sm font-normal text-muted-foreground">
          (
          {values.insuranceType === 'statutory' ? 'Gesetzlich' : 'Privat'}
          )
        </span>
      </CollapsibleCardHeader>
      <CollapsibleCardContent>
        <EnabledToggle
          enabled={values.enabled}
          onEnabledChange={onChange.onEnabledChange}
          idPrefix="health-care-insurance-enabled-full"
        />

        <CoupleModeBanner planningMode={planningMode} />

        <InsuranceTypeSelection
          insuranceType={values.insuranceType}
          onInsuranceTypeChange={onChange.onInsuranceTypeChange}
        />

        <RetirementStartYearDisplay
          planningMode={planningMode}
          birthYear={birthYear}
          spouseBirthYear={spouseBirthYear}
          retirementStartYear={values.retirementStartYear}
        />

        <ConfigurationSectionsWrapper values={values} onChange={onChange} planningMode={planningMode} />

        {costPreviewElement}
      </CollapsibleCardContent>
    </CollapsibleCard>
  )
}
