import { formatCurrency } from '../utils/currency'
import type { WithdrawalResult } from '../../helpers/withdrawal'
import { SegmentedComparisonBaseMetrics } from './SegmentedComparisonBaseMetrics'
import { SegmentedComparisonCard, type SegmentedComparisonResult } from './SegmentedComparisonCard'

// Type for withdrawal array elements (year-indexed object with withdrawal result data)
// Using a flexible type that allows dynamic properties
type WithdrawalArrayElement = {
  endkapital?: number
  entnahme?: number
  jahr?: number
  [key: string]: unknown
}

interface SegmentedWithdrawalComparisonDisplayProps {
  withdrawalData: {
    startingCapital: number
    withdrawalArray: WithdrawalArrayElement[]
    withdrawalResult: WithdrawalResult
    duration: number | null
  }
  segmentedComparisonResults: SegmentedComparisonResult[]
}

export function SegmentedWithdrawalComparisonDisplay({
  withdrawalData,
  segmentedComparisonResults,
}: SegmentedWithdrawalComparisonDisplayProps) {
  return (
    <div>
      <h4>Geteilte Phasen Vergleich</h4>
      <p>
        <strong>Startkapital bei Entnahme:</strong>
        {' '}
        {formatCurrency(withdrawalData.startingCapital)}
      </p>

      {/* Base configuration summary (from the main withdrawal data) */}
      <SegmentedComparisonBaseMetrics
        endkapital={withdrawalData.withdrawalArray[0]?.endkapital || 0}
        duration={withdrawalData.duration}
      />

      {/* Comparison configurations results */}
      <h5>🔍 Vergleichs-Konfigurationen</h5>
      {segmentedComparisonResults.length > 0 ? (
        <div style={{ display: 'grid', gap: '15px' }}>
          {segmentedComparisonResults.map(
            (result: SegmentedComparisonResult, _index: number) => (
              <SegmentedComparisonCard key={result.strategy.id} result={result} />
            ),
          )}
        </div>
      ) : (
        <div style={{
          padding: '20px',
          textAlign: 'center' as const,
          color: '#666',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          border: '1px dashed #ccc',
        }}
        >
          <p>Keine Vergleichs-Konfigurationen definiert.</p>
          <p style={{ fontSize: '14px', margin: '5px 0 0 0' }}>
            Erstelle Vergleichs-Konfigurationen in den Variablen-Einstellungen.
          </p>
        </div>
      )}

      {/* Comparison table for detailed analysis */}
      {segmentedComparisonResults.length > 1 && (
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
      )}
    </div>
  )
}
