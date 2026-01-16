import { useState, useMemo } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Switch } from '../ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { AlertCircle, Plus, Trash2, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react'
import { formatCurrency } from '../../utils/currency'
import { generateFormId } from '../../utils/unique-id'
import {
  createPortfolioPosition,
  identifyLossHarvestingOpportunities,
  getDefaultTransactionCostConfig,
  getDefaultWashSaleConfig,
  type PortfolioPosition,
  type LossHarvestingOpportunity,
} from '../../../helpers/tax-loss-harvesting-tracker'

interface PortfolioTrackerSectionProps {
  taxRate: number
  teilfreistellungsquote: number
}

interface PositionFormData {
  id: string
  name: string
  symbol: string
  assetClass: PortfolioPosition['assetClass']
  acquisitionDate: string
  purchasePrice: string
  currentPrice: string
  quantity: string
  isStockFund: boolean
}

const ASSET_CLASS_LABELS: Record<PortfolioPosition['assetClass'], string> = {
  stocks: 'Aktien / Aktienfonds',
  bonds: 'Anleihen',
  reits: 'Immobilien (REITs)',
  commodities: 'Rohstoffe',
  mixed: 'Mischfonds',
  other: 'Sonstige',
}

function getDefaultFormData(): PositionFormData {
  return {
    id: crypto.randomUUID(),
    name: '',
    symbol: '',
    assetClass: 'stocks',
    acquisitionDate: new Date().toISOString().split('T')[0],
    purchasePrice: '',
    currentPrice: '',
    quantity: '',
    isStockFund: true,
  }
}

interface PortfolioPositionFormProps {
  formData: PositionFormData
  onChange: (data: PositionFormData) => void
  onAdd: () => void
  onCancel: () => void
}

