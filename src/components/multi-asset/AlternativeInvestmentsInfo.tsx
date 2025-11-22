import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Info, TrendingUp, Coins, Home, AlertTriangle } from 'lucide-react'

/**
 * REITs information section
 */
function REITsSection() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Home className="h-4 w-4 text-amber-700" />
        <h4 className="font-semibold text-sm text-amber-900">REITs (Real Estate Investment Trusts)</h4>
      </div>
      <p className="text-sm text-amber-800">
        REITs sind börsengehandelte Immobiliengesellschaften, die es ermöglichen, in Immobilien zu investieren, ohne
        direkt Eigentum zu erwerben. Sie bieten:
      </p>
      <ul className="text-sm text-amber-800 list-disc list-inside space-y-1 ml-2">
        <li>Diversifikation durch Streuung über verschiedene Immobilientypen</li>
        <li>Regelmäßige Ausschüttungen (oft quartalsweise)</li>
        <li>Liquidität durch Börsenhandel (im Gegensatz zu direktem Immobilienbesitz)</li>
        <li>Professionelles Management durch erfahrene Teams</li>
      </ul>
      <div className="bg-amber-100 p-3 rounded-md border border-amber-200">
        <p className="text-xs text-amber-900 font-semibold mb-1">Steuerliche Behandlung in Deutschland:</p>
        <p className="text-xs text-amber-800">
          REITs unterliegen der Teilfreistellung für Immobilienfonds. Die Ausschüttungen werden wie Kapitaleinkünfte
          behandelt und sind mit der Kapitalertragsteuer (25% + Solidaritätszuschlag + ggf. Kirchensteuer) zu
          versteuern.
        </p>
      </div>
    </div>
  )
}

/**
 * Commodities information section
 */
function CommoditiesSection() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Coins className="h-4 w-4 text-amber-700" />
        <h4 className="font-semibold text-sm text-amber-900">Rohstoffe (Commodities)</h4>
      </div>
      <p className="text-sm text-amber-800">
        Rohstoffinvestments umfassen Gold, Öl, Industriemetalle, Agrarrohstoffe und mehr. Sie dienen oft als:
      </p>
      <ul className="text-sm text-amber-800 list-disc list-inside space-y-1 ml-2">
        <li>Inflationsschutz bei steigenden Preisen</li>
        <li>Diversifikation mit geringer Korrelation zu Aktien</li>
        <li>Portfolio-Absicherung in Krisenzeiten (insbesondere Gold)</li>
        <li>Profiteur von Wirtschaftswachstum (Industriemetalle)</li>
      </ul>
      <div className="bg-amber-100 p-3 rounded-md border border-amber-200">
        <p className="text-xs text-amber-900 font-semibold mb-1">Steuerliche Behandlung in Deutschland:</p>
        <p className="text-xs text-amber-800">
          Rohstoff-ETCs und -ETFs werden wie andere Investmentfonds besteuert. Gewinne unterliegen der
          Kapitalertragsteuer. Bei physischem Gold: Verkauf nach 1 Jahr Haltedauer steuerfrei (Spekulationsfrist).
        </p>
      </div>
    </div>
  )
}

/**
 * Risk warnings section
 */
function RiskWarnings() {
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-3">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-semibold text-red-900">Wichtige Risikohinweise:</p>
          <ul className="text-xs text-red-800 space-y-1">
            <li>
              <strong>Höhere Volatilität:</strong> Rohstoffe schwanken oft stärker als traditionelle Anlagen (bis zu
              25% Volatilität)
            </li>
            <li>
              <strong>Keine laufenden Erträge:</strong> Im Gegensatz zu Aktien oder Anleihen werfen viele Rohstoffe
              keine Dividenden oder Zinsen ab
            </li>
            <li>
              <strong>Komplexität:</strong> Rohstoffmärkte reagieren auf spezifische Faktoren (Wetter, Politik,
              Lagerbestände)
            </li>
            <li>
              <strong>Empfehlung:</strong> Alternative Investments sollten typischerweise nur 5-15% des Portfolios
              ausmachen
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

/**
 * When to use section
 */
function WhenToUseSection() {
  return (
    <div className="bg-green-50 border border-green-200 rounded-md p-3">
      <div className="flex items-start gap-2">
        <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-semibold text-green-900">Wann sind alternative Investments sinnvoll?</p>
          <ul className="text-xs text-green-800 space-y-1">
            <li>✓ Zur weiteren Diversifikation eines bereits ausgewogenen Portfolios</li>
            <li>✓ Als Inflationsschutz in Zeiten steigender Preise</li>
            <li>✓ Für erfahrene Anleger mit Verständnis für diese Märkte</li>
            <li>✓ Bei langfristigem Anlagehorizont (10+ Jahre)</li>
            <li>✓ Wenn Sie bereit sind, höhere Volatilität zu akzeptieren</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

/**
 * Information panel for alternative investments (REITs and Commodities)
 * Provides educational content about these asset classes for German investors
 */
export function AlternativeInvestmentsInfo() {
  return (
    <Card className="border-l-4 border-l-amber-500 bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-900">
          <Info className="h-5 w-5" />
          Alternative Investments: REITs & Rohstoffe
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <REITsSection />
        <CommoditiesSection />
        <RiskWarnings />
        <WhenToUseSection />
      </CardContent>
    </Card>
  )
}
