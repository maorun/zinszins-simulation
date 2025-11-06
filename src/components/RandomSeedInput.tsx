import { Input } from './ui/input'
import { Label } from './ui/label'

interface RandomSeedInputProps {
  randomSeed: number | undefined
  setRandomSeed: (value: number | undefined) => void
  performSimulation: () => void
}

const RandomSeedInput = ({ randomSeed, setRandomSeed, performSimulation }: RandomSeedInputProps) => {
  return (
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
  )
}

export default RandomSeedInput
