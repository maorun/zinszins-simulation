import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { Slider } from './ui/slider'

interface InflationConfigurationProps {
  inflationAktiv: boolean
  inflationsrate: number
  onInflationActiveChange: (active: boolean) => void
  onInflationRateChange: (rate: number) => void
}

export function InflationConfiguration({
  inflationAktiv,
  inflationsrate,
  onInflationActiveChange,
  onInflationRateChange,
}: InflationConfigurationProps) {
  return (
    <>
      {/* General inflation controls for all strategies */}
      <div className="mb-4 space-y-2">
        <Label>Inflation berücksichtigen</Label>
        <Switch
          checked={inflationAktiv}
          onCheckedChange={onInflationActiveChange}
        />
        <div className="text-sm text-muted-foreground mt-1">
          Passt die Entnahmebeträge jährlich an die Inflation an (für alle
          Entnahme-Strategien)
        </div>
      </div>

      {inflationAktiv && (
        <div className="mb-4 space-y-2">
          <Label>Inflationsrate (%)</Label>
          <div className="space-y-2">
            <Slider
              value={[inflationsrate]}
              onValueChange={(values: number[]) => {
                onInflationRateChange(values[0])
              }}
              min={0}
              max={5}
              step={0.1}
              className="mt-2"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>0%</span>
              <span className="font-medium text-gray-900">
                {inflationsrate}
                %
              </span>
              <span>5%</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Jährliche Inflationsrate zur Anpassung der Entnahmebeträge
          </div>
        </div>
      )}
    </>
  )
}