function AssetClassSelection({
  assetClassId,
  value,
  onChange,
}: {
  assetClassId: string
  value: PortfolioPosition['assetClass']
  onChange: (value: PortfolioPosition['assetClass']) => void
}) {
  return (
    <div className="space-y-2 md:col-span-2">
      <Label htmlFor={assetClassId}>Anlageklasse *</Label>
      <RadioGroup value={value} onValueChange={onChange}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {Object.entries(ASSET_CLASS_LABELS).map(([val, label]) => (
            <div key={val} className="flex items-center space-x-2">
              <RadioGroupItem value={val} id={`${assetClassId}-${val}`} />
              <Label htmlFor={`${assetClassId}-${val}`} className="font-normal text-sm">
                {label}
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  )
}

function PositionFormFields({
  formData,
  onChange,
  nameId,
  symbolId,
  assetClassId,
  dateId,
  purchasePriceId,
  currentPriceId,
  quantityId,
  stockFundId,
}: {
  formData: PositionFormData
  onChange: (data: PositionFormData) => void
  nameId: string
  symbolId: string
  assetClassId: string
  dateId: string
  purchasePriceId: string
  currentPriceId: string
  quantityId: string
  stockFundId: string
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor={nameId}>Name der Position *</Label>
        <Input id={nameId} value={formData.name} onChange={e => onChange({ ...formData, name: e.target.value })} placeholder="z.B. MSCI World ETF" />
      </div>

      <div className="space-y-2">
        <Label htmlFor={symbolId}>ISIN / Symbol</Label>
        <Input id={symbolId} value={formData.symbol} onChange={e => onChange({ ...formData, symbol: e.target.value })} placeholder="z.B. IE00B4L5Y983" />
      </div>

      <AssetClassSelection assetClassId={assetClassId} value={formData.assetClass} onChange={value => onChange({ ...formData, assetClass: value })} />

      <div className="space-y-2">
        <Label htmlFor={dateId}>Kaufdatum *</Label>
        <Input id={dateId} type="date" value={formData.acquisitionDate} onChange={e => onChange({ ...formData, acquisitionDate: e.target.value })} />
      </div>

      <div className="space-y-2"><Label htmlFor={purchasePriceId}>Kaufpreis (€) *</Label><Input id={purchasePriceId} type="number" min="0" step="0.01" value={formData.purchasePrice} onChange={e => onChange({ ...formData, purchasePrice: e.target.value })} placeholder="100.00" /></div>
      <div className="space-y-2"><Label htmlFor={currentPriceId}>Aktueller Preis (€) *</Label><Input id={currentPriceId} type="number" min="0" step="0.01" value={formData.currentPrice} onChange={e => onChange({ ...formData, currentPrice: e.target.value })} placeholder="80.00" /></div>
      <div className="space-y-2"><Label htmlFor={quantityId}>Anzahl *</Label><Input id={quantityId} type="number" min="0" step="0.001" value={formData.quantity} onChange={e => onChange({ ...formData, quantity: e.target.value })} placeholder="100" /></div>

      <div className="flex items-center space-x-2">
        <Switch id={stockFundId} checked={formData.isStockFund} onCheckedChange={checked => onChange({ ...formData, isStockFund: checked })} />
        <Label htmlFor={stockFundId} className="text-sm">Aktienfonds (für Teilfreistellung)</Label>
      </div>
    </div>
  )
}

function PortfolioPositionForm({ formData, onChange, onAdd, onCancel }: PortfolioPositionFormProps) {
  const nameId = useMemo(() => generateFormId('portfolio-position', 'name'), [])
  const symbolId = useMemo(() => generateFormId('portfolio-position', 'symbol'), [])
  const assetClassId = useMemo(() => generateFormId('portfolio-position', 'asset-class'), [])
  const dateId = useMemo(() => generateFormId('portfolio-position', 'date'), [])
  const purchasePriceId = useMemo(() => generateFormId('portfolio-position', 'purchase-price'), [])
  const currentPriceId = useMemo(() => generateFormId('portfolio-position', 'current-price'), [])
  const quantityId = useMemo(() => generateFormId('portfolio-position', 'quantity'), [])
  const stockFundId = useMemo(() => generateFormId('portfolio-position', 'stock-fund'), [])

  const isValid =
    formData.name &&
    formData.purchasePrice &&
    formData.currentPrice &&
    formData.quantity &&
    parseFloat(formData.purchasePrice) > 0 &&
    parseFloat(formData.currentPrice) >= 0 &&
    parseFloat(formData.quantity) > 0

  return (
    <Card className="bg-blue-50/50">
      <CardHeader>
        <CardTitle className="text-base">Neue Position hinzufügen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <PositionFormFields
          formData={formData}
          onChange={onChange}
          nameId={nameId}
          symbolId={symbolId}
          assetClassId={assetClassId}
          dateId={dateId}
          purchasePriceId={purchasePriceId}
          currentPriceId={currentPriceId}
          quantityId={quantityId}
          stockFundId={stockFundId}
        />

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel}>
            Abbrechen
          </Button>
          <Button onClick={onAdd} disabled={!isValid}>
            <Plus className="h-4 w-4 mr-2" />
            Position hinzufügen
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function PortfolioSummaryCard({ summary }: { summary: { totalValue: number; totalCost: number; totalGainLoss: number; lossPositions: number } }) {
  return (
    <Card>
      <CardContent className="p-4">
        <h4 className="font-medium mb-3">Portfolio-Übersicht</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Positionen:</span>
            <div className="font-medium">{summary.lossPositions}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Gesamtwert:</span>
            <div className="font-medium">{formatCurrency(summary.totalValue)}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Gesamtkosten:</span>
            <div className="font-medium">{formatCurrency(summary.totalCost)}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Gesamt G/V:</span>
            <div className={`font-medium ${summary.totalGainLoss < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(summary.totalGainLoss)}
            </div>
          </div>
        </div>
        {summary.lossPositions > 0 && (
          <div className="mt-3 pt-3 border-t text-sm text-orange-700">
            ⚠️ {summary.lossPositions} Position(en) mit unrealisierten Verlusten gefunden
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PortfolioPositionCard({
  position,
  onDelete,
}: {
  position: PortfolioPosition
  onDelete: (id: string) => void
}) {
  const isLoss = position.unrealizedGainLoss < 0
  const performanceClass = isLoss ? 'text-red-600' : 'text-green-600'

  return (
    <Card className={isLoss ? 'border-red-200 bg-red-50/30' : 'border-green-200 bg-green-50/30'}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <PositionDetails position={position} performanceClass={performanceClass} />
          <Button variant="ghost" size="sm" onClick={() => onDelete(position.id)}>
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function PositionDetails({ position, performanceClass }: { position: PortfolioPosition; performanceClass: string }) {
  return (
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-2">
        <h4 className="font-medium">{position.name}</h4>
        {position.unrealizedGainLoss < 0 && <TrendingDown className="h-4 w-4 text-red-600" />}
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
        <div>
          <span className="font-medium">Anlageklasse:</span> {ASSET_CLASS_LABELS[position.assetClass]}
        </div>
        {position.symbol && (
          <div>
            <span className="font-medium">Symbol:</span> {position.symbol}
          </div>
        )}
        <div>
          <span className="font-medium">Kaufpreis:</span> {formatCurrency(position.purchasePrice)}
        </div>
        <div>
          <span className="font-medium">Aktuell:</span> {formatCurrency(position.currentPrice)}
        </div>
        <div>
          <span className="font-medium">Anzahl:</span> {position.quantity}
        </div>
        <div>
          <span className="font-medium">Gesamtwert:</span> {formatCurrency(position.currentValue)}
        </div>
        <div className="col-span-2">
          <span className="font-medium">Gewinn/Verlust:</span>{' '}
          <span className={performanceClass}>
            {formatCurrency(position.unrealizedGainLoss)} ({position.unrealizedGainLossPercent.toFixed(2)}%)
          </span>
        </div>
      </div>
    </div>
  )
}

function ReplacementSuggestions({ suggestions }: { suggestions: LossHarvestingOpportunity['replacementSuggestions'] }) {
  if (suggestions.length === 0) return null

  return (
    <div className="pt-3 border-t">
      <p className="text-sm font-medium mb-2">💡 Ersatz-Investments:</p>
      <div className="space-y-2">
        {suggestions.slice(0, 2).map((suggestion, idx) => (
          <div key={idx} className="text-sm pl-4 border-l-2 border-gray-300">
            <div className="font-medium">{suggestion.name}</div>
            <div className="text-xs text-muted-foreground">{suggestion.reason}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function OpportunityDetails({ opportunity }: { opportunity: LossHarvestingOpportunity }) {
  return (
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div>
        <span className="text-muted-foreground">Unrealisierter Verlust:</span>
        <div className="font-medium text-red-600">{formatCurrency(opportunity.lossAmount)}</div>
      </div>
      <div>
        <span className="text-muted-foreground">Potenzielle Steuerersparnis:</span>
        <div className="font-medium text-green-600">{formatCurrency(opportunity.potentialTaxSavings)}</div>
      </div>
      <div>
        <span className="text-muted-foreground">Transaktionskosten:</span>
        <div className="font-medium">{formatCurrency(opportunity.transactionCosts)}</div>
      </div>
      <div>
        <span className="text-muted-foreground">Netto-Vorteil:</span>
        <div className="font-medium text-green-600">{formatCurrency(opportunity.netBenefit)}</div>
      </div>
    </div>
  )
}

function OpportunityCard({ opportunity }: { opportunity: LossHarvestingOpportunity }) {
  const priorityColors = {
    high: 'border-red-500 bg-red-50',
    medium: 'border-yellow-500 bg-yellow-50',
    low: 'border-blue-500 bg-blue-50',
  }

  const priorityIcons = {
    high: <AlertCircle className="h-5 w-5 text-red-600" />,
    medium: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
    low: <CheckCircle className="h-5 w-5 text-blue-600" />,
  }

  const priorityLabels = {
    high: 'Hohe Priorität',
    medium: 'Mittlere Priorität',
    low: 'Niedrige Priorität',
  }

  return (
    <Card className={priorityColors[opportunity.priorityLevel]}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{priorityIcons[opportunity.priorityLevel]}</div>
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium">
                  #{opportunity.priority} - {opportunity.position.name}
                </h4>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${opportunity.priorityLevel === 'high' ? 'bg-red-200 text-red-800' : opportunity.priorityLevel === 'medium' ? 'bg-yellow-200 text-yellow-800' : 'bg-blue-200 text-blue-800'}`}
                >
                  {priorityLabels[opportunity.priorityLevel]}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{opportunity.recommendation}</p>
            </div>

            <OpportunityDetails opportunity={opportunity} />
            <ReplacementSuggestions suggestions={opportunity.replacementSuggestions} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function OpportunitiesList({ opportunities }: { opportunities: LossHarvestingOpportunity[] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <TrendingDown className="h-5 w-5 text-orange-600" />
        <h4 className="font-medium">Tax Loss Harvesting Opportunities ({opportunities.length} gefunden)</h4>
      </div>
      <div className="space-y-3">
        {opportunities.map(opportunity => (
          <OpportunityCard key={opportunity.position.id} opportunity={opportunity} />
        ))}
      </div>
    </div>
  )
}

function NoOpportunitiesMessage({ hasPositions }: { hasPositions: boolean }) {
  if (!hasPositions) return null

  return (
    <Card className="bg-green-50 border-green-200">
      <CardContent className="p-4 text-center">
        <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
        <p className="text-sm text-green-800">
          Keine Tax Loss Harvesting Opportunities gefunden. Alle Positionen sind profitabel oder zu klein für rentable
          Verlustrealisierung.
        </p>
      </CardContent>
    </Card>
  )
}

function PortfolioContent({
  positions,
  showForm,
  formData,
  portfolioSummary,
  opportunities,
  onShowForm,
  onFormChange,
  onAddPosition,
  onCancelForm,
  onDeletePosition,
}: {
  positions: PortfolioPosition[]
  showForm: boolean
  formData: PositionFormData
  portfolioSummary: { totalValue: number; totalCost: number; totalGainLoss: number; lossPositions: number }
  opportunities: LossHarvestingOpportunity[]
  onShowForm: () => void
  onFormChange: (data: PositionFormData) => void
  onAddPosition: () => void
  onCancelForm: () => void
  onDeletePosition: (id: string) => void
}) {
  return (
    <div className="space-y-4">
      {positions.length > 0 && <PortfolioSummaryCard summary={portfolioSummary} />}

      {!showForm && (
        <Button onClick={onShowForm} className="w-full"><Plus className="h-4 w-4 mr-2" />Portfolio-Position hinzufügen</Button>
      )}

      {showForm && (<PortfolioPositionForm formData={formData} onChange={onFormChange} onAdd={onAddPosition} onCancel={onCancelForm} />)}

      {positions.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Deine Positionen</h4>
          <div className="space-y-2">{positions.map(position => (<PortfolioPositionCard key={position.id} position={position} onDelete={onDeletePosition} />))}</div>
        </div>
      )}

      {opportunities.length > 0 && <OpportunitiesList opportunities={opportunities} />}
      <NoOpportunitiesMessage hasPositions={positions.length > 0 && opportunities.length === 0} />
    </div>
  )
}

/**
 * Portfolio Tracker Section for Tax Loss Harvesting
 *
 * Allows users to track their portfolio positions and automatically identifies
 * tax loss harvesting opportunities with wash-sale rule checking.
 */
export function PortfolioTrackerSection({ taxRate, teilfreistellungsquote }: PortfolioTrackerSectionProps) {
  const [enabled, setEnabled] = useState(false)
  const [positions, setPositions] = useState<PortfolioPosition[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<PositionFormData>(getDefaultFormData())

  const enabledId = useMemo(() => generateFormId('portfolio-tracker', 'enabled'), [])

  const handleAddPosition = () => {
    const purchasePrice = parseFloat(formData.purchasePrice)
    const currentPrice = parseFloat(formData.currentPrice)
    const quantity = parseFloat(formData.quantity)
    const totalCost = purchasePrice * quantity

    const position = createPortfolioPosition(formData.id, formData.name, formData.symbol, formData.assetClass, new Date(formData.acquisitionDate), purchasePrice, currentPrice, quantity, totalCost, formData.isStockFund)

    setPositions([...positions, position])
    setFormData(getDefaultFormData())
    setShowForm(false)
  }

  const handleDeletePosition = (id: string) => setPositions(positions.filter(p => p.id !== id))

  const opportunities = useMemo(() => {
    if (!enabled || positions.length === 0) return []
    return identifyLossHarvestingOpportunities(positions, taxRate, teilfreistellungsquote, getDefaultTransactionCostConfig(), getDefaultWashSaleConfig())
  }, [enabled, positions, taxRate, teilfreistellungsquote])

  const portfolioSummary = useMemo(() => {
    const totalValue = positions.reduce((sum, p) => sum + p.currentValue, 0)
    const totalCost = positions.reduce((sum, p) => sum + p.totalCost, 0)
    const totalGainLoss = totalValue - totalCost
    const lossPositions = positions.filter(p => p.unrealizedGainLoss < 0).length
    return { totalValue, totalCost, totalGainLoss, lossPositions }
  }, [positions])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
        <div className="space-y-1">
          <Label className="text-base font-medium">📊 Portfolio Tax Loss Harvesting Tracker</Label>
          <p className="text-sm text-muted-foreground">Automatische Erkennung von Verlustrealisierungs-Möglichkeiten mit Wash-Sale-Prüfung</p>
        </div>
        <Switch id={enabledId} checked={enabled} onCheckedChange={setEnabled} />
      </div>

      {enabled && (<PortfolioContent positions={positions} showForm={showForm} formData={formData} portfolioSummary={portfolioSummary} opportunities={opportunities} onShowForm={() => setShowForm(true)} onFormChange={setFormData} onAddPosition={handleAddPosition} onCancelForm={() => { setShowForm(false); setFormData(getDefaultFormData()) }} onDeletePosition={handleDeletePosition} />)}
    </div>
  )
}
