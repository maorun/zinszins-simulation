import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Plus, Trash2, Info } from 'lucide-react'
import {
  type ProgressionsvorbehaltConfig,
  DEFAULT_PROGRESSIONSVORBEHALT_CONFIG,
  calculateIncomeTaxWithProgressionsvorbehalt,
  calculateGermanIncomeTax,
} from '../../helpers/progressionsvorbehalt'
import { formatCurrency } from '../utils/currency'
import { GlossaryTerm } from './GlossaryTerm'

interface ProgressionsvorbehaltConfigurationProps {
  /** Current configuration */
  config: ProgressionsvorbehaltConfig
  /** Callback when configuration changes */
  onChange: (config: ProgressionsvorbehaltConfig) => void
  /** Planning mode for proper Grundfreibetrag */
  planningMode?: 'individual' | 'couple'
  /** Whether Kirchensteuer is active */
  kirchensteuerAktiv?: boolean
  /** Kirchensteuer rate (8 or 9%) */
  kirchensteuersatz?: number
  /** Optional time range for year selection */
  timeRange?: { start: number; end: number }
}

// Income type categories for Progressionsvorbehalt - reserved for future use
// const INCOME_TYPES = [
//   { value: 'elterngeld', label: 'Elterngeld', description: 'Parental allowance' },
//   { value: 'arbeitslosengeld', label: 'Arbeitslosengeld I', description: 'Unemployment benefits' },
//   { value: 'kurzarbeitergeld', label: 'Kurzarbeitergeld', description: 'Short-time work compensation' },
//   { value: 'foreign', label: 'Ausländische Einkünfte', description: 'Foreign income' },
//   { value: 'insolvenzgeld', label: 'Insolvenzgeld', description: 'Insolvency compensation' },
//   { value: 'other', label: 'Sonstige', description: 'Other progression-relevant income' },
// ] as const

/**
 * Example scenarios for Progressionsvorbehalt
 */
const EXAMPLE_SCENARIOS = [
  {
    name: 'Elternzeit (1 Jahr)',
    description: 'Elterngeld während Elternzeit',
    yearlyIncome: 12000,
    incomeType: 'elterngeld',
  },
  {
    name: 'Kurzarbeit (6 Monate)',
    description: 'Kurzarbeitergeld bei 50% Kurzarbeit',
    yearlyIncome: 6000,
    incomeType: 'kurzarbeitergeld',
  },
  {
    name: 'Arbeitslosigkeit (kurz)',
    description: 'Arbeitslosengeld I für 3 Monate',
    yearlyIncome: 4500,
    incomeType: 'arbeitslosengeld',
  },
] as const

/**
 * Calculate comparison preview showing tax impact
 */
function calculateTaxComparison(
  config: ProgressionsvorbehaltConfig,
  exampleTaxableIncome: number,
  year: number,
  kirchensteuerAktiv: boolean,
  kirchensteuersatz: number,
) {
  const grundfreibetrag = 11604 // 2024 value
  const progressionIncome = config.progressionRelevantIncomePerYear[year] || 0

  // Tax without Progressionsvorbehalt
  const normalTax = calculateGermanIncomeTax(exampleTaxableIncome, grundfreibetrag)

  // Tax with Progressionsvorbehalt
  const progressionTax = calculateIncomeTaxWithProgressionsvorbehalt(
    exampleTaxableIncome,
    progressionIncome,
    grundfreibetrag,
    kirchensteuerAktiv,
    kirchensteuersatz,
  )

  // Effective tax rates
  const normalRate = exampleTaxableIncome > 0 ? (normalTax / exampleTaxableIncome) * 100 : 0
  const progressionRate = exampleTaxableIncome > 0 ? (progressionTax / exampleTaxableIncome) * 100 : 0

  return {
    normalTax,
    progressionTax,
    additionalTax: progressionTax - normalTax,
    normalRate,
    progressionRate,
    rateIncrease: progressionRate - normalRate,
  }
}

