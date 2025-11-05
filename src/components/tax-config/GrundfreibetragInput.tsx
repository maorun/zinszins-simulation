import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { GrundfreibetragInfo } from './GrundfreibetragInfo'

interface GrundfreibetragInputProps {
  grundfreibetragBetrag: number
  recommendedGrundfreibetrag: number
  planningModeLabel: string
  onGrundfreibetragBetragChange: (value: number) => void
}

export function GrundfreibetragInput({
  grundfreibetragBetrag,
  recommendedGrundfreibetrag,
  planningModeLabel,
  onGrundfreibetragBetragChange,
}: GrundfreibetragInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="grundfreibetragBetrag">Grundfreibetrag pro Jahr (€)</Label>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onGrundfreibetragBetragChange(recommendedGrundfreibetrag)}
          className="text-xs"
        >
          Reset (
          {planningModeLabel}
          )
        </Button>
      </div>
      <Input
        id="grundfreibetragBetrag"
        type="number"
        value={grundfreibetragBetrag}
        min={0}
        max={50000}
        step={100}
        onChange={(e) => {
          const value = Number(e.target.value)
          if (!isNaN(value)) {
            onGrundfreibetragBetragChange(value)
          }
        }}
        className="w-full"
      />
      <GrundfreibetragInfo
        recommendedGrundfreibetrag={recommendedGrundfreibetrag}
        planningModeLabel={planningModeLabel}
      />
    </div>
  )
}
