import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AverageReturnSlider } from './AverageReturnSlider'

describe('AverageReturnSlider', () => {
  const defaultProps = {
    segmentId: 'test-segment',
    averageReturn: 0.05,
    onAverageReturnChange: vi.fn(),
  }

  it('renders the label', () => {
    render(<AverageReturnSlider {...defaultProps} />)

    expect(screen.getByText('Durchschnittliche Rendite (%)')).toBeInTheDocument()
  })

  it('displays the current average return value', () => {
    render(<AverageReturnSlider {...defaultProps} averageReturn={0.07} />)

    expect(screen.getByText('7.0%')).toBeInTheDocument()
  })

  it('renders slider with correct value', () => {
    render(<AverageReturnSlider {...defaultProps} averageReturn={0.05} />)

    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-valuenow', '5')
  })

  it('displays min and max labels', () => {
    render(<AverageReturnSlider {...defaultProps} />)

    expect(screen.getByText('0%')).toBeInTheDocument()
    expect(screen.getByText('12%')).toBeInTheDocument()
  })

  it('displays helper text', () => {
    render(<AverageReturnSlider {...defaultProps} />)

    expect(
      screen.getByText(/Erwartete durchschnittliche Rendite für diese Phase/),
    ).toBeInTheDocument()
  })
})
