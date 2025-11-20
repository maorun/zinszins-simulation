import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TutorialOverlay, TutorialCard, TutorialStepIndicator } from './TutorialOverlay'
import { type Tutorial } from '../data/tutorials'

const mockTutorial: Tutorial = {
  id: 'test-tutorial',
  name: 'Test Tutorial',
  description: 'A test tutorial for testing purposes',
  category: 'getting-started',
  icon: '🧪',
  estimatedMinutes: 5,
  steps: [
    {
      id: 'step-1',
      title: 'First Step',
      description: 'This is the first step',
      action: 'Do something',
      skippable: true,
    },
    {
      id: 'step-2',
      title: 'Second Step',
      description: 'This is the second step',
      skippable: false,
    },
    {
      id: 'step-3',
      title: 'Final Step',
      description: 'This is the final step',
    },
  ],
}

describe('TutorialOverlay', () => {
  it('should render tutorial overlay when open', () => {
    const onClose = vi.fn()
    const onComplete = vi.fn()

    render(<TutorialOverlay tutorial={mockTutorial} open={true} onClose={onClose} onComplete={onComplete} />)

    expect(screen.getByText('Test Tutorial')).toBeInTheDocument()
    expect(screen.getByText('Schritt 1 von 3')).toBeInTheDocument()
    expect(screen.getByText('First Step')).toBeInTheDocument()
    expect(screen.getByText('This is the first step')).toBeInTheDocument()
  })

  it('should not render tutorial overlay when closed', () => {
    const onClose = vi.fn()
    const onComplete = vi.fn()

    render(<TutorialOverlay tutorial={mockTutorial} open={false} onClose={onClose} onComplete={onComplete} />)

    expect(screen.queryByText('Test Tutorial')).not.toBeInTheDocument()
  })

  it('should display tutorial icon', () => {
    const onClose = vi.fn()
    const onComplete = vi.fn()

    render(<TutorialOverlay tutorial={mockTutorial} open={true} onClose={onClose} onComplete={onComplete} />)

    expect(screen.getByText('🧪')).toBeInTheDocument()
  })

  it('should show action message when step has action', () => {
    const onClose = vi.fn()
    const onComplete = vi.fn()

    render(<TutorialOverlay tutorial={mockTutorial} open={true} onClose={onClose} onComplete={onComplete} />)

    expect(screen.getByText('Do something')).toBeInTheDocument()
  })

  it('should not show Zurück button on first step', () => {
    const onClose = vi.fn()
    const onComplete = vi.fn()

    render(<TutorialOverlay tutorial={mockTutorial} open={true} onClose={onClose} onComplete={onComplete} />)

    expect(screen.queryByText('Zurück')).not.toBeInTheDocument()
  })

  it('should show Zurück button on second step', () => {
    const onClose = vi.fn()
    const onComplete = vi.fn()

    render(
      <TutorialOverlay
        tutorial={mockTutorial}
        open={true}
        onClose={onClose}
        onComplete={onComplete}
        currentStepIndex={1}
      />
    )

    expect(screen.getByText('Zurück')).toBeInTheDocument()
  })

  it('should show Weiter button on non-final steps', () => {
    const onClose = vi.fn()
    const onComplete = vi.fn()

    render(<TutorialOverlay tutorial={mockTutorial} open={true} onClose={onClose} onComplete={onComplete} />)

    expect(screen.getByText('Weiter')).toBeInTheDocument()
  })

  it('should show Fertig button on final step', () => {
    const onClose = vi.fn()
    const onComplete = vi.fn()

    render(
      <TutorialOverlay
        tutorial={mockTutorial}
        open={true}
        onClose={onClose}
        onComplete={onComplete}
        currentStepIndex={2}
      />
    )

    expect(screen.getByText('Fertig')).toBeInTheDocument()
  })

  it('should show Überspringen button when step is skippable', () => {
    const onClose = vi.fn()
    const onComplete = vi.fn()

    render(<TutorialOverlay tutorial={mockTutorial} open={true} onClose={onClose} onComplete={onComplete} />)

    expect(screen.getByText('Überspringen')).toBeInTheDocument()
  })

  it('should not show Überspringen button when step is not skippable', () => {
    const onClose = vi.fn()
    const onComplete = vi.fn()

    render(
      <TutorialOverlay
        tutorial={mockTutorial}
        open={true}
        onClose={onClose}
        onComplete={onComplete}
        currentStepIndex={1}
      />
    )

    expect(screen.queryByText('Überspringen')).not.toBeInTheDocument()
  })

  it('should call onComplete when Fertig is clicked', () => {
    const onClose = vi.fn()
    const onComplete = vi.fn()

    render(
      <TutorialOverlay
        tutorial={mockTutorial}
        open={true}
        onClose={onClose}
        onComplete={onComplete}
        currentStepIndex={2}
      />
    )

    const finishButton = screen.getByText('Fertig')
    fireEvent.click(finishButton)

    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when Überspringen is clicked', () => {
    const onClose = vi.fn()
    const onComplete = vi.fn()

    render(<TutorialOverlay tutorial={mockTutorial} open={true} onClose={onClose} onComplete={onComplete} />)

    const skipButton = screen.getByText('Überspringen')
    fireEvent.click(skipButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should advance to next step when Weiter is clicked', () => {
    const onClose = vi.fn()
    const onComplete = vi.fn()
    const onStepChange = vi.fn()

    render(
      <TutorialOverlay
        tutorial={mockTutorial}
        open={true}
        onClose={onClose}
        onComplete={onComplete}
        currentStepIndex={0}
        onStepChange={onStepChange}
      />
    )

    const nextButton = screen.getByText('Weiter')
    fireEvent.click(nextButton)

    expect(onStepChange).toHaveBeenCalledWith(1)
  })

  it('should go back to previous step when Zurück is clicked', () => {
    const onClose = vi.fn()
    const onComplete = vi.fn()
    const onStepChange = vi.fn()

    render(
      <TutorialOverlay
        tutorial={mockTutorial}
        open={true}
        onClose={onClose}
        onComplete={onComplete}
        currentStepIndex={1}
        onStepChange={onStepChange}
      />
    )

    const backButton = screen.getByText('Zurück')
    fireEvent.click(backButton)

    expect(onStepChange).toHaveBeenCalledWith(0)
  })
})

describe('TutorialStepIndicator', () => {
  it('should render correct number of step dots', () => {
    const { container } = render(<TutorialStepIndicator currentStep={0} totalSteps={5} />)

    const dots = container.querySelectorAll('.h-2.w-2.rounded-full')
    expect(dots).toHaveLength(5)
  })

  it('should highlight current step dot', () => {
    const { container } = render(<TutorialStepIndicator currentStep={2} totalSteps={5} />)

    const dots = container.querySelectorAll('.h-2.w-2.rounded-full')
    expect(dots[2]).toHaveClass('bg-blue-600')
  })

  it('should show completed steps in lighter color', () => {
    const { container } = render(<TutorialStepIndicator currentStep={2} totalSteps={5} />)

    const dots = container.querySelectorAll('.h-2.w-2.rounded-full')
    expect(dots[0]).toHaveClass('bg-blue-300')
    expect(dots[1]).toHaveClass('bg-blue-300')
  })

  it('should show future steps in gray', () => {
    const { container } = render(<TutorialStepIndicator currentStep={2} totalSteps={5} />)

    const dots = container.querySelectorAll('.h-2.w-2.rounded-full')
    expect(dots[3]).toHaveClass('bg-gray-300')
    expect(dots[4]).toHaveClass('bg-gray-300')
  })
})

describe('TutorialCard', () => {
  it('should render tutorial card with correct information', () => {
    const onStart = vi.fn()

    render(<TutorialCard tutorial={mockTutorial} onStart={onStart} />)

    expect(screen.getByText('Test Tutorial')).toBeInTheDocument()
    expect(screen.getByText('A test tutorial for testing purposes')).toBeInTheDocument()
    expect(screen.getByText('🧪')).toBeInTheDocument()
    expect(screen.getByText(/5 Min\./)).toBeInTheDocument()
    expect(screen.getByText(/3 Schritte/)).toBeInTheDocument()
  })

  it('should show Tutorial starten button for new tutorials', () => {
    const onStart = vi.fn()

    render(<TutorialCard tutorial={mockTutorial} onStart={onStart} />)

    expect(screen.getByText('Tutorial starten')).toBeInTheDocument()
  })

  it('should show Abgeschlossen badge when completed', () => {
    const onStart = vi.fn()

    render(<TutorialCard tutorial={mockTutorial} onStart={onStart} completed={true} />)

    expect(screen.getByText(/✓ Abgeschlossen/)).toBeInTheDocument()
  })

  it('should show Erneut starten button when completed', () => {
    const onStart = vi.fn()

    render(<TutorialCard tutorial={mockTutorial} onStart={onStart} completed={true} />)

    expect(screen.getByText('Erneut starten')).toBeInTheDocument()
  })

  it('should show Gesperrt badge when locked', () => {
    const onStart = vi.fn()

    render(<TutorialCard tutorial={mockTutorial} onStart={onStart} locked={true} />)

    expect(screen.getByText(/🔒 Gesperrt/)).toBeInTheDocument()
  })

  it('should disable button when locked', () => {
    const onStart = vi.fn()

    render(<TutorialCard tutorial={mockTutorial} onStart={onStart} locked={true} />)

    const button = screen.getByText('Nicht verfügbar')
    expect(button).toBeDisabled()
  })

  it('should call onStart when button is clicked', () => {
    const onStart = vi.fn()

    render(<TutorialCard tutorial={mockTutorial} onStart={onStart} />)

    const button = screen.getByText('Tutorial starten')
    fireEvent.click(button)

    expect(onStart).toHaveBeenCalledTimes(1)
  })

  it('should not call onStart when locked card is clicked', () => {
    const onStart = vi.fn()

    render(<TutorialCard tutorial={mockTutorial} onStart={onStart} locked={true} />)

    const button = screen.getByText('Nicht verfügbar')
    fireEvent.click(button)

    expect(onStart).not.toHaveBeenCalled()
  })

  it('should call onStart when card is clicked', () => {
    const onStart = vi.fn()

    const { container } = render(<TutorialCard tutorial={mockTutorial} onStart={onStart} />)

    const card = container.firstChild as HTMLElement
    fireEvent.click(card)

    expect(onStart).toHaveBeenCalledTimes(1)
  })

  it('should show prerequisites when present', () => {
    const tutorialWithPrereq: Tutorial = {
      ...mockTutorial,
      prerequisites: ['welcome', 'basics'],
    }
    const onStart = vi.fn()

    render(<TutorialCard tutorial={tutorialWithPrereq} onStart={onStart} />)

    expect(screen.getByText(/Voraussetzung:/)).toBeInTheDocument()
    expect(screen.getByText(/welcome, basics/)).toBeInTheDocument()
  })

  it('should not show prerequisites when none present', () => {
    const onStart = vi.fn()

    render(<TutorialCard tutorial={mockTutorial} onStart={onStart} />)

    expect(screen.queryByText(/Voraussetzung:/)).not.toBeInTheDocument()
  })
})
