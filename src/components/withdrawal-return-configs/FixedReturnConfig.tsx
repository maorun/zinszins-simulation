import { Label } from '../ui/label'
import { Slider } from '../ui/slider'

interface FixedReturnConfigProps {
  formValueRendite: number
  onFormValueRenditeChange: (rendite: number) => void
}

export function FixedReturnConfig({ formValueRendite, onFormValueRenditeChange }: FixedReturnConfigProps) {
  return (
    <div className="mb-4 space-y-2">
      <Label>Erwartete Rendite Entnahme-Phase (%)</Label>
      <div className="space-y-2">
        <Slider
          value={[formValueRendite]}
          onValueChange={(values: number[]) => onFormValueRenditeChange(values[0])}
          min={0}
          max={10}
          step={0.5}
          className="mt-2"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>0%</span>
          <span className="font-medium text-gray-900">{formValueRendite}%</span>
          <span>10%</span>
        </div>
      </div>
      <div className="text-sm text-muted-foreground mt-1">
        Feste Rendite für die gesamte Entnahme-Phase (oft konservativer als die Sparphase-Rendite).
      </div>
    </div>
  )
}
