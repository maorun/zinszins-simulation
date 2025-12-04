import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Info } from 'lucide-react'

export function PensionPointsInformationCard({ nestingLevel }: { nestingLevel: number }) {
  return (
    <Card nestingLevel={nestingLevel + 1} className="bg-gray-50">
      <CardHeader nestingLevel={nestingLevel + 1} className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Info className="h-4 w-4" />
          💡 Wie funktioniert die Berechnung?
        </CardTitle>
      </CardHeader>
      <CardContent nestingLevel={nestingLevel + 1}>
        <div className="text-sm space-y-2">
          <p>
            Die gesetzliche Rente basiert auf <strong>Rentenpunkten</strong>:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Pro Jahr: (Ihr Gehalt) / (Durchschnittsgehalt) = Rentenpunkte</li>
            <li>Bei durchschnittlichem Gehalt: 1,0 Rentenpunkt pro Jahr</li>
            <li>Monatliche Rente = Rentenpunkte × Rentenwert (≈ 37,60 € in 2024)</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-3">ℹ️ Diese Berechnung gibt eine Schätzung basierend auf Ihrer Gehaltshistorie. Die tatsächliche Rente kann durch weitere Faktoren beeinflusst werden.</p>
        </div>
      </CardContent>
    </Card>
  )
}
