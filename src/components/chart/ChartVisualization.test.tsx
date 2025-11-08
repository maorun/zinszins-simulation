import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { ChartVisualization } from './ChartVisualization'

// Mock Chart.js components to avoid canvas rendering issues in tests
vi.mock('react-chartjs-2', () => ({
  Line: ({ data, options }: { data: unknown; options: unknown }) => (
    <div data-testid="chartjs-line" data-chart-data={JSON.stringify(data)} data-chart-options={JSON.stringify(options)}>
      Chart.js Line Mock
    </div>
  ),
}))

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
    const { container, getByTestId } = render(
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

    // Verify Chart.js Line component is rendered
    const chartComponent = getByTestId('chartjs-line')
    expect(chartComponent).toBeInTheDocument()
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
    const { getByTestId } = render(
      <ChartVisualization
        chartData={mockChartData}
        chartConfig={mockChartConfig}
        showInflationAdjusted={false}
        showTaxes={false}
      />,
    )

    // Chart should still render
    const chartComponent = getByTestId('chartjs-line')
    expect(chartComponent).toBeInTheDocument()
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
    const { getByTestId } = render(
      <ChartVisualization
        chartData={[]}
        chartConfig={mockChartConfig}
        showInflationAdjusted={false}
        showTaxes={true}
      />,
    )

    // Chart should still render with empty data
    const chartComponent = getByTestId('chartjs-line')
    expect(chartComponent).toBeInTheDocument()
  })
})
