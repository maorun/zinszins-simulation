import { Label } from './ui/label'
import { Switch } from './ui/switch'

interface CalculationModeToggleProps {
  useAutomaticCalculation: boolean
  onChange: (value: boolean) => void
}

export function CalculationModeToggle({ useAutomaticCalculation, onChange }: CalculationModeToggleProps) {
  return (
    <div className="mb-6 p-3 border rounded-lg bg-white">
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1">
          <Label htmlFor="calculation-mode" className="font-medium">
            Berechnungsmodus
          </Label>
          <p className="text-sm text-muted-foreground hidden sm:block">
            Manuell für direkte Jahreseingabe, Automatisch für Geburtsjahr-basierte Berechnung
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`text-sm ${!useAutomaticCalculation ? 'font-medium' : 'text-muted-foreground'}`}>
            Manuell
          </span>
          <Switch id="calculation-mode" checked={useAutomaticCalculation} onCheckedChange={onChange} />
          <span className={`text-sm ${useAutomaticCalculation ? 'font-medium' : 'text-muted-foreground'}`}>
            Automatisch
          </span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-3 sm:hidden">
        Manuell für direkte Jahreseingabe, Automatisch für Geburtsjahr-basierte Berechnung
      </p>
    </div>
  )
}
