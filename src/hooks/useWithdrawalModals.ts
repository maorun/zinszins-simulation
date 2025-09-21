import { useState } from 'react'
import {
  createInflationExplanation,
  createWithdrawalInterestExplanation,
  createTaxExplanation,
  createIncomeTaxExplanation,
  createTaxableIncomeExplanation,
  createOtherIncomeExplanation,
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
      // Use segment-specific settings if in segmented mode, otherwise use form values
      const grundfreibetragAmount = applicableSegment?.enableGrundfreibetrag
        ? (applicableSegment.grundfreibetragPerYear?.[rowData.year] || 10908)
        : (formValue.grundfreibetragAktiv ? (formValue.grundfreibetragBetrag || 10908) : 0)

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
      // Use segment-specific settings if in segmented mode, otherwise use form values
      const grundfreibetragAmount = applicableSegment?.enableGrundfreibetrag
        ? (applicableSegment.grundfreibetragPerYear?.[rowData.year] || 10908)
        : (formValue.grundfreibetragAktiv ? (formValue.grundfreibetragBetrag || 10908) : 0)

      const explanation = createTaxableIncomeExplanation(
        rowData.entnahme,
        grundfreibetragAmount,
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
