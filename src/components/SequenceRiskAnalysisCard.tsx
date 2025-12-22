import React, { useState, useMemo } from 'react'
import { Card, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent } from './ui/collapsible'
import { CollapsibleCardHeader } from './ui/collapsible-card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Info, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { generateFormId } from '../utils/unique-id'
import { formatCurrency } from '../utils/currency'
import {
  analyzeSequenceRisk,
  getDefaultSequenceRiskConfig,
  type SequenceRiskAnalysis,
} from '../../helpers/sequence-risk'

interface ConfigurationFormProps {
  startingPortfolioId: string
  annualWithdrawalId: string
  yearsId: string
  averageReturnId: string
  volatilityId: string
  startingPortfolio: number
  annualWithdrawal: number
  years: number
  averageReturn: number
  volatility: number
  withdrawalRate: number
  onStartingPortfolioChange: (value: number) => void
  onAnnualWithdrawalChange: (value: number) => void
  onYearsChange: (value: number) => void
  onAverageReturnChange: (value: number) => void
  onVolatilityChange: (value: number) => void
}

function ConfigurationForm({
  startingPortfolioId,
  annualWithdrawalId,
  yearsId,
  averageReturnId,
  volatilityId,
  startingPortfolio,
  annualWithdrawal,
  years,
  averageReturn,
  volatility,
  withdrawalRate,
  onStartingPortfolioChange,
  onAnnualWithdrawalChange,
  onYearsChange,
  onAverageReturnChange,
  onVolatilityChange,
}: ConfigurationFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Konfiguration</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={startingPortfolioId}>Startkapital</Label>
          <Input
            id={startingPortfolioId}
            type="number"
            min="0"
            step="10000"
            value={startingPortfolio}
            onChange={(e) => onStartingPortfolioChange(parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={annualWithdrawalId}>Jährliche Entnahme</Label>
          <Input
            id={annualWithdrawalId}
            type="number"
            min="0"
            step="1000"
            value={annualWithdrawal}
            onChange={(e) => onAnnualWithdrawalChange(parseFloat(e.target.value) || 0)}
          />
          <p className="text-xs text-muted-foreground">Entnahmerate: {withdrawalRate.toFixed(2)}%</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor={yearsId}>Zeitraum (Jahre)</Label>
          <Input
            id={yearsId}
            type="number"
            min="5"
            max="50"
            step="1"
            value={years}
            onChange={(e) => onYearsChange(parseInt(e.target.value) || 30)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={averageReturnId}>Durchschnittliche Rendite (%)</Label>
          <Input
            id={averageReturnId}
            type="number"
            min="0"
            max="20"
            step="0.5"
            value={averageReturn}
            onChange={(e) => onAverageReturnChange(parseFloat(e.target.value) || 7)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={volatilityId}>Volatilität (%)</Label>
          <Input
            id={volatilityId}
            type="number"
            min="0"
            max="50"
            step="1"
            value={volatility}
            onChange={(e) => onVolatilityChange(parseFloat(e.target.value) || 15)}
          />
          <p className="text-xs text-muted-foreground">Standardabweichung der jährlichen Renditen</p>
        </div>
      </div>
    </div>
  )
}

interface RiskLevelBadgeProps {
  level: 'low' | 'medium' | 'high' | 'critical'
}

function RiskLevelBadge({ level }: RiskLevelBadgeProps) {
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

interface ScenarioResultProps {
  label: string
  analysis: SequenceRiskAnalysis
  icon: React.ReactNode
}

function ScenarioResult({ label, analysis, icon }: ScenarioResultProps) {
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

export function SequenceRiskAnalysisCard() {
  // Get default config
  const defaultConfig = getDefaultSequenceRiskConfig()

  // State for configuration
  const [startingPortfolio, setStartingPortfolio] = useState(defaultConfig.startingPortfolio)
  const [annualWithdrawal, setAnnualWithdrawal] = useState(defaultConfig.annualWithdrawal)
  const [years, setYears] = useState(defaultConfig.years)
  const [averageReturn, setAverageReturn] = useState(defaultConfig.averageReturn * 100)
  const [volatility, setVolatility] = useState(defaultConfig.volatility * 100)

  // Generate unique IDs for form fields
  const startingPortfolioId = useMemo(() => generateFormId('sequence-risk', 'starting-portfolio'), [])
  const annualWithdrawalId = useMemo(() => generateFormId('sequence-risk', 'annual-withdrawal'), [])
  const yearsId = useMemo(() => generateFormId('sequence-risk', 'years'), [])
  const averageReturnId = useMemo(() => generateFormId('sequence-risk', 'average-return'), [])
  const volatilityId = useMemo(() => generateFormId('sequence-risk', 'volatility'), [])

  // Perform analysis
  const analysis = useMemo(
    () => analyzeSequenceRisk(startingPortfolio, annualWithdrawal, years, averageReturn / 100, volatility / 100),
    [startingPortfolio, annualWithdrawal, years, averageReturn, volatility],
  )

  const withdrawalRate = (annualWithdrawal / startingPortfolio) * 100

  return (
    <Card>
      <Collapsible defaultOpen={false}>
        <CollapsibleCardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-semibold">Sequenz-Risiko-Analyse</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Analyse des Einflusses der Rendite-Reihenfolge auf die Portfolio-Nachhaltigkeit im Ruhestand
          </p>
        </CollapsibleCardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Info Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-2">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900 space-y-2">
                  <p className="font-medium">Was ist Sequenz-Risiko?</p>
                  <p>
                    Das Sequenz-Risiko (Sequence of Returns Risk) beschreibt die Gefahr, dass schlechte Renditen in den
                    ersten Jahren des Ruhestands das Portfolio dauerhaft schwächen. Zwei Portfolios mit identischer
                    durchschnittlicher Rendite können aufgrund unterschiedlicher Rendite-Reihenfolgen völlig
                    unterschiedliche Ergebnisse erzielen.
                  </p>
                </div>
              </div>
            </div>

            {/* Configuration Section */}
            <ConfigurationForm
              startingPortfolioId={startingPortfolioId}
              annualWithdrawalId={annualWithdrawalId}
              yearsId={yearsId}
              averageReturnId={averageReturnId}
              volatilityId={volatilityId}
              startingPortfolio={startingPortfolio}
              annualWithdrawal={annualWithdrawal}
              years={years}
              averageReturn={averageReturn}
              volatility={volatility}
              withdrawalRate={withdrawalRate}
              onStartingPortfolioChange={setStartingPortfolio}
              onAnnualWithdrawalChange={setAnnualWithdrawal}
              onYearsChange={setYears}
              onAverageReturnChange={setAverageReturn}
              onVolatilityChange={setVolatility}
            />

            {/* Risk Assessment */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Risikobewertung</h3>
                <RiskLevelBadge level={analysis.riskLevel} />
              </div>

              {/* Scenario Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ScenarioResult
                  label="Günstige Sequenz"
                  analysis={analysis.bestCase}
                  icon={<TrendingUp className="h-5 w-5 text-green-600" />}
                />
                <ScenarioResult
                  label="Durchschnitt"
                  analysis={analysis.averageCase}
                  icon={<Info className="h-5 w-5 text-blue-600" />}
                />
                <ScenarioResult
                  label="Ungünstige Sequenz"
                  analysis={analysis.worstCase}
                  icon={<TrendingDown className="h-5 w-5 text-red-600" />}
                />
              </div>

              {/* Outcome Differences */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-sm">Unterschied zwischen Best- und Worst-Case</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Endkapital-Differenz</p>
                    <p className="font-medium">{formatCurrency(analysis.outcomeDifference.portfolioValueDiff)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Jahre-Differenz</p>
                    <p className="font-medium">{analysis.outcomeDifference.yearsSurvivedDiff} Jahre</p>
                  </div>
                </div>
                {analysis.outcomeDifference.percentageDiff !== Infinity && (
                  <p className="text-xs text-muted-foreground">
                    Das entspricht einem Unterschied von {analysis.outcomeDifference.percentageDiff.toFixed(1)}%
                  </p>
                )}
              </div>
            </div>

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Empfehlungen</h3>
                <ul className="space-y-2">
                  {analysis.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex gap-2 text-sm">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Additional Info */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-900 space-y-2">
                  <p className="font-medium">Wichtiger Hinweis</p>
                  <p>
                    Diese Analyse zeigt das Risiko unterschiedlicher Rendite-Sequenzen. Um das Sequenz-Risiko zu
                    reduzieren, können Sie:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Eine niedrigere Entnahmerate wählen (z.B. 3-4% statt 5%)</li>
                    <li>Dynamische Entnahmestrategien verwenden (Anpassung an Portfolio-Performance)</li>
                    <li>Einen Cash-Puffer für schlechte Marktjahre vorhalten</li>
                    <li>Die Asset-Allokation im Zeitverlauf anpassen (Glide Path)</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
