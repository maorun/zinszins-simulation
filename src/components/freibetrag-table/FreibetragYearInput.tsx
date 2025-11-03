import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Plus } from 'lucide-react'

interface FreibetragYearInputProps {
  yearToday: number
  onAddYear: (year: number) => void
}

export function FreibetragYearInput({ yearToday, onAddYear }: FreibetragYearInputProps) {
  return (
    <div className="flex gap-2 items-end">
      <div className="flex-1">
        <Input
          type="number"
          placeholder="Jahr"
          min={yearToday}
          max={2100}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const input = e.target as HTMLInputElement
              const year = Number(input.value)
              if (year) {
                onAddYear(year)
                input.value = ''
              }
            }
          }}
        />
      </div>
      <Button onClick={() => onAddYear(yearToday)}>
        <Plus className="h-4 w-4 mr-2" />
        Jahr hinzufügen
      </Button>
    </div>
  )
}
