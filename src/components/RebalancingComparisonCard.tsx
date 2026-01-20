import { useState, useMemo } from 'react'
import { Card, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent } from './ui/collapsible'
import { CollapsibleCardHeader } from './ui/collapsible-card'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Slider } from './ui/slider'
import { Input } from './ui/input'
import { TrendingUp, BarChart3, Target, AlertTriangle } from 'lucide-react'
import {
  createDefaultStrategyConfigs,
  compareRebalancingStrategies,
  recommendBestStrategy,
  type StrategyComparisonResult,
} from '../../helpers/rebalancing-comparison'
import { createDefaultRebalancingTaxConfig, createDefaultTransactionCostConfig } from '../../helpers/rebalancing'
import type { AssetClass } from '../../helpers/multi-asset-portfolio'
import { formatCurrency, formatPercentage } from '../utils/currency'
import { useNestingLevel } from '../lib/nesting-utils'

interface ComparisonConfig {
  initialValue: number
  years: number
  averageReturn: number
  volatility: number
  targetAllocationDomestic: number
  targetAllocationInternational: number
  targetAllocationBonds: number
}

function createDefaultComparisonConfig(): ComparisonConfig {
  return {
    initialValue: 100000,
    years: 10,
    averageReturn: 7,
    volatility: 15,
    targetAllocationDomestic: 30,
    targetAllocationInternational: 40,
    targetAllocationBonds: 30,
  }
}

function AllocationInputs({
  config,
  onChange,
}: {
  config: ComparisonConfig
  onChange: (config: ComparisonConfig) => void
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="space-y-1">
        <Label className="text-xs">Deutsch</Label>
        <Input
          type="number"
          value={config.targetAllocationDomestic}
          onChange={e => onChange({ ...config, targetAllocationDomestic: parseFloat(e.target.value) || 0 })}
          className="text-xs"
          min={0}
          max={100}
        />
        <span className="text-xs text-gray-500">{config.targetAllocationDomestic}%</span>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Int.</Label>
        <Input
          type="number"
          value={config.targetAllocationInternational}
          onChange={e => onChange({ ...config, targetAllocationInternational: parseFloat(e.target.value) || 0 })}
          className="text-xs"
          min={0}
          max={100}
        />
        <span className="text-xs text-gray-500">{config.targetAllocationInternational}%</span>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Anleihen</Label>
        <Input
          type="number"
          value={config.targetAllocationBonds}
          onChange={e => onChange({ ...config, targetAllocationBonds: parseFloat(e.target.value) || 0 })}
          className="text-xs"
          min={0}
          max={100}
        />
        <span className="text-xs text-gray-500">{config.targetAllocationBonds}%</span>
      </div>
    </div>
  )
}

function CapitalAndTimeSliders({
  config,
  onChange,
}: {
  config: ComparisonConfig
  onChange: (config: ComparisonConfig) => void
}) {
  return (
    <>
      <div className="space-y-2">
        <Label className="text-xs">Startkapital: {formatCurrency(config.initialValue)}</Label>
        <Slider
          value={[config.initialValue]}
          onValueChange={([initialValue]) => onChange({ ...config, initialValue })}
          min={10000}
          max={1000000}
          step={10000}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Simulationszeitraum: {config.years} Jahre</Label>
        <Slider
          value={[config.years]}
          onValueChange={([years]) => onChange({ ...config, years })}
          min={5}
          max={20}
          step={1}
        />
      </div>
    </>
  )
}

function ReturnAndVolatilitySliders({
  config,
  onChange,
}: {
  config: ComparisonConfig
  onChange: (config: ComparisonConfig) => void
}) {
  return (
    <>
      <div className="space-y-2">
        <Label className="text-xs">Durchschnittsrendite: {config.averageReturn}%</Label>
        <Slider
          value={[config.averageReturn]}
          onValueChange={([averageReturn]) => onChange({ ...config, averageReturn })}
          min={0}
          max={15}
          step={0.5}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Volatilität: {config.volatility}%</Label>
        <Slider
          value={[config.volatility]}
          onValueChange={([volatility]) => onChange({ ...config, volatility })}
          min={5}
          max={30}
          step={1}
        />
      </div>
    </>
  )
}

function PortfolioSliders({
  config,
  onChange,
}: {
  config: ComparisonConfig
  onChange: (config: ComparisonConfig) => void
}) {
  return (
    <div className="space-y-3">
      <CapitalAndTimeSliders config={config} onChange={onChange} />
      <ReturnAndVolatilitySliders config={config} onChange={onChange} />
    </div>
  )
}

