import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { formatCurrency } from '../../utils/currency'

/**
 * Example scenarios for Progressionsvorbehalt
 */
export const EXAMPLE_SCENARIOS = [
  {
    name: 'Elternzeit (1 Jahr)',
    description: 'Elterngeld während Elternzeit',
    yearlyIncome: 12000,
    incomeType: 'elterngeld',
  },
  {
    name: 'Kurzarbeit (6 Monate)',
    description: 'Kurzarbeitergeld bei 50% Kurzarbeit',
    yearlyIncome: 6000,
    incomeType: 'kurzarbeitergeld',
  },
  {
    name: 'Arbeitslosigkeit (kurz)',
    description: 'Arbeitslosengeld I für 3 Monate',
    yearlyIncome: 4500,
    incomeType: 'arbeitslosengeld',
  },
] as const

interface ProgressionsvorbehaltScenariosProps {
  onApplyScenario: (scenario: (typeof EXAMPLE_SCENARIOS)[number]) => void
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
