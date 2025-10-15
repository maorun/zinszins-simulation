import { Info } from 'lucide-react'
import { formatCurrency } from '../../utils/currency'

interface IncomeTaxSectionProps {
  rowData: {
    einkommensteuer?: number
    genutzterGrundfreibetrag?: number
  }
  isGrundfreibetragEnabled: boolean
  onCalculationInfoClick: (explanationType: string, rowData: unknown) => void
}

/**
 * Section displaying income tax information: Einkommensteuer and Grundfreibetrag
 */
export function IncomeTaxSection({
  rowData,
  isGrundfreibetragEnabled,
  onCalculationInfoClick,
}: IncomeTaxSectionProps) {
  if (!isGrundfreibetragEnabled) {
    return null
  }

  return (
    <>
      {/* Income tax */}
      {rowData.einkommensteuer !== undefined && (
        <div className="flex justify-between items-center py-1">
          <span className="text-sm text-gray-600 font-medium">🏛️ Einkommensteuer:</span>
          <span className="font-semibold text-pink-600 text-sm flex items-center">
            {formatCurrency(rowData.einkommensteuer)}
            <Info
              className="h-4 w-4 ml-2 cursor-pointer text-blue-600 hover:text-blue-800"
              onClick={() => onCalculationInfoClick('incomeTax', rowData)}
            />
          </span>
        </div>
      )}

      {/* Grundfreibetrag */}
      {rowData.genutzterGrundfreibetrag !== undefined && (
        <div className="flex justify-between items-center py-1">
          <span className="text-sm text-gray-600 font-medium">🆓 Grundfreibetrag:</span>
          <span className="font-semibold text-green-600 text-sm flex items-center">
            {formatCurrency(rowData.genutzterGrundfreibetrag)}
            <Info
              className="h-4 w-4 ml-2 cursor-pointer text-blue-600 hover:text-blue-800"
              onClick={() => onCalculationInfoClick('incomeTax', rowData)}
            />
          </span>
        </div>
      )}
    </>
  )
}
