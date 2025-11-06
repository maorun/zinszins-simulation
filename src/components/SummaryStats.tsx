import React from 'react'
import { formatCurrency } from '../utils/currency'

interface SummaryStatsProps {
  lowestValue: number
  lowestLabel: string
  highestValue: number
  highestLabel: string
  rangeValue: number
}

const SummaryStats: React.FC<SummaryStatsProps> = ({
  lowestValue,
  lowestLabel,
  highestValue,
  highestLabel,
  rangeValue,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-gradient-to-r from-red-50 to-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
        <div className="text-xs text-gray-600 mb-1">Niedrigster Wert ({lowestLabel})</div>
        <div className="font-bold text-gray-800">{formatCurrency(lowestValue)}</div>
      </div>
      <div className="bg-gradient-to-r from-yellow-50 to-green-50 p-3 rounded-lg border-l-4 border-green-400">
        <div className="text-xs text-gray-600 mb-1">Höchster Wert ({highestLabel})</div>
        <div className="font-bold text-gray-800">{formatCurrency(highestValue)}</div>
      </div>
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border-l-4 border-purple-400">
        <div className="text-xs text-gray-600 mb-1">Spannweite</div>
        <div className="font-bold text-gray-800">{formatCurrency(rangeValue)}</div>
      </div>
    </div>
  )
}

export default SummaryStats
