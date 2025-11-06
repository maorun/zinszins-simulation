import { Label } from '../ui/label'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import type { InflationScenario, InflationScenarioId } from '../../../helpers/inflation-scenarios'
import { generateFormId } from '../../utils/unique-id'

interface ScenarioSelectorProps {
  availableScenarios: InflationScenario[]
  selectedScenarioId: InflationScenarioId | 'none'
  onScenarioChange: (scenarioId: InflationScenarioId) => void
}

/**
 * Component to select an inflation scenario from available options
 */
export const ScenarioSelector = ({
  availableScenarios,
  selectedScenarioId,
  onScenarioChange,
}: ScenarioSelectorProps) => {
  return (
    <div>
      <Label className="text-sm font-medium mb-2 block">Szenario auswählen</Label>
      <RadioGroup
        value={selectedScenarioId === 'none' ? undefined : selectedScenarioId}
        onValueChange={(value) => onScenarioChange(value as InflationScenarioId)}
      >
        <div className="grid gap-3">
          {availableScenarios.map((scenario) => {
            const scenarioRadioId = generateFormId('inflation-scenario', `scenario-${scenario.id}`)

            return (
              <div
                key={scenario.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedScenarioId === scenario.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => onScenarioChange(scenario.id)}
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
          })}
        </div>
      </RadioGroup>
    </div>
  )
}
