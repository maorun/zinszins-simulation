import { useMemo } from 'react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { generateFormId } from '../../utils/unique-id'

interface ComparisonYearsInputProps {
  comparisonYears: { [year: number]: number }
  onComparisonYearsChange: (years: { [year: number]: number }) => void
}

export function ComparisonYearsInput({ comparisonYears, onComparisonYearsChange }: ComparisonYearsInputProps) {
  const handleYearIncomeChange = (year: number, income: number) => {
    onComparisonYearsChange({
      ...comparisonYears,
      [year]: income,
    })
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Jahresbruttoeinkommen für Vergleichsjahre</Label>
      <p className="text-xs text-muted-foreground mb-3">
        Geben Sie Ihr erwartetes Bruttoeinkommen für verschiedene Jahre ein, um den steuerlich günstigsten Zeitpunkt zu
        finden.
      </p>
      {Object.entries(comparisonYears)
        .sort(([a], [b]) => parseInt(a, 10) - parseInt(b, 10))
        .map(([year]) => (
          <YearIncomeRow
            key={year}
            year={parseInt(year, 10)}
            income={comparisonYears[parseInt(year, 10)]}
            onChange={handleYearIncomeChange}
          />
        ))}
    </div>
  )
}

function YearIncomeRow({
  year,
  income,
  onChange,
}: {
  year: number
  income: number
  onChange: (year: number, income: number) => void
}) {
  const inputId = useMemo(() => generateFormId('severance-comparison', `year-${year}`), [year])

  return (
    <div className="flex items-center space-x-3">
      <Label htmlFor={inputId} className="text-sm w-16">
        {year}:
      </Label>
      <Input
        id={inputId}
        type="number"
        min="0"
        step="1000"
        value={income}
        onChange={e => onChange(year, parseFloat(e.target.value) || 0)}
        className="flex-1"
      />
      <span className="text-sm text-muted-foreground">€</span>
    </div>
  )
}
