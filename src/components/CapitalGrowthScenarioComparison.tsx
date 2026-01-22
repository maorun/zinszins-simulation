/**
 * Capital Growth Scenario Comparison Component
 * (Kapitalwertentwicklungs-Szenario-Vergleich)
 *
 * Allows users to compare up to 5 different financial planning scenarios side-by-side
 */

import { useState, useMemo, type Dispatch, type SetStateAction } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Alert, AlertDescription } from './ui/alert'
import { Switch } from './ui/switch'
import { Plus, Play, Info } from 'lucide-react'
import {
  type CapitalGrowthComparison,
  type ComparisonScenario,
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
 * Creates a new scenario with default settings
 */
function createNewScenario(
  scenariosCount: number,
  baseConfig: ReturnType<typeof mapSimulationContextToConfig>
) {
  const colorIndex = scenariosCount % DEFAULT_COMPARISON_CONFIG.defaultColors.length
  const color = DEFAULT_COMPARISON_CONFIG.defaultColors[colorIndex]!
  const name = `Szenario ${scenariosCount + 1}`
  return createScenario(name, color, baseConfig)
}

/**
 * Updates a scenario's return rate configuration
 */
function updateScenarioReturn(
  scenario: ComparisonScenario,
  rendite: number
): ComparisonScenario {
  return {
    ...scenario,
    configuration: {
      ...scenario.configuration,
      rendite,
      averageReturn: rendite,
    },
  }
}

/**
 * Handlers for adding/removing scenarios
 */
function useScenarioMutations(
  comparison: CapitalGrowthComparison,
  setComparison: Dispatch<SetStateAction<CapitalGrowthComparison>>,
  baseConfig: ReturnType<typeof mapSimulationContextToConfig>
) {
  const handleAddScenario = () => {
    if (comparison.scenarios.length >= DEFAULT_COMPARISON_CONFIG.maxScenarios) {
      return
    }

    const newScenario = createNewScenario(comparison.scenarios.length, baseConfig)

    setComparison((prev) => ({
      ...prev,
      scenarios: [...prev.scenarios, newScenario],
      updatedAt: new Date().toISOString(),
    }))
  }

  const handleRemoveScenario = (scenarioId: string) => {
    setComparison((prev) => ({
      ...prev,
      scenarios: prev.scenarios.filter((s) => s.id !== scenarioId),
      results: prev.results?.filter((r) => r.scenarioId !== scenarioId),
      updatedAt: new Date().toISOString(),
    }))
  }

  return { handleAddScenario, handleRemoveScenario }
}

/**
 * Handlers for updating scenario properties
 */
function useScenarioUpdates(
  setComparison: Dispatch<SetStateAction<CapitalGrowthComparison>>
) {
  const handleUpdateScenarioName = (scenarioId: string, name: string) => {
    setComparison((prev) => ({
      ...prev,
      scenarios: prev.scenarios.map((s) => (s.id === scenarioId ? { ...s, name } : s)),
      updatedAt: new Date().toISOString(),
    }))
  }

  const handleUpdateScenarioReturn = (scenarioId: string, rendite: number) => {
    setComparison((prev) => ({
      ...prev,
      scenarios: prev.scenarios.map((s) =>
        s.id === scenarioId ? updateScenarioReturn(s, rendite) : s
      ),
      updatedAt: new Date().toISOString(),
    }))
  }

  return { handleUpdateScenarioName, handleUpdateScenarioReturn }
}

/**
 * Handler for running comparison simulation
 */
function useComparisonSimulation(
  comparison: CapitalGrowthComparison,
  setComparison: Dispatch<SetStateAction<CapitalGrowthComparison>>
) {
  const handleRunComparison = async () => {
    if (comparison.scenarios.length < 2) {
      return
    }

    // Run simulation in a timeout to allow UI to update
    await new Promise((resolve) => setTimeout(resolve, 100))

    const results = simulateComparison(comparison)
    setComparison(results)
  }

  return { handleRunComparison }
}

/**
 * Combined event handlers for scenario management
 */
function useScenarioHandlers(
  comparison: CapitalGrowthComparison,
  setComparison: Dispatch<SetStateAction<CapitalGrowthComparison>>,
  baseConfig: ReturnType<typeof mapSimulationContextToConfig>
) {
  const { handleAddScenario, handleRemoveScenario } = useScenarioMutations(
    comparison,
    setComparison,
    baseConfig
  )
  const { handleUpdateScenarioName, handleUpdateScenarioReturn } = useScenarioUpdates(setComparison)
  const { handleRunComparison } = useComparisonSimulation(comparison, setComparison)

  return {
    handleAddScenario,
    handleRemoveScenario,
    handleUpdateScenarioName,
    handleUpdateScenarioReturn,
    handleRunComparison,
  }
}

/**
 * Action buttons for managing scenarios and running comparison
 */
function ComparisonActions({
  canAddScenario,
  canRunComparison,
  isSimulating,
  onAddScenario,
  onRunComparison,
}: {
  canAddScenario: boolean
  canRunComparison: boolean
  isSimulating: boolean
  onAddScenario: () => void
  onRunComparison: () => void
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      <Button onClick={onAddScenario} disabled={!canAddScenario} variant="outline">
        <Plus className="h-4 w-4 mr-2" />
        Szenario hinzufügen
      </Button>

      <Button onClick={onRunComparison} disabled={!canRunComparison || isSimulating}>
        <Play className="h-4 w-4 mr-2" />
        {isSimulating ? 'Berechne...' : 'Vergleich durchführen'}
      </Button>
    </div>
  )
}

/**
 * Results visualization section with chart and statistics
 */
function ComparisonResultsSection({
  comparison,
  showRealValues,
  onShowRealValuesChange,
}: {
  comparison: CapitalGrowthComparison
  showRealValues: boolean
  onShowRealValuesChange: (checked: boolean) => void
}) {
  if (!comparison.results || comparison.results.length < 2) {
    return null
  }

  return (
    <>
      {/* Chart Visualization */}
      <div className="pt-4 border-t">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Kapitalentwicklung im Vergleich</h3>
          <div className="flex items-center gap-2">
            <Switch
              id="show-real-values"
              checked={showRealValues}
              onCheckedChange={onShowRealValuesChange}
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
  )
}

/**
 * List of scenario cards
 */
function ScenarioList({
  comparison,
  onRemoveScenario,
  onUpdateScenarioName,
  onUpdateScenarioReturn,
}: {
  comparison: CapitalGrowthComparison
  onRemoveScenario: (scenarioId: string) => void
  onUpdateScenarioName: (scenarioId: string, name: string) => void
  onUpdateScenarioReturn: (scenarioId: string, rendite: number) => void
}) {
  return (
    <div className="space-y-3">
      {comparison.scenarios.map((scenario, index) => (
        <ComparisonScenarioCard
          key={scenario.id}
          scenario={scenario}
          index={index}
          onRemove={() => onRemoveScenario(scenario.id)}
          onUpdateName={(name) => onUpdateScenarioName(scenario.id, name)}
          onUpdateReturn={(rendite) => onUpdateScenarioReturn(scenario.id, rendite)}
          result={comparison.results?.find((r) => r.scenarioId === scenario.id)}
        />
      ))}
    </div>
  )
}

/**
 * Props for comparison content component
 */
interface ComparisonContentProps {
  comparison: CapitalGrowthComparison
  showRealValues: boolean
  isSimulating: boolean
  canAddScenario: boolean
  canRunComparison: boolean
  onShowRealValuesChange: (checked: boolean) => void
  onAddScenario: () => void
  onRemoveScenario: (scenarioId: string) => void
  onUpdateScenarioName: (scenarioId: string, name: string) => void
  onUpdateScenarioReturn: (scenarioId: string, rendite: number) => void
  onRunComparison: () => void
}

/**
 * Content of the comparison card including scenarios and results
 */
function ComparisonContent(props: ComparisonContentProps) {
  return (
    <CardContent className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Erstellen Sie mehrere Szenarien mit unterschiedlichen Parametern (z.B. Sparrate, Rendite)
          und vergleichen Sie die Ergebnisse side-by-side.
        </AlertDescription>
      </Alert>

      <ScenarioList
        comparison={props.comparison}
        onRemoveScenario={props.onRemoveScenario}
        onUpdateScenarioName={props.onUpdateScenarioName}
        onUpdateScenarioReturn={props.onUpdateScenarioReturn}
      />

      <ComparisonActions
        canAddScenario={props.canAddScenario}
        canRunComparison={props.canRunComparison}
        isSimulating={props.isSimulating}
        onAddScenario={props.onAddScenario}
        onRunComparison={props.onRunComparison}
      />

      <ComparisonResultsSection
        comparison={props.comparison}
        showRealValues={props.showRealValues}
        onShowRealValuesChange={props.onShowRealValuesChange}
      />
    </CardContent>
  )
}

/**
 * Custom hook for comparison state management
 */
function useComparisonState(baseConfig: ReturnType<typeof mapSimulationContextToConfig>) {
  const [comparison, setComparison] = useState<CapitalGrowthComparison>(() =>
    createComparison('Szenario-Vergleich')
  )
  const [isSimulating, setIsSimulating] = useState(false)
  const [showRealValues, setShowRealValues] = useState(false)

  const handlers = useScenarioHandlers(comparison, setComparison, baseConfig)

  const runComparison = async () => {
    setIsSimulating(true)
    try {
      await handlers.handleRunComparison()
    } finally {
      setIsSimulating(false)
    }
  }

  const canAddScenario = comparison.scenarios.length < DEFAULT_COMPARISON_CONFIG.maxScenarios
  const canRunComparison = comparison.scenarios.length >= 2

  return {
    comparison,
    isSimulating,
    showRealValues,
    setShowRealValues,
    canAddScenario,
    canRunComparison,
    runComparison,
    ...handlers,
  }
}

/**
 * Main component for scenario comparison
 * Orchestrates state management and coordinates sub-components
 */
export function CapitalGrowthScenarioComparison() {
  const simulationContext = useSimulation()
  const baseConfig = useMemo(
    () => mapSimulationContextToConfig(simulationContext),
    [simulationContext]
  )

  const {
    comparison,
    isSimulating,
    showRealValues,
    setShowRealValues,
    canAddScenario,
    canRunComparison,
    runComparison,
    handleAddScenario,
    handleRemoveScenario,
    handleUpdateScenarioName,
    handleUpdateScenarioReturn,
  } = useComparisonState(baseConfig)

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
      <ComparisonContent
        comparison={comparison}
        showRealValues={showRealValues}
        isSimulating={isSimulating}
        canAddScenario={canAddScenario}
        canRunComparison={canRunComparison}
        onShowRealValuesChange={setShowRealValues}
        onAddScenario={handleAddScenario}
        onRemoveScenario={handleRemoveScenario}
        onUpdateScenarioName={handleUpdateScenarioName}
        onUpdateScenarioReturn={handleUpdateScenarioReturn}
        onRunComparison={runComparison}
      />
    </Card>
  )
}

