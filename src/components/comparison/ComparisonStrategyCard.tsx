import type { WithdrawalStrategy } from '../../../helpers/withdrawal'
import type { ComparisonStrategy } from '../../utils/config-storage'

interface ComparisonStrategyCardProps {
  strategy: ComparisonStrategy
  index: number
  onUpdate: (id: string, updates: Partial<ComparisonStrategy>) => void
  onRemove: (id: string) => void
}

// Strategy display name mapping
const STRATEGY_DISPLAY_NAMES: Record<WithdrawalStrategy, string> = {
  '4prozent': '4% Regel',
  '3prozent': '3% Regel',
  'variabel_prozent': 'Variable Prozent',
  'monatlich_fest': 'Monatlich fest',
  'dynamisch': 'Dynamische Strategie',
  'bucket_strategie': 'Drei-Eimer-Strategie',
  'rmd': 'RMD (Lebenserwartung)',
  'kapitalerhalt': 'Kapitalerhalt / Ewige Rente',
  'steueroptimiert': 'Steueroptimierte Entnahme',
}

// Helper function for strategy display names
function getStrategyDisplayName(strategy: WithdrawalStrategy): string {
  return STRATEGY_DISPLAY_NAMES[strategy] || strategy
}

/**
 * Variable percentage field for variable withdrawal strategy
 */
function VariablePercentageField({
  strategyId,
  value,
  onUpdate,
}: {
  strategyId: string
  value: number | undefined
  onUpdate: (id: string, updates: Partial<ComparisonStrategy>) => void
}) {
  return (
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
        value={value || 4}
        onChange={(e) => {
          onUpdate(strategyId, {
            variabelProzent: parseFloat(e.target.value) || 5,
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
  )
}

/**
 * Monthly amount field for fixed monthly withdrawal strategy
 */
function MonthlyAmountField({
  strategyId,
  value,
  onUpdate,
}: {
  strategyId: string
  value: number | undefined
  onUpdate: (id: string, updates: Partial<ComparisonStrategy>) => void
}) {
  return (
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
        value={value || 2000}
        onChange={(e) => {
          onUpdate(strategyId, {
            monatlicheBetrag: parseFloat(e.target.value) || 2000,
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
  )
}

/**
 * Dynamic strategy fields for dynamic withdrawal strategy
 */
function DynamicStrategyFields({
  strategyId,
  basisrate,
  obereSchwell,
  untereSchwell,
  onUpdate,
}: {
  strategyId: string
  basisrate: number | undefined
  obereSchwell: number | undefined
  untereSchwell: number | undefined
  onUpdate: (id: string, updates: Partial<ComparisonStrategy>) => void
}) {
  return (
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
          value={basisrate || 4}
          onChange={(e) => {
            onUpdate(strategyId, {
              dynamischBasisrate: parseFloat(e.target.value) || 4,
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
          value={obereSchwell || 8}
          onChange={(e) => {
            onUpdate(strategyId, {
              dynamischObereSchwell: parseFloat(e.target.value) || 8,
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
          Untere Schwelle (%)
        </label>
        <input
          type="number"
          min="-20"
          max="0"
          step="0.5"
          value={untereSchwell || -8}
          onChange={(e) => {
            onUpdate(strategyId, {
              dynamischUntereSchwell: parseFloat(e.target.value) || -8,
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
  )
}

/**
 * Bucket strategy fields for bucket withdrawal strategy
 */
function BucketStrategyFields({
  strategyId,
  initialCash,
  baseRate,
  onUpdate,
}: {
  strategyId: string
  initialCash: number | undefined
  baseRate: number | undefined
  onUpdate: (id: string, updates: Partial<ComparisonStrategy>) => void
}) {
  return (
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
          value={initialCash || 20000}
          onChange={(e) => {
            onUpdate(strategyId, {
              bucketInitialCash: parseFloat(e.target.value) || 20000,
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
          value={baseRate || 4}
          onChange={(e) => {
            onUpdate(strategyId, {
              bucketBaseRate: parseFloat(e.target.value) || 4,
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
  )
}

/**
 * Render strategy-specific fields based on strategy type
 */
function StrategySpecificFields({
  strategy,
  onUpdate,
}: {
  strategy: ComparisonStrategy
  onUpdate: (id: string, updates: Partial<ComparisonStrategy>) => void
}) {
  if (strategy.strategie === 'variabel_prozent') {
    return (
      <VariablePercentageField
        strategyId={strategy.id}
        value={strategy.variabelProzent}
        onUpdate={onUpdate}
      />
    )
  }

  if (strategy.strategie === 'monatlich_fest') {
    return (
      <MonthlyAmountField
        strategyId={strategy.id}
        value={strategy.monatlicheBetrag}
        onUpdate={onUpdate}
      />
    )
  }

  if (strategy.strategie === 'dynamisch') {
    return (
      <DynamicStrategyFields
        strategyId={strategy.id}
        basisrate={strategy.dynamischBasisrate}
        obereSchwell={strategy.dynamischObereSchwell}
        untereSchwell={strategy.dynamischUntereSchwell}
        onUpdate={onUpdate}
      />
    )
  }

  if (strategy.strategie === 'bucket_strategie') {
    return (
      <BucketStrategyFields
        strategyId={strategy.id}
        initialCash={strategy.bucketInitialCash}
        baseRate={strategy.bucketBaseRate}
        onUpdate={onUpdate}
      />
    )
  }

  return null
}

/**
 * Card component for a single comparison strategy
 * Extracted from ComparisonStrategyConfiguration to reduce complexity
 */
export function ComparisonStrategyCard({
  strategy,
  index,
  onUpdate,
  onRemove,
}: ComparisonStrategyCardProps) {
  return (
    <div
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
          onClick={() => onRemove(strategy.id)}
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
              const newStrategie = e.target.value as WithdrawalStrategy
              onUpdate(strategy.id, {
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
            <option value="variabel_prozent">Variable Prozent</option>
            <option value="monatlich_fest">Monatlich fest</option>
            <option value="dynamisch">Dynamische Strategie</option>
            <option value="bucket_strategie">Drei-Eimer-Strategie</option>
            <option value="rmd">RMD (Lebenserwartung)</option>
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
              onUpdate(strategy.id, {
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

        <StrategySpecificFields strategy={strategy} onUpdate={onUpdate} />
      </div>
    </div>
  )
}
