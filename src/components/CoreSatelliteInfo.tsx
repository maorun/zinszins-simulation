import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'
import { Badge } from './ui/badge'
import { Info, TrendingUp, Target, PieChart } from 'lucide-react'

/**
 * Core-Satellite Strategy Information Card
 *
 * Educational component explaining the Core-Satellite portfolio strategy
 * for German investors. This is an informational card that helps users
 * understand this investment approach without requiring complex configuration.
 *
 * The strategy combines:
 * - Core (70-90%): Passive, low-cost, broadly diversified
 * - Satellite (10-30%): Active, selective, higher-conviction positions
 */

interface CoreSatelliteInfoProps {
  /** Card nesting level for proper styling */
  nestingLevel?: number
}

/** Core allocation section */
function CoreAllocationSection() {
  return (
    <div className="rounded-md border p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium">Core (Kern)</span>
        <Badge variant="default">70-90%</Badge>
      </div>
      <ul className="space-y-1 text-sm text-muted-foreground">
        <li>• Breit diversifizierte ETFs</li>
        <li>• Niedrige Kosten (0,1-0,3% TER)</li>
        <li>• Passive Indexnachbildung</li>
        <li>• Weltportfolio / Multi-Asset</li>
      </ul>
    </div>
  )
}

/** Satellite allocation section */
function SatelliteAllocationSection() {
  return (
    <div className="rounded-md border p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium">Satellites (Satelliten)</span>
        <Badge variant="secondary">10-30%</Badge>
      </div>
      <ul className="space-y-1 text-sm text-muted-foreground">
        <li>• Themenfonds (KI, Clean Energy)</li>
        <li>• Einzelaktien / Sektorwetten</li>
        <li>• Emerging Markets / Small Caps</li>
        <li>• Faktor-Strategien (Value, Growth)</li>
      </ul>
    </div>
  )
}

/** Benefits section */
function BenefitsSection({ exampleMetrics }: { exampleMetrics: { coreCosts: string; satelliteCosts: string; totalCosts: string } }) {
  return (
    <div className="grid gap-2">
      <Alert>
        <AlertDescription className="text-sm">
          <strong>Kostenoptimiert:</strong> Durchschnittliche Gesamtkosten bleiben niedrig, da der Großteil des
          Portfolios passiv verwaltet wird.
          <br />
          <span className="text-xs text-muted-foreground">
            Beispiel (80/20): Core {exampleMetrics.coreCosts}% + Satellites {exampleMetrics.satelliteCosts}% =
            Gesamt {exampleMetrics.totalCosts}% p.a.
          </span>
        </AlertDescription>
      </Alert>

      <Alert>
        <AlertDescription className="text-sm">
          <strong>Kontrolliertes Risiko:</strong> Aktive Positionen sind auf 10-30% begrenzt. Der Kern bietet
          Stabilität und Diversifikation.
        </AlertDescription>
      </Alert>

      <Alert>
        <AlertDescription className="text-sm">
          <strong>Persönliche Überzeugungen:</strong> Raum für gezielte Investments ohne das gesamte Portfolio
          aufs Spiel zu setzen.
        </AlertDescription>
      </Alert>

      <Alert>
        <AlertDescription className="text-sm">
          <strong>Performance-Attribution:</strong> Klar erkennbar, welcher Teil (Core vs. Satellites) zur
          Gesamtrendite beiträgt.
        </AlertDescription>
      </Alert>
    </div>
  )
}

/** Satellite types section */
function SatelliteTypesSection() {
  const types = [
    { label: 'Sektor', description: 'Übergewichtung einzelner Sektoren (z.B. Technologie, Healthcare)' },
    { label: 'Regional', description: 'Geografische Schwerpunkte (Emerging Markets, Small Caps bestimmter Regionen)' },
    { label: 'Thematisch', description: 'Themen-Fonds (KI, Blockchain, Clean Energy, Cybersecurity)' },
    { label: 'Faktor', description: 'Faktor-Strategien (Value, Growth, Quality, Momentum)' },
    { label: 'Individual', description: 'Einzelaktien nach eigener Analyse und Überzeugung' },
  ]

  return (
    <div className="grid gap-2 text-sm">
      {types.map((type) => (
        <div key={type.label} className="flex items-start gap-2">
          <Badge variant="outline" className="mt-0.5">
            {type.label}
          </Badge>
          <span className="text-muted-foreground">{type.description}</span>
        </div>
      ))}
    </div>
  )
}

