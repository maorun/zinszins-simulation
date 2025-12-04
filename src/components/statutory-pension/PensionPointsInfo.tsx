import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Info } from 'lucide-react'

interface PensionPointsInfoProps {
  nestingLevel: number
}

/**
 * Informational card about German Pension Points (Rentenpunkte) calculation
 * 
 * Provides users with information about how the German pension system
 * calculates pensions based on pension points.
 */
export function PensionPointsInfo({ nestingLevel }: PensionPointsInfoProps) {
  return (
    <Card nestingLevel={nestingLevel} className="bg-blue-50">
      <CardHeader nestingLevel={nestingLevel} className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Info className="h-4 w-4" />
          💡 Rentenpunkte-Berechnung
        </CardTitle>
      </CardHeader>
      <CardContent nestingLevel={nestingLevel}>
        <div className="text-sm space-y-2">
          <p>
            Die gesetzliche Rente basiert auf <strong>Rentenpunkten</strong>:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Pro Jahr erhalten Sie: (Ihr Gehalt) / (Durchschnittsgehalt) Rentenpunkte</li>
            <li>Bei genau durchschnittlichem Gehalt: 1,0 Rentenpunkt pro Jahr</li>
            <li>Monatliche Rente = Rentenpunkte × aktueller Rentenwert (≈ 37,60 € in 2024)</li>
          </ul>
          <p className="text-xs text-gray-600 mt-3">
            ℹ️ Sie können Ihre Rentenpunkte anhand Ihrer Gehaltshistorie berechnen und die resultierende
            monatliche Rente hier eintragen. Die Rentenpunkte-Berechnung berücksichtigt Ihre
            Beitragsjahre und die Entwicklung Ihres Bruttogehalts im Vergleich zum deutschen
            Durchschnittsgehalt.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
