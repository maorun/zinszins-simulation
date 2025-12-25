import { useState, useMemo } from 'react'
import { Button } from '../ui/button'
import type { ProgressionsvorbehaltConfig } from '../../../helpers/progressionsvorbehalt'
import { ProgressionsvorbehaltInfo } from './ProgressionsvorbehaltInfo'
import { ProgressionsvorbehaltScenarios } from './ProgressionsvorbehaltScenarios'
import { ProgressionsvorbehaltTaxComparison } from './ProgressionsvorbehaltTaxComparison'
import { ConfiguredYearsList } from './ConfiguredYearsList'
import { AddYearForm } from './AddYearForm'
import { calculateTaxComparisonData } from './taxCalculation'
import { createHandlers } from './handlers'

interface ProgressionsvorbehaltContentProps {
  config: ProgressionsvorbehaltConfig
  onChange: (config: ProgressionsvorbehaltConfig) => void
  kirchensteuerAktiv: boolean
  kirchensteuersatz: number
  timeRange?: { start: number; end: number }
}

function useConfiguredYears(config: ProgressionsvorbehaltConfig) {
  return useMemo(
    () => Object.keys(config.progressionRelevantIncomePerYear).map(Number).sort((a, b) => a - b),
    [config.progressionRelevantIncomePerYear],
  )
}

function useComparisonData(
  config: ProgressionsvorbehaltConfig,
  configuredYears: number[],
  kirchensteuerAktiv: boolean,
  kirchensteuersatz: number,
) {
  const exampleTaxableIncome = 40000
  return useMemo(() => {
    if (!config.enabled || configuredYears.length === 0) return { data: null, exampleTaxableIncome }
    return {
      data: calculateTaxComparisonData(config, exampleTaxableIncome, configuredYears[0], kirchensteuerAktiv, kirchensteuersatz),
      exampleTaxableIncome,
    }
  }, [config, configuredYears, kirchensteuerAktiv, kirchensteuersatz])
}

export function ProgressionsvorbehaltContent(props: ProgressionsvorbehaltContentProps) {
  const { config, onChange, kirchensteuerAktiv, kirchensteuersatz, timeRange } = props
  const [newYearInput, setNewYearInput] = useState('')
  const [newIncomeInput, setNewIncomeInput] = useState('')
  const configuredYears = useConfiguredYears(config)
  const comparison = useComparisonData(config, configuredYears, kirchensteuerAktiv, kirchensteuersatz)
  const handlers = createHandlers(config, onChange)

  const handleAddYear = () => {
    const year = parseInt(newYearInput, 10)
    const income = parseFloat(newIncomeInput)
    if (isNaN(year) || isNaN(income) || income < 0) return
    handlers.handleAddYear(year, income)
    setNewYearInput('')
    setNewIncomeInput('')
  }

  return (
    <div className="space-y-6">
      <ProgressionsvorbehaltInfo />
      {configuredYears.length === 0 && <ProgressionsvorbehaltScenarios onApplyScenario={handlers.handleApplyScenario} />}
      <ConfiguredYearsList
        config={config}
        configuredYears={configuredYears}
        onUpdateIncome={handlers.handleUpdateIncome}
        onRemoveYear={handlers.handleRemoveYear}
      />
      <AddYearForm
        newYearInput={newYearInput}
        newIncomeInput={newIncomeInput}
        onYearInputChange={setNewYearInput}
        onIncomeInputChange={setNewIncomeInput}
        onAdd={handleAddYear}
        timeRange={timeRange}
      />
      {comparison.data && (
        <ProgressionsvorbehaltTaxComparison comparisonData={comparison.data} exampleTaxableIncome={comparison.exampleTaxableIncome} />
      )}
      {(config.enabled || configuredYears.length > 0) && (
        <div className="flex justify-end border-t pt-4">
          <Button variant="outline" size="sm" onClick={handlers.handleReset}>
            Zurücksetzen
          </Button>
        </div>
      )}
    </div>
  )
}
