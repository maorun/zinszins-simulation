import { useCallback } from 'react'
import { Slider } from '../ui/slider'
import { Label } from '../ui/label'
import { useSimulation } from '../../contexts/useSimulation'
import { convertSparplanToElements } from '../../utils/sparplan-utils'

const MIN_YEAR = 2024
const MAX_YEAR = 2100

function YearSlider({
  label,
  description,
  value,
  onValueChange,
}: {
  label: string
  description: string
  value: number
  onValueChange: (values: number[]) => void
}) {
  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">{label}</Label>
      <p className="text-sm text-muted-foreground">{description}</p>
      <Slider min={MIN_YEAR} max={MAX_YEAR} value={[value]} onValueChange={onValueChange} className="w-full" />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{MIN_YEAR}</span>
        <span className="font-semibold text-foreground text-base">{value}</span>
        <span>{MAX_YEAR}</span>
      </div>
    </div>
  )
}

function ZeitspanneSummary({ sparphaseEnde, endOfLife }: { sparphaseEnde: number; endOfLife: number }) {
  const currentYear = new Date().getFullYear()
  return (
    <div className="rounded-lg bg-muted p-4 space-y-1 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Sparphase:</span>
        <span className="font-medium">
          bis {sparphaseEnde} ({sparphaseEnde - currentYear} Jahre)
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Entnahmephase:</span>
        <span className="font-medium">
          {sparphaseEnde + 1} – {endOfLife} ({endOfLife - sparphaseEnde} Jahre)
        </span>
      </div>
    </div>
  )
}

export function WizardStep1Zeitspanne() {
  const { startEnd, setStartEnd, endOfLife, setEndOfLife, sparplan, simulationAnnual, setSparplanElemente } =
    useSimulation()

  const sparphaseEnde = startEnd[0]

  const handleSparphaseEndeChange = useCallback(
    ([value]: number[]) => {
      const newEnd = Math.min(value, endOfLife - 1)
      const newStartEnd: [number, number] = [newEnd, startEnd[1]]
      setStartEnd(newStartEnd)
      setSparplanElemente(convertSparplanToElements(sparplan, newStartEnd, simulationAnnual))
    },
    [startEnd, endOfLife, setStartEnd, sparplan, simulationAnnual, setSparplanElemente],
  )

  const handleEndOfLifeChange = useCallback(
    ([value]: number[]) => {
      setEndOfLife(Math.max(value, sparphaseEnde + 1))
    },
    [sparphaseEnde, setEndOfLife],
  )

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">📅 Zeitspanne festlegen</h2>
        <p className="text-sm text-muted-foreground">
          Wann möchtest du mit dem Entsparen beginnen, und wie lange soll dein Depot reichen?
        </p>
      </div>
      <div className="space-y-6">
        <YearSlider
          label="Ende der Sparphase"
          description="Bis wann möchtest du aktiv Geld investieren?"
          value={sparphaseEnde}
          onValueChange={handleSparphaseEndeChange}
        />
        <YearSlider
          label="Ende der Entnahmephase"
          description="Wie lange soll dein Depot mindestens reichen?"
          value={endOfLife}
          onValueChange={handleEndOfLifeChange}
        />
        <ZeitspanneSummary sparphaseEnde={sparphaseEnde} endOfLife={endOfLife} />
      </div>
    </div>
  )
}
