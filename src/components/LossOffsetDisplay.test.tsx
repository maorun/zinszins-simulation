/**
 * Tests for LossOffsetDisplay component
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LossOffsetDisplay, LossOffsetDetailedView } from './LossOffsetDisplay'
import type { LossOffsetResult } from '../../helpers/loss-offset-accounts'

describe('LossOffsetDisplay', () => {
  const mockLossOffsetResult: LossOffsetResult = {
    capitalGainsBeforeOffset: 10000,
    stockGains: 7000,
    otherGains: 3000,
    vorabpauschale: 500,
    stockLossesUsed: 2000,
    otherLossesUsed: 1000,
    totalLossesUsed: 3000,
    taxableIncomeAfterOffset: 7500,
    taxSavings: 791.25,
    remainingLosses: {
      stockLosses: 500,
      otherLosses: 200,
      year: 2023,
    },
  }

  it('should render loss offset information', () => {
    render(<LossOffsetDisplay lossOffsetDetails={mockLossOffsetResult} year={2023} />)

    expect(screen.getByText(/Verlustverrechnung/)).toBeInTheDocument()
    expect(screen.getByText(/verrechnet/)).toBeInTheDocument()
  })

  it('should display total losses used', () => {
    render(<LossOffsetDisplay lossOffsetDetails={mockLossOffsetResult} year={2023} />)

    // Check that the total losses used is displayed (3000 EUR formatted)
    expect(screen.getByText(/3\.000,00/)).toBeInTheDocument()
  })

  it('should display loss carry forward', () => {
    render(<LossOffsetDisplay lossOffsetDetails={mockLossOffsetResult} year={2023} />)

    // Check that carry forward is shown (500 + 200 = 700)
    expect(screen.getByText(/Vortrag:/)).toBeInTheDocument()
    expect(screen.getByText(/700,00/)).toBeInTheDocument()
  })

  it('should not render when no losses', () => {
    const noLossesResult: LossOffsetResult = {
      ...mockLossOffsetResult,
      totalLossesUsed: 0,
      stockLossesUsed: 0,
      otherLossesUsed: 0,
      remainingLosses: {
        stockLosses: 0,
        otherLosses: 0,
        year: 2023,
      },
    }

    const { container } = render(<LossOffsetDisplay lossOffsetDetails={noLossesResult} year={2023} />)

    // Component should return null and not render anything
    expect(container.firstChild).toBeNull()
  })

  it('should show loss offset even if no carry forward', () => {
    const noCarryForwardResult: LossOffsetResult = {
      ...mockLossOffsetResult,
      remainingLosses: {
        stockLosses: 0,
        otherLosses: 0,
        year: 2023,
      },
    }

    render(<LossOffsetDisplay lossOffsetDetails={noCarryForwardResult} year={2023} />)

    expect(screen.getByText(/Verlustverrechnung/)).toBeInTheDocument()
    expect(screen.queryByText(/Vortrag:/)).not.toBeInTheDocument()
  })
})

describe('LossOffsetDetailedView', () => {
  const mockLossOffsetResult: LossOffsetResult = {
    capitalGainsBeforeOffset: 10000,
    stockGains: 7000,
    otherGains: 3000,
    vorabpauschale: 500,
    stockLossesUsed: 2000,
    otherLossesUsed: 1000,
    totalLossesUsed: 3000,
    taxableIncomeAfterOffset: 7500,
    taxSavings: 791.25,
    remainingLosses: {
      stockLosses: 500,
      otherLosses: 200,
      year: 2023,
    },
  }

  it('should render detailed loss offset view', () => {
    render(<LossOffsetDetailedView lossOffsetDetails={mockLossOffsetResult} year={2023} />)

    expect(screen.getByText(/📉 Verlustverrechnung 2023/)).toBeInTheDocument()
    expect(screen.getByText(/Verlustverwendung/)).toBeInTheDocument()
    expect(screen.getByText(/Verlustvortrag ins nächste Jahr/)).toBeInTheDocument()
    expect(screen.getByText(/Verlustverrechnungsregeln:/)).toBeInTheDocument()
  })

  it('should display stock losses used', () => {
    render(<LossOffsetDetailedView lossOffsetDetails={mockLossOffsetResult} year={2023} />)

    expect(screen.getByText(/Aktienverluste verrechnet:/)).toBeInTheDocument()
    // Should show 2000 EUR formatted as 2.000,00 €
    const amountElements = screen.getAllByText(/2\.000,00/)
    expect(amountElements.length).toBeGreaterThan(0)
  })

  it('should display other losses used', () => {
    render(<LossOffsetDetailedView lossOffsetDetails={mockLossOffsetResult} year={2023} />)

    expect(screen.getByText(/Sonstige Verluste verrechnet:/)).toBeInTheDocument()
    // Should show 1000 EUR formatted as 1.000,00 €
    const amountElements = screen.getAllByText(/1\.000,00/)
    expect(amountElements.length).toBeGreaterThan(0)
  })

  it('should display total losses used', () => {
    render(<LossOffsetDetailedView lossOffsetDetails={mockLossOffsetResult} year={2023} />)

    expect(screen.getByText(/Gesamt verrechnet:/)).toBeInTheDocument()
    // Should show 3000 EUR formatted as 3.000,00 €
    const amountElements = screen.getAllByText(/3\.000,00/)
    expect(amountElements.length).toBeGreaterThan(0)
  })

  it('should display tax savings', () => {
    render(<LossOffsetDetailedView lossOffsetDetails={mockLossOffsetResult} year={2023} />)

    expect(screen.getByText(/💰 Steuerersparnis:/)).toBeInTheDocument()
    // Should show 791.25 EUR formatted as 791,25 €
    expect(screen.getByText(/791,25/)).toBeInTheDocument()
  })

  it('should display loss carry forward details', () => {
    render(<LossOffsetDetailedView lossOffsetDetails={mockLossOffsetResult} year={2023} />)

    expect(screen.getByText(/Aktienverlusttopf:/)).toBeInTheDocument()
    expect(screen.getByText(/Sonstiger Verlusttopf:/)).toBeInTheDocument()
    expect(screen.getByText(/Gesamt Vortrag:/)).toBeInTheDocument()
  })

  it('should display loss offset rules', () => {
    render(<LossOffsetDetailedView lossOffsetDetails={mockLossOffsetResult} year={2023} />)

    expect(screen.getByText(/Aktienverluste können nur mit Aktiengewinnen verrechnet werden/)).toBeInTheDocument()
    expect(
      screen.getByText(/Sonstige Verluste können mit allen Kapitalerträgen verrechnet werden/),
    ).toBeInTheDocument()
    expect(screen.getByText(/Nicht genutzte Verluste werden unbegrenzt vorgetragen/)).toBeInTheDocument()
  })

  it('should not display carry forward section when no remaining losses', () => {
    const noCarryForwardResult: LossOffsetResult = {
      ...mockLossOffsetResult,
      remainingLosses: {
        stockLosses: 0,
        otherLosses: 0,
        year: 2023,
      },
    }

    render(<LossOffsetDetailedView lossOffsetDetails={noCarryForwardResult} year={2023} />)

    expect(screen.queryByText(/Verlustvortrag ins nächste Jahr/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Aktienverlusttopf:/)).not.toBeInTheDocument()
  })

  it('should display tax savings only when losses are used', () => {
    const zeroLossesResult: LossOffsetResult = {
      ...mockLossOffsetResult,
      totalLossesUsed: 0,
      stockLossesUsed: 0,
      otherLossesUsed: 0,
      taxSavings: 0,
    }

    render(<LossOffsetDetailedView lossOffsetDetails={zeroLossesResult} year={2023} />)

    expect(screen.queryByText(/💰 Steuerersparnis:/)).not.toBeInTheDocument()
  })
})
