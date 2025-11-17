import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import {
  type OtherIncomeSource,
  type IncomeType,
  createDefaultRealEstateConfig,
  createDefaultKindergeldConfig,
  createDefaultBURenteConfig,
  createDefaultKapitallebensversicherungConfig,
} from '../../../helpers/other-income'
import { useFormId } from '../../utils/unique-id'
import { NameInputSection } from './NameInputSection'
import { TypeSelectSection } from './TypeSelectSection'
import { NotesSection } from './NotesSection'
import { ActionButtonsSection } from './ActionButtonsSection'
import { FormConfigurationSections } from './FormConfigurationSections'

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
  } else if (newType !== 'rental' && source.realEstateConfig) {
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
  } else if (newType !== 'kindergeld' && source.kindergeldConfig) {
    delete source.kindergeldConfig
  }
}

// Helper to apply BU-Rente defaults
function applyBURenteDefaults(source: OtherIncomeSource): void {
  source.buRenteConfig = createDefaultBURenteConfig()
  source.amountType = 'gross'
  source.taxRate = 25.0 // Typical personal income tax rate
  source.inflationRate = 0 // BU-Rente typically has fixed amounts
  source.monthlyAmount = 1500
}

// Helper to configure BU-Rente settings based on income type
function configureBURenteSettings(source: OtherIncomeSource, newType: IncomeType): void {
  if (newType === 'bu_rente' && !source.buRenteConfig) {
    applyBURenteDefaults(source)
  } else if (newType !== 'bu_rente' && source.buRenteConfig) {
    delete source.buRenteConfig
  }
}

// Helper to apply Kapitallebensversicherung defaults
function applyKapitallebensversicherungDefaults(source: OtherIncomeSource): void {
  source.kapitallebensversicherungConfig = createDefaultKapitallebensversicherungConfig()
  source.amountType = 'gross'
  source.taxRate = 26.375 // Abgeltungsteuer
  source.inflationRate = 0 // Lump sum, no inflation
  source.monthlyAmount = 0 // Will be calculated from total payout
}

// Helper to configure Kapitallebensversicherung settings based on income type
function configureKapitallebensversicherungSettings(source: OtherIncomeSource, newType: IncomeType): void {
  if (newType === 'kapitallebensversicherung' && !source.kapitallebensversicherungConfig) {
    applyKapitallebensversicherungDefaults(source)
  } else if (newType !== 'kapitallebensversicherung' && source.kapitallebensversicherungConfig) {
    delete source.kapitallebensversicherungConfig
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
  configureBURenteSettings(updatedSource, newType)
  configureKapitallebensversicherungSettings(updatedSource, newType)
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
  const isBURente = editingSource.type === 'bu_rente'
  const isRental = editingSource.type === 'rental'
  const isKapitallebensversicherung = editingSource.type === 'kapitallebensversicherung'
  const isGrossIncome = editingSource.amountType === 'gross'

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleIncomeTypeChange(e.target.value as IncomeType, editingSource, onUpdate)
  }

  return (
    <Card className="mb-6 border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="text-base">{getFormTitle(isAddingNew)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <NameInputSection editingSource={editingSource} onUpdate={onUpdate} />
        <TypeSelectSection editingSource={editingSource} onTypeChange={handleTypeChange} />
        <FormConfigurationSections
          editingSource={editingSource}
          monthlyAmountId={monthlyAmountId}
          currentYear={currentYear}
          isKindergeld={isKindergeld}
          isBURente={isBURente}
          isRental={isRental}
          isKapitallebensversicherung={isKapitallebensversicherung}
          isGrossIncome={isGrossIncome}
          onUpdate={onUpdate}
        />
        <NotesSection editingSource={editingSource} onUpdate={onUpdate} />
        <ActionButtonsSection isAddingNew={isAddingNew} onSave={onSave} onCancel={onCancel} />
      </CardContent>
    </Card>
  )
}
