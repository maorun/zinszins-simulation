import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RiskMetricsContainer } from './RiskMetricsContainer'

// Mock the RiskMetricsDisplay component
vi.mock('./RiskMetricsDisplay', () => ({
  RiskMetricsDisplay: () => <div data-testid="risk-metrics-display">Risk Metrics Display</div>,
}))

// Mock the StressTestDisplay component
vi.mock('./StressTestDisplay', () => ({
  StressTestDisplay: ({ portfolioValue }: { portfolioValue: number }) => (
    <div data-testid="stress-test-display">Stress Test Display for {portfolioValue}</div>
  ),
}))

const mockRiskMetrics = {
  valueAtRisk5: 0.15,
  valueAtRisk1: 0.25,
  maxDrawdown: 0.2,
  sharpeRatio: 1.5,
  volatility: 0.12,
  sortinoRatio: 2.0,
  calmarRatio: 1.2,
}

describe('RiskMetricsContainer', () => {
  test('shows fixed return notice when showFixedReturnNotice is true', () => {
    render(<RiskMetricsContainer riskMetrics={null} portfolioDataLength={10} showFixedReturnNotice={true} />)

    expect(screen.getByText(/Feste Rendite gewählt/)).toBeInTheDocument()
    expect(screen.getByText(/Bei einer festen Rendite gibt es keine Volatilität/)).toBeInTheDocument()
  })

  test('does not show fixed return notice when showFixedReturnNotice is false', () => {
    render(
      <RiskMetricsContainer riskMetrics={mockRiskMetrics} portfolioDataLength={10} showFixedReturnNotice={false} />,
    )

    expect(screen.queryByText(/Feste Rendite gewählt/)).not.toBeInTheDocument()
  })

  test('shows RiskMetricsDisplay when riskMetrics is provided', () => {
    render(
      <RiskMetricsContainer riskMetrics={mockRiskMetrics} portfolioDataLength={10} showFixedReturnNotice={false} />,
    )

    expect(screen.getByTestId('risk-metrics-display')).toBeInTheDocument()
  })

  test('does not show RiskMetricsDisplay when riskMetrics is null', () => {
    render(<RiskMetricsContainer riskMetrics={null} portfolioDataLength={10} showFixedReturnNotice={false} />)

    expect(screen.queryByTestId('risk-metrics-display')).not.toBeInTheDocument()
  })

  test('shows additional risk metrics when riskMetrics is provided', () => {
    render(
      <RiskMetricsContainer riskMetrics={mockRiskMetrics} portfolioDataLength={15} showFixedReturnNotice={false} />,
    )

    expect(screen.getByText(/Value-at-Risk \(99%\)/)).toBeInTheDocument()
    expect(screen.getByText(/Datenpunkte/)).toBeInTheDocument()
    expect(screen.getByText(/15 Jahre/)).toBeInTheDocument()
  })

  test('formats Value-at-Risk (99%) correctly', () => {
    render(
      <RiskMetricsContainer riskMetrics={mockRiskMetrics} portfolioDataLength={10} showFixedReturnNotice={false} />,
    )

    // formatRiskMetric converts 0.25 to "0.25%" not "25,00%"
    expect(screen.getByText(/0\.25%/)).toBeInTheDocument()
  })

  test('displays correct number of data points', () => {
    render(
      <RiskMetricsContainer riskMetrics={mockRiskMetrics} portfolioDataLength={25} showFixedReturnNotice={false} />,
    )

    expect(screen.getByText(/25 Jahre/)).toBeInTheDocument()
  })

  test('can show both fixed return notice and risk metrics together', () => {
    render(<RiskMetricsContainer riskMetrics={mockRiskMetrics} portfolioDataLength={10} showFixedReturnNotice={true} />)

    // Both should be present
    expect(screen.getByText(/Feste Rendite gewählt/)).toBeInTheDocument()
    expect(screen.getByTestId('risk-metrics-display')).toBeInTheDocument()
  })

  test('shows stress test display when portfolio value is provided and risk metrics exist', () => {
    render(
      <RiskMetricsContainer
        riskMetrics={mockRiskMetrics}
        portfolioDataLength={10}
        showFixedReturnNotice={false}
        portfolioValue={100000}
      />,
    )

    expect(screen.getByTestId('stress-test-display')).toBeInTheDocument()
    expect(screen.getByText(/Stress Test Display for 100000/)).toBeInTheDocument()
  })

  test('does not show stress test display when portfolio value is not provided', () => {
    render(
      <RiskMetricsContainer riskMetrics={mockRiskMetrics} portfolioDataLength={10} showFixedReturnNotice={false} />,
    )

    expect(screen.queryByTestId('stress-test-display')).not.toBeInTheDocument()
  })

  test('does not show stress test display when portfolio value is 0', () => {
    render(
      <RiskMetricsContainer
        riskMetrics={mockRiskMetrics}
        portfolioDataLength={10}
        showFixedReturnNotice={false}
        portfolioValue={0}
      />,
    )

    expect(screen.queryByTestId('stress-test-display')).not.toBeInTheDocument()
  })

  test('does not show stress test display when riskMetrics is null', () => {
    render(
      <RiskMetricsContainer
        riskMetrics={null}
        portfolioDataLength={10}
        showFixedReturnNotice={false}
        portfolioValue={100000}
      />,
    )

    expect(screen.queryByTestId('stress-test-display')).not.toBeInTheDocument()
  })

  test('does not show stress test display when fixed return notice is shown', () => {
    render(
      <RiskMetricsContainer
        riskMetrics={mockRiskMetrics}
        portfolioDataLength={10}
        showFixedReturnNotice={true}
        portfolioValue={100000}
      />,
    )

    expect(screen.queryByTestId('stress-test-display')).not.toBeInTheDocument()
  })
})
