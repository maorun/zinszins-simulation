import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThreeDVisualization } from './ThreeDVisualization'
import type { ThreeDDataPoint } from '../utils/3d-visualization-data'

describe('ThreeDVisualization', () => {
  const mockDataPoints: ThreeDDataPoint[] = [
    { year: 2023, returnRate: 5, capital: 10000 },
    { year: 2024, returnRate: 6, capital: 11000 },
    { year: 2025, returnRate: 4, capital: 11500 },
  ]

  it('should render without crashing with valid data', () => {
    render(<ThreeDVisualization dataPoints={mockDataPoints} />)
    // Component should render canvas
    expect(document.querySelector('canvas')).toBeInTheDocument()
  })

  it('should show message when no data is available', () => {
    render(<ThreeDVisualization dataPoints={[]} />)
    expect(screen.getByText('Keine Daten zur Visualisierung verfügbar')).toBeInTheDocument()
  })

  it('should accept custom width and height', () => {
    const { container } = render(<ThreeDVisualization dataPoints={mockDataPoints} width={1000} height={800} />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveStyle({ width: '1000px', height: '800px' })
  })

  it('should use default width and height when not specified', () => {
    const { container } = render(<ThreeDVisualization dataPoints={mockDataPoints} />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveStyle({ width: '800px', height: '600px' })
  })

  it('should render canvas element', () => {
    render(<ThreeDVisualization dataPoints={mockDataPoints} />)
    const canvas = document.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
  })

  it('should apply border and rounded corners styling', () => {
    const { container } = render(<ThreeDVisualization dataPoints={mockDataPoints} />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('rounded-lg', 'border', 'border-gray-200')
  })

  it('should handle single data point', () => {
    const singlePoint: ThreeDDataPoint[] = [{ year: 2023, returnRate: 5, capital: 10000 }]
    render(<ThreeDVisualization dataPoints={singlePoint} />)
    expect(document.querySelector('canvas')).toBeInTheDocument()
  })

  it('should handle data points with negative returns', () => {
    const negativeReturns: ThreeDDataPoint[] = [
      { year: 2023, returnRate: -5, capital: 9500 },
      { year: 2024, returnRate: -10, capital: 8550 },
    ]
    render(<ThreeDVisualization dataPoints={negativeReturns} />)
    expect(document.querySelector('canvas')).toBeInTheDocument()
  })

  it('should handle data points with very high returns', () => {
    const highReturns: ThreeDDataPoint[] = [
      { year: 2023, returnRate: 15, capital: 11500 },
      { year: 2024, returnRate: 20, capital: 13800 },
    ]
    render(<ThreeDVisualization dataPoints={highReturns} />)
    expect(document.querySelector('canvas')).toBeInTheDocument()
  })

  it('should handle data points with zero capital', () => {
    const zeroCapital: ThreeDDataPoint[] = [
      { year: 2023, returnRate: 0, capital: 0 },
      { year: 2024, returnRate: 5, capital: 500 },
    ]
    render(<ThreeDVisualization dataPoints={zeroCapital} />)
    expect(document.querySelector('canvas')).toBeInTheDocument()
  })

  it('should handle large datasets', () => {
    const largeDataset: ThreeDDataPoint[] = Array.from({ length: 50 }, (_, i) => ({
      year: 2023 + i,
      returnRate: 5 + Math.random() * 5,
      capital: 10000 * Math.pow(1.05, i),
    }))
    render(<ThreeDVisualization dataPoints={largeDataset} />)
    expect(document.querySelector('canvas')).toBeInTheDocument()
  })

  it('should accept showLabels prop', () => {
    // Test with labels enabled (default)
    const { rerender } = render(<ThreeDVisualization dataPoints={mockDataPoints} showLabels={true} />)
    expect(document.querySelector('canvas')).toBeInTheDocument()

    // Test with labels disabled
    rerender(<ThreeDVisualization dataPoints={mockDataPoints} showLabels={false} />)
    expect(document.querySelector('canvas')).toBeInTheDocument()
  })

  it('should accept colorByReturn prop', () => {
    // Test with color by return enabled (default)
    const { rerender } = render(<ThreeDVisualization dataPoints={mockDataPoints} colorByReturn={true} />)
    expect(document.querySelector('canvas')).toBeInTheDocument()

    // Test with color by return disabled
    rerender(<ThreeDVisualization dataPoints={mockDataPoints} colorByReturn={false} />)
    expect(document.querySelector('canvas')).toBeInTheDocument()
  })

  it('should accept showConnections prop', () => {
    // Test with connections enabled (default)
    const { rerender } = render(<ThreeDVisualization dataPoints={mockDataPoints} showConnections={true} />)
    expect(document.querySelector('canvas')).toBeInTheDocument()

    // Test with connections disabled
    rerender(<ThreeDVisualization dataPoints={mockDataPoints} showConnections={false} />)
    expect(document.querySelector('canvas')).toBeInTheDocument()
  })

  it('should handle data points with volatility information', () => {
    const dataWithVolatility: ThreeDDataPoint[] = [
      { year: 2023, returnRate: 5, capital: 10000, volatility: 2 },
      { year: 2024, returnRate: 6, capital: 11000, volatility: 3 },
      { year: 2025, returnRate: 4, capital: 11500, volatility: 1.5 },
    ]
    render(<ThreeDVisualization dataPoints={dataWithVolatility} />)
    expect(document.querySelector('canvas')).toBeInTheDocument()
  })

  it('should handle unsorted year data', () => {
    const unsortedData: ThreeDDataPoint[] = [
      { year: 2025, returnRate: 4, capital: 11500 },
      { year: 2023, returnRate: 5, capital: 10000 },
      { year: 2024, returnRate: 6, capital: 11000 },
    ]
    render(<ThreeDVisualization dataPoints={unsortedData} />)
    expect(document.querySelector('canvas')).toBeInTheDocument()
  })

  it('should render with all props combined', () => {
    const { container } = render(
      <ThreeDVisualization
        dataPoints={mockDataPoints}
        width={1000}
        height={800}
        showLabels={true}
        colorByReturn={true}
        showConnections={true}
      />
    )
    const canvas = document.querySelector('canvas')
    expect(canvas).toBeInTheDocument()

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveStyle({ width: '1000px', height: '800px' })
  })
})
