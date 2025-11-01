import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from './ui/dialog'
import { Button } from './ui/button'
import IntroductionSection from './CalculationExplanationModal/IntroductionSection'
import CalculationStepsSection from './CalculationExplanationModal/CalculationStepsSection'
import FinalResultSection from './CalculationExplanationModal/FinalResultSection'

interface CalculationStep {
  title: string
  description: string
  calculation: string
  result: string
  backgroundColor: string
  borderColor: string
}

interface CalculationExplanationModalProps {
  open: boolean
  onClose: () => void
  title: string
  introduction: string
  steps: CalculationStep[]
  finalResult: {
    title: string
    values: Array<{ label: string, value: string }>
  }
}

const CalculationExplanationModal = ({
  open,
  onClose,
  title,
  introduction,
  steps,
  finalResult,
}: CalculationExplanationModalProps) => {
  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div>
          <div style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
            <IntroductionSection introduction={introduction} />
            <CalculationStepsSection steps={steps} />
            <FinalResultSection finalResult={finalResult} />
          </div>
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

export default CalculationExplanationModal
