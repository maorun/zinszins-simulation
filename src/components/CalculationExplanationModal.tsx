import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from './ui/dialog'
import { Button } from './ui/button'
import IntroductionSection from './CalculationExplanationModal/IntroductionSection'
import CalculationStepsSection from './CalculationExplanationModal/CalculationStepsSection'
import FinalResultSection from './CalculationExplanationModal/FinalResultSection'

interface CalculationStep {
  readonly title: string
  readonly description: string
  readonly calculation: string
  readonly result: string
  readonly backgroundColor: string
  readonly borderColor: string
}

interface CalculationExplanationModalProps {
  open: boolean
  onClose: () => void
  title: string
  introduction: string
  steps: readonly CalculationStep[]
  finalResult: {
    readonly title: string
    readonly values: ReadonlyArray<{ readonly label: string; readonly value: string }>
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
          <div className="text-[0.95rem] leading-[1.6]">
            <IntroductionSection introduction={introduction} />
            <CalculationStepsSection steps={steps} />
            <FinalResultSection finalResult={finalResult} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Verstanden</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CalculationExplanationModal
