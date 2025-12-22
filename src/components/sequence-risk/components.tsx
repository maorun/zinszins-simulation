import React from 'react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { TrendingUp, TrendingDown, Info } from 'lucide-react'
import { formatCurrency } from '../../utils/currency'
import type { SequenceRiskAnalysis } from '../../../helpers/sequence-risk'

export interface RiskLevelBadgeProps {
  level: 'low' | 'medium' | 'high' | 'critical'
}

export function RiskLevelBadge({ level }: RiskLevelBadgeProps) {
  const colors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  }

  const labels = {
    low: 'Niedriges Risiko',
    medium: 'Mittleres Risiko',
    high: 'Hohes Risiko',
    critical: 'Kritisches Risiko',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[level]}`}>
      {labels[level]}
    </span>
  )
}

export interface ScenarioResultProps {
  label: string
  analysis: SequenceRiskAnalysis
  icon: React.ReactNode
}

export function ScenarioResult({ label, analysis, icon }: ScenarioResultProps) {
  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex items-center gap-2">
        {icon}
        <h4 className="font-medium">{label}</h4>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-muted-foreground">Endkapital</p>
          <p className="font-medium">
            {analysis.portfolioDepleted ? 'Aufgebraucht' : formatCurrency(analysis.finalPortfolioValue)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Jahre überlebt</p>
          <p className="font-medium">
            {analysis.yearsSurvived} / {analysis.scenario.years}
          </p>
        </div>
      </div>
      {analysis.portfolioDepleted && analysis.depletionYear && (
        <p className="text-sm text-red-600">Portfolio aufgebraucht in Jahr {analysis.depletionYear}</p>
      )}
    </div>
  )
}

export interface ScenarioComparisonProps {
  bestCase: SequenceRiskAnalysis
  averageCase: SequenceRiskAnalysis
  worstCase: SequenceRiskAnalysis
}

export function ScenarioComparison({ bestCase, averageCase, worstCase }: ScenarioComparisonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ScenarioResult
        label="Günstige Sequenz"
        analysis={bestCase}
        icon={<TrendingUp className="h-5 w-5 text-green-600" />}
      />
      <ScenarioResult label="Durchschnitt" analysis={averageCase} icon={<Info className="h-5 w-5 text-blue-600" />} />
      <ScenarioResult
        label="Ungünstige Sequenz"
        analysis={worstCase}
        icon={<TrendingDown className="h-5 w-5 text-red-600" />}
      />
    </div>
  )
}

export interface ConfigInputFieldProps {
  id: string
  label: string
  value: number
  min: string
  max?: string
  step: string
  helperText?: string
  onChange: (value: number) => void
  parseValue?: (value: string) => number
}

export function ConfigInputField({
  id,
  label,
  value,
  min,
  max,
  step,
  helperText,
  onChange,
  parseValue = (v) => parseFloat(v) || 0,
}: ConfigInputFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseValue(e.target.value))}
      />
      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
    </div>
  )
}
