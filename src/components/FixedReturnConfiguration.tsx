import { Slider } from './ui/slider'
import { Label } from './ui/label'
import { useSimulation } from '../contexts/useSimulation'

const FixedReturnConfiguration = () => {
  const {
    rendite,
    setRendite,
    performSimulation,
  } = useSimulation()

  return (
    <div className="space-y-2">
      <Label htmlFor="fixedReturn">Feste Rendite</Label>
      <div className="space-y-2">
        <Slider
          id="fixedReturn"
          value={[rendite]}
          onValueChange={([value]) => {
            setRendite(value)
            performSimulation({ rendite: value })
          }}
          min={0}
          max={15}
          step={0.5}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>0%</span>
          <span className="font-medium">
            {rendite}
            %
          </span>
          <span>15%</span>
        </div>
      </div>
    </div>
  )
}

export default FixedReturnConfiguration
