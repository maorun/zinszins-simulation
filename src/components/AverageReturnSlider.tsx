import { Slider } from './ui/slider'
import { Label } from './ui/label'

interface AverageReturnSliderProps {
  averageReturn: number
  setAverageReturn: (value: number) => void
  performSimulation: () => void
}

const AverageReturnSlider = ({ averageReturn, setAverageReturn, performSimulation }: AverageReturnSliderProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="averageReturn">Durchschnittliche Rendite</Label>
      <Slider
        id="averageReturn"
        value={[averageReturn]}
        onValueChange={([value]) => {
          setAverageReturn(value)
          performSimulation()
        }}
        min={0}
        max={15}
        step={0.5}
        className="w-full"
      />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>0%</span>
        <span className="font-medium">{averageReturn}%</span>
        <span>15%</span>
      </div>
    </div>
  )
}

export default AverageReturnSlider
