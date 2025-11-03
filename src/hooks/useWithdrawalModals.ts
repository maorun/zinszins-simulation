import { useState } from 'react'
import { createHandlerContext, processCalculationInfoClick } from './useWithdrawalModals.handlers'
import type {
  CalculationExplanation,
  VorabpauschaleDetails,
  WithdrawalSegment,
  WithdrawalData,
} from './useWithdrawalModals.types'

/**
 * Initialize modal states
 */
function useModalStates() {
  const [showCalculationModal, setShowCalculationModal] = useState(false)
  const [calculationDetails, setCalculationDetails] = useState<CalculationExplanation | null>(null)
  const [showVorabpauschaleModal, setShowVorabpauschaleModal] = useState(false)
  const [selectedVorabDetails, setSelectedVorabDetails] = useState<VorabpauschaleDetails | null>(null)

  return {
    showCalculationModal,
    setShowCalculationModal,
    calculationDetails,
    setCalculationDetails,
    showVorabpauschaleModal,
    setShowVorabpauschaleModal,
    selectedVorabDetails,
    setSelectedVorabDetails,
  }
}

/**
 * Create the handleCalculationInfoClick callback
 */
function createCalculationInfoClickHandler(
  formValue: {
    inflationsrate?: number
    rendite?: number
    einkommensteuersatz?: number
  },
  withdrawalData: WithdrawalData | null,
  startOfIndependence: number,
  steuerlast: number,
  teilfreistellungsquote: number,
  grundfreibetragAktiv: boolean,
  grundfreibetragBetrag: number,
  useSegmentedWithdrawal: boolean,
  withdrawalSegments: WithdrawalSegment[],
  setCalculationDetails: (details: CalculationExplanation | null) => void,
  setShowCalculationModal: (show: boolean) => void,
  setSelectedVorabDetails: (details: VorabpauschaleDetails | null) => void,
  setShowVorabpauschaleModal: (show: boolean) => void,
) {
  return (explanationType: string, rowData: unknown) => {
    const context = createHandlerContext(
      formValue,
      withdrawalData,
      startOfIndependence,
      steuerlast,
      teilfreistellungsquote,
      grundfreibetragAktiv,
      grundfreibetragBetrag,
    )

    const result = processCalculationInfoClick(
      explanationType,
      rowData,
      useSegmentedWithdrawal,
      withdrawalSegments,
      context,
    )

    if (result.showCalculation) {
      setCalculationDetails(result.calculationDetails)
      setShowCalculationModal(true)
    }
    if (result.showVorabpauschale) {
      setSelectedVorabDetails(result.vorabDetails)
      setShowVorabpauschaleModal(true)
    }
  }
}

/**
 * Custom hook for managing modal states and calculation explanations
 */
export function useWithdrawalModals(
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
  const modalStates = useModalStates()

  const handleCalculationInfoClick = createCalculationInfoClickHandler(
    formValue,
    withdrawalData,
    startOfIndependence,
    steuerlast,
    teilfreistellungsquote,
    grundfreibetragAktiv,
    grundfreibetragBetrag,
    useSegmentedWithdrawal,
    withdrawalSegments,
    modalStates.setCalculationDetails,
    modalStates.setShowCalculationModal,
    modalStates.setSelectedVorabDetails,
    modalStates.setShowVorabpauschaleModal,
  )

  return {
    showCalculationModal: modalStates.showCalculationModal,
    setShowCalculationModal: modalStates.setShowCalculationModal,
    calculationDetails: modalStates.calculationDetails,
    showVorabpauschaleModal: modalStates.showVorabpauschaleModal,
    setShowVorabpauschaleModal: modalStates.setShowVorabpauschaleModal,
    selectedVorabDetails: modalStates.selectedVorabDetails,
    handleCalculationInfoClick,
  }
}
