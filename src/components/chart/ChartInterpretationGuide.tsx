import type { ChartView } from './ChartControls'
import { ChartLegend } from './ChartLegend'
import { InteractiveFeaturesGuide } from './InteractiveFeaturesGuide'

export interface ChartInterpretationGuideProps {
  showInflationAdjusted: boolean
  showTaxes: boolean
  chartView: ChartView
}

/**
 * Displays interpretation guide for the chart
 */
export function ChartInterpretationGuide({
  showInflationAdjusted,
  showTaxes,
  chartView,
}: ChartInterpretationGuideProps) {
  return (
    <div className="mt-4 text-xs text-gray-600 space-y-2">
      <ChartLegend
        showInflationAdjusted={showInflationAdjusted}
        showTaxes={showTaxes}
      />
      <InteractiveFeaturesGuide chartView={chartView} />
    </div>
  )
}
