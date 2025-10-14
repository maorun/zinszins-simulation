import { useEffect, useMemo } from 'react'
import { calculateRetirementStartYear } from '../../helpers/statutory-pension'
import { formatCurrency } from '../utils/currency'
import {
  calculateHealthCareInsuranceForYear,
  calculateCoupleHealthInsuranceForYear,
  createDefaultHealthCareInsuranceConfig,
} from '../../helpers/health-care-insurance'
import { CollapsibleCard, CollapsibleCardContent, CollapsibleCardHeader } from './ui/collapsible-card'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { InsuranceTypeSelection } from './health-insurance/InsuranceTypeSelection'
import { StatutoryInsuranceConfig } from './health-insurance/StatutoryInsuranceConfig'
import { PrivateInsuranceConfig } from './health-insurance/PrivateInsuranceConfig'
import { RetirementStartYearDisplay } from './health-insurance/RetirementStartYearDisplay'
import { CoupleConfiguration } from './health-insurance/CoupleConfiguration'
import { AdditionalCareInsurance } from './health-insurance/AdditionalCareInsurance'

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

export interface HealthCareInsuranceChangeHandlers {
  onEnabledChange: (enabled: boolean) => void
  onInsuranceTypeChange: (type: 'statutory' | 'private') => void
  onIncludeEmployerContributionChange: (include: boolean) => void
  onStatutoryHealthInsuranceRateChange: (rate: number) => void
  onStatutoryCareInsuranceRateChange: (rate: number) => void
  onStatutoryMinimumIncomeBaseChange: (amount: number) => void
  onStatutoryMaximumIncomeBaseChange: (amount: number) => void
  onPrivateHealthInsuranceMonthlyChange: (amount: number) => void
  onPrivateCareInsuranceMonthlyChange: (amount: number) => void
  onPrivateInsuranceInflationRateChange: (rate: number) => void
  onRetirementStartYearChange: (year: number) => void
  onAdditionalCareInsuranceForChildlessChange: (enabled: boolean) => void
  onAdditionalCareInsuranceAgeChange: (age: number) => void
  // Couple-specific handlers
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
}

interface HealthCareInsuranceConfigurationProps {
  values: HealthCareInsuranceFormValues
  onChange: HealthCareInsuranceChangeHandlers
  currentYear?: number
  // Birth year information for automatic retirement calculation
  birthYear?: number
  spouseBirthYear?: number
  planningMode: 'individual' | 'couple'
  // Current withdrawal amount from simulation for cost preview
  currentWithdrawalAmount?: number
}

