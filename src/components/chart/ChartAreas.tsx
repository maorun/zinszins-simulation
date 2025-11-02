import { Area } from 'recharts'

interface ChartAreasProps {
  zinsenKey: string
  zinsenLabel: string
}

/**
 * Chart area components for stacked visualization
 * Renders the cumulative deposits and gains areas
 */
export function ChartAreas({ zinsenKey, zinsenLabel }: ChartAreasProps) {
  return (
    <>
      {/* Area for cumulative deposits */}
      <Area
        type="monotone"
        dataKey="kumulativeEinzahlungen"
        stackId="1"
        stroke="#3b82f6"
        fill="#3b82f6"
        fillOpacity={0.6}
        name="Kumulierte Einzahlungen"
      />

      {/* Area for total gains/interest */}
      <Area
        type="monotone"
        dataKey={zinsenKey}
        stackId="1"
        stroke="#10b981"
        fill="#10b981"
        fillOpacity={0.6}
        name={zinsenLabel}
      />
    </>
  )
}
