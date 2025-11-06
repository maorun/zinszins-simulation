import { Label } from '../ui/label'
import { RadioTile, RadioTileGroup } from '../ui/radio-tile'

interface InflationApplicationModeProps {
  inflationAnwendungSparphase: 'sparplan' | 'gesamtmenge'
  onInflationAnwendungChange: (mode: 'sparplan' | 'gesamtmenge') => void
}

const InflationApplicationMode = ({
  inflationAnwendungSparphase,
  onInflationAnwendungChange,
}: InflationApplicationModeProps) => {
  return (
    <div className="mt-4 space-y-2">
      <Label className="text-sm font-medium">Anwendung der Inflation:</Label>
      <RadioTileGroup
        value={inflationAnwendungSparphase}
        onValueChange={(value: string) => {
          const mode = value as 'sparplan' | 'gesamtmenge'
          onInflationAnwendungChange(mode)
        }}
      >
        <RadioTile value="sparplan" label="Auf Sparplan">
          Inflation wird auf einzelne Beiträge angewendet (realistische Anpassung zukünftiger Einzahlungen)
        </RadioTile>
        <RadioTile value="gesamtmenge" label="Auf Gesamtmenge">
          Inflation wird auf die gesamte Sparsumme in der Sparphase angewendet
        </RadioTile>
      </RadioTileGroup>
    </div>
  )
}

export default InflationApplicationMode
