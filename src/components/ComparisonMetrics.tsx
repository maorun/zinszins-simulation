import { formatCurrency } from '../utils/currency'

interface ComparisonMetricsProps {
  displayName: string
  rendite: number
  endkapital: number
  duration: string
  withdrawalAmount: number | null
  withdrawalLabel: string
}

/**
 * Individual metric display component
 */
function MetricItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <strong>{label}</strong> {value}
    </div>
  )
}

/**
 * Component for displaying base strategy metrics
 * Shows key performance indicators for the base withdrawal strategy
 */
export function ComparisonMetrics({
  displayName,
  rendite,
  endkapital,
  duration,
  withdrawalAmount,
  withdrawalLabel,
}: ComparisonMetricsProps) {
  return (
    <div className="border-2 border-[#1675e0] rounded-lg p-[15px] mb-5 bg-[#f8f9ff]">
      <h5 className="text-[#1675e0] m-0 mb-[10px]">📊 Basis-Strategie: {displayName}</h5>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[10px]">
        <MetricItem label="Rendite:" value={`${rendite}%`} />
        <MetricItem label="Endkapital:" value={formatCurrency(endkapital)} />
        <MetricItem label="Vermögen reicht für:" value={duration} />
        {withdrawalAmount !== null && (
          <MetricItem label={`${withdrawalLabel}`} value={formatCurrency(withdrawalAmount)} />
        )}
      </div>
    </div>
  )
}