export function HealthCareInsuranceConfiguration({
  values,
  onChange,
  currentYear: _currentYear = new Date().getFullYear(),
  birthYear,
  spouseBirthYear,
  planningMode,
  currentWithdrawalAmount,
}: HealthCareInsuranceConfigurationProps) {
  // Auto-calculate retirement start year when birth year changes
  useEffect(() => {
    const calculatedStartYear = calculateRetirementStartYear(
      planningMode,
      birthYear,
      spouseBirthYear,
      67, // Default retirement age
      67, // Default retirement age for spouse
    )

    if (calculatedStartYear && calculatedStartYear !== values.retirementStartYear) {
      onChange.onRetirementStartYearChange(calculatedStartYear)
    }
  }, [birthYear, spouseBirthYear, planningMode, values.retirementStartYear, onChange])

  if (!values.enabled) {
    return (
      <CollapsibleCard>
        <CollapsibleCardHeader>
          🏥 Kranken- und Pflegeversicherung
        </CollapsibleCardHeader>
        <CollapsibleCardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={values.enabled}
                onCheckedChange={onChange.onEnabledChange}
                id="health-care-insurance-enabled"
              />
              <Label htmlFor="health-care-insurance-enabled">
                Kranken- und Pflegeversicherung berücksichtigen
              </Label>
            </div>
            <div className="text-sm text-muted-foreground">
              Aktivieren Sie diese Option, um Kranken- und Pflegeversicherungsbeiträge in die
              Entnahmeplanung einzubeziehen. Berücksichtigt unterschiedliche Versicherungsarten und
              Beitragssätze.
            </div>
          </div>
        </CollapsibleCardContent>
      </CollapsibleCard>
    )
  }

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
        {/* Enable/Disable Toggle */}
        <div className="flex items-center space-x-2">
          <Switch
            checked={values.enabled}
            onCheckedChange={onChange.onEnabledChange}
            id="health-care-insurance-enabled-full"
          />
          <Label htmlFor="health-care-insurance-enabled-full">
            Kranken- und Pflegeversicherung berücksichtigen
          </Label>
        </div>

        {/* Planning Mode Info (derived from global planning) */}
        {planningMode === 'couple' && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm font-medium text-blue-900">
              💑 Paarplanung aktiviert
            </div>
            <div className="text-xs text-blue-700 mt-1">
              Planungsmodus wird aus der globalen Planung übernommen
            </div>
          </div>
        )}

        {/* Insurance Type Selection */}
        <InsuranceTypeSelection
          insuranceType={values.insuranceType}
          onInsuranceTypeChange={onChange.onInsuranceTypeChange}
        />

        {/* Automatic Retirement Start Year Display */}
        <RetirementStartYearDisplay
          planningMode={planningMode}
          birthYear={birthYear}
          spouseBirthYear={spouseBirthYear}
          retirementStartYear={values.retirementStartYear}
        />

        {/* Statutory Insurance Configuration */}
        {values.insuranceType === 'statutory' && (
          <StatutoryInsuranceConfig
            includeEmployerContribution={values.includeEmployerContribution}
            statutoryHealthInsuranceRate={values.statutoryHealthInsuranceRate}
            statutoryCareInsuranceRate={values.statutoryCareInsuranceRate}
            statutoryMinimumIncomeBase={values.statutoryMinimumIncomeBase}
            statutoryMaximumIncomeBase={values.statutoryMaximumIncomeBase}
            onIncludeEmployerContributionChange={onChange.onIncludeEmployerContributionChange}
            onStatutoryMinimumIncomeBaseChange={onChange.onStatutoryMinimumIncomeBaseChange}
            onStatutoryMaximumIncomeBaseChange={onChange.onStatutoryMaximumIncomeBaseChange}
          />
        )}

        {/* Private Insurance Configuration */}
        {values.insuranceType === 'private' && (
          <PrivateInsuranceConfig
            privateHealthInsuranceMonthly={values.privateHealthInsuranceMonthly}
            privateCareInsuranceMonthly={values.privateCareInsuranceMonthly}
            privateInsuranceInflationRate={values.privateInsuranceInflationRate}
            onPrivateHealthInsuranceMonthlyChange={onChange.onPrivateHealthInsuranceMonthlyChange}
            onPrivateCareInsuranceMonthlyChange={onChange.onPrivateCareInsuranceMonthlyChange}
            onPrivateInsuranceInflationRateChange={onChange.onPrivateInsuranceInflationRateChange}
          />
        )}

        {/* Couple Configuration */}
        {planningMode === 'couple' && values.insuranceType === 'statutory' && (
          <CoupleConfiguration
            coupleStrategy={values.coupleStrategy || 'optimize'}
            familyInsuranceThresholdRegular={values.familyInsuranceThresholdRegular || 505}
            familyInsuranceThresholdMiniJob={values.familyInsuranceThresholdMiniJob || 538}
            person1Name={values.person1Name || ''}
            person1WithdrawalShare={values.person1WithdrawalShare ?? 0.5}
            person1OtherIncomeAnnual={values.person1OtherIncomeAnnual || 0}
            person1AdditionalCareInsuranceForChildless={values.person1AdditionalCareInsuranceForChildless || false}
            person2Name={values.person2Name || ''}
            person2WithdrawalShare={values.person2WithdrawalShare ?? 0.5}
            person2OtherIncomeAnnual={values.person2OtherIncomeAnnual || 0}
            person2AdditionalCareInsuranceForChildless={values.person2AdditionalCareInsuranceForChildless || false}
            onCoupleStrategyChange={onChange.onCoupleStrategyChange!}
            onFamilyInsuranceThresholdRegularChange={onChange.onFamilyInsuranceThresholdRegularChange!}
            onFamilyInsuranceThresholdMiniJobChange={onChange.onFamilyInsuranceThresholdMiniJobChange!}
            onPerson1NameChange={onChange.onPerson1NameChange!}
            onPerson1WithdrawalShareChange={onChange.onPerson1WithdrawalShareChange!}
            onPerson1OtherIncomeAnnualChange={onChange.onPerson1OtherIncomeAnnualChange!}
            onPerson1AdditionalCareInsuranceForChildlessChange={
              onChange.onPerson1AdditionalCareInsuranceForChildlessChange!
            }
            onPerson2NameChange={onChange.onPerson2NameChange!}
            onPerson2WithdrawalShareChange={onChange.onPerson2WithdrawalShareChange!}
            onPerson2OtherIncomeAnnualChange={onChange.onPerson2OtherIncomeAnnualChange!}
            onPerson2AdditionalCareInsuranceForChildlessChange={
              onChange.onPerson2AdditionalCareInsuranceForChildlessChange!
            }
          />
        )}

        {/* Additional Care Insurance for Childless (Individual Mode Only) */}
        {planningMode === 'individual' && (
          <AdditionalCareInsurance
            additionalCareInsuranceForChildless={values.additionalCareInsuranceForChildless}
            additionalCareInsuranceAge={values.additionalCareInsuranceAge}
            onAdditionalCareInsuranceForChildlessChange={onChange.onAdditionalCareInsuranceForChildlessChange}
            onAdditionalCareInsuranceAgeChange={onChange.onAdditionalCareInsuranceAgeChange}
          />
        )}

        {/* Health Insurance Cost Preview */}
        {values.enabled && (
          <HealthInsuranceCostPreview
            values={values}
            planningMode={planningMode}
            birthYear={birthYear}
            spouseBirthYear={spouseBirthYear}
            currentWithdrawalAmount={currentWithdrawalAmount}
          />
        )}
      </CollapsibleCardContent>
    </CollapsibleCard>
  )
}

