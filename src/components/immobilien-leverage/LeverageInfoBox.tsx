import { Info } from 'lucide-react'
import { Card, CardContent } from '../ui/card'

export function LeverageInfoBox() {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm text-blue-900">
            <p className="font-semibold">Hinweise zur Leverage-Analyse:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>
                <strong>Hebeleffekt:</strong> Zeigt wie stark die Eigenkapitalrendite durch Fremdkapital
                beeinflusst wird
              </li>
              <li>
                <strong>LTV (Beleihungsauslauf):</strong> Verhältnis Darlehensbetrag zu Immobilienwert. Banken
                finanzieren typisch bis 80%
              </li>
              <li>
                <strong>Cash-on-Cash Return:</strong> Jährlicher Cashflow im Verhältnis zum eingesetzten
                Eigenkapital
              </li>
              <li>
                <strong>Steuervorteile:</strong> Darlehenszinsen und AfA sind steuerlich absetzbar
                (Werbungskosten)
              </li>
              <li>
                <strong>Risiko:</strong> Höherer Leverage bedeutet höhere potenzielle Rendite, aber auch
                höheres Risiko
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
