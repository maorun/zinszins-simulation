import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Slider } from './ui/slider'
import { Switch } from './ui/switch'
import { ChevronDown, Plus, Trash2, Calculator } from 'lucide-react'
import {
  type OtherIncomeConfiguration,
  type OtherIncomeSource,
  type IncomeType,
  createDefaultOtherIncomeSource,
  getIncomeTypeDisplayName,
  getAmountTypeDisplayName,
} from '../../helpers/other-income'
import { toast } from 'sonner'

interface OtherIncomeConfigurationProps {
  config: OtherIncomeConfiguration
  onChange: (config: OtherIncomeConfiguration) => void
}

export function OtherIncomeConfigurationComponent({
  config,
  onChange,
}: OtherIncomeConfigurationProps) {
  const [editingSource, setEditingSource] = useState<OtherIncomeSource | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)

  const handleConfigChange = (updates: Partial<OtherIncomeConfiguration>) => {
    onChange({ ...config, ...updates })
  }

  const handleSourceChange = (sourceId: string, updates: Partial<OtherIncomeSource>) => {
    const updatedSources = config.sources.map(source =>
      source.id === sourceId ? { ...source, ...updates } : source,
    )
    handleConfigChange({ sources: updatedSources })
  }

  const handleAddSource = () => {
    const newSource = createDefaultOtherIncomeSource()
    setEditingSource(newSource)
    setIsAddingNew(true)
  }

  const handleSaveSource = () => {
    if (!editingSource) return

    if (isAddingNew) {
      handleConfigChange({
        sources: [...config.sources, editingSource],
      })
      toast.success('Einkommensquelle erfolgreich hinzugefügt!')
    }
    else {
      handleSourceChange(editingSource.id, editingSource)
      toast.success('Einkommensquelle erfolgreich aktualisiert!')
    }

    setEditingSource(null)
    setIsAddingNew(false)
  }

  const handleCancelEdit = () => {
    setEditingSource(null)
    setIsAddingNew(false)
  }

  const handleDeleteSource = (sourceId: string) => {
    const updatedSources = config.sources.filter(source => source.id !== sourceId)
    handleConfigChange({ sources: updatedSources })
    toast.success('Einkommensquelle erfolgreich entfernt!')
  }

  const handleEditSource = (source: OtherIncomeSource) => {
    setEditingSource({ ...source })
    setIsAddingNew(false)
  }

  const currentYear = new Date().getFullYear()

  return (
    <Card className="mb-6">
      <Collapsible defaultOpen={false}>
        <CardHeader className="pb-4">
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                💰 Andere Einkünfte
              </CardTitle>
              <ChevronDown className="h-5 w-5 text-gray-500" />
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                Hier können Sie zusätzliche Einkünfte wie Mieteinnahmen, private Renten oder
                Gewerbeeinkünfte hinzufügen. Diese werden in der Entnahmephase als zusätzliches
                Einkommen berücksichtigt und können die notwendigen Entnahmen aus dem Portfolio reduzieren.
              </p>
            </div>

            {/* Enable/Disable Toggle */}
            <div className="mb-6 space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="other-income-enabled" className="text-base font-medium">
                  Andere Einkünfte aktivieren
                </Label>
                <Switch
                  id="other-income-enabled"
                  checked={config.enabled}
                  onCheckedChange={enabled => handleConfigChange({ enabled })}
                />
              </div>
              <p className="text-sm text-gray-600">
                Aktivieren Sie diese Option, um zusätzliche Einkommensquellen zu berücksichtigen.
              </p>
            </div>

            {config.enabled && (
              <>
                {/* Add New Source Button */}
                <div className="mb-6">
                  <Button
                    onClick={handleAddSource}
                    variant="outline"
                    size="lg"
                    className="w-full"
                    disabled={editingSource !== null}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Neue Einkommensquelle hinzufügen
                  </Button>
                </div>

                {/* Edit/Add Source Form */}
                {editingSource && (
                  <Card className="mb-6 border-2 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-base">
                        {isAddingNew ? 'Neue Einkommensquelle' : 'Einkommensquelle bearbeiten'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Name */}
                      <div className="space-y-2">
                        <Label htmlFor="source-name">Bezeichnung</Label>
                        <Input
                          id="source-name"
                          value={editingSource.name}
                          onChange={e => setEditingSource({ ...editingSource, name: e.target.value })}
                          placeholder="z.B. Mieteinnahmen Wohnung 1"
                        />
                      </div>

                      {/* Type */}
                      <div className="space-y-2">
                        <Label htmlFor="source-type">Art der Einkünfte</Label>
                        <select
                          id="source-type"
                          value={editingSource.type}
                          onChange={e =>
                            setEditingSource({ ...editingSource, type: e.target.value as IncomeType })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="rental">Mieteinnahmen</option>
                          <option value="pension">Rente/Pension</option>
                          <option value="business">Gewerbeeinkünfte</option>
                          <option value="investment">Kapitalerträge</option>
                          <option value="other">Sonstige Einkünfte</option>
                        </select>
                      </div>

                      {/* Amount Type (Gross/Net) Slider */}
                      <div className="space-y-2">
                        <Label>Einkunftsart</Label>
                        <div className="flex items-center justify-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          <span className={`text-sm ${editingSource.amountType === 'gross' ? 'font-bold text-blue-600' : 'text-gray-500'}`}>
                            Brutto
                          </span>
                          <Switch
                            checked={editingSource.amountType === 'net'}
                            onCheckedChange={isNet =>
                              setEditingSource({
                                ...editingSource,
                                amountType: isNet ? 'net' : 'gross',
                              })}
                          />
                          <span className={`text-sm ${editingSource.amountType === 'net' ? 'font-bold text-blue-600' : 'text-gray-500'}`}>
                            Netto
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          {editingSource.amountType === 'gross'
                            ? 'Bei Bruttoeinkünften wird automatisch die Steuer abgezogen'
                            : 'Nettoeinkünfte werden bereits nach Steuern angegeben'}
                        </p>
                      </div>

                      {/* Monthly Amount */}
                      <div className="space-y-2">
                        <Label htmlFor="monthly-amount">
                          Monatlicher Betrag (€)
                          {editingSource.amountType === 'gross' ? ' - Brutto' : ' - Netto'}
                        </Label>
                        <Input
                          id="monthly-amount"
                          type="number"
                          value={editingSource.monthlyAmount}
                          onChange={e => setEditingSource({
                            ...editingSource,
                            monthlyAmount: Number(e.target.value) || 0,
                          })}
                          min={0}
                          step={100}
                        />
                      </div>

                      {/* Tax Rate (only for gross income) */}
                      {editingSource.amountType === 'gross' && (
                        <div className="space-y-2">
                          <Label>Steuersatz (%)</Label>
                          <Slider
                            value={[editingSource.taxRate]}
                            onValueChange={values => setEditingSource({
                              ...editingSource,
                              taxRate: values[0],
                            })}
                            min={0}
                            max={50}
                            step={0.5}
                            className="mt-2"
                          />
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>0%</span>
                            <span className="font-medium text-gray-900">
                              {editingSource.taxRate.toFixed(1)}
                              %
                            </span>
                            <span>50%</span>
                          </div>
                        </div>
                      )}

                      {/* Time Period */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="start-year">Startjahr</Label>
                          <Input
                            id="start-year"
                            type="number"
                            value={editingSource.startYear}
                            onChange={e => setEditingSource({
                              ...editingSource,
                              startYear: Number(e.target.value) || currentYear,
                            })}
                            min={2020}
                            max={2080}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="end-year">Endjahr (optional)</Label>
                          <Input
                            id="end-year"
                            type="number"
                            value={editingSource.endYear || ''}
                            onChange={e => setEditingSource({
                              ...editingSource,
                              endYear: e.target.value ? Number(e.target.value) : null,
                            })}
                            min={editingSource.startYear}
                            max={2080}
                            placeholder="Unbegrenzt"
                          />
                        </div>
                      </div>

                      {/* Inflation Rate */}
                      <div className="space-y-2">
                        <Label>Inflationsanpassung (%)</Label>
                        <Slider
                          value={[editingSource.inflationRate]}
                          onValueChange={values => setEditingSource({
                            ...editingSource,
                            inflationRate: values[0],
                          })}
                          min={0}
                          max={8}
                          step={0.1}
                          className="mt-2"
                        />
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>0%</span>
                          <span className="font-medium text-gray-900">
                            {editingSource.inflationRate.toFixed(1)}
                            %
                          </span>
                          <span>8%</span>
                        </div>
                        <p className="text-xs text-gray-600">
                          Jährliche Steigerung der Einkünfte (z.B. Mietanpassungen)
                        </p>
                      </div>

                      {/* Notes */}
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notizen (optional)</Label>
                        <textarea
                          id="notes"
                          value={editingSource.notes || ''}
                          onChange={e => setEditingSource({
                            ...editingSource,
                            notes: e.target.value,
                          })}
                          placeholder="Zusätzliche Informationen zu dieser Einkommensquelle"
                          rows={2}
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleSaveSource} size="lg" className="flex-1">
                          <Calculator className="h-4 w-4 mr-2" />
                          {isAddingNew ? 'Hinzufügen' : 'Aktualisieren'}
                        </Button>
                        <Button onClick={handleCancelEdit} variant="outline" size="lg">
                          Abbrechen
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Existing Sources List */}
                {config.sources.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold">Konfigurierte Einkommensquellen</h3>
                    {config.sources.map(source => (
                      <Card key={source.id} className="border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">{source.name}</h4>
                                <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                                  {getIncomeTypeDisplayName(source.type)}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  source.amountType === 'gross'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                                >
                                  {getAmountTypeDisplayName(source.amountType)}
                                </span>
                                <Switch
                                  checked={source.enabled}
                                  onCheckedChange={enabled => handleSourceChange(source.id, { enabled })}
                                />
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <div>
                                  💰
                                  {' '}
                                  {source.monthlyAmount.toLocaleString('de-DE')}
                                  {' '}
                                  €/Monat
                                  (
                                  {(source.monthlyAmount * 12).toLocaleString('de-DE')}
                                  {' '}
                                  €/Jahr)
                                </div>
                                <div>
                                  📅
                                  {' '}
                                  {source.startYear}
                                  {' '}
                                  -
                                  {' '}
                                  {source.endYear || 'Unbegrenzt'}
                                </div>
                                <div>
                                  📈
                                  {' '}
                                  {source.inflationRate}
                                  % Inflation
                                  {source.amountType === 'gross' && `, ${source.taxRate}% Steuersatz`}
                                </div>
                                {source.notes && (
                                  <div className="text-gray-500">
                                    📝
                                    {source.notes}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                onClick={() => handleEditSource(source)}
                                variant="outline"
                                size="sm"
                                disabled={editingSource !== null}
                              >
                                Bearbeiten
                              </Button>
                              <Button
                                onClick={() => handleDeleteSource(source.id)}
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {config.sources.length === 0 && !editingSource && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Noch keine Einkommensquellen konfiguriert.</p>
                    <p className="text-sm">Klicken Sie oben auf "Neue Einkommensquelle hinzufügen" um zu beginnen.</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
