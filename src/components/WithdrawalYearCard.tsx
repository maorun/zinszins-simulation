import { formatWithInflation } from '../utils/format-with-inflation'
import type { WithdrawalFormValue } from '../utils/config-storage'
import {
  OtherIncomeSection,
  HealthCareInsuranceSection,
  StatutoryPensionSection,
} from './withdrawal-card-sections'
import { YearHeader } from './withdrawal-card/YearHeader'
import { FinancialDetailsSection } from './withdrawal-card/FinancialDetailsSection'
import { TaxSection } from './withdrawal-card/TaxSection'
import { IncomeTaxSection } from './withdrawal-card/IncomeTaxSection'

interface WithdrawalYearCardProps {
  rowData: {
    year: number
    startkapital: number
    endkapital: number
    entnahme: number
    monatlicheEntnahme?: number
    inflationAnpassung?: number
    portfolioAnpassung?: number
    zinsen: number
    bezahlteSteuer: number
    vorabpauschale?: number
    genutzterFreibetrag: number
    einkommensteuer?: number
    genutzterGrundfreibetrag?: number
    otherIncome?: {
      totalNetAmount: number
      totalTaxAmount: number
      sourceCount: number
    }
    healthCareInsurance?: {
      totalAnnual: number
      healthInsuranceAnnual: number
      careInsuranceAnnual: number
      totalMonthly: number
      insuranceType: 'statutory' | 'private'
      effectiveHealthInsuranceRate?: number
      effectiveCareInsuranceRate?: number
      includesEmployerContribution?: boolean
      inflationAdjustmentFactor?: number
    }
    statutoryPension?: {
      grossAnnualAmount: number
      netAnnualAmount: number
      incomeTax: number
    }
    guenstigerPruefungResultRealizedGains?: {
      isFavorable: string
      usedTaxRate: number
      explanation: string
    }
  }
  formValue: WithdrawalFormValue
  allYears: Array<number | null | undefined>
  onCalculationInfoClick: (explanationType: string, rowData: unknown) => void
}

function TaxAndIncomeSections({
  rowData,
  formValue,
  allYears,
  onCalculationInfoClick,
  isGrundfreibetragEnabled,
}: WithdrawalYearCardProps & { isGrundfreibetragEnabled: boolean }) {
  return (
    <>
      <TaxSection
        rowData={{
          year: rowData.year,
          zinsen: rowData.zinsen,
          bezahlteSteuer: rowData.bezahlteSteuer,
          vorabpauschale: rowData.vorabpauschale,
          genutzterFreibetrag: rowData.genutzterFreibetrag,
          guenstigerPruefungResultRealizedGains: rowData.guenstigerPruefungResultRealizedGains,
        }}
        formValue={formValue}
        allYears={allYears}
        onCalculationInfoClick={onCalculationInfoClick}
        formatWithInflation={formatWithInflation}
      />
      <IncomeTaxSection
        rowData={{
          einkommensteuer: rowData.einkommensteuer,
          genutzterGrundfreibetrag: rowData.genutzterGrundfreibetrag,
        }}
        isGrundfreibetragEnabled={isGrundfreibetragEnabled}
        onCalculationInfoClick={onCalculationInfoClick}
      />
      <OtherIncomeSection
        otherIncome={rowData.otherIncome}
        onCalculationInfoClick={onCalculationInfoClick}
        rowData={rowData}
      />
      <HealthCareInsuranceSection
        healthCareInsurance={rowData.healthCareInsurance}
        onCalculationInfoClick={onCalculationInfoClick}
        rowData={rowData}
      />
      <StatutoryPensionSection
        statutoryPension={rowData.statutoryPension}
        onCalculationInfoClick={onCalculationInfoClick}
        rowData={rowData}
      />
    </>
  )
}

function CardSections({
  rowData,
  formValue,
  allYears,
  onCalculationInfoClick,
  isGrundfreibetragEnabled,
}: WithdrawalYearCardProps & { isGrundfreibetragEnabled: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <FinancialDetailsSection
        rowData={{
          startkapital: rowData.startkapital,
          entnahme: rowData.entnahme,
          monatlicheEntnahme: rowData.monatlicheEntnahme,
          inflationAnpassung: rowData.inflationAnpassung,
          portfolioAnpassung: rowData.portfolioAnpassung,
          year: rowData.year,
        }}
        formValue={formValue}
        allYears={allYears}
        onCalculationInfoClick={onCalculationInfoClick}
        formatWithInflation={formatWithInflation}
      />
      <TaxAndIncomeSections
        rowData={rowData}
        formValue={formValue}
        allYears={allYears}
        onCalculationInfoClick={onCalculationInfoClick}
        isGrundfreibetragEnabled={isGrundfreibetragEnabled}
      />
    </div>
  )
}

/**
 * Card component for displaying withdrawal data for a single year
 */
export function WithdrawalYearCard({
  rowData,
  formValue,
  allYears,
  onCalculationInfoClick,
}: WithdrawalYearCardProps) {
  const isGrundfreibetragEnabled = formValue.grundfreibetragAktiv || false

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm transition-shadow hover:shadow-md">
      <YearHeader
        year={rowData.year}
        endkapital={rowData.endkapital}
        allYears={allYears}
        formValue={formValue}
        onCalculationInfoClick={onCalculationInfoClick}
        rowData={rowData}
        formatWithInflation={formatWithInflation}
      />
      <CardSections
        rowData={rowData}
        formValue={formValue}
        allYears={allYears}
        onCalculationInfoClick={onCalculationInfoClick}
        isGrundfreibetragEnabled={isGrundfreibetragEnabled}
      />
    </div>
  )
}
