import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { Slider } from '../ui/slider'
import { RadioTileGroup, RadioTile } from '../ui/radio-tile'
import { Input } from '../ui/input'
import { DollarSign, TrendingUp, ArrowUpDown } from 'lucide-react'

interface RebalancingConfig {
  frequency: 'never' | 'monthly' | 'quarterly' | 'annually'
  useThreshold: boolean
  threshold: number
  transactionCosts: {
    percentageCost: number
    fixedCost: number
    minTransactionSize: number
  }
  costBenefitThreshold: number
}

interface RebalancingConfigurationProps {
  /** Current rebalancing configuration */
  config: RebalancingConfig
  /** Callback when configuration changes */
  onChange: (updates: Partial<RebalancingConfig>) => void
}

/**
 * Threshold-based rebalancing configuration
 */
function ThresholdConfiguration({
  useThreshold,
  threshold,
  onChange,
}: {
  useThreshold: boolean
  threshold: number
  onChange: (updates: Partial<RebalancingConfig>) => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Switch checked={useThreshold} onCheckedChange={useThreshold => onChange({ useThreshold })} />
        <Label className="text-sm">Schwellenwert-basiertes Rebalancing</Label>
      </div>

      {useThreshold && (
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-700">
            Drift-Schwellenwert: {(threshold * 100).toFixed(1)}%
          </Label>
          <Slider
            value={[threshold * 100]}
            onValueChange={([value]) => onChange({ threshold: value / 100 })}
            min={1}
            max={20}
            step={0.5}
            className="w-full"
          />
          <p className="text-xs text-gray-600">
            Rebalancing erfolgt wenn eine Anlageklasse um mehr als diesen Wert von der Zielallokation abweicht
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Percentage cost slider component
 */
function PercentageCostSlider({
  percentageCost,
  onChange,
}: {
  percentageCost: number
  onChange: (value: number) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-gray-700">Prozentuale Kosten</Label>
        <span className="text-xs font-mono text-gray-600">{(percentageCost * 100).toFixed(3)}%</span>
      </div>
      <Slider
        value={[percentageCost * 1000]}
        onValueChange={([value]) => onChange(value / 1000)}
        min={0}
        max={10}
        step={0.1}
        className="w-full"
      />
      <p className="text-xs text-gray-600">Prozentuale Kosten pro Trade (z.B. 0.1% für typische Online-Broker)</p>
    </div>
  )
}

/**
 * Fixed cost input component
 */
function FixedCostInput({ fixedCost, onChange }: { fixedCost: number; onChange: (value: number) => void }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-gray-700">Fixe Kosten pro Trade</Label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={fixedCost}
          onChange={e => onChange(Math.max(0, Number(e.target.value) || 0))}
          min={0}
          step={0.5}
          className="flex-1"
        />
        <span className="text-xs text-gray-600">€</span>
      </div>
      <p className="text-xs text-gray-600">Fixe Gebühr pro Transaktion (z.B. 5€ pro Order)</p>
    </div>
  )
}

/**
 * Minimum transaction size input component
 */
function MinTransactionSizeInput({
  minTransactionSize,
  onChange,
}: {
  minTransactionSize: number
  onChange: (value: number) => void
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-gray-700">Minimale Transaktionsgröße</Label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={minTransactionSize}
          onChange={e => onChange(Math.max(0, Number(e.target.value) || 0))}
          min={0}
          step={10}
          className="flex-1"
        />
        <span className="text-xs text-gray-600">€</span>
      </div>
      <p className="text-xs text-gray-600">Kleinere Transaktionen werden vermieden</p>
    </div>
  )
}

/**
 * Cost-benefit threshold slider component
 */
function CostBenefitThresholdSlider({
  costBenefitThreshold,
  onChange,
}: {
  costBenefitThreshold: number
  onChange: (value: number) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp className="h-3 w-3 text-blue-600" />
        <Label className="text-xs font-medium text-gray-700">Kosten-Nutzen-Schwellenwert</Label>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">{(costBenefitThreshold * 100).toFixed(2)}% des Portfoliowerts</span>
      </div>
      <Slider
        value={[costBenefitThreshold * 1000]}
        onValueChange={([value]) => onChange(value / 1000)}
        min={0}
        max={10}
        step={0.1}
        className="w-full"
      />
      <p className="text-xs text-gray-600">
        Rebalancing nur durchführen, wenn Kosten unter diesem Schwellenwert liegen
      </p>
    </div>
  )
}

/**
 * Transaction cost configuration
 */
function TransactionCostConfiguration({
  transactionCosts,
  costBenefitThreshold,
  onChange,
}: {
  transactionCosts: RebalancingConfig['transactionCosts']
  costBenefitThreshold: number
  onChange: (updates: Partial<RebalancingConfig>) => void
}) {
  return (
    <div className="space-y-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
      <div className="flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-blue-600" />
        <h4 className="text-sm font-semibold text-gray-700">Transaktionskosten</h4>
      </div>

      <PercentageCostSlider
        percentageCost={transactionCosts.percentageCost}
        onChange={percentageCost => onChange({ transactionCosts: { ...transactionCosts, percentageCost } })}
      />

      <FixedCostInput
        fixedCost={transactionCosts.fixedCost}
        onChange={fixedCost => onChange({ transactionCosts: { ...transactionCosts, fixedCost } })}
      />

      <MinTransactionSizeInput
        minTransactionSize={transactionCosts.minTransactionSize}
        onChange={minTransactionSize => onChange({ transactionCosts: { ...transactionCosts, minTransactionSize } })}
      />

      <CostBenefitThresholdSlider
        costBenefitThreshold={costBenefitThreshold}
        onChange={costBenefitThreshold => onChange({ costBenefitThreshold })}
      />

      <div className="p-2 bg-white rounded-md">
        <div className="flex items-start gap-2 text-xs text-gray-600">
          <ArrowUpDown className="h-3 w-3 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Steueroptimiert:</strong> Verluste werden prioritär verkauft (Tax Loss Harvesting), Freibetrag wird
            optimal genutzt
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Configuration component for portfolio rebalancing settings.
 * Allows users to set rebalancing frequency and optional threshold-based rebalancing.
 */
export function RebalancingConfiguration({ config, onChange }: RebalancingConfigurationProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Rebalancing</h3>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Rebalancing-Häufigkeit</Label>
        <RadioTileGroup
          value={config.frequency}
          onValueChange={frequency => onChange({ frequency: frequency as typeof config.frequency })}
        >
          <RadioTile value="never" label="Nie">
            Nie
          </RadioTile>
          <RadioTile value="annually" label="Jährlich">
            Jährlich
          </RadioTile>
          <RadioTile value="quarterly" label="Quartalsweise">
            Quartalsweise
          </RadioTile>
          <RadioTile value="monthly" label="Monatlich">
            Monatlich
          </RadioTile>
        </RadioTileGroup>
      </div>

      {config.frequency !== 'never' && (
        <>
          <ThresholdConfiguration useThreshold={config.useThreshold} threshold={config.threshold} onChange={onChange} />
          <TransactionCostConfiguration
            transactionCosts={config.transactionCosts}
            costBenefitThreshold={config.costBenefitThreshold}
            onChange={onChange}
          />
        </>
      )}
    </div>
  )
}
