import { Label } from '../ui/label'
import { Slider } from '../ui/slider'

interface YearSliderProps {
  scenarioYear: number
  onYearChange: (year: number) => void
  scenarioYearSliderId: string
  simulationStartYear: number
}

/**
 * Slider component to select the start year for the inflation scenario
 */
export const YearSlider = ({
  scenarioYear,
  onYearChange,
  scenarioYearSliderId,
  simulationStartYear,
}: YearSliderProps) => {
  return (
    <div>
      <Label htmlFor={scenarioYearSliderId} className="text-sm font-medium">
        Startyear des Szenarios: {scenarioYear}
      </Label>
      <Slider
        id={scenarioYearSliderId}
        value={[scenarioYear]}
        onValueChange={([value]) => onYearChange(value)}
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
