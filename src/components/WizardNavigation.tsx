import { useState } from 'react'
import { Button } from './ui/button'
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react'
import { WizardStep1Zeitspanne } from './wizard/WizardStep1Zeitspanne'
import { WizardStep2Sparplan } from './wizard/WizardStep2Sparplan'
import { WizardStep3Entnahme } from './wizard/WizardStep3Entnahme'
import { WizardStep4Ergebnis } from './wizard/WizardStep4Ergebnis'

interface WizardNavigationProps {
  onSwitchToAdvanced: () => void
}

interface WizardStep {
  title: string
  icon: string
  shortTitle: string
}

const STEPS: WizardStep[] = [
  { icon: '📅', title: 'Zeitspanne', shortTitle: 'Zeit' },
  { icon: '💰', title: 'Sparplan', shortTitle: 'Sparen' },
  { icon: '🏦', title: 'Entnahme', shortTitle: 'Entnahme' },
  { icon: '📊', title: 'Ergebnis', shortTitle: 'Ergebnis' },
]

function StepCircle({ step, index, currentStep }: { step: WizardStep; index: number; currentStep: number }) {
  const isCompleted = index < currentStep
  const isCurrent = index === currentStep
  const baseClass = 'flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-sm sm:text-base font-semibold transition-all'
  const stateClass = isCompleted
    ? 'bg-primary text-primary-foreground'
    : isCurrent
      ? 'bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110'
      : 'bg-muted text-muted-foreground'

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`${baseClass} ${stateClass}`}>{isCompleted ? '✓' : step.icon}</div>
      <span className={`text-xs hidden sm:block ${isCurrent ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
        {step.shortTitle}
      </span>
    </div>
  )
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2">
      {STEPS.map((step, index) => (
        <div key={index} className="flex items-center">
          <StepCircle step={step} index={index} currentStep={currentStep} />
          {index < STEPS.length - 1 && (
            <div className={`h-0.5 w-6 sm:w-10 mx-1 transition-colors ${index < currentStep ? 'bg-primary' : 'bg-muted'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function WizardStickyHeader({ currentStep, onSwitchToAdvanced }: { currentStep: number; onSwitchToAdvanced: () => void }) {
  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200">
      <div className="px-2 sm:px-3 mx-auto max-w-full md:px-4 md:max-w-3xl lg:px-6 lg:max-w-5xl xl:max-w-7xl py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <StepIndicator currentStep={currentStep} />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSwitchToAdvanced}
            className="ml-2 text-muted-foreground hover:text-foreground shrink-0"
            title="Zur vollständigen Ansicht wechseln"
          >
            <Settings className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline text-xs">Erweitert</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

function WizardStepContent({ currentStep, onSwitchToAdvanced }: { currentStep: number; onSwitchToAdvanced: () => void }) {
  return (
    <div className="bg-card rounded-xl border shadow-sm p-6 sm:p-8">
      {currentStep === 0 && <WizardStep1Zeitspanne />}
      {currentStep === 1 && <WizardStep2Sparplan />}
      {currentStep === 2 && <WizardStep3Entnahme />}
      {currentStep === 3 && <WizardStep4Ergebnis onSwitchToAdvanced={onSwitchToAdvanced} />}
    </div>
  )
}

export function WizardNavigation({ onSwitchToAdvanced }: WizardNavigationProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === STEPS.length - 1

  return (
    <div className="space-y-4">
      <WizardStickyHeader currentStep={currentStep} onSwitchToAdvanced={onSwitchToAdvanced} />
      <div className="px-2 sm:px-3 mx-auto max-w-full md:px-4 md:max-w-2xl lg:px-6 lg:max-w-3xl xl:max-w-4xl">
        <WizardStepContent currentStep={currentStep} onSwitchToAdvanced={onSwitchToAdvanced} />
        <div className="flex justify-between items-center mt-4 px-1">
          <Button variant="outline" onClick={() => setCurrentStep(p => p - 1)} disabled={isFirstStep} className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Zurück
          </Button>
          <span className="text-sm text-muted-foreground">Schritt {currentStep + 1} von {STEPS.length}</span>
          {!isLastStep ? (
            <Button onClick={() => setCurrentStep(p => p + 1)} className="gap-2">
              Weiter
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={onSwitchToAdvanced} variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Alle Einstellungen
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
