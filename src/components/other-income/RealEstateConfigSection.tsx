import type { OtherIncomeSource } from '../../../helpers/other-income'
import { useFormId } from '../../utils/unique-id'
import { PropertyValueInput } from './PropertyValueInput'
import { MaintenanceCostSlider } from './MaintenanceCostSlider'
import { VacancyRateSlider } from './VacancyRateSlider'
import { MortgagePaymentInput } from './MortgagePaymentInput'
import { PropertyAppreciationSlider } from './PropertyAppreciationSlider'
import { AppreciationToggle } from './AppreciationToggle'

interface RealEstateConfigSectionProps {
  editingSource: OtherIncomeSource
  onUpdate: (source: OtherIncomeSource) => void
}

export function RealEstateConfigSection({ editingSource, onUpdate }: RealEstateConfigSectionProps) {
  const propertyValueId = useFormId('other-income-real-estate', 'property-value')
  const mortgagePaymentId = useFormId('other-income-real-estate', 'mortgage-payment')

  if (!editingSource.realEstateConfig) {
    return null
  }

  return (
    <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
      <h4 className="text-sm font-semibold text-green-800 flex items-center gap-2">
        🏠 Immobilien-spezifische Einstellungen
      </h4>

      <PropertyValueInput editingSource={editingSource} propertyValueId={propertyValueId} onUpdate={onUpdate} />

      <MaintenanceCostSlider editingSource={editingSource} onUpdate={onUpdate} />

      <VacancyRateSlider editingSource={editingSource} onUpdate={onUpdate} />

      <MortgagePaymentInput editingSource={editingSource} mortgagePaymentId={mortgagePaymentId} onUpdate={onUpdate} />

      <PropertyAppreciationSlider editingSource={editingSource} onUpdate={onUpdate} />

      <AppreciationToggle editingSource={editingSource} onUpdate={onUpdate} />
    </div>
  )
}
