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
                onUpdate(strategy.id, {
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
                onUpdate(strategy.id, {
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
                  onUpdate(strategy.id, {
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
                value={strategy.dynamischObereSchwell || 8}
                onChange={(e) => {
                  onUpdate(strategy.id, {
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
                  onUpdate(strategy.id, {
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
                value={strategy.bucketBaseRate || 4}
                onChange={(e) => {
                  onUpdate(strategy.id, {
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
        )}
      </div>
    </div>
  )
}
