import { formatCurrency } from '../utils/currency'

interface ComparisonMetricsProps {
  displayName: string
  rendite: number
  endkapital: number
  duration: string
  withdrawalAmount: number | null
  withdrawalLabel: string
}

/**
 * Component for displaying base strategy metrics
 * Shows key performance indicators for the base withdrawal strategy
 */
export function ComparisonMetrics({
  displayName,
  rendite,
  endkapital,
  duration,
  withdrawalAmount,
  withdrawalLabel,
}: ComparisonMetricsProps) {
  return (
    <div
      style={{
        border: '2px solid #1675e0',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px',
        backgroundColor: '#f8f9ff',
      }}
    >
      <h5 style={{ color: '#1675e0', margin: '0 0 10px 0' }}>
        📊 Basis-Strategie:
        {' '}
        {displayName}
      </h5>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px',
        }}
      >
        <div>
          <strong>Rendite:</strong>
          {' '}
          {rendite}
          %
        </div>
        <div>
          <strong>Endkapital:</strong>
          {' '}
          {formatCurrency(endkapital)}
        </div>
        <div>
          <strong>Vermögen reicht für:</strong>
          {' '}
          {duration}
        </div>
        {withdrawalAmount !== null && (
          <div>
            <strong>{withdrawalLabel}</strong>
            {' '}
            {formatCurrency(withdrawalAmount)}
          </div>
        )}
      </div>
    </div>
  )
}
