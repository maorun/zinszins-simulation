import type { WithdrawalStrategy } from '../../helpers/withdrawal'
import type { ComparisonStrategy, WithdrawalFormValue } from '../utils/config-storage'
import { BucketStrategyConfiguration } from './BucketStrategyConfiguration'
import { DynamicWithdrawalConfiguration } from './DynamicWithdrawalConfiguration'
import { KapitalerhaltConfiguration } from './KapitalerhaltConfiguration'
import { RMDWithdrawalConfiguration } from './RMDWithdrawalConfiguration'
import { SteueroptimierteEntnahmeConfiguration } from './SteueroptimierteEntnahmeConfiguration'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { RadioTile, RadioTileGroup } from './ui/radio-tile'
import { Slider } from './ui/slider'
import { Switch } from './ui/switch'

// Helper function for strategy display names
function getStrategyDisplayName(strategy: WithdrawalStrategy): string {
  switch (strategy) {
    case '4prozent':
      return '4% Regel'
    case '3prozent':
      return '3% Regel'
    case 'variabel_prozent':
      return 'Variable Prozent'
    case 'monatlich_fest':
      return 'Monatlich fest'
    case 'dynamisch':
      return 'Dynamische Strategie'
    case 'bucket_strategie':
      return 'Drei-Eimer-Strategie'
    case 'rmd':
      return 'RMD (Lebenserwartung)'
    case 'kapitalerhalt':
      return 'Kapitalerhalt / Ewige Rente'
    case 'steueroptimiert':
      return 'Steueroptimierte Entnahme'
    default:
      return strategy
  }
}

interface ComparisonStrategyConfigurationProps {
  formValue: WithdrawalFormValue
  comparisonStrategies: ComparisonStrategy[]
  onUpdateFormValue: (value: Partial<WithdrawalFormValue>) => void
  onUpdateComparisonStrategy: (id: string, updates: Partial<ComparisonStrategy>) => void
  onRemoveComparisonStrategy: (id: string) => void
  onAddComparisonStrategy: () => void
}

/**
 * Component for configuring comparison strategies
 * Extracted from EntnahmeSimulationsAusgabe to reduce complexity
 */
