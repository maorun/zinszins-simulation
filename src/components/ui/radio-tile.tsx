import * as React from "react"
import { RadioGroup, RadioGroupItem } from "./radio-group"
import { Label } from "./label"
import { cn } from "../../lib/utils"

interface RadioTileProps {
  value: string
  label: string
  children: React.ReactNode
  className?: string
}

export const RadioTile = React.forwardRef<
  React.ElementRef<typeof RadioGroupItem>,
  RadioTileProps
>(({ value, label, children, className, ...props }, ref) => {
  return (
    <Label 
      htmlFor={value}
      className={cn(
        "flex cursor-pointer flex-col space-y-2 rounded-lg border border-input p-4 transition-colors hover:bg-accent/50 data-[state=checked]:border-primary data-[state=checked]:bg-accent",
        className
      )}
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem ref={ref} value={value} id={value} {...props} />
        <div className="font-semibold leading-none">{label}</div>
      </div>
      <div className="text-sm text-muted-foreground">{children}</div>
    </Label>
  )
})
RadioTile.displayName = "RadioTile"

interface RadioTileGroupProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

export const RadioTileGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroup>,
  RadioTileGroupProps
>(({ value, onValueChange, children, className, ...props }, ref) => {
  return (
    <RadioGroup
      ref={ref}
      value={value}
      onValueChange={onValueChange}
      className={cn("grid grid-cols-1 gap-4 md:grid-cols-3", className)}
      {...props}
    >
      {children}
    </RadioGroup>
  )
})
RadioTileGroup.displayName = "RadioTileGroup"