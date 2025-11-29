import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Trash2 } from 'lucide-react'
import { formatCurrency } from '../../utils/currency'
import type { ProgressionsvorbehaltConfig } from '../../../helpers/progressionsvorbehalt'

interface ConfiguredYearsListProps {
  config: ProgressionsvorbehaltConfig
  configuredYears: number[]
  onUpdateIncome: (year: number, income: number) => void
  onRemoveYear: (year: number) => void
}

/**
 * Display list of configured years with edit/delete options
 */
export function ConfiguredYearsList({
  config,
  configuredYears,
  onUpdateIncome,
  onRemoveYear,
}: ConfiguredYearsListProps) {
  if (configuredYears.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold">Konfigurierte progressionsrelevante Einkünfte:</Label>
      <div className="space-y-2">
        {configuredYears.map(year => (
          <div key={year} className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold">{year}</span>
                <span className="text-sm text-muted-foreground">·</span>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(config.progressionRelevantIncomePerYear[year])}
                </span>
              </div>
            </div>
            <Input
              type="number"
              value={config.progressionRelevantIncomePerYear[year]}
              onChange={e => onUpdateIncome(year, parseFloat(e.target.value) || 0)}
              className="w-32"
              min="0"
              step="100"
            />
            <Button variant="ghost" size="sm" onClick={() => onRemoveYear(year)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