export function ComparisonStrategyConfiguration({
  formValue,
  comparisonStrategies,
  onUpdateFormValue,
  onUpdateComparisonStrategy,
  onRemoveComparisonStrategy,
  onAddComparisonStrategy,
}: ComparisonStrategyConfigurationProps) {
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

      {/* Comparison strategies configuration */}
      <div style={{ marginTop: '30px' }}>
        <h4>Vergleichs-Strategien</h4>
        <p
          style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '20px',
          }}
        >
          Konfiguriere zusätzliche Strategien zum Vergleich. Diese zeigen
          nur die wichtigsten Parameter und Endergebnisse.
        </p>

        {comparisonStrategies.map(
          (strategy: ComparisonStrategy, index: number) => (
            <div
              key={strategy.id}
              style={{
                border: '1px solid #e5e5ea',
                borderRadius: '6px',
                padding: '15px',
                marginBottom: '15px',
                backgroundColor: '#f8f9fa',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                }}
              >
                <h5 style={{ margin: 0 }}>
                  Strategie
                  {' '}
                  {index + 1}
                  :
                  {' '}
                  {strategy.name}
                </h5>
                <button
                  type="button"
                  onClick={() => onRemoveComparisonStrategy(strategy.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#999',
                    cursor: 'pointer',
                    fontSize: '18px',
                  }}
                >
                  ×
                </button>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  alignItems: 'end',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      marginBottom: '5px',
                    }}
                  >
                    Strategie-Typ
                  </label>
                  <select
                    value={strategy.strategie}
                    onChange={(e) => {
                      const newStrategie = e.target
                        .value as WithdrawalStrategy
                      onUpdateComparisonStrategy(strategy.id, {
                        strategie: newStrategie,
                        name: getStrategyDisplayName(newStrategie),
                      })
                    }}
                    style={{
                      width: '100%',
                      padding: '6px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                    }}
                  >
                    <option value="4prozent">4% Regel</option>
                    <option value="3prozent">3% Regel</option>
                    <option value="variabel_prozent">
                      Variable Prozent
                    </option>
                    <option value="monatlich_fest">Monatlich fest</option>
                    <option value="dynamisch">
                      Dynamische Strategie
                    </option>
                    <option value="bucket_strategie">
                      Drei-Eimer-Strategie
                    </option>
                    <option value="rmd">
                      RMD (Lebenserwartung)
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      marginBottom: '5px',
                    }}
                  >
                    Rendite (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="15"
                    step="0.5"
                    value={strategy.rendite}
                    onChange={(e) => {
                      onUpdateComparisonStrategy(strategy.id, {
                        rendite: parseFloat(e.target.value) || 5,
                      })
                    }}
                    style={{
                      width: '100%',
                      padding: '6px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                    }}
                  />
                </div>

                {strategy.strategie === 'variabel_prozent' && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        marginBottom: '5px',
                      }}
                    >
                      Entnahme-Prozentsatz (%)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      step="0.5"
                      value={strategy.variabelProzent || 4}
                      onChange={(e) => {
                        onUpdateComparisonStrategy(strategy.id, {
                          variabelProzent:
                          parseFloat(e.target.value) || 5,
                        })
                      }}
                      style={{
                        width: '50%',
                        padding: '6px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                )}

                {strategy.strategie === 'monatlich_fest' && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        marginBottom: '5px',
                      }}
                    >
                      Monatlicher Betrag (€)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={strategy.monatlicheBetrag || 2000}
                      onChange={(e) => {
                        onUpdateComparisonStrategy(strategy.id, {
                          monatlicheBetrag:
                          parseFloat(e.target.value) || 2000,
                        })
                      }}
                      style={{
                        width: '50%',
                        padding: '6px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                )}

                {strategy.strategie === 'dynamisch' && (
                  <>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          marginBottom: '5px',
                        }}
                      >
                        Basis-Rate (%)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        step="0.5"
                        value={strategy.dynamischBasisrate || 4}
                        onChange={(e) => {
                          onUpdateComparisonStrategy(strategy.id, {
                            dynamischBasisrate:
                            parseFloat(e.target.value) || 4,
                          })
                        }}
                        style={{
                          width: '100%',
                          padding: '6px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          marginBottom: '5px',
                        }}
                      >
                        Obere Schwelle (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        value={strategy.dynamischObereSchwell || 8}
                        onChange={(e) => {
                          onUpdateComparisonStrategy(strategy.id, {
                            dynamischObereSchwell:
                            parseFloat(e.target.value) || 8,
                          })
                        }}
                        style={{
                          width: '100%',
                          padding: '6px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </>
                )}

                {strategy.strategie === 'bucket_strategie' && (
                  <>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          marginBottom: '5px',
                        }}
                      >
                        Cash-Polster (€)
                      </label>
                      <input
                        type="number"
                        min="1000"
                        step="1000"
                        value={strategy.bucketInitialCash || 20000}
                        onChange={(e) => {
                          onUpdateComparisonStrategy(strategy.id, {
                            bucketInitialCash:
                            parseFloat(e.target.value) || 20000,
                          })
                        }}
                        style={{
                          width: '100%',
                          padding: '6px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          marginBottom: '5px',
                        }}
                      >
                        Basis-Rate (%)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        step="0.1"
                        value={strategy.bucketBaseRate || 4}
                        onChange={(e) => {
                          onUpdateComparisonStrategy(strategy.id, {
                            bucketBaseRate:
                            parseFloat(e.target.value) || 4,
                          })
                        }}
                        style={{
                          width: '100%',
                          padding: '6px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          ),
        )}

        <button
          type="button"
          onClick={onAddComparisonStrategy}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1675e0',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          + Weitere Strategie hinzufügen
        </button>
      </div>
    </div>
  )
}
