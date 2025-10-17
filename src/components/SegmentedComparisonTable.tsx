import { formatCurrency } from '../utils/currency'
import type { SegmentedComparisonResult } from './SegmentedComparisonCard'

interface SegmentedComparisonTableProps {
  segmentedComparisonResults: SegmentedComparisonResult[]
}

/**
 * Table header for segmented comparison
 */
function ComparisonTableHeader() {
  return (
    <thead>
      <tr className="bg-[#f8f9fa]">
        <th className="p-2.5 text-left border-b-2 border-[#dee2e6]">Konfiguration</th>
        <th className="p-2.5 text-right border-b-2 border-[#dee2e6]">Endkapital</th>
        <th className="p-2.5 text-right border-b-2 border-[#dee2e6]">Gesamtentnahme</th>
        <th className="p-2.5 text-right border-b-2 border-[#dee2e6]">Ø Jährlich</th>
        <th className="p-2.5 text-center border-b-2 border-[#dee2e6]">Laufzeit</th>
        <th className="p-2.5 text-center border-b-2 border-[#dee2e6]">Phasen</th>
      </tr>
    </thead>
  )
}

/**
 * Table row for a single comparison result
 */
function ComparisonTableRow({
  result,
  index,
}: {
  result: SegmentedComparisonResult
  index: number
}) {
  return (
    <tr
      key={result.strategy.id}
      className={`border-b border-[#dee2e6] ${index % 2 === 0 ? 'bg-white' : 'bg-[#f8f9fa]'}`}
    >
      <td className="p-2.5 font-semibold">{result.strategy.name}</td>
      <td className="p-2.5 text-right">{formatCurrency(result.finalCapital)}</td>
      <td className="p-2.5 text-right">{formatCurrency(result.totalWithdrawal)}</td>
      <td className="p-2.5 text-right">{formatCurrency(result.averageAnnualWithdrawal)}</td>
      <td className="p-2.5 text-center">
        {typeof result.duration === 'number' ? `${result.duration} Jahre` : result.duration}
      </td>
      <td className="p-2.5 text-center">{result.strategy.segments.length}</td>
    </tr>
  )
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
    <div className="mt-8">
      <h5>📊 Detaillierter Vergleich</h5>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <ComparisonTableHeader />
          <tbody>
            {segmentedComparisonResults.map((result, index) => (
              <ComparisonTableRow key={result.strategy.id} result={result} index={index} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
