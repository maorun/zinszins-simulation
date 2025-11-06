import { Label } from './ui/label'
import { Slider } from './ui/slider'
import { Switch } from './ui/switch'
import type { InflationConfig } from '../../helpers/withdrawal'

interface SegmentInflationConfigProps {
  inflationConfig: InflationConfig | undefined
  onInflationConfigChange: (config: InflationConfig | undefined) => void
}

export function SegmentInflationConfig({ inflationConfig, onInflationConfigChange }: SegmentInflationConfigProps) {
  const isEnabled = inflationConfig !== undefined
  const inflationRate = inflationConfig?.inflationRate || 0.02

  return (
    <>
      <div className="mb-4 space-y-2">
        <Label>Inflation berücksichtigen</Label>
        <Switch
          checked={isEnabled}
          onCheckedChange={(checked: boolean) => {
            onInflationConfigChange(checked ? { inflationRate: 0.02 } : undefined)
          }}
        />
      </div>

      {isEnabled && (
        <div className="mb-4 space-y-2">
          <Label>Inflationsrate (%)</Label>
          <div className="space-y-2">
            <Slider
              value={[inflationRate * 100]}
              min={0}
              max={5}
              step={0.1}
              onValueChange={value =>
                onInflationConfigChange({
                  inflationRate: value[0] / 100,
                })
              }
              className="mt-2"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>0%</span>
              <span className="font-medium text-gray-900">{(inflationRate * 100).toFixed(1)}%</span>
              <span>5%</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