export function ProgressionsvorbehaltConfiguration({
  config,
  onChange,
  kirchensteuerAktiv = false,
  kirchensteuersatz = 9,
  timeRange,
}: ProgressionsvorbehaltConfigurationProps) {
  const [newYearInput, setNewYearInput] = useState<string>('')
  const [newIncomeInput, setNewIncomeInput] = useState<string>('')

  // Get years with configured income
  const configuredYears = useMemo(
    () => Object.keys(config.progressionRelevantIncomePerYear).map(Number).sort((a, b) => a - b),
    [config.progressionRelevantIncomePerYear],
  )

  // Example calculation (using 40,000€ as typical taxable income)
  const exampleTaxableIncome = 40000
  const comparisonData = useMemo(() => {
    if (!config.enabled || configuredYears.length === 0) {
      return null
    }
    const year = configuredYears[0] // Use first configured year for preview
    return calculateTaxComparison(config, exampleTaxableIncome, year, kirchensteuerAktiv, kirchensteuersatz)
  }, [config, configuredYears, kirchensteuerAktiv, kirchensteuersatz])

  const handleToggle = (checked: boolean) => {
    onChange({ ...config, enabled: checked })
  }

  const handleAddYear = () => {
    const year = parseInt(newYearInput, 10)
    const income = parseFloat(newIncomeInput)

    if (isNaN(year) || isNaN(income) || income < 0) {
      return
    }

    onChange({
      ...config,
      progressionRelevantIncomePerYear: {
        ...config.progressionRelevantIncomePerYear,
        [year]: income,
      },
    })

    setNewYearInput('')
    setNewIncomeInput('')
  }

  const handleRemoveYear = (year: number) => {
    const { [year]: _, ...rest } = config.progressionRelevantIncomePerYear
    onChange({
      ...config,
      progressionRelevantIncomePerYear: rest,
    })
  }

  const handleUpdateIncome = (year: number, income: number) => {
    onChange({
      ...config,
      progressionRelevantIncomePerYear: {
        ...config.progressionRelevantIncomePerYear,
        [year]: Math.max(0, income),
      },
    })
  }

  const handleApplyScenario = (scenario: (typeof EXAMPLE_SCENARIOS)[number]) => {
    const currentYear = new Date().getFullYear()
    onChange({
      ...config,
      enabled: true,
      progressionRelevantIncomePerYear: {
        ...config.progressionRelevantIncomePerYear,
        [currentYear]: scenario.yearlyIncome,
      },
    })
  }

  const handleReset = () => {
    onChange(DEFAULT_PROGRESSIONSVORBEHALT_CONFIG)
  }

  return (
    <Card nestingLevel={1}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            📊 Progressionsvorbehalt
            <GlossaryTerm term="progressionsvorbehalt" showIcon />
          </span>
          <div className="flex items-center gap-2">
            <Switch
              id="progressionsvorbehalt-enabled"
              checked={config.enabled}
              onCheckedChange={handleToggle}
              aria-label="Progressionsvorbehalt aktivieren"
            />
            <Label htmlFor="progressionsvorbehalt-enabled" className="cursor-pointer text-sm font-normal">
              {config.enabled ? 'Aktiviert' : 'Deaktiviert'}
            </Label>
          </div>
        </CardTitle>
      </CardHeader>

      {config.enabled && (
        <CardContent className="space-y-6">
          {/* Information Section */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex gap-2">
              <Info className="h-5 w-5 flex-shrink-0 text-blue-600" />
              <div className="space-y-2 text-sm text-blue-900">
                <p className="font-semibold">Was ist der Progressionsvorbehalt?</p>
                <p>
                  Bestimmte steuerfreie Einkünfte (z.B. Elterngeld, Arbeitslosengeld I, Kurzarbeitergeld,
                  ausländische Einkünfte) erhöhen Ihren Steuersatz auf das zu versteuernde Einkommen, obwohl sie
                  selbst steuerfrei sind.
                </p>
                <p className="text-xs">
                  Dies kann zu einer höheren Steuerlast auf Ihre sonstigen Einkünfte (z.B. Kapitalerträge,
                  Entnahmen) führen.
                </p>
              </div>
            </div>
          </div>

          {/* Example Scenarios */}
          {configuredYears.length === 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Beispielszenarien anwenden:</Label>
              <div className="grid gap-2 sm:grid-cols-3">
                {EXAMPLE_SCENARIOS.map(scenario => (
                  <Button
                    key={scenario.name}
                    variant="outline"
                    size="sm"
                    onClick={() => handleApplyScenario(scenario)}
                    className="h-auto flex-col items-start gap-1 whitespace-normal p-3 text-left"
                  >
                    <span className="font-semibold">{scenario.name}</span>
                    <span className="text-xs text-muted-foreground">{scenario.description}</span>
                    <span className="text-xs font-medium">{formatCurrency(scenario.yearlyIncome)} p.a.</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Configured Years List */}
          {configuredYears.length > 0 && (
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
                      onChange={e => handleUpdateIncome(year, parseFloat(e.target.value) || 0)}
                      className="w-32"
                      min="0"
                      step="100"
                    />
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveYear(year)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Year */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Neues Jahr hinzufügen:</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Jahr (z.B. 2024)"
                value={newYearInput}
                onChange={e => setNewYearInput(e.target.value)}
                className="w-32"
                min={timeRange?.start || 2020}
                max={timeRange?.end || 2100}
              />
              <Input
                type="number"
                placeholder="Betrag in €"
                value={newIncomeInput}
                onChange={e => setNewIncomeInput(e.target.value)}
                className="flex-1"
                min="0"
                step="100"
              />
              <Button onClick={handleAddYear} size="sm" disabled={!newYearInput || !newIncomeInput}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tax Comparison Preview */}
          {comparisonData && (
            <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-amber-600" />
                <span className="font-semibold text-amber-900">
                  Steuerliche Auswirkungen (Beispiel: {formatCurrency(exampleTaxableIncome)} zu verst. Einkommen)
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1 rounded-lg bg-white p-3">
                  <p className="text-xs text-muted-foreground">Ohne Progressionsvorbehalt</p>
                  <p className="text-xl font-bold">{formatCurrency(comparisonData.normalTax)}</p>
                  <p className="text-sm text-muted-foreground">
                    Steuersatz: {comparisonData.normalRate.toFixed(2)}%
                  </p>
                </div>

                <div className="space-y-1 rounded-lg bg-white p-3">
                  <p className="text-xs text-muted-foreground">Mit Progressionsvorbehalt</p>
                  <p className="text-xl font-bold text-amber-700">{formatCurrency(comparisonData.progressionTax)}</p>
                  <p className="text-sm text-muted-foreground">
                    Steuersatz: {comparisonData.progressionRate.toFixed(2)}%
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-amber-100 p-3">
                <p className="text-sm">
                  <span className="font-semibold">Zusätzliche Steuerlast:</span>{' '}
                  <span className="font-bold text-amber-900">{formatCurrency(comparisonData.additionalTax)}</span>
                  <span className="text-muted-foreground">
                    {' '}
                    (Steuersatz +{comparisonData.rateIncrease.toFixed(2)} Prozentpunkte)
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Reset Button */}
          {(config.enabled || configuredYears.length > 0) && (
            <div className="flex justify-end border-t pt-4">
              <Button variant="outline" size="sm" onClick={handleReset}>
                Zurücksetzen
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
