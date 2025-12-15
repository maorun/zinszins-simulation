import type { ChangeEvent } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import {
  type OtherIncomeSource,
  type IncomeType,
  createDefaultRealEstateConfig,
  createDefaultKindergeldConfig,
  createDefaultElterngeldConfig,
  createDefaultBURenteConfig,
  createDefaultKapitallebensversicherungConfig,
  createDefaultPflegezusatzversicherungConfig,
  createDefaultRisikolebensversicherungConfig,
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

// Helper to apply Elterngeld defaults
function applyElterngeldDefaults(source: OtherIncomeSource): void {
  source.elterngeldConfig = createDefaultElterngeldConfig()
  source.amountType = 'net' // Elterngeld is tax-free (but subject to Progressionsvorbehalt)
  source.taxRate = 0
  source.inflationRate = 0 // Based on previous income, not inflation-adjusted
  source.monthlyAmount = 1200 // Default estimate (will be calculated from previous income)
}

// Helper to configure Elterngeld settings based on income type
function configureElterngeldSettings(source: OtherIncomeSource, newType: IncomeType): void {
  if (newType === 'elterngeld' && !source.elterngeldConfig) {
    applyElterngeldDefaults(source)
  } else if (newType !== 'elterngeld' && source.elterngeldConfig) {
    delete source.elterngeldConfig
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

// Helper to apply Pflegezusatzversicherung defaults
function applyPflegezusatzversicherungDefaults(source: OtherIncomeSource): void {
  source.pflegezusatzversicherungConfig = createDefaultPflegezusatzversicherungConfig()
  source.amountType = 'gross'
  source.taxRate = 0 // Care benefits are tax-free
  source.inflationRate = 2 // Benefits adjust with inflation
  source.monthlyAmount = 1500 // Default monthly benefit (1500€)
}

// Helper to configure Pflegezusatzversicherung settings based on income type
function configurePflegezusatzversicherungSettings(source: OtherIncomeSource, newType: IncomeType): void {
  if (newType === 'pflegezusatzversicherung' && !source.pflegezusatzversicherungConfig) {
    applyPflegezusatzversicherungDefaults(source)
  } else if (newType !== 'pflegezusatzversicherung' && source.pflegezusatzversicherungConfig) {
    delete source.pflegezusatzversicherungConfig
  }
}

// Helper to apply Risikolebensversicherung defaults
function applyRisikolebensversicherungDefaults(source: OtherIncomeSource): void {
  source.risikolebensversicherungConfig = createDefaultRisikolebensversicherungConfig()
  source.amountType = 'net'
  source.taxRate = 0 // Premiums are not tax-deductible
  source.inflationRate = 0 // Premiums typically fixed
  source.monthlyAmount = 0 // Will be calculated from coverage
}

// Helper to configure Risikolebensversicherung settings based on income type
function configureRisikolebensversicherungSettings(source: OtherIncomeSource, newType: IncomeType): void {
  if (newType === 'risikolebensversicherung' && !source.risikolebensversicherungConfig) {
    applyRisikolebensversicherungDefaults(source)
  } else if (newType !== 'risikolebensversicherung' && source.risikolebensversicherungConfig) {
    delete source.risikolebensversicherungConfig
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
  configureElterngeldSettings(updatedSource, newType)
  configureBURenteSettings(updatedSource, newType)
  configureKapitallebensversicherungSettings(updatedSource, newType)
  configurePflegezusatzversicherungSettings(updatedSource, newType)
  configureRisikolebensversicherungSettings(updatedSource, newType)
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
  const isElterngeld = editingSource.type === 'elterngeld'
  const isBURente = editingSource.type === 'bu_rente'
  const isRental = editingSource.type === 'rental'
  const isKapitallebensversicherung = editingSource.type === 'kapitallebensversicherung'
  const isPflegezusatzversicherung = editingSource.type === 'pflegezusatzversicherung'
  const isRisikolebensversicherung = editingSource.type === 'risikolebensversicherung'
  const isGrossIncome = editingSource.amountType === 'gross'

  const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
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
          isElterngeld={isElterngeld}
          isBURente={isBURente}
          isRental={isRental}
          isKapitallebensversicherung={isKapitallebensversicherung}
          isPflegezusatzversicherung={isPflegezusatzversicherung}
          isRisikolebensversicherung={isRisikolebensversicherung}
          isGrossIncome={isGrossIncome}
          onUpdate={onUpdate}
        />
        <NotesSection editingSource={editingSource} onUpdate={onUpdate} />
        <ActionButtonsSection isAddingNew={isAddingNew} onSave={onSave} onCancel={onCancel} />
      </CardContent>
    </Card>
  )
}
