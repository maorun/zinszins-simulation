import React from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
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
import { AmountTypeSection } from './AmountTypeSection'
import { TaxRateSection } from './TaxRateSection'
import { InflationRateSection } from './InflationRateSection'
import { MonthlyAmountSection } from './MonthlyAmountSection'
import { TimePeriodSection } from './TimePeriodSection'

interface OtherIncomeSourceFormEditorProps {
  editingSource: OtherIncomeSource
  isAddingNew: boolean
  onUpdate: (source: OtherIncomeSource) => void
  onSave: () => void
  onCancel: () => void
}

// Helper to configure real estate settings based on income type
function configureRealEstateSettings(source: OtherIncomeSource, newType: IncomeType): void {
  if (newType === 'rental' && !source.realEstateConfig) {
    source.realEstateConfig = createDefaultRealEstateConfig()
  }
  else if (newType !== 'rental' && source.realEstateConfig) {
    delete source.realEstateConfig
  }
}

// Helper to apply Kindergeld defaults
function applyKindergeldDefaults(source: OtherIncomeSource): void {
  source.kindergeldConfig = createDefaultKindergeldConfig()
  source.amountType = 'net' // Kindergeld is tax-free
  source.taxRate = 0
  source.inflationRate = 0
  source.monthlyAmount = 250
}

// Helper to configure Kindergeld settings based on income type
function configureKindergeldSettings(source: OtherIncomeSource, newType: IncomeType): void {
  if (newType === 'kindergeld' && !source.kindergeldConfig) {
    applyKindergeldDefaults(source)
  }
  else if (newType !== 'kindergeld' && source.kindergeldConfig) {
    delete source.kindergeldConfig
  }
}

// Helper to handle income type change
function handleIncomeTypeChange(
  newType: IncomeType,
  currentSource: OtherIncomeSource,
  onUpdate: (source: OtherIncomeSource) => void,
): void {
  const updatedSource = { ...currentSource, type: newType }
  configureRealEstateSettings(updatedSource, newType)
  configureKindergeldSettings(updatedSource, newType)
  onUpdate(updatedSource)
}

function getFormTitle(isAddingNew: boolean): string {
  return isAddingNew ? 'Neue Einkommensquelle' : 'Einkommensquelle bearbeiten'
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
  const isKindergeld = editingSource.type === 'kindergeld'
  const isRental = editingSource.type === 'rental'
  const isGrossIncome = editingSource.amountType === 'gross'

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleIncomeTypeChange(e.target.value as IncomeType, editingSource, onUpdate)
  }

  return (
    <Card className="mb-6 border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="text-base">
          {getFormTitle(isAddingNew)}
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
        {!isKindergeld && (
          <AmountTypeSection editingSource={editingSource} onUpdate={onUpdate} />
        )}

        {/* Monthly Amount - Disabled for Kindergeld */}
        <MonthlyAmountSection
          editingSource={editingSource}
          monthlyAmountId={monthlyAmountId}
          isKindergeld={isKindergeld}
          isGrossIncome={isGrossIncome}
          onUpdate={onUpdate}
        />

        {/* Tax Rate (only for gross income) */}
        {isGrossIncome && (
          <TaxRateSection editingSource={editingSource} onUpdate={onUpdate} />
        )}

        {/* Time Period */}
        <TimePeriodSection
          editingSource={editingSource}
          currentYear={currentYear}
          onUpdate={onUpdate}
        />

        {/* Inflation Rate - Hide for Kindergeld */}
        {!isKindergeld && (
          <InflationRateSection editingSource={editingSource} onUpdate={onUpdate} />
        )}

        {/* Real Estate Configuration - only for rental income */}
        {isRental && (
          <RealEstateConfigSection
            editingSource={editingSource}
            onUpdate={onUpdate}
          />
        )}

        {/* Kindergeld Configuration - only for kindergeld income */}
        {isKindergeld && (
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
