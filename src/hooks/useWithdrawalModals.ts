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
  const handleCalculationInfoClick = (explanationType: string, rowData: unknown) => {
    // Type guard to ensure rowData has the expected shape
    if (!rowData || typeof rowData !== 'object' || !('year' in rowData)) {
      return
    }
    const data = rowData as RowData
    // Find applicable segment for this year
    const applicableSegment = findApplicableSegment(
      useSegmentedWithdrawal,
      withdrawalSegments,
      data.year,
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
      explanation = handleInflationExplanation({ rowData: data, context, applicableSegment })
    }
    else if (explanationType === 'interest') {
      explanation = handleInterestExplanation({ rowData: data, context, applicableSegment })
    }
    else if (explanationType === 'tax') {
      explanation = handleTaxExplanation({ rowData: data, context })
    }
    else if (explanationType === 'incomeTax') {
      explanation = handleIncomeTaxExplanation({ rowData: data, context, applicableSegment })
    }
    else if (explanationType === 'taxableIncome') {
      explanation = handleTaxableIncomeExplanation({ rowData: data, context })
    }
    else if (explanationType === 'otherIncome') {
      explanation = handleOtherIncomeExplanation({ rowData: data })
    }
    else if (explanationType === 'statutoryPension') {
      explanation = handleStatutoryPensionExplanation({ rowData: data })
    }
    else if (explanationType === 'endkapital') {
      explanation = handleEndkapitalExplanation({ rowData: data })
    }
    else if (explanationType === 'healthCareInsurance') {
      explanation = handleHealthCareInsuranceExplanation({ rowData: data })
    }
    else if (explanationType === 'vorabpauschale' && data.vorabpauschaleDetails) {
      setSelectedVorabDetails(data.vorabpauschaleDetails)
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
