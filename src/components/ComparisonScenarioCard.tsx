/**
 * Comparison Scenario Card Component
 *
 * Displays an individual scenario with editable name, return rate,
 * and result metrics in a card format for Capital Growth Scenario Comparison.
 */

import { useMemo } from 'react'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { Trash2 } from 'lucide-react'
import { formatCurrency } from '../utils/currency'
import { generateUniqueId } from '../utils/unique-id'
import type { ComparisonScenario, ScenarioSimulationResult } from '../types/capital-growth-comparison'

interface ComparisonScenarioCardProps {
  /** The scenario configuration and metadata */
  scenario: ComparisonScenario
  /** Index of this scenario (for display purposes) */
  index: number
  /** Callback when scenario should be removed */
  onRemove: () => void
  /** Callback when scenario name is updated */
  onUpdateName: (name: string) => void
  /** Callback when return rate is updated */
  onUpdateReturn: (rendite: number) => void
  /** Optional simulation result for this scenario */
  result?: ScenarioSimulationResult
}

/**
 * Results preview section showing end capital and annualized return
 */
function ResultsPreview({ result }: { result: ScenarioSimulationResult }) {
  return (
    <div className="text-sm space-y-1 pt-2 border-t">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Endkapital:</span>
        <span className="font-medium">{formatCurrency(result.metrics.endCapital)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Rendite p.a.:</span>
        <span className="font-medium">{result.metrics.annualizedReturn.toFixed(2)}%</span>
      </div>
    </div>
  )
}

/**
 * Card component for displaying and editing a single comparison scenario
 */
export function ComparisonScenarioCard({
  scenario,
  index,
  onRemove,
  onUpdateName,
  onUpdateReturn,
  result,
}: ComparisonScenarioCardProps) {
  const nameId = useMemo(() => generateUniqueId('scenario-name'), [])
  const returnId = useMemo(() => generateUniqueId('scenario-return'), [])

  return (
    <div
      className="border rounded-lg p-4 space-y-3"
      style={{ borderLeftWidth: '4px', borderLeftColor: scenario.color }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <div className="space-y-1">
            <Label htmlFor={nameId}>Szenario-Name</Label>
            <Input
              id={nameId}
              value={scenario.name}
              onChange={(e) => onUpdateName(e.target.value)}
              placeholder={`Szenario ${index + 1}`}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor={returnId}>Erwartete Rendite (% p.a.)</Label>
            <Input
              id={returnId}
              type="number"
              step="0.1"
              min="0"
              max="20"
              value={(scenario.configuration.rendite * 100).toFixed(1)}
              onChange={(e) => onUpdateReturn(parseFloat(e.target.value) / 100)}
            />
          </div>

          {result && <ResultsPreview result={result} />}
        </div>

        <Button variant="ghost" size="icon" onClick={onRemove} className="ml-2">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
