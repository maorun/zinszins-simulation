import { useMemo, useState } from 'react'
import { Home } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Switch } from './ui/switch'
import {
  createDefaultEigenheimVsMieteConfig,
  compareEigenheimVsMiete,
  type EigenheimVsMieteConfig,
} from '../../helpers/eigenheim-vs-miete'
import { generateFormId } from '../utils/unique-id'
import { formatCurrencyWhole } from '../utils/currency'
import { ComparisonResultsDisplay } from './eigenheim-vs-miete/ComparisonResultsDisplay'
import { ComparisonSettings } from './eigenheim-vs-miete/ComparisonSettings'
import { OwnershipConfiguration } from './eigenheim-vs-miete/OwnershipConfiguration'
import { RentalConfiguration } from './eigenheim-vs-miete/RentalConfiguration'

/**
 * EigenheimVsMiete Component
 * Comprehensive comparison tool for homeownership vs. renting decision
 */
export function EigenheimVsMieteComparison() {
  const [config, setConfig] = useState<EigenheimVsMieteConfig>(() =>
    createDefaultEigenheimVsMieteConfig(new Date().getFullYear()),
  )

  const results = useMemo(() => (config.comparison.enabled ? compareEigenheimVsMiete(config) : null), [config])

  const ids = useMemo(
    () => ({
      enabled: generateFormId('eigenheim-vs-miete', 'enabled'),
      purchasePrice: generateFormId('eigenheim-vs-miete', 'purchase-price'),
      downPayment: generateFormId('eigenheim-vs-miete', 'down-payment'),
      mortgageRate: generateFormId('eigenheim-vs-miete', 'mortgage-rate'),
      mortgageTerm: generateFormId('eigenheim-vs-miete', 'mortgage-term'),
      monthlyRent: generateFormId('eigenheim-vs-miete', 'monthly-rent'),
      rentIncrease: generateFormId('eigenheim-vs-miete', 'rent-increase'),
      comparisonYears: generateFormId('eigenheim-vs-miete', 'comparison-years'),
      investmentReturn: generateFormId('eigenheim-vs-miete', 'investment-return'),
      propertyAppreciation: generateFormId('eigenheim-vs-miete', 'property-appreciation'),
    }),
    [],
  )

  return (
    <Card className="mb-3 sm:mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5 text-blue-600" />
            <CardTitle>Eigenheim vs. Miete Vergleich</CardTitle>
          </div>
          <Switch
            id={ids.enabled}
            checked={config.comparison.enabled}
            onCheckedChange={enabled => setConfig({ ...config, comparison: { ...config.comparison, enabled } })}
          />
        </div>
        <CardDescription>Detaillierter Vergleich: Kaufen oder mieten Sie Ihr Zuhause?</CardDescription>
      </CardHeader>

      {config.comparison.enabled && (
        <CardContent className="space-y-6">
          <ComparisonSettings config={config} setConfig={setConfig} ids={ids} />
          <OwnershipConfiguration config={config} setConfig={setConfig} ids={ids} />
          <RentalConfiguration config={config} setConfig={setConfig} ids={ids} />
          {results && (
            <ComparisonResultsDisplay
              summary={results.summary}
              comparisonYears={config.comparison.comparisonYears}
              formatCurrency={formatCurrencyWhole}
            />
          )}
        </CardContent>
      )}
    </Card>
  )
}
