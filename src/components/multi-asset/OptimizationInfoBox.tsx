import { Info } from 'lucide-react'

/**
 * Info box explaining portfolio optimization
 */
export function OptimizationInfoBox() {
  return (
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
      <div className="flex items-start gap-2 text-sm text-blue-800">
        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium mb-1">Automatische Portfolio-Optimierung</p>
          <p className="text-xs">
            Findet die optimale Allokation basierend auf dem gewählten Optimierungsziel unter Berücksichtigung der
            Korrelationen zwischen den Anlageklassen.
          </p>
        </div>
      </div>
    </div>
  )
}
