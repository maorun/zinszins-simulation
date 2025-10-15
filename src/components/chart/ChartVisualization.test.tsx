import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ChartVisualization } from './ChartVisualization'

describe('ChartVisualization', () => {
  const mockChartData = [
    {
      year: 2023,
      startkapital: 0,
      endkapital: 10000,
      zinsen: 500,
      kumulativeEinzahlungen: 10000,
      bezahlteSteuer: 100,
      endkapitalReal: 9500,
      zinsenReal: 450,
    },
    {
      year: 2024,
      startkapital: 10000,
      endkapital: 21000,
      zinsen: 1050,
      kumulativeEinzahlungen: 20000,
      bezahlteSteuer: 200,
      endkapitalReal: 19500,
      zinsenReal: 950,
    },
  ]

  const mockChartConfig = {
    isDetailedView: false,
    containerHeight: 'h-96',
    marginBottom: 20,
    xAxisAngle: 0,
    xAxisTextAnchor: 'middle' as const,
    xAxisHeight: 30,
    endkapitalDot: false as const,
    taxDot: false as const,
    showBrush: false,
  }

  it('should render chart container with nominal values configuration', () => {
    const { container } = render(
      <ChartVisualization
        chartData={mockChartData}
        chartConfig={mockChartConfig}
        showInflationAdjusted={false}
        showTaxes={true}
      />,
    )

    // Check that the chart container exists
    const chartContainer = container.querySelector('.h-96')
    expect(chartContainer).toBeInTheDocument()
    
    // Verify ResponsiveContainer is rendered
    const responsiveContainer = container.querySelector('.recharts-responsive-container')
    expect(responsiveContainer).toBeInTheDocument()
  })

  it('should render chart container with inflation-adjusted configuration', () => {
    const { container } = render(
      <ChartVisualization
        chartData={mockChartData}
        chartConfig={mockChartConfig}
        showInflationAdjusted={true}
        showTaxes={true}
      />,
    )

    // Check that the chart container exists
    expect(container.querySelector('.h-96')).toBeInTheDocument()
  })

  it('should render without taxes when showTaxes is false', () => {
    const { container } = render(
      <ChartVisualization
        chartData={mockChartData}
        chartConfig={mockChartConfig}
        showInflationAdjusted={false}
        showTaxes={false}
      />,
    )

    // Chart should still render
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument()
  })

  it('should apply detailed view configuration with increased height', () => {
    const detailedConfig = {
      ...mockChartConfig,
      isDetailedView: true,
      containerHeight: 'h-[500px]',
      marginBottom: 60,
      xAxisAngle: -45,
      xAxisTextAnchor: 'end' as const,
      xAxisHeight: 60,
      endkapitalDot: { fill: '#ef4444', strokeWidth: 2, r: 4 },
      taxDot: { fill: '#f59e0b', strokeWidth: 1, r: 2 },
      showBrush: true,
    }

    const { container } = render(
      <ChartVisualization
        chartData={mockChartData}
        chartConfig={detailedConfig}
        showInflationAdjusted={false}
        showTaxes={true}
      />,
    )

    // Check that the container has the correct height class
    const chartContainer = container.querySelector('.h-\\[500px\\]')
    expect(chartContainer).toBeInTheDocument()
  })

  it('should apply overview configuration with standard height', () => {
    const { container } = render(
      <ChartVisualization
        chartData={mockChartData}
        chartConfig={mockChartConfig}
        showInflationAdjusted={false}
        showTaxes={true}
      />,
    )

    // Check that the container has the correct height class
    const chartContainer = container.querySelector('.h-96')
    expect(chartContainer).toBeInTheDocument()
  })

  it('should handle empty data gracefully', () => {
    const { container } = render(
      <ChartVisualization
        chartData={[]}
        chartConfig={mockChartConfig}
        showInflationAdjusted={false}
        showTaxes={true}
      />,
    )

    // Chart should still render with empty data
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument()
  })
})
