import { useMemo, useState } from 'react'
import { Home, DollarSign, Info } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Switch } from './ui/switch'
import { Slider } from './ui/slider'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import {
  createDefaultEigenheimVsMieteConfig,
  compareEigenheimVsMiete,
  type EigenheimVsMieteConfig,
  type ComparisonResults,
} from '../../helpers/eigenheim-vs-miete'
import { generateFormId } from '../utils/unique-id'
import { ComparisonResultsDisplay } from './eigenheim-vs-miete/ComparisonResultsDisplay'

/**
 * EigenheimVsMiete Component
 * Comprehensive comparison tool for homeownership vs. renting decision
 */
export function EigenheimVsMieteComparison() {
  const [config, setConfig] = useState<EigenheimVsMieteConfig>(() => createDefaultEigenheimVsMieteConfig(new Date().getFullYear()))

  const results: ComparisonResults | null = useMemo(() => {
    if (!config.comparison.enabled) {
      return null
    }
    return compareEigenheimVsMiete(config)
  }, [config])

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

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
            onCheckedChange={(enabled) => setConfig({ ...config, comparison: { ...config.comparison, enabled } })}
          />
        </div>
        <CardDescription>Detaillierter Vergleich: Kaufen oder mieten Sie Ihr Zuhause?</CardDescription>
      </CardHeader>

      {config.comparison.enabled && (
        <CardContent className="space-y-6">
          {/* Comparison Settings */}
          <ComparisonSettings config={config} setConfig={setConfig} ids={ids} />

          {/* Ownership Configuration */}
          <OwnershipConfiguration config={config} setConfig={setConfig} ids={ids} />

          {/* Rental Configuration */}
          <RentalConfiguration config={config} setConfig={setConfig} ids={ids} />

          {/* Results */}
          {results && <ComparisonResultsDisplay summary={results.summary} comparisonYears={config.comparison.comparisonYears} formatCurrency={formatCurrency} />}
        </CardContent>
      )}
    </Card>
  )
}

interface ConfigProps {
  config: EigenheimVsMieteConfig
  setConfig: (config: EigenheimVsMieteConfig) => void
  ids: Record<string, string>
}

function ComparisonSettings({ config, setConfig, ids }: ConfigProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Vergleichseinstellungen</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={ids.comparisonYears}>Vergleichszeitraum (Jahre)</Label>
          <Slider
            id={ids.comparisonYears}
            min={5}
            max={40}
            step={1}
            value={[config.comparison.comparisonYears]}
            onValueChange={([value]) => setConfig({ ...config, comparison: { ...config.comparison, comparisonYears: value } })}
          />
          <p className="text-sm text-gray-600">{config.comparison.comparisonYears} Jahre</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor={ids.investmentReturn}>
            Erwartete Rendite Mieter-Investitionen (%)
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="inline h-4 w-4 ml-1 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Die erwartete jährliche Rendite für Investitionen des Mieters</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          <Input
            id={ids.investmentReturn}
            type="number"
            min={0}
            max={15}
            step={0.1}
            value={config.comparison.investmentReturnRate}
            onChange={(e) => setConfig({ ...config, comparison: { ...config.comparison, investmentReturnRate: parseFloat(e.target.value) || 0 } })}
          />
        </div>
      </div>
    </div>
  )
}

function OwnershipConfiguration({ config, setConfig, ids }: ConfigProps) {
  return (
    <div className="space-y-4 pt-4 border-t">
      <h3 className="text-sm font-medium flex items-center gap-2">
        <Home className="h-4 w-4 text-green-600" />
        Eigenheim-Szenario
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={ids.purchasePrice}>Kaufpreis (€)</Label>
          <Input
            id={ids.purchasePrice}
            type="number"
            min={0}
            step={10000}
            value={config.ownership.purchasePrice}
            onChange={(e) => setConfig({ ...config, ownership: { ...config.ownership, purchasePrice: parseFloat(e.target.value) || 0 } })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={ids.downPayment}>Eigenkapital (€)</Label>
          <Input
            id={ids.downPayment}
            type="number"
            min={0}
            step={5000}
            value={config.ownership.downPayment}
            onChange={(e) => setConfig({ ...config, ownership: { ...config.ownership, downPayment: parseFloat(e.target.value) || 0 } })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={ids.mortgageRate}>Darlehenszinssatz (%)</Label>
          <Input
            id={ids.mortgageRate}
            type="number"
            min={0}
            max={10}
            step={0.1}
            value={config.ownership.mortgageInterestRate}
            onChange={(e) => setConfig({ ...config, ownership: { ...config.ownership, mortgageInterestRate: parseFloat(e.target.value) || 0 } })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={ids.mortgageTerm}>Darlehenslaufzeit (Jahre)</Label>
          <Input
            id={ids.mortgageTerm}
            type="number"
            min={5}
            max={40}
            step={1}
            value={config.ownership.mortgageTerm}
            onChange={(e) => setConfig({ ...config, ownership: { ...config.ownership, mortgageTerm: parseInt(e.target.value) || 0 } })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={ids.propertyAppreciation}>Wertsteigerung p.a. (%)</Label>
          <Input
            id={ids.propertyAppreciation}
            type="number"
            min={-5}
            max={10}
            step={0.1}
            value={config.ownership.propertyAppreciationRate}
            onChange={(e) => setConfig({ ...config, ownership: { ...config.ownership, propertyAppreciationRate: parseFloat(e.target.value) || 0 } })}
          />
        </div>
      </div>
    </div>
  )
}

function RentalConfiguration({ config, setConfig, ids }: ConfigProps) {
  return (
    <div className="space-y-4 pt-4 border-t">
      <h3 className="text-sm font-medium flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-blue-600" />
        Miet-Szenario
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={ids.monthlyRent}>Monatliche Kaltmiete (€)</Label>
          <Input
            id={ids.monthlyRent}
            type="number"
            min={0}
            step={50}
            value={config.rental.monthlyRent}
            onChange={(e) => setConfig({ ...config, rental: { ...config.rental, monthlyRent: parseFloat(e.target.value) || 0 } })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={ids.rentIncrease}>Jährliche Mieterhöhung (%)</Label>
          <Input
            id={ids.rentIncrease}
            type="number"
            min={0}
            max={10}
            step={0.1}
            value={config.rental.annualRentIncrease}
            onChange={(e) => setConfig({ ...config, rental: { ...config.rental, annualRentIncrease: parseFloat(e.target.value) || 0 } })}
          />
        </div>
      </div>
    </div>
  )
}
