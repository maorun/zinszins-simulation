/**
 * Capital Growth Scenario Comparison Component
 * (Kapitalwertentwicklungs-Szenario-Vergleich)
 *
 * Allows users to compare up to 5 different financial planning scenarios side-by-side
 */

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Alert, AlertDescription } from './ui/alert'
import { Switch } from './ui/switch'
import { Plus, Play, Info } from 'lucide-react'
import {
  type CapitalGrowthComparison,
  DEFAULT_COMPARISON_CONFIG,
} from '../types/capital-growth-comparison'
import {
  simulateComparison,
  createComparison,
  createScenario,
} from '../utils/capital-growth-comparison'
import { useSimulation } from '../contexts/useSimulation'
import { ScenarioComparisonChart } from './ScenarioComparisonChart'
import { mapSimulationContextToConfig } from '../utils/config-mappers'
import { ComparisonScenarioCard } from './ComparisonScenarioCard'
import { ComparisonResults } from './ComparisonResults'

/**
 * Main component for scenario comparison
 * Orchestrates state management and coordinates sub-components
 */
// eslint-disable-next-line max-lines-per-function -- Main orchestrator component requires state management, event handlers, and conditional rendering
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
            <ComparisonScenarioCard
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
            <ComparisonResults 
              comparison={comparison} 
              baselineScenarioId={comparison.scenarios[0]?.id} 
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}

