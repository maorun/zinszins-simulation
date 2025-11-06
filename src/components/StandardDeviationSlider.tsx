import { Slider } from './ui/slider'
import { Label } from './ui/label'

interface StandardDeviationSliderProps {
  standardDeviation: number
  setStandardDeviation: (value: number) => void
  performSimulation: () => void
}

const StandardDeviationSlider = ({
  standardDeviation,
  setStandardDeviation,
  performSimulation,
}: StandardDeviationSliderProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="standardDeviation">Volatilität (Standardabweichung)</Label>
      <Slider
        id="standardDeviation"
        value={[standardDeviation]}
        onValueChange={([value]) => {
          setStandardDeviation(value)
          performSimulation()
        }}
        min={5}
        max={30}
        step={1}
        className="w-full"
      />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>5%</span>
        <span className="font-medium">{standardDeviation}%</span>
        <span>30%</span>
      </div>
    </div>
  )
}

export default StandardDeviationSlider
