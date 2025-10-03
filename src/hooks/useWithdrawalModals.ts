import { useState } from 'react'
import {
  createInflationExplanation,
  createWithdrawalInterestExplanation,
  createTaxExplanation,
  createIncomeTaxExplanation,
  createTaxableIncomeExplanation,
  createOtherIncomeExplanation,
  createStatutoryPensionExplanation,
  createEndkapitalExplanation,
} from '../components/calculationHelpers'

/**
 * Custom hook for managing modal states and calculation explanations
 */
export function useWithdrawalModals(
  formValue: any,
  useSegmentedWithdrawal: boolean,
  withdrawalSegments: any[],
  withdrawalData: any,
  startOfIndependence: number,
  steuerlast: number,
  teilfreistellungsquote: number,
  grundfreibetragAktiv: boolean,
  grundfreibetragBetrag: number,
) {
  // State for calculation explanation modals
  const [showCalculationModal, setShowCalculationModal] = useState(false)
  const [calculationDetails, setCalculationDetails] = useState<any>(null)
  const [showVorabpauschaleModal, setShowVorabpauschaleModal] = useState(false)
  const [selectedVorabDetails, setSelectedVorabDetails] = useState<any>(null)

  // Handle calculation explanation clicks
  const handleCalculationInfoClick = (explanationType: string, rowData: any) => {
    // For segmented withdrawal, find the segment that applies to this year
    let applicableSegment: any = null
    if (useSegmentedWithdrawal) {
      applicableSegment = withdrawalSegments.find(segment =>
        rowData.year >= segment.startYear && rowData.year <= segment.endYear,
      )
    }

    if (explanationType === 'inflation' && rowData.inflationAnpassung !== undefined) {
      const yearsPassed = rowData.year - startOfIndependence - 1
      const baseAmount = withdrawalData ? withdrawalData.startingCapital * 0.04 : 0 // Estimate base amount
      const inflationRate = applicableSegment?.inflationConfig?.inflationRate || formValue.inflationsrate / 100 || 0.02

      const explanation = createInflationExplanation(
        baseAmount,
        inflationRate,
        yearsPassed,
        rowData.inflationAnpassung,
      )
      setCalculationDetails(explanation)
      setShowCalculationModal(true)
    }
    else if (explanationType === 'interest' && rowData.zinsen) {
      const returnRate = applicableSegment?.returnConfig?.mode === 'fixed'
        ? applicableSegment.returnConfig.fixedRate * 100
        : formValue.rendite || 5

      const explanation = createWithdrawalInterestExplanation(
        rowData.startkapital,
        rowData.zinsen,
        returnRate,
        rowData.year,
      )
      setCalculationDetails(explanation)
      setShowCalculationModal(true)
    }
    else if (explanationType === 'tax' && rowData.bezahlteSteuer) {
      // For withdrawal phase tax explanation - this is usually capital gains tax
      const explanation = createTaxExplanation(
        rowData.bezahlteSteuer,
        rowData.bezahlteSteuer / (steuerlast * (1 - teilfreistellungsquote)), // Estimate vorabpauschale
        steuerlast,
        teilfreistellungsquote,
        rowData.genutzterFreibetrag || 2000,
        rowData.year,
      )
      setCalculationDetails(explanation)
      setShowCalculationModal(true)
    }
    else if (explanationType === 'incomeTax' && rowData.einkommensteuer !== undefined) {
      // Use global Grundfreibetrag settings
      const grundfreibetragAmount = grundfreibetragAktiv ? grundfreibetragBetrag : 0

      const incomeTaxRate = applicableSegment?.incomeTaxRate
        ? applicableSegment.incomeTaxRate * 100
        : formValue.einkommensteuersatz || 18 // Default to 18% instead of 25%

      const explanation = createIncomeTaxExplanation(
        rowData.entnahme,
        grundfreibetragAmount,
        incomeTaxRate,
        rowData.einkommensteuer,
        rowData.genutzterGrundfreibetrag || 0,
      )
      setCalculationDetails(explanation)
      setShowCalculationModal(true)
    }
    else if (explanationType === 'taxableIncome') {
      // Use global Grundfreibetrag settings
      const grundfreibetragAmount = grundfreibetragAktiv ? grundfreibetragBetrag : 0

      // Get statutory pension taxable amount if available
      const statutoryPensionTaxableAmount = rowData.statutoryPension?.taxableAmount || 0

      // Get other income gross amount if available
      const otherIncomeGrossAmount = rowData.otherIncome?.sources?.reduce(
        (sum: number, source: any) => sum + (source.grossAnnualAmount || 0),
        0,
      ) || 0

      const explanation = createTaxableIncomeExplanation(
        rowData.entnahme,
        grundfreibetragAmount,
        statutoryPensionTaxableAmount,
        otherIncomeGrossAmount,
      )
      setCalculationDetails(explanation)
      setShowCalculationModal(true)
    }
    else if (explanationType === 'otherIncome' && rowData.otherIncome) {
      const explanation = createOtherIncomeExplanation(
        rowData.otherIncome.totalNetAmount,
        rowData.otherIncome.totalTaxAmount,
        rowData.otherIncome.sourceCount,
        rowData.otherIncome,
      )
      setCalculationDetails(explanation)
      setShowCalculationModal(true)
    }
    else if (explanationType === 'statutoryPension' && rowData.statutoryPension) {
      const explanation = createStatutoryPensionExplanation(
        rowData.statutoryPension.grossAnnualAmount,
        rowData.statutoryPension.netAnnualAmount,
        rowData.statutoryPension.incomeTax,
        rowData.statutoryPension.taxableAmount,
        rowData.year,
      )
      setCalculationDetails(explanation)
      setShowCalculationModal(true)
    }
    else if (explanationType === 'endkapital') {
      // For withdrawal phase, calculate the Endkapital explanation
      // Endkapital = Startkapital + Zinsen - Entnahme - Steuern - Kosten
      const zinsen = rowData.zinsen || 0
      const entnahme = rowData.entnahme || 0
      const bezahlteSteuer = rowData.bezahlteSteuer || 0
      const kosten = (rowData.terCosts || 0) + (rowData.transactionCosts || 0)

      const explanation = createEndkapitalExplanation(
        rowData.endkapital,
        rowData.startkapital,
        -entnahme, // Negative because it's a withdrawal (reduces capital)
        zinsen,
        bezahlteSteuer + kosten, // Total costs including taxes
        rowData.year,
      )
      setCalculationDetails(explanation)
      setShowCalculationModal(true)
    }
    else if (explanationType === 'vorabpauschale' && rowData.vorabpauschaleDetails) {
      setSelectedVorabDetails(rowData.vorabpauschaleDetails)
      setShowVorabpauschaleModal(true)
    }
  }

  return {
    showCalculationModal,
    setShowCalculationModal,
    calculationDetails,
    showVorabpauschaleModal,
    setShowVorabpauschaleModal,
    selectedVorabDetails,
    handleCalculationInfoClick,
  }
}
