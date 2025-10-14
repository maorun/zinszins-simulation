import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SavingsPhaseSection } from './SavingsPhaseSection'
import type { EnhancedSummary } from '../../utils/summary-utils'

describe('SavingsPhaseSection', () => {
  const mockEnhancedSummary: Partial<EnhancedSummary> = {
    startkapital: 408000,
    endkapital: 596168.79,
    zinsen: 188168.79,
    renditeAnsparphase: 4.6,
  }

  it('should render the savings phase header with year range', () => {
    render(
      <SavingsPhaseSection
        savingsStartYear={2023}
        savingsEndYear={2040}
        enhancedSummary={mockEnhancedSummary as EnhancedSummary}
      />,
    )

    expect(screen.getByText(/📈 Ansparphase/)).toBeInTheDocument()
    expect(screen.getByText(/2023/)).toBeInTheDocument()
    expect(screen.getByText(/2040/)).toBeInTheDocument()
  })

  it('should display total contributions correctly formatted', () => {
    render(
      <SavingsPhaseSection
        savingsStartYear={2023}
        savingsEndYear={2040}
        enhancedSummary={mockEnhancedSummary as EnhancedSummary}
      />,
    )

    expect(screen.getByText('💰 Gesamte Einzahlungen')).toBeInTheDocument()
    expect(screen.getByText('408.000,00 €')).toBeInTheDocument()
  })

  it('should display end capital correctly formatted', () => {
    render(
      <SavingsPhaseSection
        savingsStartYear={2023}
        savingsEndYear={2040}
        enhancedSummary={mockEnhancedSummary as EnhancedSummary}
      />,
    )

    expect(screen.getByText('🎯 Endkapital Ansparphase')).toBeInTheDocument()
    expect(screen.getByText('596.168,79 €')).toBeInTheDocument()
  })

  it('should display total interest correctly formatted', () => {
    render(
      <SavingsPhaseSection
        savingsStartYear={2023}
        savingsEndYear={2040}
        enhancedSummary={mockEnhancedSummary as EnhancedSummary}
      />,
    )

    expect(screen.getByText('📊 Gesamtzinsen Ansparphase')).toBeInTheDocument()
    expect(screen.getByText('188.168,79 €')).toBeInTheDocument()
  })

  it('should display return rate with two decimal places', () => {
    render(
      <SavingsPhaseSection
        savingsStartYear={2023}
        savingsEndYear={2040}
        enhancedSummary={mockEnhancedSummary as EnhancedSummary}
      />,
    )

    expect(screen.getByText('📈 Rendite Ansparphase')).toBeInTheDocument()
    expect(screen.getByText(/4\.60.*% p\.a\./)).toBeInTheDocument()
  })

  it('should handle different year ranges', () => {
    render(
      <SavingsPhaseSection
        savingsStartYear={2025}
        savingsEndYear={2050}
        enhancedSummary={mockEnhancedSummary as EnhancedSummary}
      />,
    )

    expect(screen.getByText(/2025/)).toBeInTheDocument()
    expect(screen.getByText(/2050/)).toBeInTheDocument()
  })

  it('should handle different financial values', () => {
    const differentSummary: Partial<EnhancedSummary> = {
      startkapital: 240000,
      endkapital: 450000,
      zinsen: 210000,
      renditeAnsparphase: 6.5,
    }

    render(
      <SavingsPhaseSection
        savingsStartYear={2023}
        savingsEndYear={2040}
        enhancedSummary={differentSummary as EnhancedSummary}
      />,
    )

    expect(screen.getByText('240.000,00 €')).toBeInTheDocument()
    expect(screen.getByText('450.000,00 €')).toBeInTheDocument()
    expect(screen.getByText('210.000,00 €')).toBeInTheDocument()
    expect(screen.getByText(/6\.50.*% p\.a\./)).toBeInTheDocument()
  })

  it('should render all metric cards in a grid layout', () => {
    const { container } = render(
      <SavingsPhaseSection
        savingsStartYear={2023}
        savingsEndYear={2040}
        enhancedSummary={mockEnhancedSummary as EnhancedSummary}
      />,
    )

    // Should have the grid container
    const gridContainer = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2')
    expect(gridContainer).toBeInTheDocument()

    // Should have all 4 metric cards
    const metricCards = container.querySelectorAll('.flex.justify-between.items-center')
    expect(metricCards).toHaveLength(4)
  })
})
