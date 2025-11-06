import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ConfigurationSliders } from './ConfigurationSliders'

describe('ConfigurationSliders', () => {
  const mockOnConfigChange = vi.fn()

  const defaultConfig = {
    targetAllocation: 0.6,
    expectedReturn: 0.07,
    volatility: 0.15,
  }

  it('should render all three sliders with correct labels', () => {
    render(<ConfigurationSliders config={defaultConfig} onConfigChange={mockOnConfigChange} />)

    // Check all three slider labels are present
    expect(screen.getByText(/Zielallokation:.*60\.0%/)).toBeInTheDocument()
    expect(screen.getByText(/Erwartete Rendite:.*7\.0%/)).toBeInTheDocument()
    expect(screen.getByText(/Volatilität:.*15\.0%/)).toBeInTheDocument()
  })

  it('should render all sliders in a grid layout', () => {
    const { container } = render(<ConfigurationSliders config={defaultConfig} onConfigChange={mockOnConfigChange} />)

    // Check for grid layout class
    const gridContainer = container.querySelector('.grid')
    expect(gridContainer).toBeInTheDocument()
    expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-3')
  })

  it('should render sliders with correct values', () => {
    render(<ConfigurationSliders config={defaultConfig} onConfigChange={mockOnConfigChange} />)

    const sliders = screen.getAllByRole('slider')
    expect(sliders).toHaveLength(3)

    // Target allocation slider (60%)
    expect(sliders[0]).toHaveAttribute('aria-valuenow', '60')

    // Expected return slider (7%) - allow for floating point precision
    const returnValue = parseFloat(sliders[1].getAttribute('aria-valuenow') || '0')
    expect(returnValue).toBeCloseTo(7, 0)

    // Volatility slider (15%)
    expect(sliders[2]).toHaveAttribute('aria-valuenow', '15')
  })

  it('should display different configuration values correctly', () => {
    const customConfig = {
      targetAllocation: 0.3,
      expectedReturn: 0.05,
      volatility: 0.2,
    }

    render(<ConfigurationSliders config={customConfig} onConfigChange={mockOnConfigChange} />)

    expect(screen.getByText(/Zielallokation:.*30\.0%/)).toBeInTheDocument()
    expect(screen.getByText(/Erwartete Rendite:.*5\.0%/)).toBeInTheDocument()
    expect(screen.getByText(/Volatilität:.*20\.0%/)).toBeInTheDocument()
  })
})
