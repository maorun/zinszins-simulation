import { useState, useMemo } from 'react'
import { Card, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent } from './ui/collapsible'
import { CollapsibleCardHeader } from './ui/collapsible-card'
import { SeveranceConfigurationSection } from './severance/SeveranceConfigurationSection'
import { SingleResultDisplay } from './severance/SingleResultDisplay'
import { YearComparisonDisplay } from './severance/YearComparisonDisplay'
import {
  calculateSeveranceTax,
  compareSeveranceYears,
  createDefaultSeveranceConfig,
  type SeveranceConfig,
} from '../../helpers/abfindung'

/**
 * Info message explaining the Fünftelregelung
 */
function InfoMessage() {
  return (
    <div className="text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-3">
      <p className="font-medium text-blue-900 mb-1">💡 Fünftelregelung (§34 EStG)</p>
      <p className="text-xs text-blue-800">
        Die Fünftelregelung ist ein Steuervergünstigung für außerordentliche Einkünfte wie Abfindungen.
        Die Steuer wird so berechnet, als würde die Abfindung über 5 Jahre verteilt:
        <br />
        <strong>Steuer = 5 × (Steuer(Einkommen + Abfindung/5) - Steuer(Einkommen))</strong>
        <br />
        Dies führt in der Regel zu deutlichen Steuerersparnissen gegenüber der normalen Besteuerung.
      </p>
    </div>
  )
}

/**
 * Severance Calculator Card - Information and optimization tool
 * for severance payments using Fünftelregelung (§34 EStG)
 */
export function SeveranceCalculatorCard() {
  const currentYear = new Date().getFullYear()
  const [config, setConfig] = useState<SeveranceConfig>(() => ({
    ...createDefaultSeveranceConfig(),
    severanceYear: currentYear,
  }))

  const [comparisonMode, setComparisonMode] = useState<'single' | 'comparison'>('single')
  const [comparisonYears, setComparisonYears] = useState<{
    [year: number]: number
  }>({
    [currentYear]: config.annualGrossIncome,
    [currentYear + 1]: config.annualGrossIncome,
    [currentYear + 2]: config.annualGrossIncome,
  })

  return (
    <Card nestingLevel={1}>
      <Collapsible defaultOpen={false}>
        <CollapsibleCardHeader titleClassName="text-left" simplifiedPadding>
          💼 Abfindungs-Rechner (Fünftelregelung)
        </CollapsibleCardHeader>
        <CollapsibleContent>
          <CardContent nestingLevel={1}>
            <SeveranceCalculatorContent
              config={config}
              setConfig={setConfig}
              comparisonMode={comparisonMode}
              setComparisonMode={setComparisonMode}
              comparisonYears={comparisonYears}
              setComparisonYears={setComparisonYears}
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

function SeveranceCalculatorContent({
  config,
  setConfig,
  comparisonMode,
  setComparisonMode,
  comparisonYears,
  setComparisonYears,
}: {
  config: SeveranceConfig
  setConfig: (config: SeveranceConfig) => void
  comparisonMode: 'single' | 'comparison'
  setComparisonMode: (mode: 'single' | 'comparison') => void
  comparisonYears: { [year: number]: number }
  setComparisonYears: (years: { [year: number]: number }) => void
}) {
  const singleResult = useMemo(() => {
    if (!config.enabled || comparisonMode !== 'single') return null
    return calculateSeveranceTax(config)
  }, [config, comparisonMode])

  const comparisonResults = useMemo(() => {
    if (!config.enabled || comparisonMode !== 'comparison') return null
    return compareSeveranceYears(
      config.severanceAmount,
      comparisonYears,
      undefined,
      config.capitalGainsTaxRate,
      config.capitalGainsTaxAllowance,
    )
  }, [config, comparisonMode, comparisonYears])

  return (
    <div className="space-y-4">
      <InfoMessage />
      <SeveranceConfigurationSection
        config={config}
        onConfigChange={setConfig}
        comparisonMode={comparisonMode}
        onComparisonModeChange={setComparisonMode}
        comparisonYears={comparisonYears}
        onComparisonYearsChange={setComparisonYears}
      />
      {comparisonMode === 'single' && singleResult && <SingleResultDisplay result={singleResult} />}
      {comparisonMode === 'comparison' && comparisonResults && (
        <YearComparisonDisplay results={comparisonResults} />
      )}
    </div>
  )
}
