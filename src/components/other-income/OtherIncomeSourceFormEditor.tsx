import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
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
import { NameInputSection } from './NameInputSection'
import { TypeSelectSection } from './TypeSelectSection'
import { NotesSection } from './NotesSection'
import { ActionButtonsSection } from './ActionButtonsSection'

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
        <NameInputSection editingSource={editingSource} onUpdate={onUpdate} />
        <TypeSelectSection editingSource={editingSource} onTypeChange={handleTypeChange} />

        {!isKindergeld && (
          <AmountTypeSection editingSource={editingSource} onUpdate={onUpdate} />
        )}

        <MonthlyAmountSection
          editingSource={editingSource}
          monthlyAmountId={monthlyAmountId}
          isKindergeld={isKindergeld}
          isGrossIncome={isGrossIncome}
          onUpdate={onUpdate}
        />

        {isGrossIncome && (
          <TaxRateSection editingSource={editingSource} onUpdate={onUpdate} />
        )}

        <TimePeriodSection
          editingSource={editingSource}
          currentYear={currentYear}
          onUpdate={onUpdate}
        />

        {!isKindergeld && (
          <InflationRateSection editingSource={editingSource} onUpdate={onUpdate} />
        )}

        {isRental && (
          <RealEstateConfigSection
            editingSource={editingSource}
            onUpdate={onUpdate}
          />
        )}

        {isKindergeld && (
          <KindergeldConfigSection
            editingSource={editingSource}
            onUpdate={onUpdate}
          />
        )}

        <NotesSection editingSource={editingSource} onUpdate={onUpdate} />
        <ActionButtonsSection isAddingNew={isAddingNew} onSave={onSave} onCancel={onCancel} />
      </CardContent>
    </Card>
  )
}
