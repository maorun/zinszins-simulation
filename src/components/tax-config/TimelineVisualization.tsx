import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { BarChart3 } from 'lucide-react'
import {
  generateTimelineData,
  type LossSimulationScenario,
  type LossRealizationStrategy,
} from '../../../helpers/loss-carryforward-simulator'
import { formatCurrency } from '../../utils/currency'

interface TimelineVisualizationProps {
  scenario: LossSimulationScenario
}

export function TimelineVisualization({ scenario }: TimelineVisualizationProps) {
  const timeline = generateTimelineData(scenario)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Zeitlicher Verlauf ({getStrategyDisplayName(scenario.strategy)})
        </CardTitle>
        <CardDescription>
          Entwicklung der Verlustvorträge und Steuerersparnisse über den Planungszeitraum
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TimelineTable timeline={timeline} scenario={scenario} />
      </CardContent>
    </Card>
  )
}

function TimelineTable({
  timeline,
  scenario,
}: {
  timeline: ReturnType<typeof generateTimelineData>
  scenario: LossSimulationScenario
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <TimelineTableHeader />
        <TimelineTableBody timeline={timeline} />
        <TimelineTableFooter scenario={scenario} />
      </table>
    </div>
  )
}

function TimelineTableHeader() {
  return (
    <thead>
      <tr className="border-b">
        <th className="text-left p-2">Jahr</th>
        <th className="text-right p-2">Verfügbare Verluste</th>
        <th className="text-right p-2">Realisierte Gewinne</th>
        <th className="text-right p-2">Genutzte Verluste</th>
        <th className="text-right p-2">Steuerersparnis</th>
        <th className="text-right p-2">Verlustvortrag</th>
      </tr>
    </thead>
  )
}

function TimelineTableBody({ timeline }: { timeline: ReturnType<typeof generateTimelineData> }) {
  return (
    <tbody>
      {timeline.map(point => (
        <tr key={point.year} className="border-b">
          <td className="p-2 font-medium">{point.year}</td>
          <td className="text-right p-2 text-muted-foreground">
            {formatCurrency(point.availableStockLosses + point.availableOtherLosses)}
          </td>
          <td className="text-right p-2 text-muted-foreground">
            {formatCurrency(point.realizedStockGains + point.realizedOtherGains)}
          </td>
          <td className="text-right p-2 font-medium text-blue-600">
            {formatCurrency(point.stockLossesUsed + point.otherLossesUsed)}
          </td>
          <td className="text-right p-2 font-medium text-green-600">{formatCurrency(point.taxSavings)}</td>
          <td className="text-right p-2 text-muted-foreground">
            {formatCurrency(point.carryforwardStockLosses + point.carryforwardOtherLosses)}
          </td>
        </tr>
      ))}
    </tbody>
  )
}

function TimelineTableFooter({ scenario }: { scenario: LossSimulationScenario }) {
  return (
    <tfoot>
      <tr className="border-t-2 font-bold">
        <td className="p-2">Gesamt</td>
        <td className="text-right p-2"></td>
        <td className="text-right p-2"></td>
        <td className="text-right p-2"></td>
        <td className="text-right p-2 text-green-600">{formatCurrency(scenario.totalTaxSavings)}</td>
        <td className="text-right p-2 text-muted-foreground">
          {formatCurrency(scenario.finalUnusedLosses.stockLosses + scenario.finalUnusedLosses.otherLosses)}
        </td>
      </tr>
    </tfoot>
  )
}

function getStrategyDisplayName(strategy: LossRealizationStrategy): string {
  const names: Record<LossRealizationStrategy, string> = {
    immediate: 'Sofortige Realisierung',
    gradual: 'Schrittweise Realisierung',
    optimized: 'Optimierte Realisierung',
    aggressive: 'Aggressive Strategie',
    conservative: 'Konservative Strategie',
  }
  return names[strategy]
}
