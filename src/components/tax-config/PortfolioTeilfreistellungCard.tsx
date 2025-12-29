import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { Label } from '../ui/label'
import { Slider } from '../ui/slider'
import { Button } from '../ui/button'
import { Plus, Trash2, TrendingUp, AlertCircle, Info, ChevronDown, ChevronUp } from 'lucide-react'
import { GlossaryTerm } from '../GlossaryTerm'
import { generateFormId } from '../../utils/unique-id'
import {
  type AssetClass,
  getAllAssetClasses,
  getAssetClassName,
  DEFAULT_TEILFREISTELLUNGSQUOTEN,
} from '../../../helpers/asset-class'
import {
  type PortfolioHolding,
  calculateWeightedTeilfreistellungsquote,
  calculateEffectiveTaxRate,
  validatePortfolioHoldings,
  suggestPortfolioOptimization,
  formatWeightedQuote,
} from '../../../helpers/portfolio-teilfreistellung'
import { Alert, AlertDescription } from '../ui/alert'
import { Separator } from '../ui/separator'

/**
 * Results summary cards component
 */
function ResultsSummaryCards({
  weightedQuote,
  effectiveTaxRate,
  potentialImprovement,
}: {
  weightedQuote: number
  effectiveTaxRate: number
  potentialImprovement: number
}) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Gewichtete TFS</div>
            <div className="text-2xl font-bold text-primary">
              {formatWeightedQuote(weightedQuote)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Effektiver Steuersatz</div>
            <div className="text-2xl font-bold">{(effectiveTaxRate * 100).toFixed(2)}%</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Verbesserungspotenzial</div>
            <div className="text-2xl font-bold text-green-600">
              +{formatWeightedQuote(potentialImprovement)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Portfolio breakdown table component
 */
function BreakdownTable({
  contributions,
  totalAllocation,
  weightedQuote,
}: {
  contributions: Array<{
    displayName: string
    allocation: number
    quote: number
    contribution: number
  }>
  totalAllocation: number
  weightedQuote: number
}) {
  return (
    <div className="border rounded-md overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="text-left p-2">Anlageklasse</th>
            <th className="text-right p-2">Anteil</th>
            <th className="text-right p-2">TFS</th>
            <th className="text-right p-2">Beitrag</th>
          </tr>
        </thead>
        <tbody>
          {contributions.map((contrib, index) => (
            <tr key={index} className="border-t">
              <td className="p-2">{contrib.displayName}</td>
              <td className="text-right p-2">{(contrib.allocation * 100).toFixed(0)}%</td>
              <td className="text-right p-2">{(contrib.quote * 100).toFixed(0)}%</td>
              <td className="text-right p-2 font-medium">
                {(contrib.contribution * 100).toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t bg-muted font-medium">
          <tr>
            <td className="p-2">Gesamt</td>
            <td className="text-right p-2">{(totalAllocation * 100).toFixed(0)}%</td>
            <td className="text-right p-2">-</td>
            <td className="text-right p-2">{formatWeightedQuote(weightedQuote)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

/**
 * Asset class selection component
 */
function AssetClassSelect({
  id,
  value,
  onChange,
}: {
  id: string
  value: AssetClass
  onChange: (value: AssetClass) => void
}) {
  const allAssetClasses = getAllAssetClasses().filter(ac => ac !== 'custom')

  return (
    <select
      id={id}
      value={value}
      onChange={e => onChange(e.target.value as AssetClass)}
      className="w-full px-3 py-2 text-sm border rounded-md"
    >
      {allAssetClasses.map(ac => (
        <option key={ac} value={ac}>
          {getAssetClassName(ac)}
        </option>
      ))}
    </select>
  )
}

/**
 * Allocation slider component
 */
function AllocationSlider({
  id,
  allocation,
  onChange,
}: {
  id: string
  allocation: number
  onChange: (value: number) => void
}) {
  return (
    <>
      <Label htmlFor={id} className="text-xs">
        Anteil: {(allocation * 100).toFixed(0)}%
      </Label>
      <Slider
        id={id}
        value={[allocation * 100]}
        onValueChange={([value]) => onChange(value / 100)}
        min={0}
        max={100}
        step={5}
        className="w-full"
      />
    </>
  )
}

/**
 * TFS badge component
 */
function TFSBadge({ quote }: { quote: number }) {
  return (
    <div className="text-center">
      <div className="text-xs text-muted-foreground">TFS</div>
      <div className="text-sm font-medium">{(quote * 100).toFixed(0)}%</div>
    </div>
  )
}

/**
 * Portfolio holding row content
 */
function PortfolioHoldingRowContent({
  assetClassSelectId,
  allocationSliderId,
  holding,
  quote,
  onAllocationChange,
  onAssetClassChange,
  onRemove,
  canRemove,
}: {
  assetClassSelectId: string
  allocationSliderId: string
  holding: PortfolioHolding
  quote: number
  onAllocationChange: (value: number) => void
  onAssetClassChange: (assetClass: AssetClass) => void
  onRemove: () => void
  canRemove: boolean
}) {
  return (
    <>
      <div className="col-span-5">
        <Label htmlFor={assetClassSelectId} className="text-xs">
          Anlageklasse
        </Label>
        <AssetClassSelect
          id={assetClassSelectId}
          value={holding.assetClass}
          onChange={onAssetClassChange}
        />
      </div>

      <div className="col-span-5">
        <AllocationSlider
          id={allocationSliderId}
          allocation={holding.allocation}
          onChange={onAllocationChange}
        />
      </div>

      <div className="col-span-1">
        <TFSBadge quote={quote} />
      </div>

      <div className="col-span-1 flex justify-end">
        <Button variant="ghost" size="sm" onClick={onRemove} disabled={!canRemove} className="h-8 w-8 p-0">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </>
  )
}

/**
 * Individual portfolio holding row component
 */
function PortfolioHoldingRow({
  holding,
  index,
  onAllocationChange,
  onAssetClassChange,
  onRemove,
  canRemove,
}: {
  holding: PortfolioHolding
  index: number
  onAllocationChange: (value: number) => void
  onAssetClassChange: (assetClass: AssetClass) => void
  onRemove: () => void
  canRemove: boolean
}) {
  const assetClassSelectId = useMemo(
    () => generateFormId('portfolio-holding', 'asset-class', index.toString()),
    [index],
  )
  const allocationSliderId = useMemo(
    () => generateFormId('portfolio-holding', 'allocation', index.toString()),
    [index],
  )

  const quote = DEFAULT_TEILFREISTELLUNGSQUOTEN[holding.assetClass]

  return (
    <div className="grid grid-cols-12 gap-4 items-center">
      <PortfolioHoldingRowContent
        assetClassSelectId={assetClassSelectId}
        allocationSliderId={allocationSliderId}
        holding={holding}
        quote={quote}
        onAllocationChange={onAllocationChange}
        onAssetClassChange={onAssetClassChange}
        onRemove={onRemove}
        canRemove={canRemove}
      />
    </div>
  )
}

/**
 * Optimization suggestions alert component
 */
function OptimizationSuggestionsAlert({ suggestions }: { suggestions: string[] }) {
  if (suggestions.length === 0) return null

  return (
    <Alert>
      <TrendingUp className="h-4 w-4" />
      <AlertDescription>
        <div className="font-medium mb-2">Optimierungsempfehlungen:</div>
        <ul className="list-disc list-inside space-y-1">
          {suggestions.map((suggestion, index) => (
            <li key={index} className="text-sm">
              {suggestion}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
}

/**
 * Results display component
 */
function PortfolioResults({
  holdings,
  capitalGainsTaxRate = 0.26375,
}: {
  holdings: PortfolioHolding[]
  capitalGainsTaxRate?: number
}) {
  const result = calculateWeightedTeilfreistellungsquote(holdings)
  const effectiveTaxRate = calculateEffectiveTaxRate(capitalGainsTaxRate, result.weightedQuote)
  const optimization = suggestPortfolioOptimization(holdings)

  return (
    <div className="space-y-4">
      <ResultsSummaryCards
        weightedQuote={result.weightedQuote}
        effectiveTaxRate={effectiveTaxRate}
        potentialImprovement={optimization.potentialImprovement}
      />

      <BreakdownTable
        contributions={result.contributions}
        totalAllocation={result.totalAllocation}
        weightedQuote={result.weightedQuote}
      />

      <OptimizationSuggestionsAlert suggestions={optimization.suggestions} />
    </div>
  )
}

/**
 * Portfolio holdings editor component
 */
function PortfolioHoldingsEditor({
  holdings,
  onAddHolding,
  onRemoveHolding,
  onAllocationChange,
  onAssetClassChange,
}: {
  holdings: PortfolioHolding[]
  onAddHolding: () => void
  onRemoveHolding: (index: number) => void
  onAllocationChange: (index: number, value: number) => void
  onAssetClassChange: (index: number, assetClass: AssetClass) => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-base font-medium">Portfolio-Positionen</Label>
        <Button onClick={onAddHolding} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-1" />
          Position hinzufügen
        </Button>
      </div>

      <div className="space-y-3">
        {holdings.map((holding, index) => (
          <PortfolioHoldingRow
            key={index}
            holding={holding}
            index={index}
            onAllocationChange={value => onAllocationChange(index, value)}
            onAssetClassChange={assetClass => onAssetClassChange(index, assetClass)}
            onRemove={() => onRemoveHolding(index)}
            canRemove={holdings.length > 1}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Info alert component
 */
function InfoAlert() {
  return (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertDescription className="text-sm">
        Dieser Rechner hilft Ihnen, die steueroptimale Portfolio-Struktur zu finden. Die gewichtete
        Teilfreistellungsquote reduziert Ihre effektive Steuerlast auf Kapitalerträge.
      </AlertDescription>
    </Alert>
  )
}

/**
 * Validation errors alert component
 */
function ValidationErrorsAlert({ errors }: { errors: string[] }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <div className="font-medium mb-1">Validierungsfehler:</div>
        <ul className="list-disc list-inside space-y-1">
          {errors.map((error, index) => (
            <li key={index} className="text-sm">
              {error}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
}

/**
 * Card content section component
 */
function CardContentSection({
  holdings,
  validationErrors,
  onAddHolding,
  onRemoveHolding,
  onAllocationChange,
  onAssetClassChange,
  onNormalizeAllocations,
}: {
  holdings: PortfolioHolding[]
  validationErrors: string[]
  onAddHolding: () => void
  onRemoveHolding: (index: number) => void
  onAllocationChange: (index: number, value: number) => void
  onAssetClassChange: (index: number, assetClass: AssetClass) => void
  onNormalizeAllocations: () => void
}) {
  const hasErrors = validationErrors.length > 0

  return (
    <>
      <InfoAlert />

      <PortfolioHoldingsEditor
        holdings={holdings}
        onAddHolding={onAddHolding}
        onRemoveHolding={onRemoveHolding}
        onAllocationChange={onAllocationChange}
        onAssetClassChange={onAssetClassChange}
      />

      {hasErrors && (
        <Button onClick={onNormalizeAllocations} variant="outline" size="sm">
          Auf 100% normalisieren
        </Button>
      )}

      {hasErrors && <ValidationErrorsAlert errors={validationErrors} />}

      <Separator />

      {!hasErrors && <PortfolioResults holdings={holdings} />}
    </>
  )
}

function usePortfolioHoldingsState() {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([
    { assetClass: 'equity-fund', allocation: 0.6 },
    { assetClass: 'bond-fund', allocation: 0.4 },
  ])

  const handleAddHolding = () => {
    setHoldings([...holdings, { assetClass: 'mixed-fund', allocation: 0.1 }])
  }

  const handleRemoveHolding = (index: number) => {
    if (holdings.length > 1) {
      setHoldings(holdings.filter((_, i) => i !== index))
    }
  }

  const handleAllocationChange = (index: number, newAllocation: number) => {
    const newHoldings = [...holdings]
    newHoldings[index] = { ...newHoldings[index], allocation: newAllocation }
    setHoldings(newHoldings)
  }

  const handleAssetClassChange = (index: number, newAssetClass: AssetClass) => {
    const newHoldings = [...holdings]
    newHoldings[index] = { ...newHoldings[index], assetClass: newAssetClass }
    setHoldings(newHoldings)
  }

  const handleNormalizeAllocations = () => {
    const total = holdings.reduce((sum, h) => sum + h.allocation, 0)
    if (total > 0) {
      setHoldings(holdings.map(h => ({ ...h, allocation: h.allocation / total })))
    }
  }

  return {
    holdings,
    handleAddHolding,
    handleRemoveHolding,
    handleAllocationChange,
    handleAssetClassChange,
    handleNormalizeAllocations,
  }
}

function PortfolioTeilfreistellungHeader({ isOpen }: { isOpen: boolean }) {
  return (
    <CollapsibleTrigger asChild>
      <div className="flex items-center justify-between cursor-pointer">
        <div className="flex-1">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Portfolio-Teilfreistellungsquoten-Rechner
          </CardTitle>
          <CardDescription>
            Berechnen Sie die gewichtete{' '}
            <GlossaryTerm term="teilfreistellung">Teilfreistellungsquote</GlossaryTerm> für komplexe
            Fonds-Portfolios nach § 20 InvStG
          </CardDescription>
        </div>
        <div className="ml-2">
          {isOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
        </div>
      </div>
    </CollapsibleTrigger>
  )
}

/**
 * Portfolio-based Teilfreistellungsquote Calculator Card
 */
export function PortfolioTeilfreistellungCard() {
  const [isOpen, setIsOpen] = useState(false)
  const {
    holdings,
    handleAddHolding,
    handleRemoveHolding,
    handleAllocationChange,
    handleAssetClassChange,
    handleNormalizeAllocations,
  } = usePortfolioHoldingsState()

  const validationErrors = validatePortfolioHoldings(holdings)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader>
          <PortfolioTeilfreistellungHeader isOpen={isOpen} />
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-6">
            <CardContentSection
              holdings={holdings}
              validationErrors={validationErrors}
              onAddHolding={handleAddHolding}
              onRemoveHolding={handleRemoveHolding}
              onAllocationChange={handleAllocationChange}
              onAssetClassChange={handleAssetClassChange}
              onNormalizeAllocations={handleNormalizeAllocations}
            />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