/** Tax considerations section */
function TaxConsiderationsSection() {
  return (
    <div className="rounded-md bg-muted p-3">
      <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <Info className="h-4 w-4" />
        Deutsche Steuerliche Aspekte
      </h4>
      <ul className="space-y-1 text-sm text-muted-foreground">
        <li>
          • <strong>Teilfreistellung:</strong> Beide Teile profitieren von der Teilfreistellung (30% für
          Aktienfonds)
        </li>
        <li>
          • <strong>Sparerpauschbetrag:</strong> Core und Satellites teilen sich den Freibetrag (1.000€ / 2.000€)
        </li>
        <li>
          • <strong>Tax Loss Harvesting:</strong> Verluste in Satelliten können mit Gewinnen verrechnet werden
        </li>
        <li>
          • <strong>Rebalancing-Kosten:</strong> Häufigeres Rebalancing bei Satelliten kann Steuern auslösen
        </li>
      </ul>
    </div>
  )
}

/** What is section */
function WhatIsSection() {
  return (
    <div>
      <h4 className="mb-2 flex items-center gap-2 font-semibold">
        <Info className="h-4 w-4" />
        Was ist die Core-Satellite Strategie?
      </h4>
      <p className="text-sm text-muted-foreground">
        Ein Portfolio-Ansatz, der einen <strong>breit diversifizierten, kostengünstigen Kern (Core)</strong> mit{' '}
        <strong>gezielten aktiven Positionen (Satellites)</strong> kombiniert. Der Kern bildet die Basis, während
        Satelliten Überzeugungen oder taktische Chancen nutzen.
      </p>
    </div>
  )
}

/** Structure section */
function StructureSection() {
  return (
    <div>
      <h4 className="mb-3 flex items-center gap-2 font-semibold">
        <Target className="h-4 w-4" />
        Typische Aufteilung
      </h4>
      <div className="grid gap-3 sm:grid-cols-2">
        <CoreAllocationSection />
        <SatelliteAllocationSection />
      </div>
    </div>
  )
}

/** Recommendations section */
function RecommendationsSection() {
  return (
    <>
      <Alert>
        <AlertDescription>
          <strong>Empfehlung für Einsteiger:</strong> Beginnen Sie mit einem reinen Core-Portfolio (100% passiv).
          Fügen Sie Satelliten erst hinzu, wenn Sie Erfahrung gesammelt haben und klare Überzeugungen für aktive
          Positionen entwickelt haben.
        </AlertDescription>
      </Alert>

      <div className="border-t pt-3">
        <p className="text-xs text-muted-foreground">
          <strong>Hinweis:</strong> Die Core-Satellite Strategie kann mit dem Multi-Asset Portfolio Feature
          umgesetzt werden: Nutzen Sie breit diversifizierte ETFs als Core und fügen Sie gezielte Positionen als
          Übergewichtungen hinzu.
        </p>
      </div>
    </>
  )
}

/** Main content body */
function CoreSatelliteContent({ exampleMetrics }: { exampleMetrics: { coreCosts: string; satelliteCosts: string; totalCosts: string } }) {
  return (
    <CardContent className="space-y-4">
      <WhatIsSection />
      <StructureSection />

      <div>
        <h4 className="mb-3 flex items-center gap-2 font-semibold">
          <TrendingUp className="h-4 w-4" />
          Vorteile
        </h4>
        <BenefitsSection exampleMetrics={exampleMetrics} />
      </div>

      <div>
        <h4 className="mb-2 font-semibold">Typische Satelliten-Strategien</h4>
        <SatelliteTypesSection />
      </div>

      <TaxConsiderationsSection />
      <RecommendationsSection />
    </CardContent>
  )
}

export function CoreSatelliteInfo({ nestingLevel = 0 }: CoreSatelliteInfoProps) {
  // Calculate example metrics
  const exampleMetrics = useMemo(() => {
    const coreCosts = 0.80 * 0.002
    const satelliteCosts = 0.20 * 0.007
    const totalCosts = coreCosts + satelliteCosts

    return {
      coreCosts: (coreCosts * 100).toFixed(2),
      satelliteCosts: (satelliteCosts * 100).toFixed(2),
      totalCosts: (totalCosts * 100).toFixed(2),
    }
  }, [])

  return (
    <Card nestingLevel={nestingLevel} className="mb-4">
      <CardHeader>
        <div className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-primary" />
          <CardTitle>Core-Satellite Strategie (Satelliten-Strategie)</CardTitle>
        </div>
        <CardDescription>
          Kombination aus passivem Kern und aktiven Satelliten für kostenoptimierte Diversifikation mit gezielten
          Überzeugungspositionen
        </CardDescription>
      </CardHeader>
      <CoreSatelliteContent exampleMetrics={exampleMetrics} />
    </Card>
  )
}
