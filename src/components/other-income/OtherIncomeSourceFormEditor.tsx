import React from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Slider } from '../ui/slider'
import { Switch } from '../ui/switch'
import { Calculator } from 'lucide-react'
import {
  type OtherIncomeSource,
  type IncomeType,
  createDefaultRealEstateConfig,
  createDefaultKindergeldConfig,
} from '../../../helpers/other-income'
import { useFormId } from '../../utils/unique-id'
import { RealEstateConfigSection } from './RealEstateConfigSection'
import { KindergeldConfigSection } from './KindergeldConfigSection'

interface OtherIncomeSourceFormEditorProps {
  editingSource: OtherIncomeSource
  isAddingNew: boolean
  onUpdate: (source: OtherIncomeSource) => void
  onSave: () => void
  onCancel: () => void
}

export function OtherIncomeSourceFormEditor({
  editingSource,
  isAddingNew,
  onUpdate,
  onSave,
  onCancel,
}: OtherIncomeSourceFormEditorProps) {
  const monthlyAmountId = useFormId('other-income', 'monthly-amount')
  const currentYear = new Date().getFullYear()

  // Helper to configure real estate settings based on income type
  const configureRealEstateSettings = (source: OtherIncomeSource, newType: IncomeType) => {
    if (newType === 'rental' && !source.realEstateConfig) {
      source.realEstateConfig = createDefaultRealEstateConfig()
    }
    else if (newType !== 'rental' && source.realEstateConfig) {
      delete source.realEstateConfig
    }
  }

  // Helper to configure Kindergeld settings based on income type
  const configureKindergeldSettings = (source: OtherIncomeSource, newType: IncomeType) => {
    if (newType === 'kindergeld' && !source.kindergeldConfig) {
      source.kindergeldConfig = createDefaultKindergeldConfig()
      // Set appropriate defaults for Kindergeld
      source.amountType = 'net' // Kindergeld is tax-free
      source.taxRate = 0
      source.inflationRate = 0
      source.monthlyAmount = 250
    }
    else if (newType !== 'kindergeld' && source.kindergeldConfig) {
      delete source.kindergeldConfig
    }
  }

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as IncomeType
    const updatedSource = { ...editingSource, type: newType }

    configureRealEstateSettings(updatedSource, newType)
    configureKindergeldSettings(updatedSource, newType)

    onUpdate(updatedSource)
  }

  return (
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
            onChange={e => onUpdate({ ...editingSource, name: e.target.value })}
            placeholder="z.B. Mieteinnahmen Wohnung 1"
          />
        </div>

        {/* Type */}
        <div className="space-y-2">
          <Label htmlFor="source-type">Art der Einkünfte</Label>
          <select
            id="source-type"
            value={editingSource.type}
            onChange={handleTypeChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="rental">Mieteinnahmen</option>
            <option value="pension">Rente/Pension</option>
            <option value="business">Gewerbeeinkünfte</option>
            <option value="investment">Kapitalerträge</option>
            <option value="kindergeld">Kindergeld</option>
            <option value="other">Sonstige Einkünfte</option>
          </select>
        </div>

        {/* Amount Type (Gross/Net) Slider - Hide for Kindergeld */}
        {editingSource.type !== 'kindergeld' && (
          <div className="space-y-2">
            <Label>Einkunftsart</Label>
            <div className="flex items-center justify-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <span className={`text-sm ${editingSource.amountType === 'gross' ? 'font-bold text-blue-600' : 'text-gray-500'}`}>
                Brutto
              </span>
              <Switch
                checked={editingSource.amountType === 'net'}
                onCheckedChange={isNet =>
                  onUpdate({
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
                ? 'Bei Brutto-Einkünften wird automatisch die Steuer abgezogen'
                : 'Netto-Einkünfte werden bereits nach Steuern angegeben'}
            </p>
          </div>
        )}

        {/* Monthly Amount - Disabled for Kindergeld */}
        <div className="space-y-2">
          <Label htmlFor={monthlyAmountId}>
            Monatlicher Betrag (€)
            {editingSource.type !== 'kindergeld' && (editingSource.amountType === 'gross' ? ' - Brutto' : ' - Netto')}
          </Label>
          <Input
            id={monthlyAmountId}
            type="number"
            value={editingSource.monthlyAmount}
            onChange={e => onUpdate({
              ...editingSource,
              monthlyAmount: Number(e.target.value) || 0,
            })}
            min={0}
            step={100}
            disabled={editingSource.type === 'kindergeld'}
          />
          {editingSource.type === 'kindergeld' && (
            <p className="text-xs text-gray-600">
              Kindergeld-Betrag ist festgelegt (250€/Monat, Stand 2024)
            </p>
          )}
        </div>

        {/* Tax Rate (only for gross income) */}
        {editingSource.amountType === 'gross' && (
          <div className="space-y-2">
            <Label>Steuersatz (%)</Label>
            <Slider
              value={[editingSource.taxRate]}
              onValueChange={values => onUpdate({
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
              onChange={e => onUpdate({
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
              onChange={e => onUpdate({
                ...editingSource,
                endYear: e.target.value ? Number(e.target.value) : null,
              })}
              min={editingSource.startYear}
              max={2080}
              placeholder="Unbegrenzt"
            />
          </div>
        </div>

        {/* Inflation Rate - Hide for Kindergeld */}
        {editingSource.type !== 'kindergeld' && (
          <div className="space-y-2">
            <Label>Inflationsanpassung (%)</Label>
            <Slider
              value={[editingSource.inflationRate]}
              onValueChange={values => onUpdate({
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
        )}

        {/* Real Estate Configuration - only for rental income */}
        {editingSource.type === 'rental' && (
          <RealEstateConfigSection
            editingSource={editingSource}
            onUpdate={onUpdate}
          />
        )}

        {/* Kindergeld Configuration - only for kindergeld income */}
        {editingSource.type === 'kindergeld' && (
          <KindergeldConfigSection
            editingSource={editingSource}
            onUpdate={onUpdate}
          />
        )}

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notizen (optional)</Label>
          <textarea
            id="notes"
            value={editingSource.notes || ''}
            onChange={e => onUpdate({
              ...editingSource,
              notes: e.target.value,
            })}
            placeholder="Zusätzliche Informationen zu dieser Einkommensquelle"
            rows={2}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button onClick={onSave} size="lg" className="flex-1 w-full sm:w-auto">
            <Calculator className="h-4 w-4 mr-2" />
            {isAddingNew ? 'Hinzufügen' : 'Aktualisieren'}
          </Button>
          <Button onClick={onCancel} variant="outline" size="lg" className="w-full sm:w-auto">
            Abbrechen
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
