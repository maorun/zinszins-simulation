import { formatCurrency } from '../utils/currency'
import type { WithdrawalResult } from '../../helpers/withdrawal'
import { SegmentedComparisonBaseMetrics } from './SegmentedComparisonBaseMetrics'
import { SegmentedComparisonCard, type SegmentedComparisonResult } from './SegmentedComparisonCard'
import { SegmentedComparisonTable } from './SegmentedComparisonTable'

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
      <SegmentedComparisonTable segmentedComparisonResults={segmentedComparisonResults} />
    </div>
  )
}
