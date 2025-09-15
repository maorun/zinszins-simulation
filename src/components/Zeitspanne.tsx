import { Slider } from './ui/slider'
import { Label } from './ui/label'

export function Zeitspanne({
  startEnd,
  dispatch,
}: {
  startEnd: [number, number]
  dispatch: (val: [number, number]) => void
}) {
  const min = 2023
  const max = 2100
  const [startOfIndependence, endOfLife] = startEnd
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="endOfSavingsPhase">Ende der Sparphase</Label>
        <Slider
          id="endOfSavingsPhase"
          min={min}
          max={max}
          value={[startOfIndependence]}
          onValueChange={([value]) => {
            dispatch([value, endOfLife])
          }}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{min}</span>
          <span className="font-medium">{startOfIndependence}</span>
          <span>{max}</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Definiert das Ende der Sparphase (Jahr
        {' '}
        {startOfIndependence}
        ). Die Entnahme-Phase beginnt automatisch im Folgejahr (
        {startOfIndependence + 1}
        ).
      </p>
    </div>
  )
}
