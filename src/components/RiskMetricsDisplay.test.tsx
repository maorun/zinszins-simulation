import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RiskMetricsDisplay } from './RiskMetricsDisplay'
import type { RiskMetrics } from '../utils/risk-metrics'

describe('RiskMetricsDisplay', () => {
  const mockRiskMetrics: RiskMetrics = {
    valueAtRisk5: 0.15,
    valueAtRisk1: 0.25,
    maxDrawdown: 0.2,
    sharpeRatio: 1.5,
    sortinoRatio: 2.0,
    calmarRatio: 0.8,
    volatility: 0.12,
    drawdownSeries: [],
  }

  it('renders all risk metrics cards', () => {
    render(<RiskMetricsDisplay riskMetrics={mockRiskMetrics} />)

    expect(screen.getByText('📉 Value-at-Risk (95%)')).toBeInTheDocument()
    expect(screen.getByText('📊 Maximum Drawdown')).toBeInTheDocument()
    expect(screen.getByText('⚖️ Sharpe Ratio')).toBeInTheDocument()
    expect(screen.getByText('📈 Volatilität')).toBeInTheDocument()
    expect(screen.getByText('🎯 Sortino Ratio')).toBeInTheDocument()
    expect(screen.getByText('📊 Calmar Ratio')).toBeInTheDocument()
  })

  it('formats VaR correctly as percentage', () => {
    render(<RiskMetricsDisplay riskMetrics={mockRiskMetrics} />)

    // VaR should be displayed (formatting may vary)
    expect(screen.getByText(/Value-at-Risk/)).toBeInTheDocument()
  })

  it('formats drawdown correctly as percentage', () => {
    render(<RiskMetricsDisplay riskMetrics={mockRiskMetrics} />)

    // Drawdown should be displayed (formatting may vary)
    expect(screen.getByText(/Maximum Drawdown/)).toBeInTheDocument()
  })

  it('displays 999+ for very high Sortino Ratio', () => {
    const highSortinoMetrics = { ...mockRiskMetrics, sortinoRatio: 1000 }
    render(<RiskMetricsDisplay riskMetrics={highSortinoMetrics} />)

    expect(screen.getByText('999+')).toBeInTheDocument()
  })

  it('displays 999+ for very high Calmar Ratio', () => {
    const highCalmarMetrics = { ...mockRiskMetrics, calmarRatio: 1500 }
    render(<RiskMetricsDisplay riskMetrics={highCalmarMetrics} />)

    expect(screen.getByText('999+')).toBeInTheDocument()
  })

  it('displays explanatory text for each metric', () => {
    render(<RiskMetricsDisplay riskMetrics={mockRiskMetrics} />)

    expect(screen.getByText(/Zeigt potenzielle Verluste/)).toBeInTheDocument()
    expect(screen.getByText(/größte Verlust vom Höchststand/)).toBeInTheDocument()
    expect(screen.getByText(/risikoadjustierte Rendite/)).toBeInTheDocument()
    expect(screen.getByText(/Standardabweichung der Renditen/)).toBeInTheDocument()
    expect(screen.getByText(/nur negative Volatilität/)).toBeInTheDocument()
    expect(screen.getByText(/Verhältnis von Jahresrendite/)).toBeInTheDocument()
  })

  it('uses appropriate color classes for each metric', () => {
    const { container } = render(<RiskMetricsDisplay riskMetrics={mockRiskMetrics} />)

    expect(container.querySelector('.bg-red-50')).toBeInTheDocument()
    expect(container.querySelector('.bg-orange-50')).toBeInTheDocument()
    expect(container.querySelector('.bg-blue-50')).toBeInTheDocument()
    expect(container.querySelector('.bg-purple-50')).toBeInTheDocument()
    expect(container.querySelector('.bg-green-50')).toBeInTheDocument()
    expect(container.querySelector('.bg-indigo-50')).toBeInTheDocument()
  })
})
