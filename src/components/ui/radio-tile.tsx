import * as React from "react"
import { cn } from "../../lib/utils"

interface RadioTileProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  description?: React.ReactNode
  children?: React.ReactNode
}

const RadioTile = React.forwardRef<HTMLInputElement, RadioTileProps>(
  ({ className, label, description, children, ...props }, ref) => {
    return (
      <label 
        className={cn(
          "relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all",
          "hover:bg-gray-50 border-gray-200",
          "has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50",
          className
        )}
      >
        <input
          type="radio"
          ref={ref}
          className="sr-only"
          {...props}
        />
        <div className="font-semibold text-sm mb-1">{label}</div>
        <div className="text-sm text-gray-600">
          {description || children}
        </div>
      </label>
    )
  }
)
RadioTile.displayName = "RadioTile"

interface RadioTileGroupProps {
  value?: string
  onValueChange?: (value: string) => void
  onChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

const RadioTileGroup = ({ 
  value, 
  onValueChange, 
  onChange, 
  children, 
  className 
}: RadioTileGroupProps) => {
  const handleChange = onValueChange || onChange

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child
        const childProps = child.props as any
        return React.cloneElement(child as any, {
          checked: childProps.value === value,
          onChange: () => handleChange && handleChange(childProps.value)
        })
      })}
    </div>
  )
}

export { RadioTile, RadioTileGroup }