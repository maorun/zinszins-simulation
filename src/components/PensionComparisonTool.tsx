import { useState, useMemo } from 'react'
import { Card, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent } from './ui/collapsible'
import { CollapsibleCardHeader } from './ui/collapsible-card'
import { PensionComparisonConfiguration } from './pension-comparison/PensionComparisonConfiguration'
import { PensionComparisonResults } from './pension-comparison/PensionComparisonResults'
import { comparePensionTypes, type PensionComparisonConfig } from '../../helpers/pension-comparison'

/**
 * Info message explaining pension comparison
 */
function InfoMessage() {
  return (
    <div className="text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-3">
      <p className="font-medium text-blue-900 mb-1">💡 Rentenversicherungs-Vergleich</p>
      <p className="text-xs text-blue-800">
        Vergleichen Sie verschiedene deutsche Rentenversicherungsarten nebeneinander:
        <br />
        <strong>Gesetzliche Rente</strong> • <strong>Riester-Rente</strong> (staatlich gefördert) •{' '}
        <strong>Rürup-Rente</strong> (Basis-Rente) • <strong>Betriebsrente</strong> (bAV)
        <br />
        Der Vergleich zeigt Beiträge, Steuervorteile, erwartete Rente und Rendite (ROI) für fundierte Entscheidungen in
        der Altersvorsorge.
      </p>
    </div>
  )
}

/**
 * Create default pension comparison configuration
 */
function createDefaultConfig(): PensionComparisonConfig {
  const currentYear = new Date().getFullYear()
  const age = 35
  const retirementAge = 67
  const pensionStartYear = currentYear + (retirementAge - age)
  const lifeExpectancy = 85
  const pensionEndYear = currentYear + (lifeExpectancy - age)

  return {
    currentYear,
    pensionStartYear,
    pensionEndYear,
    personalTaxRate: 0.35, // 35% during working years
    pensionTaxRate: 0.2, // 20% during retirement (typically lower)
    annualGrossIncome: 50000,
    socialSecurityRate: 0.2,
    inStatutoryHealthInsurance: true,
    hasChildren: true,
  }
}

/**
 * Pension Comparison Tool Card - Compare different German pension insurance types
 */
export function PensionComparisonTool() {
  const [config, setConfig] = useState<PensionComparisonConfig>(createDefaultConfig)

  const comparisonResults = useMemo(() => {
    // Only calculate if at least one pension type is configured
    const hasAnyPension = config.statutoryPension || config.riesterRente || config.ruerupRente || config.betriebsrente

    if (!hasAnyPension) return null

    return comparePensionTypes(config)
  }, [config])

  return (
    <Card nestingLevel={1}>
      <Collapsible defaultOpen={false}>
        <CollapsibleCardHeader titleClassName="text-left" simplifiedPadding>
          🏦 Rentenversicherungs-Vergleich
        </CollapsibleCardHeader>
        <CollapsibleContent>
          <CardContent nestingLevel={1}>
            <div className="space-y-4">
              <InfoMessage />
              <PensionComparisonConfiguration config={config} onConfigChange={setConfig} />
              {comparisonResults && <PensionComparisonResults results={comparisonResults} />}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
