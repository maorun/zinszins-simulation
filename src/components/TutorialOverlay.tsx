import React, { useState } from 'react'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { type Tutorial } from '../data/tutorials'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface TutorialOverlayProps {
  /** The tutorial to display */
  tutorial: Tutorial
  /** Whether the tutorial overlay is open */
  open: boolean
  /** Callback when the tutorial is closed */
  onClose: () => void
  /** Callback when the tutorial is completed */
  onComplete: () => void
  /** Current step index (0-based) */
  currentStepIndex?: number
  /** Callback when step changes */
  onStepChange?: (stepIndex: number) => void
}

/**
 * Tutorial Progress Bar Component
 */
function TutorialProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

/**
 * Tutorial Step Action Component
 */
function TutorialStepAction({ action }: { action: string }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <p className="text-sm font-medium text-blue-900">
        <span className="mr-2">✨</span>
        {action}
      </p>
    </div>
  )
}

/**
 * Tutorial Navigation Buttons Component
 */
function TutorialNavigationButtons({
  isFirstStep,
  isLastStep,
  isSkippable,
  onPrevious,
  onSkip,
  onNext,
}: {
  isFirstStep: boolean
  isLastStep: boolean
  isSkippable: boolean
  onPrevious: () => void
  onSkip: () => void
  onNext: () => void
}) {
  return (
    <DialogFooter className="flex justify-between items-center sm:justify-between mt-6">
      <div className="flex gap-2">
        {!isFirstStep && (
          <Button variant="outline" onClick={onPrevious} size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Zurück
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        {isSkippable && !isLastStep && (
          <Button variant="ghost" onClick={onSkip} size="sm">
            <X className="h-4 w-4 mr-1" />
            Überspringen
          </Button>
        )}

        <Button onClick={onNext} size="sm">
          {isLastStep ? (
            <>
              Fertig
              <span className="ml-1">🎉</span>
            </>
          ) : (
            <>
              Weiter
              <ChevronRight className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </DialogFooter>
  )
}

/**
 * Tutorial Header Component
 */
function TutorialHeader({
  icon,
  name,
  stepIndex,
  totalSteps,
  progress,
}: {
  icon: string
  name: string
  stepIndex: number
  totalSteps: number
  progress: number
}) {
  return (
    <DialogHeader>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <div>
            <DialogTitle className="text-left">{name}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Schritt {stepIndex + 1} von {totalSteps}
            </p>
          </div>
        </div>
      </div>

      <TutorialProgressBar progress={progress} />
    </DialogHeader>
  )
}

/**
 * Tutorial Step Content Component
 */
function TutorialStepContent({ title, description, action }: { title: string; description: string; action?: string }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <DialogDescription className="text-base text-gray-700">{description}</DialogDescription>
      </div>

      {action && <TutorialStepAction action={action} />}
    </div>
  )
}

/**
 * Custom hook for tutorial navigation logic
 */
function useTutorialNavigation({
  tutorial,
  currentStepIndex,
  onStepChange,
  onComplete,
  onClose,
}: {
  tutorial: Tutorial
  currentStepIndex: number
  onStepChange?: (stepIndex: number) => void
  onComplete: () => void
  onClose: () => void
}) {
  const [localStepIndex, setLocalStepIndex] = useState(currentStepIndex)

  // Use controlled or uncontrolled step index
  const stepIndex = onStepChange ? currentStepIndex : localStepIndex
  const setStepIndex = onStepChange || setLocalStepIndex

  const currentStep = tutorial.steps[stepIndex]
  const isFirstStep = stepIndex === 0
  const isLastStep = stepIndex === tutorial.steps.length - 1
  const progress = ((stepIndex + 1) / tutorial.steps.length) * 100

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
    } else {
      setStepIndex(stepIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (!isFirstStep) {
      setStepIndex(stepIndex - 1)
    }
  }

  const handleSkip = () => {
    if (currentStep.skippable !== false) {
      onClose()
    }
  }

  return {
    stepIndex,
    currentStep,
    isFirstStep,
    isLastStep,
    progress,
    handleNext,
    handlePrevious,
    handleSkip,
  }
}

/**
 * Tutorial Overlay Component
 *
 * Displays an interactive tutorial with step-by-step guidance.
 * Uses shadcn/ui Dialog component for the overlay.
 */
export function TutorialOverlay({
  tutorial,
  open,
  onClose,
  onComplete,
  currentStepIndex = 0,
  onStepChange,
}: TutorialOverlayProps) {
  const { stepIndex, currentStep, isFirstStep, isLastStep, progress, handleNext, handlePrevious, handleSkip } =
    useTutorialNavigation({
      tutorial,
      currentStepIndex,
      onStepChange,
      onComplete,
      onClose,
    })

  return (
    <Dialog open={open} onOpenChange={(isOpen: boolean) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl">
        <TutorialHeader
          icon={tutorial.icon}
          name={tutorial.name}
          stepIndex={stepIndex}
          totalSteps={tutorial.steps.length}
          progress={progress}
        />

        <TutorialStepContent
          title={currentStep.title}
          description={currentStep.description}
          action={currentStep.action}
        />

        <TutorialNavigationButtons
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          isSkippable={currentStep.skippable !== false}
          onPrevious={handlePrevious}
          onSkip={handleSkip}
          onNext={handleNext}
        />
      </DialogContent>
    </Dialog>
  )
}

/**
 * Tutorial Step Indicator
 *
 * Small component to show current step and total steps
 */
export function TutorialStepIndicator({
  currentStep,
  totalSteps,
}: {
  currentStep: number
  totalSteps: number
}) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`h-2 w-2 rounded-full transition-colors ${
            index === currentStep ? 'bg-blue-600' : index < currentStep ? 'bg-blue-300' : 'bg-gray-300'
          }`}
        />
      ))}
    </div>
  )
}

