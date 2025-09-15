import { formatCurrency } from '../utils/currency'
import type { WithdrawalResult } from '../../helpers/withdrawal'
import type { SegmentedComparisonStrategy } from '../utils/config-storage'

// Type for segmented comparison results
type SegmentedComparisonResult = {
  strategy: SegmentedComparisonStrategy
  finalCapital: number
  totalWithdrawal: number
  averageAnnualWithdrawal: number
  duration: number | string
  result: any // Full withdrawal result for detailed analysis
}

interface SegmentedWithdrawalComparisonDisplayProps {
  withdrawalData: {
    startingCapital: number
    withdrawalArray: any[]
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
            {formatCurrency(
              withdrawalData.withdrawalArray[0]?.endkapital || 0,
            )}
          </div>
          <div>
            <strong>Vermögen reicht für:</strong>
            {' '}
            {withdrawalData.duration
              ? `${withdrawalData.duration} Jahr${withdrawalData.duration === 1 ? '' : 'e'}`
              : 'unbegrenzt'}
          </div>
        </div>
      </div>

      {/* Comparison configurations results */}
      <h5>🔍 Vergleichs-Konfigurationen</h5>
      {segmentedComparisonResults.length > 0 ? (
        <div style={{ display: 'grid', gap: '15px' }}>
          {segmentedComparisonResults.map(
            (result: SegmentedComparisonResult, _index: number) => (
              <div
                key={result.strategy.id}
                style={{
                  border: '1px solid #e5e5ea',
                  borderRadius: '6px',
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                }}
              >
                <h6 style={{ margin: '0 0 10px 0', color: '#666' }}>
                  {result.strategy.name}
                  {' '}
                  (
                  {result.strategy.segments.length}
                  {' '}
                  Phase
                  {result.strategy.segments.length !== 1 ? 'n' : ''}
                  )
                </h6>

                {/* Strategy segments overview */}
                <div style={{ marginBottom: '15px' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '8px',
                    fontSize: '14px',
                  }}
                  >
                    {result.strategy.segments.map((segment, _segIndex) => (
                      <div
                        key={segment.id}
                        style={{
                          padding: '8px',
                          backgroundColor: '#e8f4f8',
                          borderRadius: '4px',
                          border: '1px solid #d1ecf1',
                        }}
                      >
                        <strong>{segment.name}</strong>
                        {' '}
                        (
                        {segment.startYear}
                        {' '}
                        -
                        {segment.endYear}
                        )
                        <br />
                        <span style={{ color: '#666' }}>
                          {getStrategyDisplayName(segment.strategy)}
                          {' '}
                          -
                          {((segment.returnConfig.fixedRate || 0.05) * 100).toFixed(1)}
                          % Rendite
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Results summary */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '10px',
                    fontSize: '14px',
                  }}
                >
                  <div>
                    <strong>Endkapital:</strong>
                    {' '}
                    {formatCurrency(result.finalCapital)}
                  </div>
                  <div>
                    <strong>Gesamtentnahme:</strong>
                    {' '}
                    {formatCurrency(result.totalWithdrawal)}
                  </div>
                  <div>
                    <strong>Ø Jährliche Entnahme:</strong>
                    {' '}
                    {formatCurrency(result.averageAnnualWithdrawal)}
                  </div>
                  <div>
                    <strong>Laufzeit:</strong>
                    {' '}
                    {typeof result.duration === 'number'
                      ? `${result.duration} Jahr${result.duration === 1 ? '' : 'e'}`
                      : result.duration}
                  </div>
                </div>
              </div>
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

// Helper function for strategy display names
function getStrategyDisplayName(strategy: string): string {
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
    default:
      return strategy
  }
}
