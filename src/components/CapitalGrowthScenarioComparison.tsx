/**
 * Capital Growth Scenario Comparison Component
 * (Kapitalwertentwicklungs-Szenario-Vergleich)
 *
 * Allows users to compare up to 5 different financial planning scenarios side-by-side
 */

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Alert, AlertDescription } from './ui/alert'
import { Switch } from './ui/switch'
import { Plus, Trash2, Play, Info } from 'lucide-react'
import { formatCurrency } from '../utils/currency'
import {
  type CapitalGrowthComparison,
  type ComparisonScenario,
  type ScenarioSimulationResult,
  DEFAULT_COMPARISON_CONFIG,
} from '../types/capital-growth-comparison'
import {
  simulateComparison,
  createComparison,
  createScenario,
} from '../utils/capital-growth-comparison'
import { useSimulation } from '../contexts/useSimulation'
import { generateUniqueId } from '../utils/unique-id'
import { ScenarioComparisonChart } from './ScenarioComparisonChart'
import { mapSimulationContextToConfig } from '../utils/config-mappers'

/**
 * Main component for scenario comparison
 */
// eslint-disable-next-line max-lines-per-function -- Complex UI component requires extensive state management and handlers
export function CapitalGrowthScenarioComparison() {
  const simulationContext = useSimulation()
  const baseConfig = useMemo(
    () => mapSimulationContextToConfig(simulationContext),
    [simulationContext]
  )

  const [comparison, setComparison] = useState<CapitalGrowthComparison>(() =>
    createComparison('Szenario-Vergleich')
  )
  const [isSimulating, setIsSimulating] = useState(false)
  const [showRealValues, setShowRealValues] = useState(false)

  // Add a new scenario based on current configuration
  const handleAddScenario = () => {
    if (comparison.scenarios.length >= DEFAULT_COMPARISON_CONFIG.maxScenarios) {
      return
    }

    const colorIndex = comparison.scenarios.length % DEFAULT_COMPARISON_CONFIG.defaultColors.length
    const color = DEFAULT_COMPARISON_CONFIG.defaultColors[colorIndex]!
    const name = `Szenario ${comparison.scenarios.length + 1}`

    const newScenario = createScenario(name, color, baseConfig)

    setComparison((prev) => ({
      ...prev,
      scenarios: [...prev.scenarios, newScenario],
      updatedAt: new Date().toISOString(),
    }))
  }

  // Remove a scenario
  const handleRemoveScenario = (scenarioId: string) => {
    setComparison((prev) => ({
      ...prev,
      scenarios: prev.scenarios.filter((s) => s.id !== scenarioId),
      results: prev.results?.filter((r) => r.scenarioId !== scenarioId),
      updatedAt: new Date().toISOString(),
    }))
  }

  // Update scenario name
  const handleUpdateScenarioName = (scenarioId: string, name: string) => {
    setComparison((prev) => ({
      ...prev,
      scenarios: prev.scenarios.map((s) => (s.id === scenarioId ? { ...s, name } : s)),
      updatedAt: new Date().toISOString(),
    }))
  }

  // Update scenario return rate
  const handleUpdateScenarioReturn = (scenarioId: string, rendite: number) => {
    setComparison((prev) => ({
      ...prev,
      scenarios: prev.scenarios.map((s) =>
        s.id === scenarioId
          ? {
              ...s,
              configuration: {
                ...s.configuration,
                rendite,
                averageReturn: rendite,
              },
            }
          : s
      ),
      updatedAt: new Date().toISOString(),
    }))
  }

  // Run the comparison simulation
  const handleRunComparison = async () => {
    if (comparison.scenarios.length < 2) {
      return
    }

    setIsSimulating(true)

    try {
      // Run simulation in a timeout to allow UI to update
      await new Promise((resolve) => setTimeout(resolve, 100))

      const results = simulateComparison(comparison)
      setComparison(results)
    } finally {
      setIsSimulating(false)
    }
  }

  const canAddScenario = comparison.scenarios.length < DEFAULT_COMPARISON_CONFIG.maxScenarios
  const canRunComparison = comparison.scenarios.length >= 2

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 Kapitalwertentwicklungs-Szenario-Vergleich
        </CardTitle>
        <CardDescription>
          Vergleichen Sie bis zu {DEFAULT_COMPARISON_CONFIG.maxScenarios} verschiedene
          Anlagestrategien nebeneinander
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Erstellen Sie mehrere Szenarien mit unterschiedlichen Parametern (z.B. Sparrate, Rendite)
            und vergleichen Sie die Ergebnisse side-by-side.
          </AlertDescription>
        </Alert>

        {/* Scenario List */}
        <div className="space-y-3">
          {comparison.scenarios.map((scenario, index) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              index={index}
              onRemove={() => handleRemoveScenario(scenario.id)}
              onUpdateName={(name) => handleUpdateScenarioName(scenario.id, name)}
              onUpdateReturn={(rendite) => handleUpdateScenarioReturn(scenario.id, rendite)}
              result={comparison.results?.find((r) => r.scenarioId === scenario.id)}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button onClick={handleAddScenario} disabled={!canAddScenario} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Szenario hinzufügen
          </Button>

          <Button onClick={handleRunComparison} disabled={!canRunComparison || isSimulating}>
            <Play className="h-4 w-4 mr-2" />
            {isSimulating ? 'Berechne...' : 'Vergleich durchführen'}
          </Button>
        </div>

        {/* Results Display */}
        {comparison.results && comparison.results.length >= 2 && (
          <>
            {/* Chart Visualization */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Kapitalentwicklung im Vergleich</h3>
                <div className="flex items-center gap-2">
                  <Switch
                    id="show-real-values"
                    checked={showRealValues}
                    onCheckedChange={setShowRealValues}
                  />
                  <Label htmlFor="show-real-values" className="cursor-pointer">
                    Inflationsbereinigt
                  </Label>
                </div>
              </div>
              <ScenarioComparisonChart comparison={comparison} showRealValues={showRealValues} />
            </div>

            {/* Statistics and Table */}
            <ComparisonResults comparison={comparison} />
          </>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Individual scenario card component
 */
interface ScenarioCardProps {
  scenario: ComparisonScenario
  index: number
  onRemove: () => void
  onUpdateName: (name: string) => void
  onUpdateReturn: (rendite: number) => void
  result?: ScenarioSimulationResult
}

// eslint-disable-next-line max-lines-per-function -- Card component with multiple input fields and conditional display
function ScenarioCard({
  scenario,
  index,
  onRemove,
  onUpdateName,
  onUpdateReturn,
  result,
}: ScenarioCardProps) {
  const nameId = useMemo(() => generateUniqueId('scenario-name'), [])
  const returnId = useMemo(() => generateUniqueId('scenario-return'), [])

  return (
    <div
      className="border rounded-lg p-4 space-y-3"
      style={{ borderLeftWidth: '4px', borderLeftColor: scenario.color }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          {/* Scenario Name */}
          <div className="space-y-1">
            <Label htmlFor={nameId}>Szenario-Name</Label>
            <Input
              id={nameId}
              value={scenario.name}
              onChange={(e) => onUpdateName(e.target.value)}
              placeholder={`Szenario ${index + 1}`}
            />
          </div>

          {/* Return Rate */}
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

          {/* Results Preview */}
          {result && (
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
          )}
        </div>

        {/* Remove Button */}
        <Button variant="ghost" size="sm" onClick={onRemove} className="ml-2">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  )
}

/**
 * Results display component
 */
interface ComparisonResultsProps {
  comparison: CapitalGrowthComparison
}

// eslint-disable-next-line max-lines-per-function -- Results display with statistics cards and detailed table
function ComparisonResults({ comparison }: ComparisonResultsProps) {
  const { results, statistics } = comparison

  if (!results || !statistics) return null

  return (
    <div className="space-y-4 pt-4 border-t">
      <h3 className="text-lg font-semibold">Vergleichsergebnisse</h3>

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bestes Szenario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(statistics.bestScenario.endCapital)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {comparison.scenarios.find((s) => s.id === statistics.bestScenario.scenarioId)?.name}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Durchschnitt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(statistics.averageEndCapital)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Median: {formatCurrency(statistics.percentiles.p50)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Schlechtestes Szenario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(statistics.worstScenario.endCapital)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {comparison.scenarios.find((s) => s.id === statistics.worstScenario.scenarioId)?.name}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Results Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-2">Szenario</th>
              <th className="text-right py-2 px-2">Endkapital</th>
              <th className="text-right py-2 px-2">Rendite p.a.</th>
              <th className="text-right py-2 px-2">Gesamtertrag</th>
              <th className="text-right py-2 px-2">Steuern</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => {
              const scenario = comparison.scenarios.find((s) => s.id === result.scenarioId)
              return (
                <tr key={result.scenarioId} className="border-b">
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: scenario?.color }}
                      />
                      {scenario?.name}
                    </div>
                  </td>
                  <td className="text-right py-2 px-2 font-medium">
                    {formatCurrency(result.metrics.endCapital)}
                  </td>
                  <td className="text-right py-2 px-2">
                    {result.metrics.annualizedReturn.toFixed(2)}%
                  </td>
                  <td className="text-right py-2 px-2">
                    {formatCurrency(result.metrics.totalReturns)}
                  </td>
                  <td className="text-right py-2 px-2">
                    {formatCurrency(result.metrics.totalTaxes)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
