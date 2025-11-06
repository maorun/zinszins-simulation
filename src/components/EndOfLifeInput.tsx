import { Label } from './ui/label'
import { Input } from './ui/input'
import { AutomaticCalculationHelper } from './AutomaticCalculationHelper'

interface EndOfLifeInputProps {
  globalEndOfLife: number
  startOfIndependence: number
  useAutomaticCalculation: boolean
  onChange: (year: number) => void
  automaticCalculationConfig?: {
    planningMode: 'individual' | 'couple'
    birthYear: number | undefined
    expectedLifespan: number | undefined
    gender: 'male' | 'female' | undefined
    spouse: { gender: 'male' | 'female'; birthYear?: number } | undefined
  }
  onExpectedLifespanChange?: (lifespan: number | undefined) => void
}

export function EndOfLifeInput({
  globalEndOfLife,
  startOfIndependence,
  useAutomaticCalculation,
  onChange,
  automaticCalculationConfig,
  onExpectedLifespanChange,
}: EndOfLifeInputProps) {
  return (
    <div className="space-y-2">
      <Label>Lebensende (Jahr)</Label>
      <Input
        type="number"
        value={globalEndOfLife}
        onChange={e => {
          const value = e.target.value ? Number(e.target.value) : 2080
          onChange(value)
        }}
        min={startOfIndependence + 1}
        max={2150}
        disabled={useAutomaticCalculation}
      />
      <div className="text-sm text-muted-foreground">Das Jahr, in dem die Entnahmephase enden soll (z.B. 2080)</div>

      {/* Automatic calculation helper */}
      {useAutomaticCalculation && automaticCalculationConfig && onExpectedLifespanChange && (
        <AutomaticCalculationHelper
          config={automaticCalculationConfig}
          onChange={{
            expectedLifespan: onExpectedLifespanChange,
          }}
        />
      )}
    </div>
  )
}
