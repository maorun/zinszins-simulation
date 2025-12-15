import type { ComponentType } from 'react'
import { PensionInputForm } from './PensionInputForm'

interface PensionConfigurationContentProps {
  values: {
    hasTaxReturnData: boolean
    taxYear: number
    annualPensionReceived: number
    taxablePortion: number
    startYear: number
    retirementAge?: number
    monthlyAmount: number
    annualIncreaseRate: number
    taxablePercentage: number
  }
  onChange: {
    onStartYearChange: (year: number) => void
    onMonthlyAmountChange: (amount: number) => void
    onAnnualIncreaseRateChange: (rate: number) => void
    onTaxablePercentageChange: (percentage: number) => void
    onRetirementAgeChange: (age: number) => void
    onTaxReturnDataChange: (data: {
      hasTaxReturnData: boolean
      taxYear: number
      annualPensionReceived: number
      taxablePortion: number
    }) => void
  }
  nestingLevel: number
  birthYear?: number
  spouseBirthYear?: number
  currentYear: number
  planningMode: 'individual' | 'couple'
  onImportFromTaxReturn: () => void
  PensionSummaryComponent: ComponentType<{
    startYear: number
    monthlyAmount: number
    taxablePercentage: number
    nestingLevel: number
  }>
}

export function PensionConfigurationContent({
  values,
  onChange,
  nestingLevel,
  birthYear,
  spouseBirthYear,
  currentYear,
  planningMode,
  onImportFromTaxReturn,
  PensionSummaryComponent,
}: PensionConfigurationContentProps) {
  return (
    <>
      <PensionInputForm
        values={values}
        onChange={onChange}
        nestingLevel={nestingLevel}
        birthYear={birthYear}
        spouseBirthYear={spouseBirthYear}
        currentYear={currentYear}
        planningMode={planningMode}
        onImportFromTaxReturn={onImportFromTaxReturn}
      />

      <PensionSummaryComponent
        startYear={values.startYear}
        monthlyAmount={values.monthlyAmount}
        taxablePercentage={values.taxablePercentage}
        nestingLevel={nestingLevel}
      />
    </>
  )
}