function ConfigurationSection({
  config,
  onChange,
}: {
  config: ComparisonConfig
  onChange: (config: ComparisonConfig) => void
}) {
  const totalAllocation = config.targetAllocationDomestic + config.targetAllocationInternational + config.targetAllocationBonds

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-gray-700">Portfolio-Parameter</h4>

      <PortfolioSliders config={config} onChange={onChange} />

      <h4 className="text-sm font-semibold text-gray-700 mt-4">Ziel-Allokation</h4>
      <AllocationInputs config={config} onChange={onChange} />
      
      {Math.abs(totalAllocation - 100) > 0.1 && (
        <div className="text-xs text-red-600 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Summe muss 100% ergeben (aktuell: {totalAllocation.toFixed(1)}%)
        </div>
      )}
    </div>
  )
}

function ComparisonTable({ results }: { results: StrategyComparisonResult[] }) {
  const recommendation = useMemo(() => {
    if (results.length === 0) return null
    return recommendBestStrategy(results)
  }, [results])

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="text-left p-2 font-semibold">Strategie</th>
            <th className="text-right p-2 font-semibold">Rendite p.a.</th>
            <th className="text-right p-2 font-semibold">Endkapital</th>
            <th className="text-right p-2 font-semibold">Transaktionen</th>
            <th className="text-right p-2 font-semibold">Kosten</th>
            <th className="text-right p-2 font-semibold">Sharpe</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => {
            const isBest = recommendation?.bestOverall === result
            return (
              <tr key={index} className={`border-b ${isBest ? 'bg-green-50' : 'hover:bg-gray-50'}`}>
                <td className="p-2">
                  <div className="font-medium">{result.strategy.name}</div>
                  {isBest && <div className="text-xs text-green-600">⭐ Empfohlen</div>}
                </td>
                <td className="text-right p-2 font-medium">{formatPercentage(result.annualizedReturn)}</td>
                <td className="text-right p-2">{formatCurrency(result.finalValue)}</td>
                <td className="text-right p-2">{result.totalTransactions}</td>
                <td className="text-right p-2">{formatCurrency(result.totalCosts)}</td>
                <td className="text-right p-2">{result.sharpeRatio.toFixed(2)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function BestByCriteriaCards({ recommendation }: { recommendation: ReturnType<typeof recommendBestStrategy> | null }) {
  if (!recommendation) return null

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
        <div className="font-medium text-blue-900">Beste Rendite</div>
        <div className="text-blue-700">{recommendation.bestByCriteria.return.strategy.name}</div>
      </div>
      <div className="p-2 bg-purple-50 border border-purple-200 rounded text-xs">
        <div className="font-medium text-purple-900">Niedrigste Kosten</div>
        <div className="text-purple-700">{recommendation.bestByCriteria.cost.strategy.name}</div>
      </div>
      <div className="p-2 bg-orange-50 border border-orange-200 rounded text-xs">
        <div className="font-medium text-orange-900">Bester Sharpe</div>
        <div className="text-orange-700">{recommendation.bestByCriteria.sharpe.strategy.name}</div>
      </div>
      <div className="p-2 bg-teal-50 border border-teal-200 rounded text-xs">
        <div className="font-medium text-teal-900">Bestes Tracking</div>
        <div className="text-teal-700">{recommendation.bestByCriteria.tracking.strategy.name}</div>
      </div>
    </div>
  )
}

function ResultsTable({ results }: { results: StrategyComparisonResult[] }) {
  const recommendation = useMemo(() => {
    if (results.length === 0) return null
    return recommendBestStrategy(results)
  }, [results])

  if (results.length === 0) {
    return (
      <div className="text-sm text-gray-600 p-4 text-center">
        Klicken Sie auf "Vergleich starten", um die Strategien zu analysieren.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Best Overall Recommendation */}
      {recommendation && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Empfohlene Strategie
          </h4>
          <p className="text-sm text-green-800">
            <span className="font-medium">{recommendation.bestOverall.strategy.name}</span>
            <br />
            <span className="text-xs">{recommendation.bestOverall.strategy.description}</span>
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-green-800">
            <div>Rendite: {formatPercentage(recommendation.bestOverall.annualizedReturn)}</div>
            <div>Kosten: {formatCurrency(recommendation.bestOverall.totalCosts)}</div>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      <ComparisonTable results={results} />

      {/* Best by Criteria */}
      <BestByCriteriaCards recommendation={recommendation} />
    </div>
  )
}

function InfoBox() {
  return (
    <div className="text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-3">
      <p className="font-medium text-blue-900 mb-1">📊 Strategievergleich</p>
      <p className="text-xs text-blue-800">
        Vergleichen Sie verschiedene Rebalancing-Ansätze für Ihr Portfolio: Kalenderbasiert, 
        Schwellenwertbasiert, Hybrid, Steueroptimiert und Opportunistisch. Das Tool berücksichtigt 
        deutsche Steuerregelungen und Transaktionskosten.
      </p>
    </div>
  )
}

function ResultsSection({ results }: { results: StrategyComparisonResult[] }) {
  if (results.length === 0) return null

  return (
    <>
      <div className="border-t pt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Vergleichsergebnisse
        </h3>
        <ResultsTable results={results} />
      </div>

      {/* Methodology Note */}
      <div className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="font-medium text-gray-700 mb-1">ℹ️ Hinweis zur Methodik</p>
        <p>
          Die Simulation verwendet synthetische Renditen basierend auf Ihren Parametern. 
          Für präzisere Ergebnisse integrieren Sie historische Marktdaten. Die Empfehlung 
          berücksichtigt Rendite (40%), Kosten (30%), Sharpe Ratio (20%) und Tracking Error (10%).
        </p>
      </div>
    </>
  )
}

function generateSyntheticReturns(years: number, averageReturn: number, volatility: number): number[] {
  const yearlyReturns: number[] = []
  for (let i = 0; i < years; i++) {
    // Simple random return generation (mean-reverting)
    const randomReturn = (averageReturn / 100) + ((Math.random() - 0.5) * (volatility / 100) * 2)
    yearlyReturns.push(randomReturn)
  }
  return yearlyReturns
}

function createTargetAllocations(
  domestic: number,
  international: number,
  bonds: number
): Record<AssetClass, number> {
  return {
    'stocks_domestic': domestic / 100,
    'stocks_international': international / 100,
    'bonds_government': bonds / 100,
    'bonds_corporate': 0,
    'real_estate': 0,
    'commodities': 0,
    'cash': 0,
  }
}

function useRebalancingComparison(config: ComparisonConfig) {
  const [results, setResults] = useState<StrategyComparisonResult[]>([])
  const [isComparing, setIsComparing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runComparison = () => {
    setIsComparing(true)
    setError(null)

    const totalAllocation = config.targetAllocationDomestic + config.targetAllocationInternational + config.targetAllocationBonds
    if (Math.abs(totalAllocation - 100) > 0.1) {
      setError('Die Summe der Allokationen muss 100% ergeben!')
      setIsComparing(false)
      return
    }

    try {
      const targetAllocations = createTargetAllocations(
        config.targetAllocationDomestic,
        config.targetAllocationInternational,
        config.targetAllocationBonds
      )

      const yearlyReturns = generateSyntheticReturns(config.years, config.averageReturn, config.volatility)
      const strategies = createDefaultStrategyConfigs()
      const taxConfig = createDefaultRebalancingTaxConfig()
      const costConfig = {
        ...createDefaultTransactionCostConfig(),
        minTransactionSize: 10,
      }

      const comparisonResults = compareRebalancingStrategies(
        strategies,
        config.initialValue,
        targetAllocations,
        yearlyReturns,
        taxConfig,
        costConfig
      )

      setResults(comparisonResults)
    } catch (err) {
      console.error('Error running comparison:', err)
      setError('Fehler beim Vergleich der Strategien')
    } finally {
      setIsComparing(false)
    }
  }

  return { results, isComparing, error, runComparison }
}

/**
 * Rebalancing Strategy Comparison Card
 * 
 * Compares different rebalancing strategies (calendar, threshold, hybrid, tax-optimized, opportunistic)
 * for portfolio management with German tax compliance.
 */
export function RebalancingComparisonCard() {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<ComparisonConfig>(createDefaultComparisonConfig())
  const { results, isComparing, error, runComparison } = useRebalancingComparison(config)

  const nestingLevel = useNestingLevel()

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card data-nesting-level={nestingLevel}>
        <CollapsibleCardHeader titleClassName="text-left" simplifiedPadding>
          <BarChart3 className="h-4 w-4 inline mr-2" />
          Rebalancing-Strategie-Vergleichstool
        </CollapsibleCardHeader>
        <CollapsibleContent>
          <CardContent>
            <div className="space-y-4">
              <InfoBox />
              <ConfigurationSection config={config} onChange={setConfig} />

              {/* Error Display */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800 text-sm">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <Button 
                onClick={runComparison} 
                disabled={isComparing}
                className="w-full"
              >
                {isComparing ? 'Vergleiche...' : 'Vergleich starten'}
              </Button>

              {/* Results */}
              <ResultsSection results={results} />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
