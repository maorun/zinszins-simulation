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
  return (
    <tr key={result.strategy.id}>
      <td className="p-[10px] border-b border-[#e5e5ea]">{result.strategy.name}</td>
      <td className="p-[10px] border-b border-[#e5e5ea] text-right">
        {result.strategy.rendite}
        %
      </td>
      <td className="p-[10px] border-b border-[#e5e5ea] text-right">{formatCurrency(result.finalCapital)}</td>
      <td className="p-[10px] border-b border-[#e5e5ea] text-right">{formatCurrency(result.averageAnnualWithdrawal)}</td>
      <td className="p-[10px] border-b border-[#e5e5ea] text-right">
        {typeof result.duration === 'number' ? `${result.duration} Jahre` : result.duration}
      </td>
    </tr>
  )
}
