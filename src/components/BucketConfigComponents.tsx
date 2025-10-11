import { Slider } from './ui/slider'
import { Label } from './ui/label'
import { Input } from './ui/input'

interface InitialCashCushionConfigProps {
  value: number
  onChange: (value: number) => void
  inputId?: string
  isFormMode?: boolean
}

export function InitialCashCushionConfig({
  value,
  onChange,
  inputId = 'bucket-initial-cash',
  isFormMode = false,
}: InitialCashCushionConfigProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>
        Initiales Cash-Polster (€)
      </Label>
      <Input
        id={inputId}
        type="number"
        value={value}
        onChange={(e) => {
          const inputValue = e.target.value
          const newValue = inputValue === '' ? 0 : Number(inputValue) || 20000
          onChange(newValue)
        }}
        min={1000}
        max={100000}
        step={1000}
      />
      <p className="text-sm text-gray-600">
        {isFormMode
          ? 'Anfänglicher Betrag im Cash-Polster für Entnahmen bei negativen Renditen'
          : 'Anfänglicher Cash-Puffer für negative Rendite-Jahre'}
      </p>
    </div>
  )
}

interface RefillThresholdConfigProps {
  value: number
  onChange: (value: number) => void
  inputId?: string
}

export function RefillThresholdConfig({
  value,
  onChange,
  inputId = 'bucket-refill-threshold',
}: RefillThresholdConfigProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>
        Auffüll-Schwellenwert (€)
      </Label>
      <Input
        id={inputId}
        type="number"
        value={value}
        onChange={(e) => {
          const inputValue = e.target.value
          const newValue = inputValue === '' ? 0 : Number(inputValue) || 5000
          onChange(newValue)
        }}
        min={100}
        max={50000}
        step={100}
      />
      <p className="text-sm text-gray-600">
        Überschreiten die jährlichen Gewinne diesen Betrag, wird Cash-Polster aufgefüllt
      </p>
    </div>
  )
}

interface RefillPercentageConfigProps {
  value: number
  onChange: (value: number) => void
}

export function RefillPercentageConfig({
  value,
  onChange,
}: RefillPercentageConfigProps) {
  return (
    <div className="space-y-2">
      <Label>Auffüll-Anteil (%)</Label>
      <div className="px-3">
        <Slider
          value={[value * 100]}
          onValueChange={(values) => {
            const percentage = values[0] / 100
            onChange(percentage)
          }}
          max={100}
          min={10}
          step={5}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-500 mt-1">
          <span>10%</span>
          <span className="font-medium text-gray-900">
            {(value * 100).toFixed(0)}
            %
          </span>
          <span>100%</span>
        </div>
      </div>
      <p className="text-sm text-gray-600">
        Anteil der Überschussgewinne, der ins Cash-Polster verschoben wird
      </p>
    </div>
  )
}
