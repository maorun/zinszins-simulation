import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from './ui/dialog'
import { Button } from './ui/button'

interface CalculationStepProps {
  step: {
    title: string
    description: string
    calculation: string
    result: string
    backgroundColor: string
    borderColor: string
  }
}

function CalculationStep({ step }: CalculationStepProps) {
  return (
    <div
      style={{
        background: step.backgroundColor,
        padding: '12px',
        borderRadius: '6px',
        border: `1px solid ${step.borderColor}`,
      }}
    >
      <strong>{step.title}</strong>
      <div style={{ marginTop: '8px', fontSize: '0.9rem' }}>{step.description}</div>
      <div
        style={{
          marginTop: '8px',
          padding: '8px',
          background: '#fff',
          borderRadius: '4px',
          fontFamily: 'monospace',
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: step.calculation }} />
        =
        <strong>{step.result}</strong>
      </div>
    </div>
  )
}

interface IntroductionProps {
  introduction: string
}

function Introduction({ introduction }: IntroductionProps) {
  return (
    <div
      style={{
        background: '#f8f9fa',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #e9ecef',
      }}
    >
      <h5 style={{ color: '#1976d2', marginBottom: '12px' }}>🎯 Erklärung</h5>
      <p style={{ margin: '0' }}>{introduction}</p>
    </div>
  )
}

interface FinalResultProps {
  finalResult: {
    title: string
    values: Array<{ label: string, value: string }>
  }
}

function FinalResult({ finalResult }: FinalResultProps) {
  return (
    <div
      style={{
        background: '#e8f5e8',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #81c784',
      }}
    >
      <h5 style={{ color: '#2e7d32', marginBottom: '12px' }}>
        ✅
        {finalResult.title}
      </h5>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
        }}
      >
        {finalResult.values.map((item, index) => (
          <div key={index}>
            <strong>
              {item.label}
              :
            </strong>
            <br />
            {item.value}
          </div>
        ))}
      </div>
    </div>
  )
}

interface CalculationExplanationModalProps {
  open: boolean
  onClose: () => void
  title: string
  introduction: string
  steps: Array<CalculationStepProps['step']>
  finalResult: FinalResultProps['finalResult']
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
        <div style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
          <Introduction introduction={introduction} />
          <div style={{ marginBottom: '24px' }}>
            <h5 style={{ color: '#1976d2', marginBottom: '16px' }}>
              🧮 Schritt-für-Schritt Berechnung
            </h5>
            <div
              style={{
                display: 'grid',
                gap: '16px',
                gridTemplateColumns: '1fr',
                maxWidth: '100%',
              }}
            >
              {steps.map((step, index) => (
                <CalculationStep key={index} step={step} />
              ))}
            </div>
          </div>
          <FinalResult finalResult={finalResult} />
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
