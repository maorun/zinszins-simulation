import { formatCurrency } from '../utils/currency'
import type { ComparisonStrategy } from '../utils/config-storage'

// Type for comparison results
type ComparisonResult = {
  strategy: ComparisonStrategy
  finalCapital: number
  totalWithdrawal: number
  averageAnnualWithdrawal: number
  duration: number | string
}

interface ComparisonTableProps {
  baseStrategyName: string
  baseStrategyRendite: number
  baseStrategyEndkapital: number
  baseStrategyAverageWithdrawal: number
  baseStrategyDuration: string
  comparisonResults: ComparisonResult[]
}

/**
 * Component for displaying comparison table
 * Shows base strategy and comparison strategies in a table format
 */
export function ComparisonTable({
  baseStrategyName,
  baseStrategyRendite,
  baseStrategyEndkapital,
  baseStrategyAverageWithdrawal,
  baseStrategyDuration,
  comparisonResults,
}: ComparisonTableProps) {
  if (comparisonResults.length === 0) {
    return null
  }

  return (
    <div style={{ marginTop: '30px' }}>
      <h5>📋 Vergleichstabelle</h5>
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            border: '1px solid #e5e5ea',
            fontSize: '14px',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th
                style={{
                  padding: '10px',
                  borderBottom: '1px solid #e5e5ea',
                  textAlign: 'left',
                }}
              >
                Strategie
              </th>
              <th
                style={{
                  padding: '10px',
                  borderBottom: '1px solid #e5e5ea',
                  textAlign: 'right',
                }}
              >
                Rendite
              </th>
              <th
                style={{
                  padding: '10px',
                  borderBottom: '1px solid #e5e5ea',
                  textAlign: 'right',
                }}
              >
                Endkapital
              </th>
              <th
                style={{
                  padding: '10px',
                  borderBottom: '1px solid #e5e5ea',
                  textAlign: 'right',
                }}
              >
                Ø Jährliche Entnahme
              </th>
              <th
                style={{
                  padding: '10px',
                  borderBottom: '1px solid #e5e5ea',
                  textAlign: 'right',
                }}
              >
                Vermögen reicht für
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Base strategy row */}
            <tr
              style={{
                backgroundColor: '#f8f9ff',
                fontWeight: 'bold',
              }}
            >
              <td
                style={{
                  padding: '10px',
                  borderBottom: '1px solid #e5e5ea',
                }}
              >
                📊
                {' '}
                {baseStrategyName}
                {' '}
                (Basis)
              </td>
              <td
                style={{
                  padding: '10px',
                  borderBottom: '1px solid #e5e5ea',
                  textAlign: 'right',
                }}
              >
                {baseStrategyRendite}
                %
              </td>
              <td
                style={{
                  padding: '10px',
                  borderBottom: '1px solid #e5e5ea',
                  textAlign: 'right',
                }}
              >
                {formatCurrency(baseStrategyEndkapital)}
              </td>
              <td
                style={{
                  padding: '10px',
                  borderBottom: '1px solid #e5e5ea',
                  textAlign: 'right',
                }}
              >
                {formatCurrency(baseStrategyAverageWithdrawal)}
              </td>
              <td
                style={{
                  padding: '10px',
                  borderBottom: '1px solid #e5e5ea',
                  textAlign: 'right',
                }}
              >
                {baseStrategyDuration}
              </td>
            </tr>
            {/* Comparison strategies rows */}
            {comparisonResults.map((result: ComparisonResult) => (
              <tr key={result.strategy.id}>
                <td
                  style={{
                    padding: '10px',
                    borderBottom: '1px solid #e5e5ea',
                  }}
                >
                  {result.strategy.name}
                </td>
                <td
                  style={{
                    padding: '10px',
                    borderBottom: '1px solid #e5e5ea',
                    textAlign: 'right',
                  }}
                >
                  {result.strategy.rendite}
                  %
                </td>
                <td
                  style={{
                    padding: '10px',
                    borderBottom: '1px solid #e5e5ea',
                    textAlign: 'right',
                  }}
                >
                  {formatCurrency(result.finalCapital)}
                </td>
                <td
                  style={{
                    padding: '10px',
                    borderBottom: '1px solid #e5e5ea',
                    textAlign: 'right',
                  }}
                >
                  {formatCurrency(result.averageAnnualWithdrawal)}
                </td>
                <td
                  style={{
                    padding: '10px',
                    borderBottom: '1px solid #e5e5ea',
                    textAlign: 'right',
                  }}
                >
                  {typeof result.duration === 'number'
                    ? `${result.duration} Jahre`
                    : result.duration}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
