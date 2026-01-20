/**
 * Tests for RebalancingComparisonCard component
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RebalancingComparisonCard } from './RebalancingComparisonCard'

// Mock the simulation context
vi.mock('../contexts/useSimulation', () => ({
  useSimulation: () => ({
    steuerlast: 0.26375,
    teilfreistellungsquote: 0.3,
  }),
}))

// Mock nesting utils
vi.mock('../lib/nesting-utils', () => ({
  useNestingLevel: () => 0,
}))

describe('RebalancingComparisonCard', () => {
  it('should render collapsed by default', () => {
    render(<RebalancingComparisonCard />)
    
    expect(screen.getByText('Rebalancing-Strategie-Vergleichstool')).toBeInTheDocument()
    // Content should not be visible when collapsed
    expect(screen.queryByText('Portfolio-Parameter')).not.toBeInTheDocument()
  })

  it('should expand when clicked', async () => {
    render(<RebalancingComparisonCard />)
    
    const header = screen.getByText('Rebalancing-Strategie-Vergleichstool')
    fireEvent.click(header)
    
    await waitFor(() => {
      expect(screen.getByText('Portfolio-Parameter')).toBeInTheDocument()
    })
  })

  it('should render configuration section when expanded', async () => {
    render(<RebalancingComparisonCard />)
    
    const header = screen.getByText('Rebalancing-Strategie-Vergleichstool')
    fireEvent.click(header)
    
    await waitFor(() => {
      expect(screen.getByText('Portfolio-Parameter')).toBeInTheDocument()
      expect(screen.getByText(/Startkapital:/)).toBeInTheDocument()
      expect(screen.getByText(/Simulationszeitraum:/)).toBeInTheDocument()
      expect(screen.getByText(/Durchschnittsrendite:/)).toBeInTheDocument()
      expect(screen.getByText(/Volatilität:/)).toBeInTheDocument()
    })
  })

  it('should render allocation configuration', async () => {
    render(<RebalancingComparisonCard />)
    
    const header = screen.getByText('Rebalancing-Strategie-Vergleichstool')
    fireEvent.click(header)
    
    await waitFor(() => {
      expect(screen.getByText('Ziel-Allokation')).toBeInTheDocument()
      expect(screen.getByText('Deutsch')).toBeInTheDocument()
      expect(screen.getByText('Int.')).toBeInTheDocument()
      expect(screen.getByText('Anleihen')).toBeInTheDocument()
    })
  })

  it('should render comparison button', async () => {
    render(<RebalancingComparisonCard />)
    
    const header = screen.getByText('Rebalancing-Strategie-Vergleichstool')
    fireEvent.click(header)
    
    await waitFor(() => {
      expect(screen.getByText('Vergleich starten')).toBeInTheDocument()
    })
  })

  it('should show info box', async () => {
    render(<RebalancingComparisonCard />)
    
    const header = screen.getByText('Rebalancing-Strategie-Vergleichstool')
    fireEvent.click(header)
    
    await waitFor(() => {
      expect(screen.getByText('📊 Strategievergleich')).toBeInTheDocument()
      expect(screen.getByText(/Vergleichen Sie verschiedene Rebalancing-Ansätze/)).toBeInTheDocument()
    })
  })

  it('should validate allocation sums to 100%', async () => {
    render(<RebalancingComparisonCard />)
    
    const header = screen.getByText('Rebalancing-Strategie-Vergleichstool')
    fireEvent.click(header)
    
    await waitFor(() => {
      const inputs = screen.getAllByRole('spinbutton')
      // Find the allocation inputs (they should be the last 3)
      const allocationInputs = inputs.slice(-3)
      
      // Change first input to 50
      fireEvent.change(allocationInputs[0], { target: { value: '50' } })
      
      // Should show validation error since total is now 120%
      expect(screen.getByText(/Summe muss 100% ergeben/)).toBeInTheDocument()
    })
  })

  it('should run comparison when button clicked', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    
    render(<RebalancingComparisonCard />)
    
    const header = screen.getByText('Rebalancing-Strategie-Vergleichstool')
    fireEvent.click(header)
    
    await waitFor(() => {
      const button = screen.getByText('Vergleich starten')
      fireEvent.click(button)
    })
    
    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText('Vergleiche...')).toBeInTheDocument()
    })
    
    // Wait for completion
    await waitFor(() => {
      expect(screen.getByText('Vergleich starten')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    alertSpy.mockRestore()
  })

  it('should display results table after comparison', async () => {
    render(<RebalancingComparisonCard />)
    
    const header = screen.getByText('Rebalancing-Strategie-Vergleichstool')
    fireEvent.click(header)
    
    await waitFor(() => {
      const button = screen.getByText('Vergleich starten')
      fireEvent.click(button)
    })
    
    // Wait for results to appear
    await waitFor(() => {
      expect(screen.getByText('Vergleichsergebnisse')).toBeInTheDocument()
      expect(screen.getByText('Strategie')).toBeInTheDocument()
      expect(screen.getByText('Rendite p.a.')).toBeInTheDocument()
      expect(screen.getByText('Endkapital')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should display recommendation after comparison', async () => {
    render(<RebalancingComparisonCard />)
    
    const header = screen.getByText('Rebalancing-Strategie-Vergleichstool')
    fireEvent.click(header)
    
    await waitFor(() => {
      const button = screen.getByText('Vergleich starten')
      fireEvent.click(button)
    })
    
    // Wait for recommendation
    await waitFor(() => {
      expect(screen.getByText('Empfohlene Strategie')).toBeInTheDocument()
      expect(screen.getByText('⭐ Empfohlen')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should display best by criteria after comparison', async () => {
    render(<RebalancingComparisonCard />)
    
    const header = screen.getByText('Rebalancing-Strategie-Vergleichstool')
    fireEvent.click(header)
    
    await waitFor(() => {
      const button = screen.getByText('Vergleich starten')
      fireEvent.click(button)
    })
    
    // Wait for best by criteria
    await waitFor(() => {
      expect(screen.getByText('Beste Rendite')).toBeInTheDocument()
      expect(screen.getByText('Niedrigste Kosten')).toBeInTheDocument()
      expect(screen.getByText('Bester Sharpe')).toBeInTheDocument()
      expect(screen.getByText('Bestes Tracking')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should show methodology note after comparison', async () => {
    render(<RebalancingComparisonCard />)
    
    const header = screen.getByText('Rebalancing-Strategie-Vergleichstool')
    fireEvent.click(header)
    
    await waitFor(() => {
      const button = screen.getByText('Vergleich starten')
      fireEvent.click(button)
    })
    
    // Wait for methodology note
    await waitFor(() => {
      expect(screen.getByText('ℹ️ Hinweis zur Methodik')).toBeInTheDocument()
      expect(screen.getByText(/Die Simulation verwendet synthetische Renditen/)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should update sliders', async () => {
    render(<RebalancingComparisonCard />)
    
    const header = screen.getByText('Rebalancing-Strategie-Vergleichstool')
    fireEvent.click(header)
    
    await waitFor(() => {
      // Get all sliders
      const sliders = screen.getAllByRole('slider')
      
      // Test initial value slider
      expect(sliders[0]).toHaveAttribute('aria-valuenow')
    })
  })

  it('should handle errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    
    render(<RebalancingComparisonCard />)
    
    const header = screen.getByText('Rebalancing-Strategie-Vergleichstool')
    fireEvent.click(header)
    
    await waitFor(() => {
      // Set invalid allocation
      const inputs = screen.getAllByRole('spinbutton')
      const allocationInputs = inputs.slice(-3)
      
      fireEvent.change(allocationInputs[0], { target: { value: '150' } })
      
      const button = screen.getByText('Vergleich starten')
      fireEvent.click(button)
    })
    
    // Should show error alert
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalled()
    })
    
    consoleSpy.mockRestore()
    alertSpy.mockRestore()
  })
})
