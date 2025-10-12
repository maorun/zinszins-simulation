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
        {/* Strategy selector - for base strategy only */}
        <div className="mb-4 space-y-2">
          <Label>Basis-Strategie</Label>
          <RadioTileGroup
            value={formValue.strategie}
            onValueChange={value =>
              onUpdateFormValue({ ...formValue, strategie: value as WithdrawalStrategy })}
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

        {/* Withdrawal frequency configuration */}
        <div className="mb-4 space-y-2">
          <Label>Entnahme-Häufigkeit</Label>
          <div className="flex items-center space-x-3 mt-2">
            <span className="text-sm">Jährlich</span>
            <Switch
              checked={formValue.withdrawalFrequency === 'monthly'}
              onCheckedChange={(checked) => {
                onUpdateFormValue({
                  withdrawalFrequency: checked ? 'monthly' : 'yearly',
                })
              }}
            />
            <span className="text-sm">Monatlich</span>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {formValue.withdrawalFrequency === 'yearly'
              ? 'Entnahme erfolgt einmal jährlich am Anfang des Jahres'
              : 'Entnahme erfolgt monatlich - Portfolio hat mehr Zeit zu wachsen'}
          </div>
        </div>

        {/* Fixed return rate for base strategy */}
        <div className="mb-4 space-y-2">
          <Label>
            Rendite Basis-Strategie (%)
          </Label>
          <div className="space-y-2">
            <Slider
              value={[formValue.rendite]}
              onValueChange={(values: number[]) => onUpdateFormValue({ ...formValue, rendite: values[0] })}
              min={0}
              max={10}
              step={0.5}
              className="mt-2"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>0%</span>
              <span className="font-medium text-gray-900">
                {formValue.rendite}
                %
              </span>
              <span>10%</span>
            </div>
          </div>
        </div>

        {/* Strategy-specific configuration for base strategy */}
        {formValue.strategie === 'variabel_prozent' && (
          <div className="mb-4 space-y-2">
            <Label>
              Entnahme-Prozentsatz (%)
            </Label>
            <div className="space-y-2">
              <Slider
                value={[formValue.variabelProzent]}
                onValueChange={(values: number[]) =>
                  onUpdateFormValue({ ...formValue, variabelProzent: values[0] })}
                min={1}
                max={10}
                step={0.5}
                className="mt-2"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>1%</span>
                <span className="font-medium text-gray-900">
                  {formValue.variabelProzent}
                  %
                </span>
                <span>10%</span>
              </div>
            </div>
          </div>
        )}

        {formValue.strategie === 'monatlich_fest' && (
          <div className="mb-4 space-y-2">
            <Label>Monatlicher Betrag (€)</Label>
            <Input
              type="number"
              value={formValue.monatlicheBetrag}
              onChange={(e) => {
                const value = e.target.value ? Number(e.target.value) : undefined
                if (value) onUpdateFormValue({ ...formValue, monatlicheBetrag: value })
              }}
            />
          </div>
        )}

        {formValue.strategie === 'dynamisch' && (
          <DynamicWithdrawalConfiguration formValue={formValue} />
        )}

        {formValue.strategie === 'rmd' && (
          <RMDWithdrawalConfiguration
            formValue={formValue}
            updateFormValue={onUpdateFormValue}
          />
        )}

        {formValue.strategie === 'kapitalerhalt' && (
          <KapitalerhaltConfiguration
            formValue={formValue}
            updateFormValue={onUpdateFormValue}
          />
        )}

        {formValue.strategie === 'bucket_strategie' && (
          <BucketStrategyConfiguration
            formValue={formValue}
            updateFormValue={onUpdateFormValue}
          />
        )}

        {formValue.strategie === 'steueroptimiert' && (
          <SteueroptimierteEntnahmeConfiguration
            formValue={formValue}
            updateFormValue={onUpdateFormValue}
          />
        )}
      </div>
    </div>
  )
}