/**
 * Tutorial Card Badge Component
 */
function TutorialCardBadge({ completed, locked }: { completed: boolean; locked: boolean }) {
  if (completed) {
    return (
      <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
        ✓ Abgeschlossen
      </div>
    )
  }
  
  if (locked) {
    return (
      <div className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded">🔒 Gesperrt</div>
    )
  }
  
  return null
}

/**
 * Tutorial Card Button Component
 */
function TutorialCardButton({
  completed,
  locked,
  onStart,
}: {
  completed: boolean
  locked: boolean
  onStart: () => void
}) {
  const buttonText = locked ? 'Nicht verfügbar' : completed ? 'Erneut starten' : 'Tutorial starten'
  
  return (
    <Button
      variant={completed ? 'outline' : 'default'}
      size="sm"
      className="w-full"
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        if (!locked) onStart()
      }}
      disabled={locked}
    >
      {buttonText}
    </Button>
  )
}

/**
 * Tutorial Card Component
 *
 * Displays a tutorial card in the tutorial selection UI
 */
export function TutorialCard({
  tutorial,
  onStart,
  completed = false,
  locked = false,
}: {
  tutorial: Tutorial
  onStart: () => void
  completed?: boolean
  locked?: boolean
}) {
  const cardClassName = locked
    ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
    : 'bg-white border-gray-300 hover:border-blue-400 hover:shadow-md cursor-pointer'
  
  return (
    <div
      className={`border rounded-lg p-4 transition-all ${cardClassName}`}
      onClick={() => !locked && onStart()}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{tutorial.icon}</span>
          <div>
            <h3 className="font-semibold text-lg">{tutorial.name}</h3>
            <p className="text-sm text-gray-600">
              {tutorial.estimatedMinutes} Min. • {tutorial.steps.length} Schritte
            </p>
          </div>
        </div>
        <TutorialCardBadge completed={completed} locked={locked} />
      </div>

      <p className="text-sm text-gray-700 mb-4">{tutorial.description}</p>

      {tutorial.prerequisites && tutorial.prerequisites.length > 0 && (
        <div className="text-xs text-gray-500 mb-3">
          Voraussetzung: {tutorial.prerequisites.map((p: string) => p).join(', ')}
        </div>
      )}

      <TutorialCardButton completed={completed} locked={locked} onStart={onStart} />
    </div>
  )
}
