import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

interface SummaryCardsProps {
  recommendedScenario: string
  bestByReturn: string
  bestByRisk: string
}

export function SummaryCards({ recommendedScenario, bestByReturn, bestByRisk }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-blue-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Empfohlenes Szenario</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold text-blue-900">{recommendedScenario}</p>
          <p className="text-xs text-muted-foreground mt-1">Balance aus Rendite und Risiko</p>
        </CardContent>
      </Card>

      <Card className="bg-green-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Höchste Rendite</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold text-green-900">{bestByReturn}</p>
          <p className="text-xs text-muted-foreground mt-1">Maximaler Cash-on-Cash Return</p>
        </CardContent>
      </Card>

      <Card className="bg-gray-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Geringstes Risiko</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold text-gray-900">{bestByRisk}</p>
          <p className="text-xs text-muted-foreground mt-1">Niedrigster Beleihungsauslauf</p>
        </CardContent>
      </Card>
    </div>
  )
}
