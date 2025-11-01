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

interface ComparisonTableRowProps {
  result: ComparisonResult
}

/**
 * Comparison strategy row component for comparison table
 */
export function ComparisonTableRow({ result }: ComparisonTableRowProps) {
  const tdStyle = { padding: '10px', borderBottom: '1px solid #e5e5ea' }
  const tdRightStyle = { ...tdStyle, textAlign: 'right' as const }

  return (
    <tr key={result.strategy.id}>
      <td style={tdStyle}>{result.strategy.name}</td>
      <td style={tdRightStyle}>
        {result.strategy.rendite}
        %
      </td>
      <td style={tdRightStyle}>{formatCurrency(result.finalCapital)}</td>
      <td style={tdRightStyle}>{formatCurrency(result.averageAnnualWithdrawal)}</td>
      <td style={tdRightStyle}>
        {typeof result.duration === 'number' ? `${result.duration} Jahre` : result.duration}
      </td>
    </tr>
  )
}
