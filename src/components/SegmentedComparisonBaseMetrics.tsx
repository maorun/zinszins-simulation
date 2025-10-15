import { formatCurrency } from '../utils/currency'

interface SegmentedComparisonBaseMetricsProps {
  endkapital: number
  duration: number | null
}

/**
 * Component for displaying base configuration metrics
 * Shows key performance indicators for the current segmented withdrawal configuration
 */
export function SegmentedComparisonBaseMetrics({
  endkapital,
  duration,
}: SegmentedComparisonBaseMetricsProps) {
  return (
    <div className="border-2 border-[#1675e0] rounded-lg p-4 mb-5 bg-[#f8f9ff]">
      <h5 className="text-[#1675e0] m-0 mb-2.5">
        📊 Basis-Konfiguration (aktuell):
      </h5>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2.5">
        <div>
          <strong>Endkapital:</strong>
          {' '}
          {formatCurrency(endkapital)}
        </div>
        <div>
          <strong>Vermögen reicht für:</strong>
          {' '}
          {duration
            ? `${duration} Jahr${duration === 1 ? '' : 'e'}`
            : 'unbegrenzt'}
        </div>
      </div>
    </div>
  )
}
