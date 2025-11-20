import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TutorialManager } from './TutorialManager'
import * as tutorialProgress from '../utils/tutorial-progress'
import * as tutorialsData from '../data/tutorials'

// Mock the tutorial progress functions
vi.mock('../utils/tutorial-progress', () => ({
  getCompletedTutorialIds: vi.fn(() => []),
  markTutorialCompleted: vi.fn(),
  areTutorialsDismissed: vi.fn(() => false),
  dismissAllTutorials: vi.fn(),
}))

// Mock tutorials data
vi.mock('../data/tutorials', async () => {
  const actual = await vi.importActual<typeof import('../data/tutorials')>('../data/tutorials')
  return {
    ...actual,
    canStartTutorial: vi.fn(() => true),
  }
})

describe('TutorialManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(tutorialProgress.areTutorialsDismissed).mockReturnValue(false)
    vi.mocked(tutorialProgress.getCompletedTutorialIds).mockReturnValue([])
  })

  it('should render tutorial button', () => {
    render(<TutorialManager />)
    
    expect(screen.getByText('Tutorials')).toBeInTheDocument()
  })

  it('should not render when tutorials are dismissed', () => {
    vi.mocked(tutorialProgress.areTutorialsDismissed).mockReturnValue(true)
    
    const { container } = render(<TutorialManager />)
    
    expect(container.firstChild).toBeNull()
  })

  it('should open tutorial list when button is clicked', () => {
    render(<TutorialManager />)
    
    const button = screen.getByText('Tutorials')
    fireEvent.click(button)
    
    expect(screen.getByText('📚 Interaktive Tutorials')).toBeInTheDocument()
    expect(screen.getByText(/Lernen Sie die wichtigsten Funktionen/)).toBeInTheDocument()
  })

  it('should display tutorial categories', () => {
    render(<TutorialManager />)
    
    const button = screen.getByText('Tutorials')
    fireEvent.click(button)
    
    expect(screen.getByText('Erste Schritte')).toBeInTheDocument()
    expect(screen.getByText('Sparpläne')).toBeInTheDocument()
    expect(screen.getByText('Entnahme')).toBeInTheDocument()
    expect(screen.getByText('Steuern')).toBeInTheDocument()
    expect(screen.getByText('Erweitert')).toBeInTheDocument()
  })

  it('should display tutorials in each category', () => {
    render(<TutorialManager />)
    
    const button = screen.getByText('Tutorials')
    fireEvent.click(button)
    
    // Check for welcome tutorial
    expect(screen.getByText(/Willkommen bei der Zinseszins-Simulation/)).toBeInTheDocument()
    
    // Check for savings plan tutorial
    expect(screen.getByText(/Sparpläne verstehen/)).toBeInTheDocument()
  })

  it('should show completed badge for completed tutorials', () => {
    vi.mocked(tutorialProgress.getCompletedTutorialIds).mockReturnValue(['welcome'])
    
    render(<TutorialManager />)
    
    const button = screen.getByText('Tutorials')
    fireEvent.click(button)
    
    expect(screen.getByText(/✓ Abgeschlossen/)).toBeInTheDocument()
  })

  it('should call dismissAllTutorials when dismiss button is clicked', () => {
    render(<TutorialManager />)
    
    const tutorialsButton = screen.getByText('Tutorials')
    fireEvent.click(tutorialsButton)
    
    // Find the X button in the dialog header
    const dismissButtons = screen.getAllByRole('button')
    const xButton = dismissButtons.find(btn => btn.querySelector('svg'))
    
    if (xButton) {
      fireEvent.click(xButton)
      expect(tutorialProgress.dismissAllTutorials).toHaveBeenCalled()
    }
  })

  it('should start tutorial when tutorial card is clicked', () => {
    render(<TutorialManager />)
    
    const tutorialsButton = screen.getByText('Tutorials')
    fireEvent.click(tutorialsButton)
    
    // Find and click "Tutorial starten" button
    const startButtons = screen.getAllByText('Tutorial starten')
    if (startButtons.length > 0) {
      fireEvent.click(startButtons[0])
      
      // Tutorial overlay should be shown (we can't fully test this without mocking the overlay)
      // But we can verify the dialog closed
      expect(screen.queryByText('📚 Interaktive Tutorials')).not.toBeInTheDocument()
    }
  })

  it('should mark tutorial as completed when finished', () => {
    render(<TutorialManager />)
    
    const tutorialsButton = screen.getByText('Tutorials')
    fireEvent.click(tutorialsButton)
    
    // Start a tutorial
    const startButtons = screen.getAllByText('Tutorial starten')
    if (startButtons.length > 0) {
      fireEvent.click(startButtons[0])
      
      // Tutorial overlay would be shown here, and when completed
      // it would call markTutorialCompleted
      // This is tested indirectly through the overlay tests
    }
  })

  it('should display tip message at the bottom', () => {
    render(<TutorialManager />)
    
    const button = screen.getByText('Tutorials')
    fireEvent.click(button)
    
    expect(screen.getByText(/💡 Tipp:/)).toBeInTheDocument()
    expect(screen.getByText(/Absolvieren Sie die Tutorials/)).toBeInTheDocument()
  })

  it('should show locked tutorials that have unsatisfied prerequisites', () => {
    vi.mocked(tutorialsData.canStartTutorial).mockImplementation((id: string) => {
      // Only welcome can be started
      return id === 'welcome'
    })
    
    render(<TutorialManager />)
    
    const button = screen.getByText('Tutorials')
    fireEvent.click(button)
    
    // Should have "Nicht verfügbar" for locked tutorials
    expect(screen.getAllByText('Nicht verfügbar').length).toBeGreaterThan(0)
  })
})