function HealthInsuranceCostPreview({
  values,
  planningMode,
  birthYear,
  spouseBirthYear,
  currentWithdrawalAmount,
}: {
  values: HealthCareInsuranceFormValues
  planningMode: 'individual' | 'couple'
  birthYear?: number
  spouseBirthYear?: number
  currentWithdrawalAmount?: number
}) {
  const currentYear = new Date().getFullYear()
  // Use actual withdrawal amount from simulation, fallback to 30k if not available
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

  if (!previewResults) return null

  if (planningMode === 'couple' && 'person1' in previewResults) {
    const coupleResults = previewResults
    return (
      <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
        <h4 className="font-medium text-sm text-green-900 mb-3 flex items-center gap-2">
          💰 Kostenvorschau (bei
          {' '}
          {formatCurrency(withdrawalAmount)}
          {' '}
          Entnahme)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <div className="space-y-2">
            <div className="text-sm font-medium text-blue-700">
              👤
              {' '}
              {coupleResults.person1.name}
            </div>
            <div className="text-xs space-y-1">
              <div>
                Jährlich:
                {formatCurrency(coupleResults.person1.healthInsuranceResult.totalAnnual)}
              </div>
              <div>
                Monatlich:
                {formatCurrency(coupleResults.person1.healthInsuranceResult.totalMonthly)}
              </div>
              <div className="text-blue-600">
                {coupleResults.person1.coveredByFamilyInsurance ? '👨‍👩‍👧‍👦 Familienversichert' : '💳 Eigenversichert'}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-purple-700">
              👤
              {' '}
              {coupleResults.person2.name}
            </div>
            <div className="text-xs space-y-1">
              <div>
                Jährlich:
                {formatCurrency(coupleResults.person2.healthInsuranceResult.totalAnnual)}
              </div>
              <div>
                Monatlich:
                {formatCurrency(coupleResults.person2.healthInsuranceResult.totalMonthly)}
              </div>
              <div className="text-purple-600">
                {coupleResults.person2.coveredByFamilyInsurance ? '👨‍👩‍👧‍👦 Familienversichert' : '💳 Eigenversichert'}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-green-300">
          <div className="text-sm font-medium text-green-900">
            Gesamt:
            {' '}
            {formatCurrency(coupleResults.totalAnnual)}
            {' '}
            / Jahr •
            {' '}
            {formatCurrency(coupleResults.totalMonthly)}
            {' '}
            / Monat
          </div>
          <div className="text-xs text-green-700 mt-1">
            Strategie:
            {' '}
            {coupleResults.strategyUsed === 'family' ? '👨‍👩‍👧‍👦 Familienversicherung'
              : coupleResults.strategyUsed === 'individual' ? '💳 Einzelversicherung' : '🎯 Optimiert'}
          </div>
        </div>
      </div>
    )
  }
  else {
    // Individual results
    const individualResults = previewResults as import('../../helpers/health-care-insurance').HealthCareInsuranceYearResult
    return (
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-sm text-blue-900 mb-3">
          💰 Kostenvorschau (bei
          {' '}
          {formatCurrency(withdrawalAmount)}
          {' '}
          Entnahme)
        </h4>

        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium">Jährlich:</span>
            {' '}
            {formatCurrency(individualResults.totalAnnual)}
          </div>
          <div className="text-sm">
            <span className="font-medium">Monatlich:</span>
            {' '}
            {formatCurrency(individualResults.totalMonthly)}
          </div>
          <div className="text-xs text-blue-700">
            Krankenversicherung:
            {' '}
            {formatCurrency(individualResults.healthInsuranceAnnual)}
            {' '}
            / Jahr •
            Pflegeversicherung:
            {' '}
            {formatCurrency(individualResults.careInsuranceAnnual)}
            {' '}
            / Jahr
          </div>
        </div>
      </div>
    )
  }
}
