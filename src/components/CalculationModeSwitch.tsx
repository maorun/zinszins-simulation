import { Label } from './ui/label'
import { Switch } from './ui/switch'
import type { SimulationAnnualType } from '../utils/simulate'

interface CalculationModeSwitchProps {
  simulationAnnual: SimulationAnnualType
  onToggle: (checked: boolean) => void
}

const CalculationModeSwitch = ({
  simulationAnnual,
  onToggle,
}: CalculationModeSwitchProps) => {
  return (
    <div className="p-3 border rounded-lg">
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1 sm:space-y-1">
          <Label htmlFor="berechnungsmodus" className="font-medium">
            Berechnungsmodus
          </Label>
          <p className="text-sm text-muted-foreground hidden sm:block">
            Jährlich für schnellere Berechnung, Monatlich für präzisere Ergebnisse
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span
            className={`text-sm ${
              simulationAnnual === 'yearly' ? 'font-medium' : 'text-muted-foreground'
            }`}
          >
            Jährlich
          </span>
          <Switch
            id="berechnungsmodus"
            checked={simulationAnnual === 'monthly'}
            onCheckedChange={onToggle}
          />
          <span
            className={`text-sm ${
              simulationAnnual === 'monthly' ? 'font-medium' : 'text-muted-foreground'
            }`}
          >
            Monatlich
          </span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-3 sm:hidden">
        Jährlich für schnellere Berechnung, Monatlich für präzisere Ergebnisse
      </p>
    </div>
  )
}

export default CalculationModeSwitch
