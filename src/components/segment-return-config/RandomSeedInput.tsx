import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { useInstanceId } from '../../utils/unique-id'

interface RandomSeedInputProps {
  segmentId: string
  seed: number | undefined
  onSeedChange: (value: number | undefined) => void
}

export function RandomSeedInput({
  segmentId,
  seed,
  onSeedChange,
}: RandomSeedInputProps) {
  const inputId = useInstanceId('random-seed', segmentId)

  return (
    <div className="mb-4 space-y-2">
      <Label htmlFor={inputId}>
        Zufalls-Seed (optional)
      </Label>
      <Input
        id={inputId}
        type="number"
        value={seed || ''}
        onChange={(e) => {
          const value = e.target.value ? Number(e.target.value) : undefined
          onSeedChange(value)
        }}
        placeholder="Für reproduzierbare Ergebnisse"
      />
      <div className="text-sm text-muted-foreground mt-1">
        Optionaler Seed für reproduzierbare Zufallsrenditen. Leer lassen für echte Zufälligkeit.
      </div>
    </div>
  )
}
