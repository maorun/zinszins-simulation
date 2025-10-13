import type { ComparisonStrategy, WithdrawalFormValue } from '../utils/config-storage'
import { BaseStrategyConfiguration } from './comparison/BaseStrategyConfiguration'
import { ComparisonStrategyCard } from './comparison/ComparisonStrategyCard'

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
      <BaseStrategyConfiguration
        formValue={formValue}
        onUpdateFormValue={onUpdateFormValue}
      />

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

        {comparisonStrategies.map((strategy: ComparisonStrategy, index: number) => (
          <ComparisonStrategyCard
            key={strategy.id}
            strategy={strategy}
            index={index}
            onUpdate={onUpdateComparisonStrategy}
            onRemove={onRemoveComparisonStrategy}
          />
        ))}

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
