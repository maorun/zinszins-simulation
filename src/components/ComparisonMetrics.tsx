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
 * Individual metric display component
 */
function MetricItem({ label, value }: { label: string, value: string | number }) {
  return (
    <div>
      <strong>{label}</strong>
      {' '}
      {value}
    </div>
  )
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
        <MetricItem label="Rendite:" value={`${rendite}%`} />
        <MetricItem label="Endkapital:" value={formatCurrency(endkapital)} />
        <MetricItem label="Vermögen reicht für:" value={duration} />
        {withdrawalAmount !== null && (
          <MetricItem label={`${withdrawalLabel}`} value={formatCurrency(withdrawalAmount)} />
        )}
      </div>
    </div>
  )
}
