import { Label } from '../ui/label'
import { Slider } from '../ui/slider'
import { Input } from '../ui/input'

interface RandomReturnConfigProps {
  withdrawalAverageReturn: number
  withdrawalStandardDeviation: number
  withdrawalRandomSeed: number | undefined
  onWithdrawalAverageReturnChange: (value: number) => void
  onWithdrawalStandardDeviationChange: (value: number) => void
  onWithdrawalRandomSeedChange: (value: number | undefined) => void
}

// eslint-disable-next-line max-lines-per-function -- Large component function
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
      <div className="mb-4 space-y-2">
        <Label>Durchschnittliche Rendite (%)</Label>
        <div className="space-y-2">
          <Slider
            value={[withdrawalAverageReturn]}
            min={0}
            max={12}
            step={0.5}
            onValueChange={value => onWithdrawalAverageReturnChange(value[0])}
            className="mt-2"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>0%</span>
            <span className="font-medium text-gray-900">
              {withdrawalAverageReturn}
              %
            </span>
            <span>12%</span>
          </div>
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          Erwartete durchschnittliche Rendite für die Entnahme-Phase
          (meist konservativer als Ansparphase)
        </div>
      </div>

      <div className="mb-4 space-y-2">
        <Label>Standardabweichung (%)</Label>
        <div className="space-y-2">
          <Slider
            value={[withdrawalStandardDeviation]}
            min={5}
            max={25}
            step={1}
            onValueChange={value => onWithdrawalStandardDeviationChange(value[0])}
            className="mt-2"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>5%</span>
            <span className="font-medium text-gray-900">
              {withdrawalStandardDeviation}
              %
            </span>
            <span>25%</span>
          </div>
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          Volatilität der Renditen (meist niedriger als Ansparphase
          wegen konservativerer Allokation)
        </div>
      </div>

      <div className="mb-4 space-y-2">
        <Label>Zufalls-Seed (optional)</Label>
        <Input
          type="number"
          value={withdrawalRandomSeed || ''}
          onChange={(e) => {
            const value = e.target.value ? Number(e.target.value) : undefined
            onWithdrawalRandomSeedChange(value)
          }}
          placeholder="Für reproduzierbare Ergebnisse"
        />
        <div className="text-sm text-muted-foreground mt-1">
          Optionaler Seed für reproduzierbare Zufallsrenditen. Leer
          lassen für echte Zufälligkeit.
        </div>
      </div>
    </>
  )
}
