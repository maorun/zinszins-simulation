import { formatCurrency } from '../../utils/currency'

interface ChartDataPoint {
  year: number
  startkapital: number
  endkapital: number
  zinsen: number
  kumulativeEinzahlungen: number
  bezahlteSteuer: number
  startkapitalReal?: number
  endkapitalReal?: number
  zinsenReal?: number
}

interface TooltipPayload {
  name: string
  value: number
  color: string
  payload: ChartDataPoint
}

interface ChartTooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string | number
}

/**
 * Enhanced tooltip formatter with better formatting and more information
 */
export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload

    return (
      <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-200 min-w-64">
        <p className="font-semibold text-gray-800 text-base mb-2">{`📅 Jahr: ${label}`}</p>

        {payload.map((entry, index: number) => (
          <div key={index} className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">
              {entry.name}
              :
            </span>
            <span
              className="text-sm font-medium ml-2"
              style={{ color: entry.color }}
            >
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}

        {data && (
          <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Gesamtrendite:</span>
              <span className="font-medium">
                {data.endkapital > data.kumulativeEinzahlungen
                  ? `+${(((data.endkapital / data.kumulativeEinzahlungen) - 1) * 100).toFixed(1)}%`
                  : `${(((data.endkapital / data.kumulativeEinzahlungen) - 1) * 100).toFixed(1)}%`}
              </span>
            </div>
          </div>
        )}
      </div>
    )
  }
  return null
}
