import * as React from 'react'
import { cn } from '../../lib/utils'

interface SliderProps {
  value?: number[]
  defaultValue?: number[]
  min?: number
  max?: number
  step?: number
  onValueChange?: (value: number[]) => void
  className?: string
  disabled?: boolean
  id?: string
  name?: string
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>((props, ref) => {
  const {
    value,
    defaultValue = [0],
    min = 0,
    max = 100,
    step = 1,
    onValueChange,
    className,
    disabled = false,
    id,
    name,
    ...rest
  } = props

  const currentValue = value !== undefined ? value[0] : defaultValue[0]
  const percentage = ((currentValue - min) / (max - min)) * 100
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => onValueChange?.([parseFloat(e.target.value)])

  return (
    <div className={cn('relative flex w-full touch-none select-none items-center', className)}>
      <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <div className="absolute h-full bg-primary transition-all" style={{ width: `${percentage}%` }} />
      </div>
      <input
        ref={ref}
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        onChange={handleChange}
        disabled={disabled}
        id={id}
        name={name}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={currentValue}
        className="absolute w-full h-2 opacity-0 cursor-pointer disabled:cursor-not-allowed"
        {...rest}
      />
      <div
        className="absolute h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-all pointer-events-none"
        style={{ left: `calc(${percentage}% - 10px)` }}
      />
    </div>
  )
})
Slider.displayName = 'Slider'

export { Slider }
