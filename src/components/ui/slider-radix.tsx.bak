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
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      value,
      defaultValue = [0],
      min = 0,
      max = 100,
      step = 1,
      onValueChange,
      className,
      disabled = false,
      ...props
    },
    ref,
  ) => {
    // Use controlled value if provided, otherwise use defaultValue
    const currentValue = value !== undefined ? value[0] : defaultValue[0]

    // Calculate percentage for visual styling
    const percentage = ((currentValue - min) / (max - min)) * 100

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value)
      onValueChange?.([newValue])
    }

    return (
      <div className={cn('relative flex w-full touch-none select-none items-center', className)}>
        {/* Track background */}
        <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
          {/* Filled portion (Range) */}
          <div
            className="absolute h-full bg-primary transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Native range input */}
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={handleChange}
          disabled={disabled}
          className="absolute w-full h-2 opacity-0 cursor-pointer disabled:cursor-not-allowed"
          {...props}
        />

        {/* Thumb */}
        <div
          className="absolute h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-all pointer-events-none"
          style={{
            left: `calc(${percentage}% - 10px)`, // Center the thumb (half of 20px width)
          }}
        />
      </div>
    )
  },
)
Slider.displayName = 'Slider'

export { Slider }
