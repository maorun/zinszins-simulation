import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Switch } from '../ui/switch'
import { InfoIcon } from './InfoIcon'

interface BusinessSaleInputFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  helpText: string
  type?: 'number'
  min?: string
  max?: string
  step?: string
}

export function BusinessSaleInputField({
  id,
  label,
  value,
  onChange,
  placeholder,
  helpText,
  type = 'number',
  min = '0',
  max,
  step = '1000',
}: BusinessSaleInputFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} <InfoIcon />
      </Label>
      <Input
        id={id}
        type={type}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <p className="text-xs text-gray-600">{helpText}</p>
    </div>
  )
}

interface BusinessSaleSwitchFieldProps {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  helpText: string
}

export function BusinessSaleSwitchField({
  id,
  label,
  checked,
  onChange,
  helpText,
}: BusinessSaleSwitchFieldProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-md">
      <div className="space-y-1">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <p className="text-xs text-gray-600">{helpText}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
