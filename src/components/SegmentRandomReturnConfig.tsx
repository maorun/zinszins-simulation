import { Input } from './ui/input'
import { Label } from './ui/label'
import { Slider } from './ui/slider'
import { generateInstanceId } from '../utils/unique-id'
import type { RandomReturnConfig } from '../../helpers/random-returns'

interface RandomReturnConfigProps {
  segmentId: string
  randomConfig: RandomReturnConfig | undefined
  onRandomConfigChange: (config: RandomReturnConfig) => void
}

// eslint-disable-next-line max-lines-per-function -- Large component function
export function SegmentRandomReturnConfig({
  segmentId,
  randomConfig,
  onRandomConfigChange,
}: RandomReturnConfigProps) {
  const averageReturn = randomConfig?.averageReturn || 0.05
  const standardDeviation = randomConfig?.standardDeviation ?? 0.12
  const seed = randomConfig?.seed

  const handleAverageReturnChange = (value: number) => {
    onRandomConfigChange({
      averageReturn: value,
      standardDeviation,
      seed,
    })
  }

  const handleStdDevChange = (value: number) => {
    onRandomConfigChange({
      averageReturn,
      standardDeviation: value,
      seed,
    })
  }

  const handleSeedChange = (value: number | undefined) => {
    onRandomConfigChange({
      averageReturn,
      standardDeviation,
      seed: value,
    })
  }

  return (
    <>
      <div className="mb-4 space-y-2">
        <Label htmlFor={generateInstanceId('avg-return', segmentId)}>
          Durchschnittliche Rendite (%)
        </Label>
        <div className="space-y-2">
          <Slider
            id={generateInstanceId('avg-return', segmentId)}
            value={[averageReturn * 100]}
            min={0}
            max={12}
            step={0.5}
            onValueChange={value => handleAverageReturnChange(value[0] / 100)}
            className="mt-2"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>0%</span>
            <span className="font-medium text-gray-900">
              {(averageReturn * 100).toFixed(1)}
              %
            </span>
            <span>12%</span>
          </div>
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          Erwartete durchschnittliche Rendite für diese Phase (meist konservativer als Ansparphase)
        </div>
      </div>

      <div className="mb-4 space-y-2">
        <Label htmlFor={generateInstanceId('std-dev', segmentId)}>
          Standardabweichung (%)
        </Label>
        <div className="space-y-2">
          <Slider
            id={generateInstanceId('std-dev', segmentId)}
            value={[standardDeviation * 100]}
            min={5}
            max={25}
            step={1}
            onValueChange={value => handleStdDevChange(value[0] / 100)}
            className="mt-2"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>5%</span>
            <span className="font-medium text-gray-900">
              {(standardDeviation * 100).toFixed(0)}
              %
            </span>
            <span>25%</span>
          </div>
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          Volatilität der Renditen (meist niedriger als Ansparphase wegen konservativerer Allokation)
        </div>
      </div>

      <div className="mb-4 space-y-2">
        <Label htmlFor={generateInstanceId('random-seed', segmentId)}>
          Zufalls-Seed (optional)
        </Label>
        <Input
          id={generateInstanceId('random-seed', segmentId)}
          type="number"
          value={seed || ''}
          onChange={(e) => {
            const value = e.target.value ? Number(e.target.value) : undefined
            handleSeedChange(value)
          }}
          placeholder="Für reproduzierbare Ergebnisse"
        />
        <div className="text-sm text-muted-foreground mt-1">
          Optionaler Seed für reproduzierbare Zufallsrenditen. Leer lassen für echte Zufälligkeit.
        </div>
      </div>
    </>
  )
}
