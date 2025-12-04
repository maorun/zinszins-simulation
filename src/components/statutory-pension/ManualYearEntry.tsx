import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Trash2 } from 'lucide-react'
import { getAverageGrossSalary } from '../../../helpers/pension-points'

interface ManualYearEntryProps {
  year: number
  salary: number
  onYearChange: (oldYear: number, newYear: number, salary: number) => void
  onSalaryChange: (year: number, salary: number) => void
  onRemove: (year: number) => void
}

/**
 * Single year entry in manual salary history mode
 */
export function ManualYearEntry({ year, salary, onYearChange, onSalaryChange, onRemove }: ManualYearEntryProps) {
  const avgSalary = getAverageGrossSalary(year)

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
      <div className="w-20">
        <Input
          type="number"
          value={year}
          onChange={e => {
            const newYear = Number(e.target.value)
            if (newYear !== year) {
              onYearChange(year, newYear, salary)
            }
          }}
          min={1960}
          max={2070}
        />
      </div>
      <div className="flex-1">
        <Input type="number" value={salary} onChange={e => onSalaryChange(year, Number(e.target.value))} min={0} step={1000} placeholder="Bruttogehalt" />
      </div>
      <div className="text-xs text-muted-foreground w-32">Ø: {avgSalary.toLocaleString('de-DE')} €</div>
      <Button onClick={() => onRemove(year)} size="sm" variant="ghost">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
