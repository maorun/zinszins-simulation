import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { InflationRateSlider } from './InflationRateSlider'

describe('InflationRateSlider', () => {
  const defaultProps = {
    value: 3,
    onChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the slider with label', () => {
    render(<InflationRateSlider {...defaultProps} />)
    
    expect(screen.getByText(/Inflationsrate für Pflegekosten:/)).toBeInTheDocument()
  })

  it('should display current value', () => {
    render(<InflationRateSlider {...defaultProps} />)
    
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-valuenow', '3')
  })

  it('should display min and max values', () => {
    render(<InflationRateSlider {...defaultProps} />)
    
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-valuemin', '0')
    expect(slider).toHaveAttribute('aria-valuemax', '10')
  })

  it('should show help text', () => {
    render(<InflationRateSlider {...defaultProps} />)
    
    expect(screen.getByText('Jährliche Steigerung der Pflegekosten')).toBeInTheDocument()
  })

  it('should render slider component', () => {
    render(<InflationRateSlider {...defaultProps} />)
    
    const slider = screen.getByRole('slider')
    expect(slider).toBeInTheDocument()
  })

  it('should render with different values correctly', () => {
    const { rerender } = render(<InflationRateSlider {...defaultProps} value={0} />)
    let slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-valuenow', '0')
    
    rerender(<InflationRateSlider {...defaultProps} value={10} />)
    slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-valuenow', '10')
    
    rerender(<InflationRateSlider {...defaultProps} value={5.5} />)
    slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-valuenow', '5.5')
  })

  it('should handle decimal values', () => {
    render(<InflationRateSlider {...defaultProps} value={2.5} />)
    
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-valuenow', '2.5')
  })
})
