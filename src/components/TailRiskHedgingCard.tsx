import { useState, useMemo } from 'react'
import { Card, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent } from './ui/collapsible'
import { CollapsibleCardHeader } from './ui/collapsible-card'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { Input } from './ui/input'
import { generateFormId } from '../utils/unique-id'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import {
  calculateHedgingSummary,
  getDefaultTailRiskHedgingConfig,
  validateHedgingConfig,
  HEDGING_STRATEGY_NAMES,
  HEDGING_STRATEGY_DESCRIPTIONS,
  getStrategyCostRange,
  type TailRiskHedgingConfig,
  type HedgingStrategy,
  type TailRiskHedgingSummary,
} from '../../helpers/tail-risk-hedging'
import { formatCurrency } from '../utils/currency'

interface ConfigSectionProps {
  config: TailRiskHedgingConfig
  onConfigChange: (config: TailRiskHedgingConfig) => void
}

function InfoMessage() {
  return (
    <div className="text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-3">
      <p className="font-medium text-blue-900 mb-1">📊 Informations-Tool</p>
      <p className="text-xs text-blue-800">
        Dieser Rechner zeigt die Kosten und Nutzen von Tail-Risk Hedging Strategien. Die Beispielberechnung simuliert
        eine 10-Jahres-Periode mit unterschiedlichen Marktszenarien.
      </p>
    </div>
  )
}

interface StrategySelectionProps {
  config: TailRiskHedgingConfig
  onConfigChange: (config: TailRiskHedgingConfig) => void
  strategyId: string
}

function StrategySelection({ config, onConfigChange, strategyId }: StrategySelectionProps) {
  const strategies: HedgingStrategy[] = ['protective-put', 'dynamic-cppi', 'tail-risk-fund', 'systematic-rebalancing']

  return (
    <div className="space-y-3 pt-2 border-t">
      <Label htmlFor={strategyId} className="text-sm font-medium">
        Absicherungsstrategie
      </Label>
      <RadioGroup
        id={strategyId}
        value={config.strategy}
        onValueChange={strategy => onConfigChange({ ...config, strategy: strategy as HedgingStrategy })}
      >
        {strategies.map(strategy => (
          <div key={strategy} className="flex items-start space-x-2">
            <RadioGroupItem value={strategy} id={`${strategyId}-${strategy}`} className="mt-1" />
            <div className="flex-1">
              <Label htmlFor={`${strategyId}-${strategy}`} className="font-normal cursor-pointer">
                {HEDGING_STRATEGY_NAMES[strategy]}
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">{HEDGING_STRATEGY_DESCRIPTIONS[strategy]}</p>
            </div>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}

interface ProtectionConfigProps {
  config: TailRiskHedgingConfig
  onConfigChange: (config: TailRiskHedgingConfig) => void
  protectionLevelId: string
  hedgeRatioId: string
}

function ProtectionConfig({ config, onConfigChange, protectionLevelId, hedgeRatioId }: ProtectionConfigProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={protectionLevelId} className="text-sm">
          Schutzniveau: {(config.protectionLevel * 100).toFixed(0)}%
        </Label>
        <Input
          id={protectionLevelId}
          type="range"
          min="50"
          max="100"
          step="5"
          value={config.protectionLevel * 100}
          onChange={e => onConfigChange({ ...config, protectionLevel: Number(e.target.value) / 100 })}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Schützt vor Verlusten unterhalb von {(config.protectionLevel * 100).toFixed(0)}% des Portfoliowerts
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={hedgeRatioId} className="text-sm">
          Absicherungsquote: {(config.hedgeRatio * 100).toFixed(0)}%
        </Label>
        <Input
          id={hedgeRatioId}
          type="range"
          min="0"
          max="100"
          step="10"
          value={config.hedgeRatio * 100}
          onChange={e => onConfigChange({ ...config, hedgeRatio: Number(e.target.value) / 100 })}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          {(config.hedgeRatio * 100).toFixed(0)}% des Portfolios wird abgesichert
        </p>
      </div>
    </>
  )
}

interface CostConfigProps {
  config: TailRiskHedgingConfig
  onConfigChange: (config: TailRiskHedgingConfig) => void
  annualCostId: string
  rebalancingId: string
}

function CostConfig({ config, onConfigChange, annualCostId, rebalancingId }: CostConfigProps) {
  const [minCost, maxCost] = getStrategyCostRange(config.strategy)
  const costHint = `Typischer Bereich: ${(minCost * 100).toFixed(1)}%-${(maxCost * 100).toFixed(1)}%`

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={annualCostId} className="text-sm">
          Jährliche Kosten: {(config.annualCost * 100).toFixed(2)}%
        </Label>
        <Input
          id={annualCostId}
          type="number"
          min="0"
          max="10"
          step="0.1"
          value={(config.annualCost * 100).toFixed(2)}
          onChange={e => {
            const value = Number(e.target.value) / 100
            if (!isNaN(value) && value >= 0 && value <= 0.1) {
              onConfigChange({ ...config, annualCost: value })
            }
          }}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">{costHint}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={rebalancingId} className="text-sm">
          Rebalancing-Frequenz
        </Label>
        <select
          id={rebalancingId}
          value={config.rebalancingMonths}
          onChange={e => onConfigChange({ ...config, rebalancingMonths: Number(e.target.value) })}
          className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="1">Monatlich</option>
          <option value="3">Quartalsweise</option>
          <option value="6">Halbjährlich</option>
          <option value="12">Jährlich</option>
        </select>
      </div>
    </>
  )
}

interface ConfigInputsProps {
  config: TailRiskHedgingConfig
  onConfigChange: (config: TailRiskHedgingConfig) => void
  protectionLevelId: string
  hedgeRatioId: string
  annualCostId: string
  rebalancingId: string
}

function ConfigInputs({
  config,
  onConfigChange,
  protectionLevelId,
  hedgeRatioId,
  annualCostId,
  rebalancingId,
}: ConfigInputsProps) {
  return (
    <>
      <ProtectionConfig
        config={config}
        onConfigChange={onConfigChange}
        protectionLevelId={protectionLevelId}
        hedgeRatioId={hedgeRatioId}
      />
      <CostConfig
        config={config}
        onConfigChange={onConfigChange}
        annualCostId={annualCostId}
        rebalancingId={rebalancingId}
      />
    </>
  )
}

function ConfigSection({ config, onConfigChange }: ConfigSectionProps) {
  const enabledId = useMemo(() => generateFormId('tail-risk-hedging', 'enabled'), [])
  const strategyId = useMemo(() => generateFormId('tail-risk-hedging', 'strategy'), [])
  const protectionLevelId = useMemo(() => generateFormId('tail-risk-hedging', 'protection-level'), [])
  const hedgeRatioId = useMemo(() => generateFormId('tail-risk-hedging', 'hedge-ratio'), [])
  const annualCostId = useMemo(() => generateFormId('tail-risk-hedging', 'annual-cost'), [])
  const rebalancingId = useMemo(() => generateFormId('tail-risk-hedging', 'rebalancing'), [])

  const validationError = validateHedgingConfig(config)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor={enabledId} className="text-sm font-medium">
          Tail-Risk Hedging aktivieren
        </Label>
        <Switch
          id={enabledId}
          checked={config.enabled}
          onCheckedChange={enabled => onConfigChange({ ...config, enabled })}
        />
      </div>

      {config.enabled && (
        <>
          <StrategySelection config={config} onConfigChange={onConfigChange} strategyId={strategyId} />
          <ConfigInputs
            config={config}
            onConfigChange={onConfigChange}
            protectionLevelId={protectionLevelId}
            hedgeRatioId={hedgeRatioId}
            annualCostId={annualCostId}
            rebalancingId={rebalancingId}
          />

          {validationError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
              ⚠️ {validationError}
            </div>
          )}
        </>
      )}
    </div>
  )
}

