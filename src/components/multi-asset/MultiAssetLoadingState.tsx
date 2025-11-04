import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { PieChart } from 'lucide-react'

interface MultiAssetLoadingStateProps {
  nestingLevel: number
}

/**
 * Loading state component shown while multi-asset configuration is initializing
 */
export function MultiAssetLoadingState({ nestingLevel }: MultiAssetLoadingStateProps) {
  return (
    <Card nestingLevel={nestingLevel} className="mb-4">
      <CardHeader nestingLevel={nestingLevel}>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Multi-Asset Portfolio (wird geladen...)
        </CardTitle>
      </CardHeader>
      <CardContent nestingLevel={nestingLevel}>
        <div className="p-4 text-center text-gray-600">Konfiguration wird initialisiert...</div>
      </CardContent>
    </Card>
  )
}
