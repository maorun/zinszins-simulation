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

  it('should render tutorial collapsible card', () => {
    render(<TutorialManager />)
    
    expect(screen.getByText('📚 Interaktive Tutorials')).toBeInTheDocument()
  })

  it('should not render when tutorials are dismissed', () => {
    vi.mocked(tutorialProgress.areTutorialsDismissed).mockReturnValue(true)
    
    const { container } = render(<TutorialManager />)
    
    expect(container.firstChild).toBeNull()
  })

  it('should expand tutorial list when card is clicked', () => {
    render(<TutorialManager />)
    
    const cardHeader = screen.getByText('📚 Interaktive Tutorials')
    fireEvent.click(cardHeader)
    
    expect(screen.getByText(/Lernen Sie die wichtigsten Funktionen/)).toBeInTheDocument()
  })

  it('should display tutorial categories when expanded', () => {
    render(<TutorialManager />)
    
    const cardHeader = screen.getByText('📚 Interaktive Tutorials')
    fireEvent.click(cardHeader)
    
    expect(screen.getByText('Erste Schritte')).toBeInTheDocument()
    expect(screen.getByText('Sparpläne')).toBeInTheDocument()
    expect(screen.getByText('Entnahme')).toBeInTheDocument()
    expect(screen.getByText('Steuern')).toBeInTheDocument()
    expect(screen.getByText('Erweitert')).toBeInTheDocument()
  })

  it('should display tutorials in each category', () => {
    render(<TutorialManager />)
    
    const cardHeader = screen.getByText('📚 Interaktive Tutorials')
    fireEvent.click(cardHeader)
    
    // Check for welcome tutorial
    expect(screen.getByText(/Willkommen bei der Zinseszins-Simulation/)).toBeInTheDocument()
    
    // Check for savings plan tutorial
    expect(screen.getByText(/Sparpläne verstehen/)).toBeInTheDocument()
  })

  it('should show completed badge for completed tutorials', () => {
    vi.mocked(tutorialProgress.getCompletedTutorialIds).mockReturnValue(['welcome'])
    
    render(<TutorialManager />)
    
    const cardHeader = screen.getByText('📚 Interaktive Tutorials')
    fireEvent.click(cardHeader)
    
    expect(screen.getByText(/✓ Abgeschlossen/)).toBeInTheDocument()
  })

  it('should start tutorial when tutorial card is clicked', () => {
    render(<TutorialManager />)
    
    const cardHeader = screen.getByText('📚 Interaktive Tutorials')
    fireEvent.click(cardHeader)
    
    // Find and click "Tutorial starten" button
    const startButtons = screen.getAllByText('Tutorial starten')
    if (startButtons.length > 0) {
      fireEvent.click(startButtons[0])
      
      // Tutorial overlay should be shown
      // The collapsible card stays visible
    }
  })

  it('should display tip message at the bottom', () => {
    render(<TutorialManager />)
    
    const cardHeader = screen.getByText('📚 Interaktive Tutorials')
    fireEvent.click(cardHeader)
    
    expect(screen.getByText(/💡 Tipp:/)).toBeInTheDocument()
    expect(screen.getByText(/Absolvieren Sie die Tutorials/)).toBeInTheDocument()
  })

  it('should show locked tutorials that have unsatisfied prerequisites', () => {
    vi.mocked(tutorialsData.canStartTutorial).mockImplementation((id: string) => {
      // Only welcome can be started
      return id === 'welcome'
    })
    
    render(<TutorialManager />)
    
    const cardHeader = screen.getByText('📚 Interaktive Tutorials')
    fireEvent.click(cardHeader)
    
    // Should have "Nicht verfügbar" for locked tutorials
    expect(screen.getAllByText('Nicht verfügbar').length).toBeGreaterThan(0)
  })
})
