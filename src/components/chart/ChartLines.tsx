import { Line } from 'recharts'

interface ChartLinesProps {
  endkapitalKey: string
  endkapitalLabel: string
  endkapitalDot: { fill: string, strokeWidth: number, r: number } | false
  showTaxes: boolean
  taxDot: { fill: string, strokeWidth: number, r: number } | false
}

/**
 * Chart line components for overlaid visualization
 * Renders the end capital and tax lines
 */
export function ChartLines({
  endkapitalKey,
  endkapitalLabel,
  endkapitalDot,
  showTaxes,
  taxDot,
}: ChartLinesProps) {
  return (
    <>
      {/* Line for end capital */}
      <Line
        type="monotone"
        dataKey={endkapitalKey}
        stroke="#ef4444"
        strokeWidth={3}
        dot={endkapitalDot}
        name={endkapitalLabel}
      />

      {/* Line for taxes paid - conditional */}
      {showTaxes && (
        <Line
          type="monotone"
          dataKey="bezahlteSteuer"
          stroke="#f59e0b"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={taxDot}
          name="Bezahlte Steuern"
        />
      )}
    </>
  )
}