interface ResultMetricsProps {
  summary: TailRiskHedgingSummary
  netBenefitPositive: boolean
}

function ResultMetrics({ summary, netBenefitPositive }: ResultMetricsProps) {
  const textColor = netBenefitPositive ? 'text-green-800' : 'text-orange-800'
  const boldColor = netBenefitPositive ? 'text-green-900' : 'text-orange-900'

  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className={textColor}>Gesamtkosten:</span>
        <span className={`font-medium ${boldColor}`}>{formatCurrency(summary.totalCosts)}</span>
      </div>
      <div className="flex justify-between">
        <span className={textColor}>Verhinderte Verluste:</span>
        <span className={`font-medium ${boldColor}`}>{formatCurrency(summary.totalLossesPrevented)}</span>
      </div>
      <div className="flex justify-between">
        <span className={textColor}>
          Hedge ausgelöst ({summary.yearsHedgeTriggered}/{summary.totalYears} Jahre):
        </span>
        <span className={`font-medium ${boldColor}`}>{summary.yearsHedgeTriggered} mal</span>
      </div>
    </div>
  )
}

interface PortfolioComparisonProps {
  summary: TailRiskHedgingSummary
}

function PortfolioComparison({ summary }: PortfolioComparisonProps) {
  const difference = summary.finalValueWithHedging - summary.finalValueWithoutHedging
  const differenceColor = difference > 0 ? 'text-green-600' : 'text-red-600'

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <h4 className="font-medium text-gray-900 mb-3">📈 Portfolio-Vergleich</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-700">Endkapital ohne Hedging:</span>
          <span className="font-medium text-gray-900">{formatCurrency(summary.finalValueWithoutHedging)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700">Endkapital mit Hedging:</span>
          <span className="font-medium text-gray-900">{formatCurrency(summary.finalValueWithHedging)}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-gray-300">
          <span className="font-medium text-gray-900">Differenz:</span>
          <span className={`font-bold ${differenceColor}`}>{formatCurrency(difference)}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-300 text-xs text-gray-700">
        <p>Durchschnittliche jährliche Kosten: {summary.averageAnnualCostPercent.toFixed(2)}% des Portfoliowerts</p>
        <p className="mt-1">Maximaler Einzeljahresvorteil: {formatCurrency(summary.maxYearBenefit)}</p>
      </div>
    </div>
  )
}

