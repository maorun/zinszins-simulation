import { useState } from 'react'
import type { VorabpauschaleDetails } from '../utils/simulate'
import type { CalculationExplanation } from '../components/calculationHelpers'

export function useSimulationModals() {
  const [showVorabpauschaleModal, setShowVorabpauschaleModal] = useState(false)
  const [selectedVorabDetails, setSelectedVorabDetails] = useState<VorabpauschaleDetails | null>(null)
  const [showCalculationModal, setShowCalculationModal] = useState(false)
  const [calculationDetails, setCalculationDetails] = useState<CalculationExplanation | null>(null)

  const showVorabpauschaleInfo = (details: VorabpauschaleDetails) => {
    setSelectedVorabDetails(details)
    setShowVorabpauschaleModal(true)
  }

  const hideVorabpauschaleInfo = () => {
    setShowVorabpauschaleModal(false)
  }

  const showCalculationInfo = (explanation: CalculationExplanation | null) => {
    if (explanation) {
      setCalculationDetails(explanation)
      setShowCalculationModal(true)
    }
  }

  const hideCalculationInfo = () => {
    setShowCalculationModal(false)
  }

  return {
    showVorabpauschaleModal,
    selectedVorabDetails,
    showCalculationModal,
    calculationDetails,
    showVorabpauschaleInfo,
    hideVorabpauschaleInfo,
    showCalculationInfo,
    hideCalculationInfo,
  }
}
