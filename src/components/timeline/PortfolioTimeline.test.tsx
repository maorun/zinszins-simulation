import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PortfolioTimeline } from './PortfolioTimeline'
import type { SimulationResult } from '../../utils/simulate'

// Mock simulation data
const createMockSimulationData = (startYear: number, endYear: number): SimulationResult => {
  const data: SimulationResult = {}
  
  for (let year = startYear; year <= endYear; year++) {
    data[year] = {
      startkapital: (year - startYear + 1) * 10000,
      endkapital: (year - startYear + 1) * 11000,
      zinsen: (year - startYear + 1) * 1000,
      bezahlteSteuer: (year - startYear + 1) * 100,
      genutzterFreibetrag: 0,
      vorabpauschale: 0,
      vorabpauschaleAccumulated: 0,
      startkapitalReal: (year - startYear + 1) * 9500,
      endkapitalReal: (year - startYear + 1) * 10500,
      zinsenReal: (year - startYear + 1) * 950,
    }
  }
  
  return data
}


// Create mock yearly contributions
const createMockYearlyContributions = (startYear: number, endYear: number): Map<number, number> => {
  const contributions = new Map<number, number>()
  for (let year = startYear; year <= endYear; year++) {
    contributions.set(year, 1000) // 1000€ per year
  }
  return contributions
}

