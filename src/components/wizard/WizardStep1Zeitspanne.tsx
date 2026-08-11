import { useCallback } from 'react'
import { Slider } from '../ui/slider'
import { Label } from '../ui/label'
import { useSimulation } from '../../contexts/useSimulation'
import { convertSparplanToElements } from '../../utils/sparplan-utils'

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
      const newEndOfLife = Math.max(value, sparphaseEnde + 1)
      setEndOfLife(newEndOfLife)
    },
    [sparphaseEnde, setEndOfLife],
  )

  const min = 2024
  const max = 2100

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">📅 Zeitspanne festlegen</h2>
        <p className="text-sm text-muted-foreground">
          Wann möchtest du mit dem Entsparen beginnen, und wie lange soll dein Depot reichen?
        </p>
      </div>

      <div className="space-y-6">
        {/* Sparphase Ende */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Ende der Sparphase</Label>
          <p className="text-sm text-muted-foreground">
            Bis wann möchtest du aktiv Geld investieren?
          </p>
          <Slider
            min={min}
            max={max}
            value={[sparphaseEnde]}
            onValueChange={handleSparphaseEndeChange}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{min}</span>
            <span className="font-semibold text-foreground text-base">{sparphaseEnde}</span>
            <span>{max}</span>
          </div>
        </div>

        {/* Lebensende / Portfolio-Ende */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Ende der Entnahmephase</Label>
          <p className="text-sm text-muted-foreground">
            Wie lange soll dein Depot mindestens reichen?
          </p>
          <Slider
            min={min}
            max={max}
            value={[endOfLife]}
            onValueChange={handleEndOfLifeChange}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{min}</span>
            <span className="font-semibold text-foreground text-base">{endOfLife}</span>
            <span>{max}</span>
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-lg bg-muted p-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sparphase:</span>
            <span className="font-medium">
              bis {sparphaseEnde} ({sparphaseEnde - new Date().getFullYear()} Jahre)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Entnahmephase:</span>
            <span className="font-medium">
              {sparphaseEnde + 1} – {endOfLife} ({endOfLife - sparphaseEnde} Jahre)
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
