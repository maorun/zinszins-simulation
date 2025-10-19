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

    // Special case: Vorabpauschale opens a different modal
    if (explanationType === 'vorabpauschale' && data.vorabpauschaleDetails) {
      setSelectedVorabDetails(data.vorabpauschaleDetails)
      setShowVorabpauschaleModal(true)
      return
    }

    // Map explanation types to their handlers
    const explanationHandlers: Record<string, () => CalculationExplanation | null> = {
      inflation: () => handleInflationExplanation({ rowData: data, context, applicableSegment }),
      interest: () => handleInterestExplanation({ rowData: data, context, applicableSegment }),
      tax: () => handleTaxExplanation({ rowData: data, context }),
      incomeTax: () => handleIncomeTaxExplanation({ rowData: data, context, applicableSegment }),
      taxableIncome: () => handleTaxableIncomeExplanation({ rowData: data, context }),
      otherIncome: () => handleOtherIncomeExplanation({ rowData: data }),
      statutoryPension: () => handleStatutoryPensionExplanation({ rowData: data }),
      endkapital: () => handleEndkapitalExplanation({ rowData: data }),
      healthCareInsurance: () => handleHealthCareInsuranceExplanation({ rowData: data }),
    }

    // Get handler for the explanation type
    const handler = explanationHandlers[explanationType]
    if (!handler) {
      return
    }

    // Generate and show explanation
    const explanation = handler()
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