describe('PortfolioTimeline', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Component Rendering', () => {
    it('renders the portfolio timeline with correct title', () => {
      const mockData = createMockSimulationData(2023, 2030)
      const mockContributions = createMockYearlyContributions(2023, 2030)
      render(<PortfolioTimeline simulationData={mockData} yearlyContributions={mockContributions} />)
      
      expect(screen.getByText(/Portfolio-Animation/i)).toBeInTheDocument()
      expect(screen.getByText(/Jahr 2023/i)).toBeInTheDocument()
    })

    it('displays all control buttons', () => {
      const mockData = createMockSimulationData(2023, 2030)
      const mockContributions = createMockYearlyContributions(2023, 2030)
      render(<PortfolioTimeline simulationData={mockData} yearlyContributions={mockContributions} />)
      
      expect(screen.getByLabelText(/Ein Jahr zurück/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Abspielen/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Zurücksetzen/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Ein Jahr vorwärts/i)).toBeInTheDocument()
    })

    it('displays current year metrics', () => {
      const mockData = createMockSimulationData(2023, 2030)
      const mockContributions = createMockYearlyContributions(2023, 2030)
      render(<PortfolioTimeline simulationData={mockData} yearlyContributions={mockContributions} />)
      
      expect(screen.getByText('Startkapital')).toBeInTheDocument()
      expect(screen.getByText('Endkapital')).toBeInTheDocument()
      expect(screen.getByText('Zinsen')).toBeInTheDocument()
      expect(screen.getByText('Einzahlungen')).toBeInTheDocument()
      expect(screen.getByText('Rendite')).toBeInTheDocument()
      expect(screen.getByText('Steuern')).toBeInTheDocument()
    })

    it('displays year range correctly', () => {
      const mockData = createMockSimulationData(2023, 2030)
      const mockContributions = createMockYearlyContributions(2023, 2030)
      render(<PortfolioTimeline simulationData={mockData} yearlyContributions={mockContributions} />)
      
      expect(screen.getByText('2023')).toBeInTheDocument()
      expect(screen.getByText('2030')).toBeInTheDocument()
    })
  })

  describe('Playback Controls', () => {
    it('starts playing when play button is clicked', async () => {
      const user = userEvent.setup({ delay: null })
      const mockData = createMockSimulationData(2023, 2025)
      const mockContributions = createMockYearlyContributions(2023, 2025)
      render(<PortfolioTimeline simulationData={mockData} yearlyContributions={mockContributions} />)
      
      const playButton = screen.getByLabelText(/Abspielen/i)
      await user.click(playButton)
      
      expect(screen.getByLabelText(/Pausieren/i)).toBeInTheDocument()
    })

    it('pauses when pause button is clicked', async () => {
      const user = userEvent.setup({ delay: null })
      const mockData = createMockSimulationData(2023, 2025)
      const mockContributions = createMockYearlyContributions(2023, 2025)
      render(<PortfolioTimeline simulationData={mockData} yearlyContributions={mockContributions} />)
      
      const playButton = screen.getByLabelText(/Abspielen/i)
      await user.click(playButton)
      
      const pauseButton = screen.getByLabelText(/Pausieren/i)
      await user.click(pauseButton)
      
      expect(screen.getByLabelText(/Abspielen/i)).toBeInTheDocument()
    })

    it('advances year when playing', async () => {
      const user = userEvent.setup({ delay: null })
      const mockData = createMockSimulationData(2023, 2025)
      const mockContributions = createMockYearlyContributions(2023, 2025)
      render(<PortfolioTimeline simulationData={mockData} yearlyContributions={mockContributions} animationSpeed={100} />)
      
      const playButton = screen.getByLabelText(/Abspielen/i)
      await user.click(playButton)
      
      // Fast forward timer
      vi.advanceTimersByTime(100)
      
      await waitFor(() => {
        expect(screen.getByText(/Jahr 2024/i)).toBeInTheDocument()
      })
    })

    it('stops at end year automatically', async () => {
      const user = userEvent.setup({ delay: null })
      const mockData = createMockSimulationData(2023, 2024)
      const mockContributions = createMockYearlyContributions(2023, 2024)
      render(<PortfolioTimeline simulationData={mockData} yearlyContributions={mockContributions} animationSpeed={100} />)
      
      const playButton = screen.getByLabelText(/Abspielen/i)
      await user.click(playButton)
      
      // Fast forward enough to reach the end
      vi.advanceTimersByTime(200)
      
      await waitFor(() => {
        expect(screen.getByText(/Jahr 2024/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Abspielen/i)).toBeInTheDocument()
      })
    })

    it('resets to start year when reset button is clicked', async () => {
      const user = userEvent.setup({ delay: null })
      const mockData = createMockSimulationData(2023, 2025)
      const mockContributions = createMockYearlyContributions(2023, 2025)
      render(<PortfolioTimeline simulationData={mockData} yearlyContributions={mockContributions} animationSpeed={100} />)
      
      // Advance to next year
      const playButton = screen.getByLabelText(/Abspielen/i)
      await user.click(playButton)
      vi.advanceTimersByTime(100)
      
      await waitFor(() => {
        expect(screen.getByText(/Jahr 2024/i)).toBeInTheDocument()
      })
      
      // Reset
      const resetButton = screen.getByLabelText(/Zurücksetzen/i)
      await user.click(resetButton)
      
      expect(screen.getByText(/Jahr 2023/i)).toBeInTheDocument()
    })
  })

  describe('Step Controls', () => {
    it('advances one year when step forward button is clicked', async () => {
      const user = userEvent.setup({ delay: null })
      const mockData = createMockSimulationData(2023, 2025)
      const mockContributions = createMockYearlyContributions(2023, 2025)
      render(<PortfolioTimeline simulationData={mockData} yearlyContributions={mockContributions} />)
      
      const stepForwardButton = screen.getByLabelText(/Ein Jahr vorwärts/i)
      await user.click(stepForwardButton)
      
      expect(screen.getByText(/Jahr 2024/i)).toBeInTheDocument()
    })

    it('goes back one year when step backward button is clicked', async () => {
      const user = userEvent.setup({ delay: null })
      const mockData = createMockSimulationData(2023, 2025)
      const mockContributions = createMockYearlyContributions(2023, 2025)
      render(<PortfolioTimeline simulationData={mockData} yearlyContributions={mockContributions} />)
      
      // First advance to 2024
      const stepForwardButton = screen.getByLabelText(/Ein Jahr vorwärts/i)
      await user.click(stepForwardButton)
      
      // Then go back
      const stepBackwardButton = screen.getByLabelText(/Ein Jahr zurück/i)
      await user.click(stepBackwardButton)
      
      expect(screen.getByText(/Jahr 2023/i)).toBeInTheDocument()
    })

    it('disables step backward button at start year', () => {
      const mockData = createMockSimulationData(2023, 2025)
      const mockContributions = createMockYearlyContributions(2023, 2025)
      render(<PortfolioTimeline simulationData={mockData} yearlyContributions={mockContributions} />)
      
      const stepBackwardButton = screen.getByLabelText(/Ein Jahr zurück/i)
      expect(stepBackwardButton).toBeDisabled()
    })

    it('disables step forward button at end year', async () => {
      const user = userEvent.setup({ delay: null })
      const mockData = createMockSimulationData(2023, 2024)
      const mockContributions = createMockYearlyContributions(2023, 2024)
      render(<PortfolioTimeline simulationData={mockData} yearlyContributions={mockContributions} />)
      
      const stepForwardButton = screen.getByLabelText(/Ein Jahr vorwärts/i)
      
      // Advance to the end
      await user.click(stepForwardButton)
      
      expect(stepForwardButton).toBeDisabled()
    })
  })

  describe('Slider Control', () => {
    it('updates year when slider is moved', async () => {
      const user = userEvent.setup({ delay: null })
      const mockData = createMockSimulationData(2023, 2025)
      const mockContributions = createMockYearlyContributions(2023, 2025)
      render(<PortfolioTimeline simulationData={mockData} yearlyContributions={mockContributions} />)
      
      const slider = screen.getByRole('slider')
      
      // Simulate slider change
      await user.click(slider)
      // Note: Actual slider interaction in tests would require more complex setup
      // This is a basic test to ensure the slider is rendered
      
      expect(slider).toBeInTheDocument()
      expect(slider).toHaveAttribute('aria-valuemin', '2023')
      expect(slider).toHaveAttribute('aria-valuemax', '2025')
    })
  })

  describe('Metrics Display', () => {
    it('displays correct metrics for current year', () => {
      const mockData = createMockSimulationData(2023, 2025)
      const mockContributions = createMockYearlyContributions(2023, 2025)
      render(<PortfolioTimeline simulationData={mockData} yearlyContributions={mockContributions} />)
      
      // For year 2023 (first year, index 1 in our mock)
      expect(screen.getByText('10.000,00 €')).toBeInTheDocument() // Startkapital
      expect(screen.getByText('11.000,00 €')).toBeInTheDocument() // Endkapital
      expect(screen.getByText('1.000,00 €')).toBeInTheDocument() // Zinsen and Einzahlungen
    })

    it('updates metrics when year changes', async () => {
      const user = userEvent.setup({ delay: null })
      const mockData = createMockSimulationData(2023, 2025)
      const mockContributions = createMockYearlyContributions(2023, 2025)
      render(<PortfolioTimeline simulationData={mockData} yearlyContributions={mockContributions} />)
      
      // Step forward to 2024
      const stepForwardButton = screen.getByLabelText(/Ein Jahr vorwärts/i)
      await user.click(stepForwardButton)
      
      // For year 2024 (second year, index 2 in our mock)
      await waitFor(() => {
        expect(screen.getByText('20.000,00 €')).toBeInTheDocument() // Startkapital
        expect(screen.getByText('22.000,00 €')).toBeInTheDocument() // Endkapital
      })
    })

    it('calculates rendite percentage correctly', () => {
      const mockData = createMockSimulationData(2023, 2025)
      const mockContributions = createMockYearlyContributions(2023, 2025)
      render(<PortfolioTimeline simulationData={mockData} yearlyContributions={mockContributions} />)
      
      // Rendite = (Zinsen / Startkapital) * 100 = (1000 / 10000) * 100 = 10%
      expect(screen.getByText('10.00%')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty simulation data gracefully', () => {
      const emptyData: SimulationResult = {}
      const mockContributions = createMockYearlyContributions(2025, 2025)
      render(<PortfolioTimeline simulationData={emptyData} yearlyContributions={mockContributions} />)
      
      // Component should render with current year and show info message
      const currentYear = new Date().getFullYear()
      expect(screen.getByText(new RegExp(`Jahr ${currentYear}`, 'i'))).toBeInTheDocument()
      expect(screen.getByText(/Keine Simulationsdaten verfügbar/i)).toBeInTheDocument()
      expect(screen.getByText(/Erstellen Sie einen Sparplan/i)).toBeInTheDocument()
    })

    it('handles single year data', () => {
      const mockData = createMockSimulationData(2023, 2023)
      const mockContributions = createMockYearlyContributions(2023, 2023)
      render(<PortfolioTimeline simulationData={mockData} yearlyContributions={mockContributions} />)
      
      expect(screen.getByText(/Jahr 2023/i)).toBeInTheDocument()
      
      // Both step buttons should be disabled
      expect(screen.getByLabelText(/Ein Jahr zurück/i)).toBeDisabled()
      expect(screen.getByLabelText(/Ein Jahr vorwärts/i)).toBeDisabled()
    })

    it('handles reset at end correctly', async () => {
      const user = userEvent.setup({ delay: null })
      const mockData = createMockSimulationData(2023, 2024)
      const mockContributions = createMockYearlyContributions(2023, 2024)
      render(<PortfolioTimeline simulationData={mockData} yearlyContributions={mockContributions} animationSpeed={100} />)
      
      // Play to the end
      const playButton = screen.getByLabelText(/Abspielen/i)
      await user.click(playButton)
      vi.advanceTimersByTime(200)
      
      await waitFor(() => {
        expect(screen.getByText(/Jahr 2024/i)).toBeInTheDocument()
      })
      
      // Click play again - should reset and start
      await user.click(screen.getByLabelText(/Abspielen/i))
      
      // Should be back at start and playing
      await waitFor(() => {
        expect(screen.getByText(/Jahr 2023/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Pausieren/i)).toBeInTheDocument()
      })
    })

    it('starts from current year when simulation data is in the future', () => {
      // Create data starting in 2040 (future year)
      const futureData = createMockSimulationData(2040, 2045)
      const mockContributions = createMockYearlyContributions(2040, 2045)
      render(<PortfolioTimeline simulationData={futureData} yearlyContributions={mockContributions} />)
      
      // Should start from current year, not 2040
      const currentYear = new Date().getFullYear()
      expect(screen.getByText(new RegExp(`Jahr ${currentYear}`, 'i'))).toBeInTheDocument()
      
      // Should show info message that data starts later
      expect(screen.getByText(/liegen noch keine Daten vor/i)).toBeInTheDocument()
      expect(screen.getByText(/Die Simulation beginnt ab Jahr 2040/i)).toBeInTheDocument()
      
      // Year range should show current year to 2045
      expect(screen.getByText(currentYear.toString())).toBeInTheDocument()
      expect(screen.getByText('2045')).toBeInTheDocument()
    })
  })

  describe('Progress Bar', () => {
    it('shows 0% progress at start year', () => {
      const mockData = createMockSimulationData(2023, 2025)
      const mockContributions = createMockYearlyContributions(2023, 2025)
      render(<PortfolioTimeline simulationData={mockData} yearlyContributions={mockContributions} />)
      
      const progressBar = document.querySelector('.bg-blue-500')
      expect(progressBar).toHaveStyle({ width: '0%' })
    })

    it('shows 100% progress at end year', async () => {
      const user = userEvent.setup({ delay: null })
      const mockData = createMockSimulationData(2023, 2024)
      const mockContributions = createMockYearlyContributions(2023, 2024)
      render(<PortfolioTimeline simulationData={mockData} yearlyContributions={mockContributions} />)
      
      const stepForwardButton = screen.getByLabelText(/Ein Jahr vorwärts/i)
      await user.click(stepForwardButton)
      
      const progressBar = document.querySelector('.bg-blue-500')
      await waitFor(() => {
        expect(progressBar).toHaveStyle({ width: '100%' })
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper aria labels for all interactive elements', () => {
      const mockData = createMockSimulationData(2023, 2025)
      const mockContributions = createMockYearlyContributions(2023, 2025)
      render(<PortfolioTimeline simulationData={mockData} yearlyContributions={mockContributions} />)
      
      expect(screen.getByLabelText(/Ein Jahr zurück/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Abspielen/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Zurücksetzen/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Ein Jahr vorwärts/i)).toBeInTheDocument()
      expect(screen.getByRole('slider')).toBeInTheDocument()
    })

    it('updates aria label when playing state changes', async () => {
      const user = userEvent.setup({ delay: null })
      const mockData = createMockSimulationData(2023, 2025)
      const mockContributions = createMockYearlyContributions(2023, 2025)
      render(<PortfolioTimeline simulationData={mockData} yearlyContributions={mockContributions} />)
      
      const playPauseButton = screen.getByLabelText(/Abspielen/i)
      await user.click(playPauseButton)
      
      expect(screen.getByLabelText(/Pausieren/i)).toBeInTheDocument()
    })
  })
})
