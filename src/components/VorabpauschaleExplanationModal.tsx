import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from './ui/dialog'
import { Button } from './ui/button'
import type { VorabpauschaleDetails } from '../utils/simulate'
import VorabpauschaleIntroduction from './VorabpauschaleIntroduction'
import VorabpauschaleCalculationSteps from './VorabpauschaleCalculationSteps'
import VorabpauschaleResultSummary from './VorabpauschaleResultSummary'

interface VorabpauschaleExplanationModalProps {
  open: boolean
  onClose: () => void
  selectedVorabDetails: VorabpauschaleDetails | null
}

const VorabpauschaleExplanationModal = ({
  open,
  onClose,
  selectedVorabDetails,
}: VorabpauschaleExplanationModalProps) => {
  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>📊 Vorabpauschale-Berechnung Schritt für Schritt</DialogTitle>
        </DialogHeader>
        <div>
          {selectedVorabDetails && (
            <div style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
              <VorabpauschaleIntroduction />
              <VorabpauschaleCalculationSteps selectedVorabDetails={selectedVorabDetails} />
              <VorabpauschaleResultSummary selectedVorabDetails={selectedVorabDetails} />
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button>
              Verstanden
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default VorabpauschaleExplanationModal