interface InterpretationMessageProps {
  config: TailRiskHedgingConfig
  netBenefitPositive: boolean
}

function InterpretationMessage({ config, netBenefitPositive }: InterpretationMessageProps) {
  return (
    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
      <p className="font-medium mb-1">💡 Interpretation:</p>
      {netBenefitPositive ? (
        <p>
          Die {HEDGING_STRATEGY_NAMES[config.strategy]} Strategie hat in diesem Szenario einen positiven Nettovorteil
          erzielt. Die verhinderten Verluste überstiegen die Hedging-Kosten.
        </p>
      ) : (
        <p>
          Die {HEDGING_STRATEGY_NAMES[config.strategy]} Strategie hat in diesem Szenario mehr gekostet als sie an
          Verlusten verhindert hat. Dies ist typisch für Bullenmärkte ohne größere Crashs.
        </p>
      )}
    </div>
  )
}

interface ResultsDisplayProps {
  summary: TailRiskHedgingSummary
  config: TailRiskHedgingConfig
}

function ResultsDisplay({ summary, config }: ResultsDisplayProps) {
  const netBenefitPositive = summary.netBenefit >= 0
  const bgColor = netBenefitPositive ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
  const titleColor = netBenefitPositive ? 'text-green-900' : 'text-orange-900'
  const borderColor = netBenefitPositive ? 'border-green-300' : 'border-orange-300'
  const boldColor = netBenefitPositive ? 'text-green-900' : 'text-orange-900'

  return (
    <div className="mt-4 space-y-4">
      <div className={`p-4 rounded-lg border ${bgColor}`}>
        <h4 className={`font-medium mb-3 ${titleColor}`}>💰 Hedging-Ergebnis (10-Jahres-Simulation)</h4>
        <ResultMetrics summary={summary} netBenefitPositive={netBenefitPositive} />
        <div className={`flex justify-between pt-2 border-t ${borderColor}`}>
          <span className={`font-medium ${boldColor}`}>Nettovorteil:</span>
          <span className={`font-bold text-lg ${boldColor}`}>{formatCurrency(summary.netBenefit)}</span>
        </div>
      </div>

      <PortfolioComparison summary={summary} />
      <InterpretationMessage config={config} netBenefitPositive={netBenefitPositive} />
    </div>
  )
}

/**
 * Tail-Risk Hedging Card - Informational calculator for hedging strategies
 * against extreme market losses
 */
export function TailRiskHedgingCard() {
  const [config, setConfig] = useState<TailRiskHedgingConfig>(getDefaultTailRiskHedgingConfig)

  // Generate example scenario data: 10 years with various returns
  // Including one crash year and mostly positive years
  const scenarioData = useMemo(() => {
    return [
      { portfolioValue: 100000, marketReturn: 0.08 }, // Year 1: +8%
      { portfolioValue: 108000, marketReturn: 0.12 }, // Year 2: +12%
      { portfolioValue: 120960, marketReturn: 0.05 }, // Year 3: +5%
      { portfolioValue: 127008, marketReturn: -0.35 }, // Year 4: -35% CRASH
      { portfolioValue: 82555, marketReturn: 0.25 }, // Year 5: +25% recovery
      { portfolioValue: 103194, marketReturn: 0.1 }, // Year 6: +10%
      { portfolioValue: 113513, marketReturn: 0.08 }, // Year 7: +8%
      { portfolioValue: 122594, marketReturn: -0.08 }, // Year 8: -8% correction
      { portfolioValue: 112787, marketReturn: 0.15 }, // Year 9: +15%
      { portfolioValue: 129705, marketReturn: 0.07 }, // Year 10: +7%
    ]
  }, [])

  const summary = useMemo(() => {
    if (!config.enabled) return null
    return calculateHedgingSummary(config, scenarioData)
  }, [config, scenarioData])

  return (
    <Card nestingLevel={1}>
      <Collapsible defaultOpen={false}>
        <CollapsibleCardHeader titleClassName="text-left" simplifiedPadding>
          🛡️ Tail-Risk Hedging Rechner
        </CollapsibleCardHeader>
        <CollapsibleContent>
          <CardContent nestingLevel={1}>
            <div className="space-y-4">
              <InfoMessage />
              <ConfigSection config={config} onConfigChange={setConfig} />
              {summary && <ResultsDisplay summary={summary} config={config} />}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
