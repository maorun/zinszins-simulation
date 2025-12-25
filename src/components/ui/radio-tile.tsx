import * as React from 'react'
import { cn } from '../../lib/utils'
import { Circle } from 'lucide-react'

// Context to pass the group name and current value to RadioTile children
const RadioTileGroupContext = React.createContext<{
  name: string
  value?: string
  onValueChange?: (value: string) => void
} | null>(null)

interface RadioTileProps {
  value: string
  label: string
  children: React.ReactNode
  className?: string
}

export const RadioTile = React.forwardRef<HTMLInputElement, RadioTileProps>(
  ({ value, label, children, className }, ref) => {
    const context = React.useContext(RadioTileGroupContext)
    if (!context) {
      throw new Error('RadioTile must be used within a RadioTileGroup')
    }

    const { name, value: groupValue, onValueChange } = context
    const isChecked = groupValue === value
    const inputId = `${name}-${value}`

    return (
      <div
        className={cn(
          'flex cursor-pointer flex-col space-y-2 rounded-lg border border-input p-4 transition-colors hover:bg-accent/50',
          isChecked && 'border-primary bg-accent',
          className,
        )}
        onClick={() => onValueChange?.(value)}
      >
        <div className="flex items-center space-x-2">
          <div className="relative flex items-center">
            <input
              ref={ref}
              type="radio"
              id={inputId}
              name={name}
              value={value}
              checked={isChecked}
              onChange={(e) => {
                if (e.target.checked) {
                  onValueChange?.(value)
                }
              }}
              className="peer sr-only"
            />
            <div
              className={cn(
                'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'flex items-center justify-center',
              )}
            >
              {isChecked && <Circle className="h-2.5 w-2.5 fill-current text-current" />}
            </div>
          </div>
          <label htmlFor={inputId} className="font-semibold leading-none cursor-pointer">
            {label}
          </label>
        </div>
        <div className="text-sm text-muted-foreground">{children}</div>
      </div>
    )
  },
)
RadioTile.displayName = 'RadioTile'

interface RadioTileGroupProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
  name?: string
}

export const RadioTileGroup = React.forwardRef<HTMLDivElement, RadioTileGroupProps>(
  ({ value, onValueChange, children, className, name = 'radio-tile-group', ...props }, ref) => {
    const contextValue = React.useMemo(
      () => ({
        name,
        value,
        onValueChange,
      }),
      [name, value, onValueChange],
    )

    return (
      <RadioTileGroupContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn('grid grid-cols-1 gap-4 md:grid-cols-3', className)}
          role="radiogroup"
          {...props}
        >
          {children}
        </div>
      </RadioTileGroupContext.Provider>
    )
  },
)
RadioTileGroup.displayName = 'RadioTileGroup'
