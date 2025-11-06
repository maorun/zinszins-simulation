import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { StandardDeviationSlider } from './StandardDeviationSlider'

describe('StandardDeviationSlider', () => {
  const defaultProps = {
    segmentId: 'test-segment',
    standardDeviation: 0.12,
    onStandardDeviationChange: vi.fn(),
  }

  it('renders the label', () => {
    render(<StandardDeviationSlider {...defaultProps} />)

    expect(screen.getByText('Standardabweichung (%)')).toBeInTheDocument()
  })

  it('displays the current standard deviation value', () => {
    render(<StandardDeviationSlider {...defaultProps} standardDeviation={0.18} />)

    expect(screen.getByText('18%')).toBeInTheDocument()
  })

  it('renders slider with correct value', () => {
    render(<StandardDeviationSlider {...defaultProps} standardDeviation={0.12} />)

    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-valuenow', '12')
  })

  it('displays min and max labels', () => {
    render(<StandardDeviationSlider {...defaultProps} />)

    expect(screen.getByText('5%')).toBeInTheDocument()
    expect(screen.getByText('25%')).toBeInTheDocument()
  })

  it('displays helper text', () => {
    render(<StandardDeviationSlider {...defaultProps} />)

    expect(screen.getByText(/Volatilität der Renditen/)).toBeInTheDocument()
  })
})
