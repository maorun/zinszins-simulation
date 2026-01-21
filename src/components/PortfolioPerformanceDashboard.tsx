import { useMemo } from 'react'
import { BarChart3 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { useSimulation } from '../contexts/useSimulation'
import { calculatePortfolioPerformance } from '../../helpers/portfolio-performance'
import { PerformanceBadge } from './portfolio-dashboard/PerformanceBadge'
import { ReturnMetricsSection } from './portfolio-dashboard/ReturnMetricsSection'
import { RiskMetricsSection } from './portfolio-dashboard/RiskMetricsSection'
import { AdditionalMetricsSection } from './portfolio-dashboard/AdditionalMetricsSection'
import { InterpretationGuide } from './portfolio-dashboard/InterpretationGuide'

/**
 * Portfolio Performance Dashboard
 * Displays comprehensive Key Performance Indicators for the portfolio
 */
export function PortfolioPerformanceDashboard() {
  const { simulationData } = useSimulation()

  // Calculate portfolio performance metrics
  const metrics = useMemo(() => {
    if (!simulationData?.sparplanElements?.length) return null

    const simulationResult: Record<number, {
      startkapital: number
      zinsen: number
      endkapital: number
      bezahlteSteuer: number
      genutzterFreibetrag: number
      vorabpauschale: number
      vorabpauschaleAccumulated: number
    }> = {}

    simulationData.sparplanElements.forEach(element => {
      if (element.simulation) Object.assign(simulationResult, element.simulation)
    })

    return calculatePortfolioPerformance(simulationResult)
  }, [simulationData])

  if (!metrics) return null

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          Portfolio-Performance Dashboard
        </CardTitle>
        <CardDescription>
          Umfassende Analyse der Portfolio-Performance mit Key Performance Indicators
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Performance Badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PerformanceBadge value={metrics.annualizedReturn} type="return" />
          <PerformanceBadge value={metrics.sharpeRatio} type="sharpe" />
        </div>

        {/* Return Metrics */}
        <ReturnMetricsSection metrics={metrics} />

        {/* Risk Metrics */}
        <RiskMetricsSection metrics={metrics} />

        {/* Additional Metrics */}
        <AdditionalMetricsSection metrics={metrics} />

        {/* Interpretation Guide */}
        <InterpretationGuide />
      </CardContent>
    </Card>
  )
}
