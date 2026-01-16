import { useState, useMemo } from 'react'
import { Card, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent } from './ui/collapsible'
import { CollapsibleCardHeader } from './ui/collapsible-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { TaxLossHarvestingSection } from './tax-config/TaxLossHarvestingSection'
import { PortfolioTrackerSection } from './tax-config/PortfolioTrackerSection'
import { calculateTaxLossHarvesting, getDefaultTaxLossHarvestingConfig } from '../../helpers/tax-loss-harvesting'
import { useSimulation } from '../contexts/useSimulation'
import { formatCurrency } from '../utils/currency'

interface TaxLossHarvestingConfig {
  enabled: boolean
  realizedStockLosses: number
  realizedOtherLosses: number
  lossCarryForward: number
}

function InfoMessage() {
  return (
    <div className="text-sm text-muted-foreground bg-yellow-50 border border-yellow-200 rounded-lg p-3">
      <p className="font-medium text-yellow-900 mb-1">💡 Informations-Tool</p>
      <p className="text-xs text-yellow-800">
        Dieser Rechner zeigt potenzielle Steuerersparnisse durch Verlustverrechnung. Die Berechnung basiert auf
        Beispielwerten (10.000 € Kapitalerträge + 500 € Vorabpauschale).
      </p>
    </div>
  )
}

interface ResultsDisplayProps {
  result: ReturnType<typeof calculateTaxLossHarvesting>
}

function ResultsDisplay({ result }: ResultsDisplayProps) {
  return (
    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
      <h4 className="font-medium text-green-900 mb-3">💰 Berechnete Steuerersparnis</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-green-800">Verfügbare Verluste gesamt:</span>
          <span className="font-medium text-green-900">{formatCurrency(result.totalLossesAvailable)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-green-800">Genutzte Verluste:</span>
          <span className="font-medium text-green-900">{formatCurrency(result.lossesUsed)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-green-800">Verlustvortrag (nächstes Jahr):</span>
          <span className="font-medium text-green-900">{formatCurrency(result.lossCarryForward)}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-green-300">
          <span className="font-medium text-green-900">Steuerersparnis:</span>
          <span className="font-bold text-green-900 text-lg">{formatCurrency(result.taxSavings)}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-green-300 text-xs text-green-800">
        <p className="font-medium mb-1">Aufschlüsselung nach Verlusttyp:</p>
        <div className="space-y-1 ml-2">
          <div>
            • Aktienverluste: {formatCurrency(result.breakdown.stockLosses.used)} von{' '}
            {formatCurrency(result.breakdown.stockLosses.available)} genutzt
          </div>
          <div>
            • Sonstige Verluste: {formatCurrency(result.breakdown.otherLosses.used)} von{' '}
            {formatCurrency(result.breakdown.otherLosses.available)} genutzt
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Tax Loss Harvesting Card - Informational calculator for tax savings
 * through Verlustverrechnung (loss offsetting)
 */
export function TaxLossHarvestingCard() {
  const { steuerlast, teilfreistellungsquote } = useSimulation()
  const currentYear = new Date().getFullYear()
  const [config, setConfig] = useState<TaxLossHarvestingConfig>(() => getDefaultTaxLossHarvestingConfig(currentYear))

  const result = useMemo(() => {
    if (!config.enabled) return null
    const effectiveTaxRate = (steuerlast / 100) * (1 - teilfreistellungsquote / 100)
    return calculateTaxLossHarvesting({ ...config, year: currentYear }, 10000, 500, effectiveTaxRate)
  }, [config, currentYear, steuerlast, teilfreistellungsquote])

  const effectiveTaxRate = (steuerlast / 100) * (1 - teilfreistellungsquote / 100)

  return (
    <Card nestingLevel={1}>
      <Collapsible defaultOpen={false}>
        <CollapsibleCardHeader titleClassName="text-left" simplifiedPadding>
          📉 Tax Loss Harvesting (Verlustverrechnung)
        </CollapsibleCardHeader>
        <CollapsibleContent>
          <CardContent nestingLevel={1}>
            <Tabs defaultValue="calculator" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="calculator">Einfacher Rechner</TabsTrigger>
                <TabsTrigger value="tracker">Portfolio Tracker</TabsTrigger>
              </TabsList>

              <TabsContent value="calculator" className="space-y-4" forceMount>
                <InfoMessage />
                <TaxLossHarvestingSection config={config} onConfigChange={setConfig} />
                {result && <ResultsDisplay result={result} />}
              </TabsContent>

              <TabsContent value="tracker" className="space-y-4" forceMount>
                <div className="text-sm text-muted-foreground bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="font-medium text-purple-900 mb-1">🚀 Portfolio Tax Loss Harvesting Tracker</p>
                  <p className="text-xs text-purple-800">
                    Verwalten Sie Ihre Portfolio-Positionen und erhalten Sie automatisch priorisierte
                    Verlustrealisierungs-Empfehlungen mit Wash-Sale-Regel-Prüfung und Ersatz-Investment-Vorschlägen.
                  </p>
                </div>
                <PortfolioTrackerSection taxRate={effectiveTaxRate} teilfreistellungsquote={teilfreistellungsquote} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
