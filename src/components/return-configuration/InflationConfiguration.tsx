import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import InflationDetails from './InflationDetails'

interface InflationConfigurationProps {
  inflationAktivSparphase: boolean
  inflationsrateSparphase: number
  inflationAnwendungSparphase: 'sparplan' | 'gesamtmenge'
  onInflationAktivChange: (active: boolean) => void
  onInflationsrateChange: (rate: number) => void
  onInflationAnwendungChange: (mode: 'sparplan' | 'gesamtmenge') => void
}

const InflationConfiguration = ({
  inflationAktivSparphase,
  inflationsrateSparphase,
  inflationAnwendungSparphase,
  onInflationAktivChange,
  onInflationsrateChange,
  onInflationAnwendungChange,
}: InflationConfigurationProps) => {
  return (
    <div className="space-y-3 border-t pt-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="inflation-sparphase" className="text-base font-medium">
          💰 Inflation berücksichtigen (Sparphase)
        </Label>
        <Switch
          id="inflation-sparphase"
          checked={inflationAktivSparphase}
          onCheckedChange={onInflationAktivChange}
        />
      </div>
      {inflationAktivSparphase && (
        <InflationDetails
          inflationsrateSparphase={inflationsrateSparphase}
          inflationAnwendungSparphase={inflationAnwendungSparphase}
          onInflationsrateChange={onInflationsrateChange}
          onInflationAnwendungChange={onInflationAnwendungChange}
        />
      )}
    </div>
  )
}

export default InflationConfiguration
