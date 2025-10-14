import { formatCurrency } from '../utils/currency'
import type { SegmentedComparisonResult } from './SegmentedComparisonCard'

interface SegmentedComparisonTableProps {
  segmentedComparisonResults: SegmentedComparisonResult[]
}

/**
 * Component for displaying detailed comparison table for segmented withdrawal strategies
 * Shows all comparison strategies in a tabular format when there are multiple strategies
 */
export function SegmentedComparisonTable({
  segmentedComparisonResults,
}: SegmentedComparisonTableProps) {
  // Only show table if there are multiple strategies to compare
  if (segmentedComparisonResults.length <= 1) {
    return null
  }

  return (
    <div style={{ marginTop: '30px' }}>
      <h5>📊 Detaillierter Vergleich</h5>
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse' as const,
          fontSize: '14px',
        }}
        >
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '10px', textAlign: 'left' as const, borderBottom: '2px solid #dee2e6' }}>
                Konfiguration
              </th>
              <th style={{ padding: '10px', textAlign: 'right' as const, borderBottom: '2px solid #dee2e6' }}>
                Endkapital
              </th>
              <th style={{ padding: '10px', textAlign: 'right' as const, borderBottom: '2px solid #dee2e6' }}>
                Gesamtentnahme
              </th>
              <th style={{ padding: '10px', textAlign: 'right' as const, borderBottom: '2px solid #dee2e6' }}>
                Ø Jährlich
              </th>
              <th style={{ padding: '10px', textAlign: 'center' as const, borderBottom: '2px solid #dee2e6' }}>
                Laufzeit
              </th>
              <th style={{ padding: '10px', textAlign: 'center' as const, borderBottom: '2px solid #dee2e6' }}>
                Phasen
              </th>
            </tr>
          </thead>
          <tbody>
            {segmentedComparisonResults.map((result, index) => (
              <tr
                key={result.strategy.id}
                style={{
                  borderBottom: '1px solid #dee2e6',
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                }}
              >
                <td style={{ padding: '10px', fontWeight: '600' }}>
                  {result.strategy.name}
                </td>
                <td style={{ padding: '10px', textAlign: 'right' as const }}>
                  {formatCurrency(result.finalCapital)}
                </td>
                <td style={{ padding: '10px', textAlign: 'right' as const }}>
                  {formatCurrency(result.totalWithdrawal)}
                </td>
                <td style={{ padding: '10px', textAlign: 'right' as const }}>
                  {formatCurrency(result.averageAnnualWithdrawal)}
                </td>
                <td style={{ padding: '10px', textAlign: 'center' as const }}>
                  {typeof result.duration === 'number'
                    ? `${result.duration} Jahre`
                    : result.duration}
                </td>
                <td style={{ padding: '10px', textAlign: 'center' as const }}>
                  {result.strategy.segments.length}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
