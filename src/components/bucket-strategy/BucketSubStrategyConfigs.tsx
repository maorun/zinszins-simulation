import { Slider } from '../ui/slider'
import { Label } from '../ui/label'
import { Input } from '../ui/input'

interface VariabelProzentConfigProps {
  value: number
  onChange: (value: number) => void
}

export function VariabelProzentConfig({ value, onChange }: VariabelProzentConfigProps) {
  return (
    <div className="space-y-2">
      <Label>Entnahme-Prozentsatz (%)</Label>
      <div className="space-y-2">
        <Slider
          value={[value]}
          onValueChange={(values: number[]) => onChange(values[0])}
          min={1}
          max={10}
          step={0.5}
          className="mt-2"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>1%</span>
          <span className="font-medium text-gray-900">{value}%</span>
          <span>10%</span>
        </div>
      </div>
      <div className="text-sm text-muted-foreground mt-1">
        Wählen Sie einen Entnahme-Prozentsatz zwischen 1% und 10% in 0,5%-Schritten
      </div>
    </div>
  )
}

interface MonatlichFestConfigProps {
  value: number
  onChange: (value: number) => void
}

export function MonatlichFestConfig({ value, onChange }: MonatlichFestConfigProps) {
  return (
    <div className="space-y-2">
      <Label>Monatlicher Betrag (€)</Label>
      <Input
        type="number"
        value={value}
        onChange={(e) => {
          const inputValue = e.target.value
          const newValue = inputValue === '' ? 0 : Number(inputValue) || 2000
          onChange(newValue)
        }}
        min={100}
        max={20000}
        step={100}
      />
      <div className="text-sm text-muted-foreground mt-1">
        Fester monatlicher Entnahme-Betrag (wird automatisch mit Inflation angepasst)
      </div>
    </div>
  )
}
