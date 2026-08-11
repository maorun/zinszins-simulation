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

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2">
      {STEPS.map((step, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep
        const isUpcoming = index > currentStep

        return (
          <div key={index} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`
                  flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-sm sm:text-base font-semibold transition-all
                  ${isCompleted ? 'bg-primary text-primary-foreground' : ''}
                  ${isCurrent ? 'bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110' : ''}
                  ${isUpcoming ? 'bg-muted text-muted-foreground' : ''}
                `}
              >
                {isCompleted ? '✓' : step.icon}
              </div>
              <span
                className={`text-xs hidden sm:block ${isCurrent ? 'font-semibold text-primary' : 'text-muted-foreground'}`}
              >
                {step.shortTitle}
              </span>
            </div>
            {index < totalSteps - 1 && (
              <div
                className={`h-0.5 w-6 sm:w-10 mx-1 transition-colors ${isCompleted ? 'bg-primary' : 'bg-muted'}`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function WizardNavigation({ onSwitchToAdvanced }: WizardNavigationProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === STEPS.length - 1

  const goNext = () => {
    if (!isLastStep) setCurrentStep(prev => prev + 1)
  }

  const goBack = () => {
    if (!isFirstStep) setCurrentStep(prev => prev - 1)
  }

  return (
    <div className="space-y-4">
      {/* Sticky header with step indicator */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200">
        <div className="px-2 sm:px-3 mx-auto max-w-full md:px-4 md:max-w-3xl lg:px-6 lg:max-w-5xl xl:max-w-7xl py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <StepIndicator currentStep={currentStep} totalSteps={STEPS.length} />
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

      {/* Step content */}
      <div className="px-2 sm:px-3 mx-auto max-w-full md:px-4 md:max-w-2xl lg:px-6 lg:max-w-3xl xl:max-w-4xl">
        <div className="bg-card rounded-xl border shadow-sm p-6 sm:p-8">
          {currentStep === 0 && <WizardStep1Zeitspanne />}
          {currentStep === 1 && <WizardStep2Sparplan />}
          {currentStep === 2 && <WizardStep3Entnahme />}
          {currentStep === 3 && <WizardStep4Ergebnis onSwitchToAdvanced={onSwitchToAdvanced} />}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center mt-4 px-1">
          <Button variant="outline" onClick={goBack} disabled={isFirstStep} className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Zurück
          </Button>

          <span className="text-sm text-muted-foreground">
            Schritt {currentStep + 1} von {STEPS.length}
          </span>

          {!isLastStep ? (
            <Button onClick={goNext} className="gap-2">
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
