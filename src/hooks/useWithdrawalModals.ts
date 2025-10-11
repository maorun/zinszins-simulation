import { useState } from 'react'
import {
  findApplicableSegment,
  handleInflationExplanation,
  handleInterestExplanation,
  handleTaxExplanation,
  handleIncomeTaxExplanation,
  handleTaxableIncomeExplanation,
  handleOtherIncomeExplanation,
  handleStatutoryPensionExplanation,
  handleEndkapitalExplanation,
  handleHealthCareInsuranceExplanation,
} from './useWithdrawalModals.helpers'
import type {
  CalculationExplanation,
  VorabpauschaleDetails,
  WithdrawalSegment,
  WithdrawalData,
  RowData,
} from './useWithdrawalModals.types'

/**
 * Custom hook for managing modal states and calculation explanations
 */
export function useWithdrawalModals(
  // Using a more lenient type to accept different form value shapes
  formValue: {
    inflationsrate?: number
    rendite?: number
    einkommensteuersatz?: number
  },
  useSegmentedWithdrawal: boolean,
  withdrawalSegments: WithdrawalSegment[],
  withdrawalData: WithdrawalData | null,
  startOfIndependence: number,
  steuerlast: number,
  teilfreistellungsquote: number,
  grundfreibetragAktiv: boolean,
  grundfreibetragBetrag: number,
) {
  // State for calculation explanation modals
  const [showCalculationModal, setShowCalculationModal] = useState(false)
  const [calculationDetails, setCalculationDetails] = useState<CalculationExplanation | null>(null)
  const [showVorabpauschaleModal, setShowVorabpauschaleModal] = useState(false)
  const [selectedVorabDetails, setSelectedVorabDetails] = useState<VorabpauschaleDetails | null>(null)

  // Handle calculation explanation clicks
  const handleCalculationInfoClick = (explanationType: string, rowData: RowData) => {
    // Find applicable segment for this year
    const applicableSegment = findApplicableSegment(
      useSegmentedWithdrawal,
      withdrawalSegments,
      rowData.year,
    )

    // Create context for handlers
    const context = {
      formValue,
      withdrawalData,
      startOfIndependence,
      steuerlast,
      teilfreistellungsquote,
      grundfreibetragAktiv,
      grundfreibetragBetrag,
    }

    // Handle different explanation types
    let explanation = null

    if (explanationType === 'inflation') {
      explanation = handleInflationExplanation({ rowData, context, applicableSegment })
    }
    else if (explanationType === 'interest') {
      explanation = handleInterestExplanation({ rowData, context, applicableSegment })
    }
    else if (explanationType === 'tax') {
      explanation = handleTaxExplanation({ rowData, context })
    }
    else if (explanationType === 'incomeTax') {
      explanation = handleIncomeTaxExplanation({ rowData, context, applicableSegment })
    }
    else if (explanationType === 'taxableIncome') {
      explanation = handleTaxableIncomeExplanation({ rowData, context })
    }
    else if (explanationType === 'otherIncome') {
      explanation = handleOtherIncomeExplanation({ rowData })
    }
    else if (explanationType === 'statutoryPension') {
      explanation = handleStatutoryPensionExplanation({ rowData })
    }
    else if (explanationType === 'endkapital') {
      explanation = handleEndkapitalExplanation({ rowData })
    }
    else if (explanationType === 'healthCareInsurance') {
      explanation = handleHealthCareInsuranceExplanation({ rowData })
    }
    else if (explanationType === 'vorabpauschale' && rowData.vorabpauschaleDetails) {
      setSelectedVorabDetails(rowData.vorabpauschaleDetails)
      setShowVorabpauschaleModal(true)
      return
    }

    // Show modal if explanation was generated
    if (explanation) {
      setCalculationDetails(explanation)
      setShowCalculationModal(true)
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
