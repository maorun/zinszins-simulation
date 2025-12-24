import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

export function GiftTaxHints() {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">💡 Hinweise zur Schenkungssteuer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-gray-700">
        <p>
          • <strong>10-Jahres-Regel:</strong> Freibeträge können alle 10 Jahre neu genutzt werden
        </p>
        <p>
          • <strong>Frühe Planung:</strong> Je früher Sie beginnen, desto mehr Freibeträge können Sie nutzen
        </p>
        <p>
          • <strong>Dokumentation:</strong> Alle Schenkungen sollten notariell beurkundet werden
        </p>
        <p>
          • <strong>Meldepflicht:</strong> Schenkungen müssen dem Finanzamt innerhalb von 3 Monaten angezeigt werden
        </p>
        <p className="pt-2 italic">
          Hinweis: Diese Planung ersetzt keine steuerliche Beratung. Konsultieren Sie einen Steuerberater für Ihre
          individuelle Situation.
        </p>
      </CardContent>
    </Card>
  )
}
