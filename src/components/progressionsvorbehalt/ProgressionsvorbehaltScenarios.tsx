import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { formatCurrency } from '../../utils/currency'
import { EXAMPLE_SCENARIOS, type ExampleScenario } from './scenarios'

interface ProgressionsvorbehaltScenariosProps {
  onApplyScenario: (scenario: ExampleScenario) => void
}

/**
 * Display example scenarios that can be applied
 */
export function ProgressionsvorbehaltScenarios({ onApplyScenario }: ProgressionsvorbehaltScenariosProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold">Beispielszenarien anwenden:</Label>
      <div className="grid gap-2 sm:grid-cols-3">
        {EXAMPLE_SCENARIOS.map(scenario => (
          <Button
            key={scenario.name}
            variant="outline"
            size="sm"
            onClick={() => onApplyScenario(scenario)}
            className="h-auto flex-col items-start gap-1 whitespace-normal p-3 text-left"
          >
            <span className="font-semibold">{scenario.name}</span>
            <span className="text-xs text-muted-foreground">{scenario.description}</span>
            <span className="text-xs font-medium">{formatCurrency(scenario.yearlyIncome)} p.a.</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
