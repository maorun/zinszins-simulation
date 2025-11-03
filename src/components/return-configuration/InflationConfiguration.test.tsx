/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import InflationConfiguration from './InflationConfiguration'

describe('InflationConfiguration', () => {
  const defaultProps = {
    inflationAktivSparphase: false,
    inflationsrateSparphase: 2.0,
    inflationAnwendungSparphase: 'sparplan' as const,
    onInflationAktivChange: vi.fn(),
    onInflationsrateChange: vi.fn(),
    onInflationAnwendungChange: vi.fn(),
  }

  it('renders the inflation toggle', () => {
    render(<InflationConfiguration {...defaultProps} />)

    expect(screen.getByText('💰 Inflation berücksichtigen (Sparphase)')).toBeInTheDocument()
  })

  it('does not show inflation details when inflation is disabled', () => {
    render(<InflationConfiguration {...defaultProps} />)

    expect(screen.queryByText(/Inflationsrate:/)).not.toBeInTheDocument()
  })

  it('shows inflation details when inflation is enabled', () => {
    render(<InflationConfiguration {...defaultProps} inflationAktivSparphase={true} />)

    expect(screen.getByText(/Inflationsrate:/)).toBeInTheDocument()
    expect(screen.getByText('2.0%')).toBeInTheDocument()
  })

  it('calls onInflationAktivChange when toggle is clicked', () => {
    const mockOnChange = vi.fn()
    render(<InflationConfiguration {...defaultProps} onInflationAktivChange={mockOnChange} />)

    const toggle = screen.getByRole('switch')
    fireEvent.click(toggle)

    expect(mockOnChange).toHaveBeenCalledWith(true)
  })

  it('displays the inflation application mode options when enabled', () => {
    render(<InflationConfiguration {...defaultProps} inflationAktivSparphase={true} />)

    expect(screen.getByText('Anwendung der Inflation:')).toBeInTheDocument()
    expect(screen.getByText('Auf Sparplan')).toBeInTheDocument()
    expect(screen.getByText('Auf Gesamtmenge')).toBeInTheDocument()
  })

  it('displays the inflation rate description', () => {
    render(<InflationConfiguration {...defaultProps} inflationAktivSparphase={true} />)

    expect(
      screen.getByText(
        'Die reale Kaufkraft der Einzahlungen wird durch die Inflation gemindert. Ihre Sparbeträge behalten nicht ihre volle Kaufkraft über die Zeit.',
      ),
    ).toBeInTheDocument()
  })
})
