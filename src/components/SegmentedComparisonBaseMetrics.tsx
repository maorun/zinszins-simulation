import { formatCurrency } from '../utils/currency'

interface SegmentedComparisonBaseMetricsProps {
  endkapital: number
  duration: number | null
}

/**
 * Component for displaying base configuration metrics
 * Shows key performance indicators for the current segmented withdrawal configuration
 */
export function SegmentedComparisonBaseMetrics({
  endkapital,
  duration,
}: SegmentedComparisonBaseMetricsProps) {
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
        📊 Basis-Konfiguration (aktuell):
      </h5>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px',
        }}
      >
        <div>
          <strong>Endkapital:</strong>
          {' '}
          {formatCurrency(endkapital)}
        </div>
        <div>
          <strong>Vermögen reicht für:</strong>
          {' '}
          {duration
            ? `${duration} Jahr${duration === 1 ? '' : 'e'}`
            : 'unbegrenzt'}
        </div>
      </div>
    </div>
  )
}
