import { Label } from '../ui/label'
import { Slider } from '../ui/slider'
import InflationApplicationMode from './InflationApplicationMode'

interface InflationDetailsProps {
  inflationsrateSparphase: number
  inflationAnwendungSparphase: 'sparplan' | 'gesamtmenge'
  onInflationsrateChange: (rate: number) => void
  onInflationAnwendungChange: (mode: 'sparplan' | 'gesamtmenge') => void
}

const InflationDetails = ({
  inflationsrateSparphase,
  inflationAnwendungSparphase,
  onInflationsrateChange,
  onInflationAnwendungChange,
}: InflationDetailsProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        Inflationsrate: <span className="font-medium text-gray-900">{inflationsrateSparphase.toFixed(1)}%</span>
      </Label>
      <Slider
        value={[inflationsrateSparphase]}
        onValueChange={(values: number[]) => {
          onInflationsrateChange(values[0])
        }}
        max={10}
        min={0}
        step={0.1}
        className="w-full"
      />
      <p className="text-xs text-muted-foreground">
        Die reale Kaufkraft der Einzahlungen wird durch die Inflation gemindert. Ihre Sparbeträge behalten nicht ihre
        volle Kaufkraft über die Zeit.
      </p>

      <InflationApplicationMode
        inflationAnwendungSparphase={inflationAnwendungSparphase}
        onInflationAnwendungChange={onInflationAnwendungChange}
      />
    </div>
  )
}

export default InflationDetails
