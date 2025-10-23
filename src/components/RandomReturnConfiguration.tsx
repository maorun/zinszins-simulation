import { Slider } from './ui/slider'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { useSimulation } from '../contexts/useSimulation'

// eslint-disable-next-line max-lines-per-function -- Large component render function
const RandomReturnConfiguration = () => {
  const {
    averageReturn,
    setAverageReturn,
    standardDeviation,
    setStandardDeviation,
    randomSeed,
    setRandomSeed,
    performSimulation,
  } = useSimulation()

  return (
    <div className="space-y-6">
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
          <span className="font-medium">
            {averageReturn}
            %
          </span>
          <span>15%</span>
        </div>
      </div>

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
          <span className="font-medium">
            {standardDeviation}
            %
          </span>
          <span>30%</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="randomSeed">Zufallsseed (optional für reproduzierbare Ergebnisse)</Label>
        <Input
          id="randomSeed"
          type="number"
          placeholder="Leer lassen für echte Zufälligkeit"
          value={randomSeed || ''}
          onChange={(e) => {
            const value = e.target.value ? parseInt(e.target.value) : undefined
            setRandomSeed(value)
            performSimulation()
          }}
          min={1}
          max={999999}
        />
      </div>
    </div>
  )
}

export default RandomReturnConfiguration
