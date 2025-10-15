import CalculationExplanationModal from './CalculationExplanationModal'
import VorabpauschaleExplanationModal from './VorabpauschaleExplanationModal'
import type { CalculationExplanation } from '../hooks/useWithdrawalModals.types'
import type { VorabpauschaleDetails } from '../utils/simulate'

interface EntnahmeSimulationModalsProps {
  showCalculationModal: boolean
  setShowCalculationModal: (show: boolean) => void
  calculationDetails: CalculationExplanation | null
  showVorabpauschaleModal: boolean
  setShowVorabpauschaleModal: (show: boolean) => void
  selectedVorabDetails: VorabpauschaleDetails | null
}

/**
 * Component for rendering withdrawal simulation modals
 * Extracted from EntnahmeSimulationsAusgabe to reduce component size
 */
export function EntnahmeSimulationModals({
  showCalculationModal,
  setShowCalculationModal,
  calculationDetails,
  showVorabpauschaleModal,
  setShowVorabpauschaleModal,
  selectedVorabDetails,
}: EntnahmeSimulationModalsProps) {
  return (
    <>
      {/* Calculation Explanation Modal */}
      {calculationDetails && (
        <CalculationExplanationModal
          open={showCalculationModal}
          onClose={() => setShowCalculationModal(false)}
          title={calculationDetails.title}
          introduction={calculationDetails.introduction}
          steps={calculationDetails.steps}
          finalResult={calculationDetails.finalResult}
        />
      )}

      {/* Vorabpauschale Explanation Modal */}
      {selectedVorabDetails && (
        <VorabpauschaleExplanationModal
          open={showVorabpauschaleModal}
          onClose={() => setShowVorabpauschaleModal(false)}
          selectedVorabDetails={selectedVorabDetails}
        />
      )}
    </>
  )
}
