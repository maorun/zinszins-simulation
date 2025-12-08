import { Label } from '../ui/label'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import type { InflationScenario, InflationScenarioId } from '../../../helpers/inflation-scenarios'
import { generateFormId } from '../../utils/unique-id'

interface ScenarioSelectorProps {
  availableScenarios: InflationScenario[]
  selectedScenarioId: InflationScenarioId | 'none'
  onScenarioChange: (scenarioId: InflationScenarioId) => void
}

interface ScenarioItemProps {
  scenario: InflationScenario
  isSelected: boolean
  onSelect: (scenarioId: InflationScenarioId) => void
}

/**
 * Individual scenario selection item
 */
const ScenarioItem = ({ scenario, isSelected, onSelect }: ScenarioItemProps) => {
  const scenarioRadioId = generateFormId('inflation-scenario', `scenario-${scenario.id}`)

  return (
    <div
      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
        isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
      }`}
      onClick={() => onSelect(scenario.id)}
    >
      <div className="flex items-start space-x-2">
        <RadioGroupItem value={scenario.id} id={scenarioRadioId} className="mt-1" />
        <div className="flex-1">
          <Label htmlFor={scenarioRadioId} className="font-medium cursor-pointer">
            {scenario.name}
          </Label>
          <p className="text-sm text-muted-foreground mt-1">{scenario.description}</p>
        </div>
      </div>
    </div>
  )
}

interface ScenarioGroupProps {
  scenarios: InflationScenario[]
  title: string
  emoji: string
  selectedScenarioId: InflationScenarioId | 'none'
  onScenarioChange: (scenarioId: InflationScenarioId) => void
}

/**
 * Group of scenarios by category
 */
const ScenarioGroup = ({ scenarios, title, emoji, selectedScenarioId, onScenarioChange }: ScenarioGroupProps) => {
  if (scenarios.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-base font-semibold">
          {emoji} {title}
        </span>
        <span className="text-xs text-muted-foreground">({scenarios.length} Szenarien)</span>
      </div>
      <div className="grid gap-3">
        {scenarios.map(scenario => (
          <ScenarioItem
            key={scenario.id}
            scenario={scenario}
            isSelected={selectedScenarioId === scenario.id}
            onSelect={onScenarioChange}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Component to select an inflation scenario from available options
 * Scenarios are grouped by category (Realistic vs. Stress-Test)
 */
export const ScenarioSelector = ({
  availableScenarios,
  selectedScenarioId,
  onScenarioChange,
}: ScenarioSelectorProps) => {
  // Group scenarios by category
  const realisticScenarios = availableScenarios.filter(s => s.category === 'realistic')
  const stressTestScenarios = availableScenarios.filter(s => s.category === 'stress-test')

  return (
    <div>
      <Label className="text-sm font-medium mb-3 block">Szenario auswählen</Label>
      <RadioGroup
        value={selectedScenarioId === 'none' ? undefined : selectedScenarioId}
        onValueChange={value => onScenarioChange(value as InflationScenarioId)}
      >
        <div className="space-y-6">
          <ScenarioGroup
            scenarios={realisticScenarios}
            title="Realistische Szenarien"
            emoji="📊"
            selectedScenarioId={selectedScenarioId}
            onScenarioChange={onScenarioChange}
          />
          <ScenarioGroup
            scenarios={stressTestScenarios}
            title="Stress-Test Szenarien"
            emoji="⚠️"
            selectedScenarioId={selectedScenarioId}
            onScenarioChange={onScenarioChange}
          />
        </div>
      </RadioGroup>
    </div>
  )
}
