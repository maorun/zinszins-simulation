import { Label } from '../ui/label'
import { Slider } from '../ui/slider'
import { Input } from '../ui/input'

interface ReturnSliderProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  description: string
}

function ReturnSlider({ label, value, min, max, step, onChange, description }: ReturnSliderProps) {
  return (
    <div className="mb-4 space-y-2">
      <Label>
        {label}
        {' '}
        (%)
      </Label>
      <div className="space-y-2">
        <Slider value={[value]} min={min} max={max} step={step} onValueChange={([val]) => onChange(val)} className="mt-2" />
        <div className="flex justify-between text-sm text-gray-500">
          <span>
            {min}
            %
          </span>
          <span className="font-medium text-gray-900">
            {value}
            %
          </span>
          <span>
            {max}
            %
          </span>
        </div>
      </div>
      <div className="text-sm text-muted-foreground mt-1">{description}</div>
    </div>
  )
}

interface RandomSeedInputProps {
  value: number | undefined
  onChange: (value: number | undefined) => void
}

function RandomSeedInput({ value, onChange }: RandomSeedInputProps) {
  return (
    <div className="mb-4 space-y-2">
      <Label>Zufalls-Seed (optional)</Label>
      <Input
        type="number"
        value={value || ''}
        onChange={e => onChange(e.target.value ? Number(e.target.value) : undefined)}
        placeholder="Für reproduzierbare Ergebnisse"
      />
      <div className="text-sm text-muted-foreground mt-1">
        Optionaler Seed für reproduzierbare Zufallsrenditen. Leer lassen für echte Zufälligkeit.
      </div>
    </div>
  )
}

interface RandomReturnConfigProps {
  withdrawalAverageReturn: number
  withdrawalStandardDeviation: number
  withdrawalRandomSeed: number | undefined
  onWithdrawalAverageReturnChange: (value: number) => void
  onWithdrawalStandardDeviationChange: (value: number) => void
  onWithdrawalRandomSeedChange: (value: number | undefined) => void
}

export function RandomReturnConfig({
  withdrawalAverageReturn,
  withdrawalStandardDeviation,
  withdrawalRandomSeed,
  onWithdrawalAverageReturnChange,
  onWithdrawalStandardDeviationChange,
  onWithdrawalRandomSeedChange,
}: RandomReturnConfigProps) {
  return (
    <>
      <ReturnSlider
        label="Durchschnittliche Rendite"
        value={withdrawalAverageReturn}
        min={0}
        max={12}
        step={0.5}
        onChange={onWithdrawalAverageReturnChange}
        description="Erwartete durchschnittliche Rendite für die Entnahme-Phase (meist konservativer als Ansparphase)"
      />
      <ReturnSlider
        label="Standardabweichung"
        value={withdrawalStandardDeviation}
        min={5}
        max={25}
        step={1}
        onChange={onWithdrawalStandardDeviationChange}
        description="Volatilität der Renditen (meist niedriger als Ansparphase wegen konservativerer Allokation)"
      />
      <RandomSeedInput value={withdrawalRandomSeed} onChange={onWithdrawalRandomSeedChange} />
    </>
  )
}
