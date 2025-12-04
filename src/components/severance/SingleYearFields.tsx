import { useMemo } from 'react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import type { SeveranceConfig } from '../../../helpers/abfindung'
import { generateFormId } from '../../utils/unique-id'

interface SingleYearFieldsProps {
  config: SeveranceConfig
  onConfigChange: (updates: Partial<SeveranceConfig>) => void
}

export function SingleYearFields({ config, onConfigChange }: SingleYearFieldsProps) {
  return (
    <>
      <YearField config={config} onConfigChange={onConfigChange} />
      <IncomeField config={config} onConfigChange={onConfigChange} />
      <CapitalGainsField config={config} onConfigChange={onConfigChange} />
    </>
  )
}

function YearField({ config, onConfigChange }: SingleYearFieldsProps) {
  const severanceYearId = useMemo(() => generateFormId('severance', 'severance-year'), [])

  return (
    <div className="space-y-2">
      <Label htmlFor={severanceYearId} className="text-sm font-medium">
        Jahr der Abfindung
      </Label>
      <Input
        id={severanceYearId}
        type="number"
        min="2020"
        max="2050"
        value={config.severanceYear}
        onChange={e => onConfigChange({ severanceYear: parseInt(e.target.value, 10) || new Date().getFullYear() })}
      />
    </div>
  )
}

function IncomeField({ config, onConfigChange }: SingleYearFieldsProps) {
  const annualIncomeId = useMemo(() => generateFormId('severance', 'annual-income'), [])

  return (
    <div className="space-y-2">
      <Label htmlFor={annualIncomeId} className="text-sm font-medium">
        Jahresbruttoeinkommen (ohne Abfindung)
      </Label>
      <div className="flex items-center space-x-2">
        <Input
          id={annualIncomeId}
          type="number"
          min="0"
          step="1000"
          value={config.annualGrossIncome}
          onChange={e => onConfigChange({ annualGrossIncome: parseFloat(e.target.value) || 0 })}
          className="flex-1"
        />
        <span className="text-sm text-muted-foreground">€</span>
      </div>
    </div>
  )
}

function CapitalGainsField({ config, onConfigChange }: SingleYearFieldsProps) {
  const capitalGainsId = useMemo(() => generateFormId('severance', 'capital-gains'), [])

  return (
    <div className="space-y-2">
      <Label htmlFor={capitalGainsId} className="text-sm font-medium">
        Kapitalerträge im Abfindungsjahr (optional)
      </Label>
      <div className="flex items-center space-x-2">
        <Input
          id={capitalGainsId}
          type="number"
          min="0"
          step="100"
          value={config.annualCapitalGains || 0}
          onChange={e => onConfigChange({ annualCapitalGains: parseFloat(e.target.value) || 0 })}
          className="flex-1"
        />
        <span className="text-sm text-muted-foreground">€</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Optional: Kapitalerträge werden zur Gesamtsteuerlast hinzugerechnet
      </p>
    </div>
  )
}
