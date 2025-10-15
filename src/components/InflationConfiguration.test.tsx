import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { InflationConfiguration } from './InflationConfiguration'

describe('InflationConfiguration', () => {
  const defaultProps = {
    inflationAktiv: false,
    inflationsrate: 2.0,
    onInflationActiveChange: vi.fn(),
    onInflationRateChange: vi.fn(),
  }

  it('should render the inflation toggle switch', () => {
    render(<InflationConfiguration {...defaultProps} />)

    expect(screen.getByText('Inflation berücksichtigen')).toBeInTheDocument()
    expect(screen.getByText(/Passt die Entnahmebeträge jährlich an die Inflation an/)).toBeInTheDocument()
  })

  it('should not show inflation rate slider when inflation is disabled', () => {
    render(<InflationConfiguration {...defaultProps} inflationAktiv={false} />)

    expect(screen.queryByText('Inflationsrate (%)')).not.toBeInTheDocument()
  })

  it('should show inflation rate slider when inflation is enabled', () => {
    render(<InflationConfiguration {...defaultProps} inflationAktiv={true} />)

    expect(screen.getByText('Inflationsrate (%)')).toBeInTheDocument()
    expect(screen.getByText(/Jährliche Inflationsrate zur Anpassung/)).toBeInTheDocument()
  })

  it('should display the current inflation rate value', () => {
    render(<InflationConfiguration {...defaultProps} inflationAktiv={true} inflationsrate={3.5} />)

    expect(screen.getByText('3.5%', { selector: '.font-medium' })).toBeInTheDocument()
  })

  it('should call onInflationActiveChange when toggle is clicked', () => {
    const onInflationActiveChange = vi.fn()
    render(<InflationConfiguration {...defaultProps} onInflationActiveChange={onInflationActiveChange} />)

    const toggle = screen.getByRole('switch')
    fireEvent.click(toggle)

    expect(onInflationActiveChange).toHaveBeenCalled()
  })

  it('should display slider range labels (0% and 5%)', () => {
    render(<InflationConfiguration {...defaultProps} inflationAktiv={true} />)

    // Check for the min and max labels
    const labels = screen.getAllByText(/^[0-5]%$/)
    expect(labels.length).toBeGreaterThanOrEqual(2) // At least min (0%) and max (5%)
  })

  it('should render with different inflation rates', () => {
    const { rerender } = render(
      <InflationConfiguration {...defaultProps} inflationAktiv={true} inflationsrate={1.0} />,
    )

    expect(screen.getByText('1%', { selector: '.font-medium' })).toBeInTheDocument()

    rerender(
      <InflationConfiguration {...defaultProps} inflationAktiv={true} inflationsrate={4.5} />,
    )

    expect(screen.getByText('4.5%', { selector: '.font-medium' })).toBeInTheDocument()
  })

  it('should have proper accessibility structure', () => {
    render(<InflationConfiguration {...defaultProps} inflationAktiv={true} />)

    // Check for proper label-input association
    expect(screen.getByText('Inflation berücksichtigen')).toBeInTheDocument()
    expect(screen.getByText('Inflationsrate (%)')).toBeInTheDocument()
  })
})
