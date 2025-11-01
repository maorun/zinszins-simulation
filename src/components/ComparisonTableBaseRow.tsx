import { formatCurrency } from '../utils/currency'

interface ComparisonTableBaseRowProps {
  baseStrategyName: string
  baseStrategyRendite: number
  baseStrategyEndkapital: number
  baseStrategyAverageWithdrawal: number
  baseStrategyDuration: string
}

// Common styles for table cells
const tdStyles = {
  padding: '10px',
  borderBottom: '1px solid #e5e5ea',
}

const tdRightStyle = {
  ...tdStyles,
  textAlign: 'right' as const,
}

/**
 * Base strategy row component for comparison table
 */
export function ComparisonTableBaseRow({
  baseStrategyName,
  baseStrategyRendite,
  baseStrategyEndkapital,
  baseStrategyAverageWithdrawal,
  baseStrategyDuration,
}: ComparisonTableBaseRowProps) {
  return (
    <tr style={{ backgroundColor: '#f8f9ff', fontWeight: 'bold' }}>
      <td style={tdStyles}>
        📊
        {' '}
        {baseStrategyName}
        {' '}
        (Basis)
      </td>
      <td style={tdRightStyle}>
        {baseStrategyRendite}
        %
      </td>
      <td style={tdRightStyle}>{formatCurrency(baseStrategyEndkapital)}</td>
      <td style={tdRightStyle}>{formatCurrency(baseStrategyAverageWithdrawal)}</td>
      <td style={tdRightStyle}>{baseStrategyDuration}</td>
    </tr>
  )
}
