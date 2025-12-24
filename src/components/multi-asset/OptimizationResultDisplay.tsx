import { Button } from '../ui/button'
import type { OptimizationResult } from '../../utils/portfolio-optimization'
import type { MultiAssetPortfolioConfig } from '../../../helpers/multi-asset-portfolio'
import { MetricsDisplay } from './MetricsDisplay'
import { AllocationsList } from './AllocationsList'

interface OptimizationResultDisplayProps {
  result: OptimizationResult
  config: MultiAssetPortfolioConfig
  onApplyAllocations: () => void
}

/**
 * Display optimization results with metrics and allocations
 */
export function OptimizationResultDisplay({ result, config, onApplyAllocations }: OptimizationResultDisplayProps) {
  return (
    <div className="space-y-3">
      <div className="border-t pt-3">
        <h4 className="text-sm font-medium mb-3">Optimierungsergebnis</h4>

        <MetricsDisplay result={result} />

        <AllocationsList result={result} config={config} />

        <div className="mt-3 text-xs text-gray-500">
          {result.converged ? (
            <p>✓ Konvergiert nach {result.iterations} Iterationen</p>
          ) : (
            <p>⚠ Maximale Iterationen erreicht ({result.iterations})</p>
          )}
        </div>

        <Button onClick={onApplyAllocations} variant="outline" className="w-full mt-4">
          Optimierte Allokationen übernehmen
        </Button>
      </div>
    </div>
  )
}
