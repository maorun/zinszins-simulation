import { useMemo } from 'react'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { Slider } from './ui/slider'
import { RadioTile, RadioTileGroup } from './ui/radio-tile'
import {
  type Currency,
  type HedgingStrategy,
  CURRENCY_NAMES,
  HEDGING_STRATEGY_NAMES,
} from '../../helpers/currency-risk'
import { generateFormId } from '../utils/unique-id'

interface CurrencyAllocation {
  currency: Currency
  allocation: number
}

interface CurrencyRiskConfigurationProps {
  enabled: boolean
  currencyAllocations: CurrencyAllocation[]
  hedgingStrategy: HedgingStrategy
  hedgingRatio: number
  hedgingCostPercent: number
  onEnabledChange: (enabled: boolean) => void
  onCurrencyAllocationChange: (allocations: CurrencyAllocation[]) => void
  onHedgingStrategyChange: (strategy: HedgingStrategy) => void
  onHedgingRatioChange: (ratio: number) => void
  onHedgingCostChange: (cost: number) => void
}

/**
 * Currency allocation slider component
 */
function CurrencyAllocationSlider({
  currency,
  allocation,
  onAllocationChange,
}: {
  currency: Currency
  allocation: number
  onAllocationChange: (allocation: number) => void
}) {
  const sliderId = useMemo(
    () => generateFormId('currency-allocation', currency.toLowerCase()),
    [currency]
  )

  return (
    <div className="mb-4 space-y-2">
      <Label htmlFor={sliderId}>{CURRENCY_NAMES[currency]}</Label>
      <div className="space-y-2">
        <Slider
          id={sliderId}
          value={[allocation * 100]}
          onValueChange={(values: number[]) => {
            onAllocationChange(values[0] / 100)
          }}
          min={0}
          max={100}
          step={5}
          className="mt-2"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>0%</span>
          <span className="font-medium text-gray-900">
            {(allocation * 100).toFixed(0)}%
          </span>
          <span>100%</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Hedging ratio slider for partial hedging
 */
function HedgingRatioSlider({
  hedgingRatio,
  onHedgingRatioChange,
}: {
  hedgingRatio: number
  onHedgingRatioChange: (ratio: number) => void
}) {
  const sliderId = useMemo(() => generateFormId('hedging-ratio', 'slider'), [])

  return (
    <div className="mb-4 space-y-2">
      <Label htmlFor={sliderId}>Absicherungsgrad</Label>
      <div className="space-y-2">
        <Slider
          id={sliderId}
          value={[hedgingRatio * 100]}
          onValueChange={(values: number[]) => {
            onHedgingRatioChange(values[0] / 100)
          }}
          min={0}
          max={100}
          step={5}
          className="mt-2"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>0%</span>
          <span className="font-medium text-gray-900">
            {(hedgingRatio * 100).toFixed(0)}%
          </span>
          <span>100%</span>
        </div>
      </div>
      <div className="text-sm text-muted-foreground mt-1">
        Prozentanteil des Währungsrisikos, der abgesichert werden soll
      </div>
    </div>
  )
}

/**
 * Hedging cost slider
 */
function HedgingCostSlider({
  hedgingCostPercent,
  onHedgingCostChange,
}: {
  hedgingCostPercent: number
  onHedgingCostChange: (cost: number) => void
}) {
  const sliderId = useMemo(() => generateFormId('hedging-cost', 'slider'), [])

  return (
    <div className="mb-4 space-y-2">
      <Label htmlFor={sliderId}>Absicherungskosten (% p.a.)</Label>
      <div className="space-y-2">
        <Slider
          id={sliderId}
          value={[hedgingCostPercent * 100]}
          onValueChange={(values: number[]) => {
            onHedgingCostChange(values[0] / 100)
          }}
          min={0}
          max={5}
          step={0.1}
          className="mt-2"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>0%</span>
          <span className="font-medium text-gray-900">
            {(hedgingCostPercent * 100).toFixed(1)}%
          </span>
          <span>5%</span>
        </div>
      </div>
      <div className="text-sm text-muted-foreground mt-1">
        Jährliche Kosten für die Währungsabsicherung (z.B. durch Termingeschäfte)
      </div>
    </div>
  )
}

/**
 * Hedging strategy selector component
 */
function HedgingStrategySelector({
  hedgingStrategy,
  onHedgingStrategyChange,
}: {
  hedgingStrategy: HedgingStrategy
  onHedgingStrategyChange: (strategy: HedgingStrategy) => void
}) {
  return (
    <div className="mb-4 space-y-2">
      <Label>Absicherungsstrategie</Label>
      <RadioTileGroup
        name="hedging-strategy"
        value={hedgingStrategy}
        onValueChange={(value) => onHedgingStrategyChange(value as HedgingStrategy)}
        className="grid-cols-1 md:grid-cols-3"
      >
        <RadioTile value="unhedged" label="Ungesichert">
          {HEDGING_STRATEGY_NAMES.unhedged}
          <div className="mt-2 text-xs">
            Keine Absicherung, volles Währungsrisiko. Geeignet für langfristige Anlagen mit
            natürlicher Diversifikation.
          </div>
        </RadioTile>
        <RadioTile value="partial_hedged" label="Teilweise">
          {HEDGING_STRATEGY_NAMES.partial_hedged}
          <div className="mt-2 text-xs">
            Teilweise Absicherung des Währungsrisikos. Ausgewogenes Verhältnis zwischen Risiko
            und Kosten.
          </div>
        </RadioTile>
        <RadioTile value="fully_hedged" label="Vollständig">
          {HEDGING_STRATEGY_NAMES.fully_hedged}
          <div className="mt-2 text-xs">
            Vollständige Absicherung gegen Währungsschwankungen. Höhere Kosten für maximale
            Sicherheit.
          </div>
        </RadioTile>
      </RadioTileGroup>
    </div>
  )
}

/**
 * Information box about hedging strategies
 */
function HedgingInformationBox() {
  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h5 className="text-sm font-semibold text-blue-900 mb-2">
        💡 Hinweis zur Währungsabsicherung
      </h5>
      <div className="text-sm text-blue-800 space-y-2">
        <p>
          <strong>Ungesichert:</strong> Volle Teilnahme an Währungsschwankungen. Langfristig
          kann sich das Währungsrisiko ausgleichen.
        </p>
        <p>
          <strong>Teilweise gesichert:</strong> Ausgewogene Lösung zwischen Risiko und Kosten.
          Typisch: 50% Absicherung.
        </p>
        <p>
          <strong>Vollständig gesichert:</strong> Eliminiert Währungsrisiko fast vollständig,
          aber mit laufenden Kosten verbunden.
        </p>
        <p className="text-xs mt-2 italic">
          Die Absicherungskosten reduzieren die Gesamtrendite des Portfolios.
        </p>
      </div>
    </div>
  )
}

/**
 * Currency allocation section
 */
function CurrencyAllocationSection({
  currencyAllocations,
  onCurrencyAllocationChange,
}: {
  currencyAllocations: CurrencyAllocation[]
  onCurrencyAllocationChange: (allocations: CurrencyAllocation[]) => void
}) {
  const updateCurrencyAllocation = (currency: Currency, newAllocation: number) => {
    const updated = currencyAllocations.map((item) =>
      item.currency === currency ? { ...item, allocation: newAllocation } : item
    )
    onCurrencyAllocationChange(updated)
  }

  return (
    <div className="pt-4 border-t">
      <h4 className="text-sm font-semibold mb-3">Währungsallokation</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Definieren Sie die Aufteilung Ihres Portfolios nach Währungen. Die Summe sollte 100%
        ergeben.
      </p>
      {currencyAllocations.map((item) => (
        <CurrencyAllocationSlider
          key={item.currency}
          currency={item.currency}
          allocation={item.allocation}
          onAllocationChange={(allocation) =>
            updateCurrencyAllocation(item.currency, allocation)
          }
        />
      ))}
      <div className="text-sm text-muted-foreground mt-2">
        Summe:{' '}
        <span className="font-medium">
          {(
            currencyAllocations.reduce((sum, item) => sum + item.allocation, 0) * 100
          ).toFixed(0)}
          %
        </span>
      </div>
    </div>
  )
}

/**
 * Hedging configuration section
 */
function HedgingConfigurationSection({
  hedgingStrategy,
  hedgingRatio,
  hedgingCostPercent,
  onHedgingStrategyChange,
  onHedgingRatioChange,
  onHedgingCostChange,
}: {
  hedgingStrategy: HedgingStrategy
  hedgingRatio: number
  hedgingCostPercent: number
  onHedgingStrategyChange: (strategy: HedgingStrategy) => void
  onHedgingRatioChange: (ratio: number) => void
  onHedgingCostChange: (cost: number) => void
}) {
  return (
    <>
      <div className="pt-4 border-t">
        <h4 className="text-sm font-semibold mb-3">Währungsabsicherung</h4>
        <HedgingStrategySelector
          hedgingStrategy={hedgingStrategy}
          onHedgingStrategyChange={onHedgingStrategyChange}
        />
      </div>

      {hedgingStrategy === 'partial_hedged' && (
        <HedgingRatioSlider
          hedgingRatio={hedgingRatio}
          onHedgingRatioChange={onHedgingRatioChange}
        />
      )}

      {hedgingStrategy !== 'unhedged' && (
        <HedgingCostSlider
          hedgingCostPercent={hedgingCostPercent}
          onHedgingCostChange={onHedgingCostChange}
        />
      )}

      <HedgingInformationBox />
    </>
  )
}

/**
 * Main currency risk configuration component
 *
 * Allows users to configure currency allocations and hedging strategies
 * for international investments in their portfolio.
 */
export function CurrencyRiskConfiguration({
  enabled,
  currencyAllocations,
  hedgingStrategy,
  hedgingRatio,
  hedgingCostPercent,
  onEnabledChange,
  onCurrencyAllocationChange,
  onHedgingStrategyChange,
  onHedgingRatioChange,
  onHedgingCostChange,
}: CurrencyRiskConfigurationProps) {
  const enabledSwitchId = useMemo(() => generateFormId('currency-risk', 'enabled'), [])

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Switch
            id={enabledSwitchId}
            checked={enabled}
            onCheckedChange={onEnabledChange}
          />
          <Label htmlFor={enabledSwitchId}>Währungsrisiko berücksichtigen</Label>
        </div>
        <div className="text-sm text-muted-foreground">
          Aktiviert die Analyse und Verwaltung von Währungsrisiken bei internationalen
          Investments. Hilfreich für Portfolios mit US-Aktien, UK-Bonds oder anderen
          Fremdwährungsanlagen.
        </div>
      </div>

      {enabled && (
        <div className="space-y-4">
          <CurrencyAllocationSection
            currencyAllocations={currencyAllocations}
            onCurrencyAllocationChange={onCurrencyAllocationChange}
          />

          <HedgingConfigurationSection
            hedgingStrategy={hedgingStrategy}
            hedgingRatio={hedgingRatio}
            hedgingCostPercent={hedgingCostPercent}
            onHedgingStrategyChange={onHedgingStrategyChange}
            onHedgingRatioChange={onHedgingRatioChange}
            onHedgingCostChange={onHedgingCostChange}
          />
        </div>
      )}
    </div>
  )
}
