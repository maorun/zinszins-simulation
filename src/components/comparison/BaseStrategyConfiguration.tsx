import type { WithdrawalStrategy } from '../../../helpers/withdrawal'
import type { WithdrawalFormValue } from '../../utils/config-storage'
import { BucketStrategyConfiguration } from '../BucketStrategyConfiguration'
import { DynamicWithdrawalConfiguration } from '../DynamicWithdrawalConfiguration'
import { KapitalerhaltConfiguration } from '../KapitalerhaltConfiguration'
import { RMDWithdrawalConfiguration } from '../RMDWithdrawalConfiguration'
import { SteueroptimierteEntnahmeConfiguration } from '../SteueroptimierteEntnahmeConfiguration'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { RadioTile, RadioTileGroup } from '../ui/radio-tile'
import { Slider } from '../ui/slider'
import { Switch } from '../ui/switch'

interface BaseStrategyConfigurationProps {
  formValue: WithdrawalFormValue
  onUpdateFormValue: (value: Partial<WithdrawalFormValue>) => void
}

/**
 * Variable percentage strategy configuration
 */
function VariablePercentConfig({
  variabelProzent,
  onUpdate,
}: {
  variabelProzent: number
  onUpdate: (variabelProzent: number) => void
}) {
  return (
    <div className="mb-4 space-y-2">
      <Label>Entnahme-Prozentsatz (%)</Label>
      <div className="space-y-2">
        <Slider
          value={[variabelProzent]}
          onValueChange={(values: number[]) => onUpdate(values[0])}
          min={1}
          max={10}
          step={0.5}
          className="mt-2"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>1%</span>
          <span className="font-medium text-gray-900">
            {variabelProzent}
            %
          </span>
          <span>10%</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Monthly fixed amount strategy configuration
 */
function MonthlyFixedConfig({
  monatlicheBetrag,
  onUpdate,
}: {
  monatlicheBetrag?: number
  onUpdate: (monatlicheBetrag: number) => void
}) {
  return (
    <div className="mb-4 space-y-2">
      <Label>Monatlicher Betrag (€)</Label>
      <Input
        type="number"
        value={monatlicheBetrag}
        onChange={(e) => {
          const value = e.target.value ? Number(e.target.value) : undefined
          if (value) onUpdate(value)
        }}
      />
    </div>
  )
}

/**
 * Strategy-specific configuration sections
 */
function StrategySpecificConfigurations({
  formValue,
  onUpdateFormValue,
}: {
  formValue: WithdrawalFormValue
  onUpdateFormValue: (updates: Partial<WithdrawalFormValue>) => void
}) {
  const { strategie } = formValue
  const updateValue = (updates: Partial<WithdrawalFormValue>) =>
    onUpdateFormValue({ ...formValue, ...updates })

  switch (strategie) {
    case 'variabel_prozent':
      return (
        <VariablePercentConfig
          variabelProzent={formValue.variabelProzent}
          onUpdate={variabelProzent => updateValue({ variabelProzent })}
        />
      )

    case 'monatlich_fest':
      return (
        <MonthlyFixedConfig
          monatlicheBetrag={formValue.monatlicheBetrag}
          onUpdate={monatlicheBetrag => updateValue({ monatlicheBetrag })}
        />
      )

    case 'dynamisch':
      return <DynamicWithdrawalConfiguration formValue={formValue} />

    case 'rmd':
      return <RMDWithdrawalConfiguration formValue={formValue} updateFormValue={onUpdateFormValue} />

    case 'kapitalerhalt':
      return <KapitalerhaltConfiguration formValue={formValue} updateFormValue={onUpdateFormValue} />

    case 'bucket_strategie':
      return <BucketStrategyConfiguration formValue={formValue} updateFormValue={onUpdateFormValue} />

    case 'steueroptimiert':
      return <SteueroptimierteEntnahmeConfiguration formValue={formValue} updateFormValue={onUpdateFormValue} />

    default:
      return null
  }
}

/**
 * Strategy selector component
 */
function StrategySelector({
  strategy,
  onStrategyChange,
}: {
  strategy: WithdrawalStrategy
  onStrategyChange: (strategy: WithdrawalStrategy) => void
}) {
  return (
    <div className="mb-4 space-y-2">
      <Label>Basis-Strategie</Label>
      <RadioTileGroup
        value={strategy}
        onValueChange={value => onStrategyChange(value as WithdrawalStrategy)}
      >
        <RadioTile value="4prozent" label="4% Regel">
          4% Entnahme
        </RadioTile>
        <RadioTile value="3prozent" label="3% Regel">
          3% Entnahme
        </RadioTile>
        <RadioTile value="variabel_prozent" label="Variable Prozent">
          Anpassbare Entnahme
        </RadioTile>
        <RadioTile value="monatlich_fest" label="Monatlich fest">
          Fester monatlicher Betrag
        </RadioTile>
        <RadioTile value="dynamisch" label="Dynamische Strategie">
          Renditebasierte Anpassung
        </RadioTile>
        <RadioTile value="bucket_strategie" label="Drei-Eimer-Strategie">
          Cash-Polster bei negativen Renditen
        </RadioTile>
        <RadioTile value="rmd" label="RMD (Lebenserwartung)">
          Entnahme basierend auf Alter und Lebenserwartung
        </RadioTile>
        <RadioTile value="kapitalerhalt" label="Kapitalerhalt / Ewige Rente">
          Reale Rendite für Kapitalerhalt
        </RadioTile>
        <RadioTile value="steueroptimiert" label="Steueroptimierte Entnahme">
          Automatische Optimierung zur Steuerminimierung
        </RadioTile>
      </RadioTileGroup>
    </div>
  )
}

/**
 * Withdrawal frequency configuration component
 */
function WithdrawalFrequencyConfig({
  frequency,
  onFrequencyChange,
}: {
  frequency: 'yearly' | 'monthly'
  onFrequencyChange: (frequency: 'yearly' | 'monthly') => void
}) {
  return (
    <div className="mb-4 space-y-2">
      <Label>Entnahme-Häufigkeit</Label>
      <div className="flex items-center space-x-3 mt-2">
        <span className="text-sm">Jährlich</span>
        <Switch
          checked={frequency === 'monthly'}
          onCheckedChange={(checked) => {
            onFrequencyChange(checked ? 'monthly' : 'yearly')
          }}
        />
        <span className="text-sm">Monatlich</span>
      </div>
      <div className="text-sm text-muted-foreground mt-1">
        {frequency === 'yearly'
          ? 'Entnahme erfolgt einmal jährlich am Anfang des Jahres'
          : 'Entnahme erfolgt monatlich - Portfolio hat mehr Zeit zu wachsen'}
      </div>
    </div>
  )
}

/**
 * Return rate slider component
 */
function ReturnRateSlider({
  rendite,
  onRenditeChange,
}: {
  rendite: number
  onRenditeChange: (rendite: number) => void
}) {
  return (
    <div className="mb-4 space-y-2">
      <Label>Rendite Basis-Strategie (%)</Label>
      <div className="space-y-2">
        <Slider
          value={[rendite]}
          onValueChange={(values: number[]) => onRenditeChange(values[0])}
          min={0}
          max={10}
          step={0.5}
          className="mt-2"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>0%</span>
          <span className="font-medium text-gray-900">
            {rendite}
            %
          </span>
          <span>10%</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Base strategy configuration component
 * Extracted from ComparisonStrategyConfiguration to reduce complexity
 */
export function BaseStrategyConfiguration({
  formValue,
  onUpdateFormValue,
}: BaseStrategyConfigurationProps) {
  return (
    <div>
      <h4>Basis-Strategie (mit vollständigen Details)</h4>
      <div>
        <StrategySelector
          strategy={formValue.strategie}
          onStrategyChange={strategy =>
            onUpdateFormValue({ ...formValue, strategie: strategy })}
        />

        <WithdrawalFrequencyConfig
          frequency={formValue.withdrawalFrequency || 'yearly'}
          onFrequencyChange={frequency =>
            onUpdateFormValue({ withdrawalFrequency: frequency })}
        />

        <ReturnRateSlider
          rendite={formValue.rendite}
          onRenditeChange={rendite => onUpdateFormValue({ ...formValue, rendite })}
        />

        <StrategySpecificConfigurations
          formValue={formValue}
          onUpdateFormValue={onUpdateFormValue}
        />
      </div>
    </div>
  )
}
