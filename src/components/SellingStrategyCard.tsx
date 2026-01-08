import { useMemo, useState } from 'react'
import { Card, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent } from './ui/collapsible'
import { CollapsibleCardHeader } from './ui/collapsible-card'
import { formatCurrency } from '../utils/currency'
import {
  calculateSellingStrategy,
  compareSellingStrategies,
  getDefaultSellingStrategyConfig,
  type InvestmentLot,
  type SellingStrategyConfig,
} from '../../helpers/selling-strategy'
import { SellingStrategyConfigForm } from './selling-strategy/SellingStrategyConfigForm'
import { SellingStrategyResults } from './selling-strategy/SellingStrategyResults'
import { SellingStrategyComparison } from './selling-strategy/SellingStrategyComparison'

/**
 * Example investment lots for demonstration
 */
function createExampleLots(): InvestmentLot[] {
  return [
    {
      id: 'lot1',
      purchaseDate: new Date('2018-01-01'),
      costBasis: 10000,
      currentValue: 18000,
      vorabpauschaleAccumulated: 200,
    },
    {
      id: 'lot2',
      purchaseDate: new Date('2020-06-01'),
      costBasis: 15000,
      currentValue: 20000,
      vorabpauschaleAccumulated: 150,
    },
    {
      id: 'lot3',
      purchaseDate: new Date('2022-03-01'),
      costBasis: 12000,
      currentValue: 13500,
      vorabpauschaleAccumulated: 50,
    },
  ]
}

/**
 * Information banner component
 */
function InformationBanner({ totalValue }: { totalValue: number }) {
  return (
    <div className="text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-3">
      <p className="font-medium text-blue-900 mb-1">💡 Intelligente Verkaufsstrategie</p>
      <p className="text-xs text-blue-800">
        Dieser Rechner zeigt die steueroptimale Reihenfolge für den Verkauf von Investments. Basierend auf
        Beispiel-Investments (Gesamt: {formatCurrency(totalValue)}).
      </p>
    </div>
  )
}

/**
 * Selling Strategy Configuration Card
 *
 * This component provides a calculator for optimizing the timing and method
 * of investment sales to minimize tax burden. It demonstrates German tax law
 * considerations including FIFO/LIFO cost basis, tax allowances, and
 * multi-year spreading strategies.
 */
export function SellingStrategyCard() {
  const currentYear = new Date().getFullYear()
  const [config, setConfig] = useState<SellingStrategyConfig>(getDefaultSellingStrategyConfig(currentYear))
  const [showComparison, setShowComparison] = useState(false)

  const exampleLots = useMemo(() => createExampleLots(), [])

  const strategyResult = useMemo(() => {
    try {
      return calculateSellingStrategy(exampleLots, config)
    } catch {
      return null
    }
  }, [exampleLots, config])

  const comparison = useMemo(() => {
    if (!showComparison) return null
    try {
      return compareSellingStrategies(exampleLots, config)
    } catch {
      return null
    }
  }, [exampleLots, config, showComparison])

  const updateConfig = (updates: Partial<SellingStrategyConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }))
  }

  const totalValue = exampleLots.reduce((sum, lot) => sum + lot.currentValue, 0)

  return (
    <Card nestingLevel={1}>
      <Collapsible defaultOpen={false}>
        <CollapsibleCardHeader titleClassName="text-left" simplifiedPadding>
          📊 Verkaufsstrategie-Optimierung
        </CollapsibleCardHeader>
        <CollapsibleContent>
          <CardContent nestingLevel={1}>
            <div className="space-y-6">
              <InformationBanner totalValue={totalValue} />

              <SellingStrategyConfigForm
                config={config}
                onConfigChange={updateConfig}
                showComparison={showComparison}
                onShowComparisonChange={setShowComparison}
              />

              <SellingStrategyResults result={strategyResult} config={config} />

              {showComparison && <SellingStrategyComparison comparison={comparison} />}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
