import { useMemo, useState } from 'react'
import { TrendingUp, AlertTriangle, Info } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Switch } from './ui/switch'
import { generateFormId } from '../utils/unique-id'
import {
  type PropertyFinancingConfig,
  type LeverageComparisonResults,
  type LeverageScenarioResults,
  createDefaultPropertyFinancingConfig,
  createStandardLeverageScenarios,
  compareLeverageScenarios,
} from '../../helpers/immobilien-leverage'
import { formatCurrency } from '../utils/currency'
import { PropertyConfiguration } from './immobilien-leverage/PropertyConfiguration'

/**
 * Get risk color class based on risk level
 */
function getRiskColor(riskLevel: string): string {
  const colors: Record<string, string> = {
    niedrig: 'text-green-600',
    mittel: 'text-yellow-600',
    hoch: 'text-orange-600',
    'sehr hoch': 'text-red-600',
  }
  return colors[riskLevel] || 'text-gray-600'
}

/**
 * Render scenario results table
 */
function ScenarioComparisonTable({ results }: { results: LeverageComparisonResults}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-300">
            <th className="text-left p-2">Szenario</th>
            <th className="text-right p-2">Eigenkapital</th>
            <th className="text-right p-2">Darlehen</th>
            <th className="text-right p-2">LTV</th>
            <th className="text-right p-2">Zinssatz</th>
            <th className="text-right p-2">Jährl. Rate</th>
            <th className="text-right p-2">Cash-on-Cash</th>
            <th className="text-right p-2">Hebeleffekt</th>
            <th className="text-center p-2">Risiko</th>
          </tr>
        </thead>
        <tbody>
          {results.scenarios.map((result, index) => {
            const isRecommended = result.scenario.name === results.recommendedScenario
            const isBestReturn = result.scenario.name === results.bestByReturn
            const isBestRisk = result.scenario.name === results.bestByRisk
            const riskColor = getRiskColor(result.riskIndicators.riskLevel)

            return (
              <tr
                key={index}
                className={`border-b hover:bg-gray-50 ${isRecommended ? 'bg-blue-50 font-semibold' : ''}`}
              >
                <td className="p-2">
                  {result.scenario.name}
                  {isRecommended && ' ⭐'}
                  {isBestReturn && ' 📈'}
                  {isBestRisk && ' 🛡️'}
                </td>
                <td className="text-right p-2">{formatCurrency(result.downPayment)}</td>
                <td className="text-right p-2">{formatCurrency(result.loanAmount)}</td>
                <td className="text-right p-2">{result.loanToValue.toFixed(1)}%</td>
                <td className="text-right p-2">{result.scenario.interestRate.toFixed(2)}%</td>
                <td className="text-right p-2">{formatCurrency(result.annualMortgagePayment)}</td>
                <td className="text-right p-2 font-semibold">{result.cashOnCashReturn.toFixed(2)}%</td>
                <td className="text-right p-2">
                  {result.leverageEffect > 0 ? '+' : ''}
                  {result.leverageEffect.toFixed(2)}%
                </td>
                <td className={`text-center p-2 ${riskColor}`}>
                  {result.riskIndicators.riskLevel.charAt(0).toUpperCase() +
                    result.riskIndicators.riskLevel.slice(1)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Render detailed scenario card
 */
function ScenarioDetailCard({ result }: { result: LeverageScenarioResults }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50">
        <CardTitle className="text-base">{result.scenario.name}</CardTitle>
        <CardDescription>
          {result.scenario.downPaymentPercent}% Eigenkapital, {result.scenario.termYears} Jahre Laufzeit
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Jährlicher Cashflow</p>
            <p className="text-lg font-semibold">{formatCurrency(result.annualNetCashFlow)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Gesamtzinskosten</p>
            <p className="text-lg font-semibold">{formatCurrency(result.totalInterestCost)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Steuervorteil/Jahr</p>
            <p className="text-lg font-semibold text-green-600">{formatCurrency(result.totalTaxBenefit)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Rendite ungehebelt</p>
            <p className="text-lg font-semibold">{result.returnWithoutLeverage.toFixed(2)}%</p>
          </div>
        </div>

        {result.riskIndicators.warnings.length > 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-yellow-900">Risikohinweise:</p>
                <ul className="text-xs text-yellow-800 space-y-0.5 list-disc list-inside">
                  {result.riskIndicators.warnings.map((warning, wIndex) => (
                    <li key={wIndex}>{warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-2 bg-gray-50 rounded">
            <p className="text-muted-foreground mb-1">Zinsdeckung</p>
            <p className="font-semibold">
              {result.riskIndicators.interestCoverageRatio === Infinity
                ? '∞'
                : result.riskIndicators.interestCoverageRatio.toFixed(2)}
            </p>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <p className="text-muted-foreground mb-1">Schuldendienstdeckung</p>
            <p className="font-semibold">
              {result.riskIndicators.debtServiceCoverageRatio === Infinity
                ? '∞'
                : result.riskIndicators.debtServiceCoverageRatio.toFixed(2)}
            </p>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <p className="text-muted-foreground mb-1">Belastungsquote</p>
            <p className="font-semibold">{result.riskIndicators.mortgageToIncomeRatio.toFixed(1)}%</p>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <p className="text-muted-foreground mb-1">AfA/Jahr</p>
            <p className="font-semibold">{formatCurrency(result.annualAfa)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * ImmobilienLeverageComparison Component
 *
 * Provides comprehensive analysis and comparison of different financing structures
 * for real estate investments, demonstrating the leverage effect and associated risks.
 */
export function ImmobilienLeverageComparison() {
  // Component state
  const [enabled, setEnabled] = useState(false)
  const [propertyConfig, setPropertyConfig] = useState<PropertyFinancingConfig>(
    createDefaultPropertyFinancingConfig(),
  )
  const [baseInterestRate, setBaseInterestRate] = useState(3.5)

  // Generate unique IDs for form fields
  const ids = useMemo(
    () => ({
      enabled: generateFormId('leverage-comparison', 'enabled'),
      totalPrice: generateFormId('leverage-comparison', 'total-price'),
      buildingValue: generateFormId('leverage-comparison', 'building-value'),
      landValue: generateFormId('leverage-comparison', 'land-value'),
      annualRent: generateFormId('leverage-comparison', 'annual-rent'),
      operatingCosts: generateFormId('leverage-comparison', 'operating-costs'),
      appreciation: generateFormId('leverage-comparison', 'appreciation'),
      taxRate: generateFormId('leverage-comparison', 'tax-rate'),
      buildingYear: generateFormId('leverage-comparison', 'building-year'),
      baseInterest: generateFormId('leverage-comparison', 'base-interest'),
    }),
    [],
  )

  // Calculate comparison results
  const comparisonResults: LeverageComparisonResults | null = useMemo(() => {
    if (!enabled) return null
    const scenarios = createStandardLeverageScenarios(baseInterestRate)
    return compareLeverageScenarios(scenarios, propertyConfig)
  }, [enabled, propertyConfig, baseInterestRate])

  // Handle configuration changes
  const updatePropertyConfig = <K extends keyof PropertyFinancingConfig>(
    key: K,
    value: PropertyFinancingConfig[K],
  ) => {
    setPropertyConfig(prev => ({ ...prev, [key]: value }))
  }

  if (!enabled) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <CardTitle>Immobilien-Leverage-Analyse</CardTitle>
            </div>
            <Switch id={ids.enabled} checked={enabled} onCheckedChange={setEnabled} />
          </div>
          <CardDescription>
            Optimale Finanzierungsstrukturen für Immobilieninvestitionen analysieren und vergleichen.
            Verstehen Sie den Hebeleffekt (Leverage) und dessen Auswirkungen auf Rendite und Risiko.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <CardTitle>Immobilien-Leverage-Analyse</CardTitle>
          </div>
          <Switch id={ids.enabled} checked={enabled} onCheckedChange={setEnabled} />
        </div>
        <CardDescription>
          Vergleich verschiedener Finanzierungsszenarien mit unterschiedlichen Eigenkapitalquoten.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <PropertyConfiguration
          config={propertyConfig}
          baseInterestRate={baseInterestRate}
          ids={ids}
          onConfigChange={updatePropertyConfig}
          onBaseInterestChange={setBaseInterestRate}
        />

        {comparisonResults && (
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-blue-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Empfohlenes Szenario</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold text-blue-900">{comparisonResults.recommendedScenario}</p>
                  <p className="text-xs text-muted-foreground mt-1">Balance aus Rendite und Risiko</p>
                </CardContent>
              </Card>

              <Card className="bg-green-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Höchste Rendite</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold text-green-900">{comparisonResults.bestByReturn}</p>
                  <p className="text-xs text-muted-foreground mt-1">Maximaler Cash-on-Cash Return</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Geringstes Risiko</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold text-gray-900">{comparisonResults.bestByRisk}</p>
                  <p className="text-xs text-muted-foreground mt-1">Niedrigster Beleihungsauslauf</p>
                </CardContent>
              </Card>
            </div>

            <ScenarioComparisonTable results={comparisonResults} />

            {/* Detailed Results for Each Scenario */}
            <div className="space-y-4">
              {comparisonResults.scenarios.map((result, index) => (
                <ScenarioDetailCard key={index} result={result} />
              ))}
            </div>

            {/* Info Box */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2 text-sm text-blue-900">
                    <p className="font-semibold">Hinweise zur Leverage-Analyse:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>
                        <strong>Hebeleffekt:</strong> Zeigt wie stark die Eigenkapitalrendite durch Fremdkapital
                        beeinflusst wird
                      </li>
                      <li>
                        <strong>LTV (Beleihungsauslauf):</strong> Verhältnis Darlehensbetrag zu Immobilienwert. Banken
                        finanzieren typisch bis 80%
                      </li>
                      <li>
                        <strong>Cash-on-Cash Return:</strong> Jährlicher Cashflow im Verhältnis zum eingesetzten
                        Eigenkapital
                      </li>
                      <li>
                        <strong>Steuervorteile:</strong> Darlehenszinsen und AfA sind steuerlich absetzbar
                        (Werbungskosten)
                      </li>
                      <li>
                        <strong>Risiko:</strong> Höherer Leverage bedeutet höhere potenzielle Rendite, aber auch
                        höheres Risiko
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
