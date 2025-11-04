import { Label } from '../ui/label'
import { Slider } from '../ui/slider'

interface EventYearSliderProps {
  eventYear: number
  simulationStartYear: number
  onYearChange: (year: number) => void
  eventYearSliderId: string
}

/**
 * Slider for selecting the year when the Black Swan event occurs
 */
export function EventYearSlider({
  eventYear,
  simulationStartYear,
  onYearChange,
  eventYearSliderId,
}: EventYearSliderProps) {
  const handleValueChange = ([value]: number[]) => {
    onYearChange(value)
  }

  return (
    <div className="space-y-3">
      <Label htmlFor={eventYearSliderId}>
        Jahr des Ereignisses:
        {' '}
        <strong>{eventYear}</strong>
      </Label>
      <Slider
        id={eventYearSliderId}
        value={[eventYear]}
        onValueChange={handleValueChange}
        min={simulationStartYear}
        max={simulationStartYear + 30}
        step={1}
        className="w-full"
      />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{simulationStartYear}</span>
        <span>{simulationStartYear + 30}</span>
      </div>
    </div>
  )
}
