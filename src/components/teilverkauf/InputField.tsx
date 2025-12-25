import { Label } from '../ui/label'
import { Input } from '../ui/input'

interface InputFieldProps {
  id: string
  label: string
  value: number
  onChange: (value: string) => void
  min: number
  max?: number
  step: number
  helpText?: string
}

export function InputField({ id, label, value, onChange, min, max, step, helpText }: InputFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type="number" min={min} max={max} step={step} value={value} onChange={(e) => onChange(e.target.value)} />
      {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
    </div>
  )
}
