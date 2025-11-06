import { Input } from './ui/input'
import { Label } from './ui/label'

interface VariableConfig {
  yearlyReturns: Record<number, number>
}

interface VariableReturnConfigProps {
  startYear: number
  endYear: number
  variableConfig: VariableConfig | undefined
  onVariableConfigChange: (config: VariableConfig) => void
}

/**
 * Single year return input row
 */
function YearReturnInput({
  year,
  currentReturn,
  onChange,
}: {
  year: number
  currentReturn: number
  onChange: (year: number, returnValue: number) => void
}) {
  return (
    <div key={year} className="flex items-center space-x-3 mb-2">
      <span className="text-sm font-medium min-w-[60px]">{year}:</span>
      <Input
        type="number"
        value={(currentReturn * 100).toFixed(1)}
        onChange={(e) => {
          const newReturn = e.target.value ? Number(e.target.value) / 100 : 0.05
          onChange(year, newReturn)
        }}
        step={0.1}
        min={-50}
        max={50}
        className="flex-1"
      />
      <span className="text-sm text-gray-500">%</span>
    </div>
  )
}

export function SegmentVariableReturnConfig({
  startYear,
  endYear,
  variableConfig,
  onVariableConfigChange,
}: VariableReturnConfigProps) {
  const yearlyReturns = variableConfig?.yearlyReturns || {}

  const handleYearReturnChange = (year: number, returnValue: number) => {
    const newYearlyReturns = { ...yearlyReturns, [year]: returnValue }
    onVariableConfigChange({ yearlyReturns: newYearlyReturns })
  }

  return (
    <div className="mb-4 space-y-2">
      <Label>Variable Renditen pro Jahr</Label>
      <div className="max-h-[300px] overflow-y-auto p-2 border border-[#e2e8f0] rounded-md">
        {Array.from({ length: endYear - startYear + 1 }, (_, index) => {
          const year = startYear + index
          const currentReturn = yearlyReturns[year] || 0.05
          return (
            <YearReturnInput key={year} year={year} currentReturn={currentReturn} onChange={handleYearReturnChange} />
          )
        })}
      </div>
      <div className="text-sm text-muted-foreground mt-1">
        Konfiguriere die erwartete Rendite für jedes Jahr dieser Phase individuell.
      </div>
    </div>
  )
}
