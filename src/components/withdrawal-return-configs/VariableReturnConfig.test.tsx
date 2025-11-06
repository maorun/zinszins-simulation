import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { VariableReturnConfig } from './VariableReturnConfig'

describe('VariableReturnConfig', () => {
  const defaultProps = {
    withdrawalVariableReturns: { 2041: 5, 2042: 6 },
    startOfIndependence: 2040,
    globalEndOfLife: 2045,
    onWithdrawalVariableReturnsChange: vi.fn(),
  }

  it('renders the label', () => {
    render(<VariableReturnConfig {...defaultProps} />)

    expect(screen.getByText('Variable Renditen pro Jahr (Entnahme-Phase)')).toBeInTheDocument()
  })

  it('renders correct number of year sliders', () => {
    render(<VariableReturnConfig {...defaultProps} />)

    // Should render years from 2041 to 2044 (5 years total: 2045 - 2040 = 5)
    const sliders = screen.getAllByRole('slider')
    expect(sliders).toHaveLength(5)
  })

  it('displays year labels', () => {
    render(<VariableReturnConfig {...defaultProps} />)

    expect(screen.getByText(/^2041:/)).toBeInTheDocument()
    expect(screen.getByText(/^2042:/)).toBeInTheDocument()
  })

  it('displays configured return values', () => {
    render(<VariableReturnConfig {...defaultProps} />)

    const fivePercent = screen.getAllByText('5.0%')
    expect(fivePercent.length).toBeGreaterThan(0)
    expect(screen.getByText('6.0%')).toBeInTheDocument()
  })

  it('displays default value for unconfigured years', () => {
    render(<VariableReturnConfig {...defaultProps} />)

    // Year 2043, 2044 are not in withdrawalVariableReturns, so should show default 5.0%
    const defaultValues = screen.getAllByText('5.0%')
    expect(defaultValues.length).toBeGreaterThanOrEqual(3) // At least 3 years with 5.0%
  })

  it('displays helper text', () => {
    render(<VariableReturnConfig {...defaultProps} />)

    expect(screen.getByText(/Tipp: Verwende niedrigere Werte für konservative/)).toBeInTheDocument()
  })

  it('renders sliders with correct default value', () => {
    render(<VariableReturnConfig {...defaultProps} />)

    const sliders = screen.getAllByRole('slider')
    expect(sliders[0]).toHaveAttribute('aria-valuenow', '5')
    expect(sliders[1]).toHaveAttribute('aria-valuenow', '6')
    expect(sliders[2]).toHaveAttribute('aria-valuenow', '5') // Default
  })

  it('renders scrollable container', () => {
    render(<VariableReturnConfig {...defaultProps} />)

    const container = screen.getByText(/^2041:/).parentElement?.parentElement
    expect(container).toHaveStyle({ maxHeight: '300px', overflowY: 'auto' })
  })
})
