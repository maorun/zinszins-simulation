import { formatCurrency } from '../utils/currency'

interface ComparisonTableBaseRowProps {
  baseStrategyName: string
  baseStrategyRendite: number
  baseStrategyEndkapital: number
  baseStrategyAverageWithdrawal: number
  baseStrategyDuration: string
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
    <tr className="bg-[#f8f9ff] font-bold">
      <td className="p-[10px] border-b border-[#e5e5ea]">📊 {baseStrategyName} (Basis)</td>
      <td className="p-[10px] border-b border-[#e5e5ea] text-right">{baseStrategyRendite}%</td>
      <td className="p-[10px] border-b border-[#e5e5ea] text-right">{formatCurrency(baseStrategyEndkapital)}</td>
      <td className="p-[10px] border-b border-[#e5e5ea] text-right">{formatCurrency(baseStrategyAverageWithdrawal)}</td>
      <td className="p-[10px] border-b border-[#e5e5ea] text-right">{baseStrategyDuration}</td>
    </tr>
  )
}
