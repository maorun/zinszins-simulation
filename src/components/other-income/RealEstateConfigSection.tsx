import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Slider } from '../ui/slider'
import { Switch } from '../ui/switch'
import type { OtherIncomeSource } from '../../../helpers/other-income'
import { useFormId } from '../../utils/unique-id'

interface RealEstateConfigSectionProps {
  editingSource: OtherIncomeSource
  onUpdate: (source: OtherIncomeSource) => void
}

// eslint-disable-next-line max-lines-per-function -- Large component function
export function RealEstateConfigSection({
  editingSource,
  onUpdate,
}: RealEstateConfigSectionProps) {
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

      {/* Property Value */}
      <div className="space-y-2">
        <Label htmlFor={propertyValueId}>Immobilienwert (€)</Label>
        <Input
          id={propertyValueId}
          type="number"
          value={editingSource.realEstateConfig.propertyValue}
          onChange={e => onUpdate({
            ...editingSource,
            realEstateConfig: {
              ...editingSource.realEstateConfig!,
              propertyValue: Number(e.target.value) || 0,
            },
          })}
          min={0}
          step={10000}
        />
        <p className="text-xs text-gray-600">
          Aktueller Marktwert der Immobilie für Wertsteigerungsberechnungen
        </p>
      </div>

      {/* Maintenance Cost Percentage */}
      <div className="space-y-2">
        <Label>Instandhaltungskosten (% der Mieteinnahmen)</Label>
        <Slider
          value={[editingSource.realEstateConfig.maintenanceCostPercent]}
          onValueChange={values => onUpdate({
            ...editingSource,
            realEstateConfig: {
              ...editingSource.realEstateConfig!,
              maintenanceCostPercent: values[0],
            },
          })}
          min={0}
          max={30}
          step={0.5}
          className="mt-2"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>0%</span>
          <span className="font-medium text-gray-900">
            {editingSource.realEstateConfig.maintenanceCostPercent.toFixed(1)}
            %
          </span>
          <span>30%</span>
        </div>
        <p className="text-xs text-gray-600">
          Reparaturen, Renovierungen, Verwaltungskosten (Richtwert: 15-20%)
        </p>
      </div>

      {/* Vacancy Rate */}
      <div className="space-y-2">
        <Label>Leerstandsquote (%)</Label>
        <Slider
          value={[editingSource.realEstateConfig.vacancyRatePercent]}
          onValueChange={values => onUpdate({
            ...editingSource,
            realEstateConfig: {
              ...editingSource.realEstateConfig!,
              vacancyRatePercent: values[0],
            },
          })}
          min={0}
          max={20}
          step={0.5}
          className="mt-2"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>0%</span>
          <span className="font-medium text-gray-900">
            {editingSource.realEstateConfig.vacancyRatePercent.toFixed(1)}
            %
          </span>
          <span>20%</span>
        </div>
        <p className="text-xs text-gray-600">
          Erwarteter jährlicher Leerstand (Richtwert: 3-5%)
        </p>
      </div>

      {/* Monthly Mortgage Payment */}
      <div className="space-y-2">
        <Label htmlFor={mortgagePaymentId}>Monatliche Finanzierungsrate (€)</Label>
        <Input
          id={mortgagePaymentId}
          type="number"
          value={editingSource.realEstateConfig.monthlyMortgagePayment}
          onChange={e => onUpdate({
            ...editingSource,
            realEstateConfig: {
              ...editingSource.realEstateConfig!,
              monthlyMortgagePayment: Number(e.target.value) || 0,
            },
          })}
          min={0}
          step={50}
        />
        <p className="text-xs text-gray-600">
          Monatliche Rate für Immobilienfinanzierung (0 = keine Finanzierung)
        </p>
      </div>

      {/* Property Appreciation */}
      <div className="space-y-2">
        <Label>Jährliche Wertsteigerung (%)</Label>
        <Slider
          value={[editingSource.realEstateConfig.propertyAppreciationRate]}
          onValueChange={values => onUpdate({
            ...editingSource,
            realEstateConfig: {
              ...editingSource.realEstateConfig!,
              propertyAppreciationRate: values[0],
            },
          })}
          min={0}
          max={8}
          step={0.1}
          className="mt-2"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>0%</span>
          <span className="font-medium text-gray-900">
            {editingSource.realEstateConfig.propertyAppreciationRate.toFixed(1)}
            %
          </span>
          <span>8%</span>
        </div>
        <p className="text-xs text-gray-600">
          Erwartete jährliche Wertsteigerung der Immobilie (Richtwert: 2-3%)
        </p>
      </div>

      {/* Include Appreciation Toggle */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="include-appreciation" className="text-sm font-medium">
            Wertsteigerung in Berechnung einbeziehen
          </Label>
          <Switch
            id="include-appreciation"
            checked={editingSource.realEstateConfig.includeAppreciation}
            onCheckedChange={includeAppreciation => onUpdate({
              ...editingSource,
              realEstateConfig: {
                ...editingSource.realEstateConfig!,
                includeAppreciation,
              },
            })}
          />
        </div>
        <p className="text-xs text-gray-600">
          {editingSource.realEstateConfig.includeAppreciation
            ? 'Wertsteigerung wird als zusätzliches Einkommen berücksichtigt'
            : 'Nur Mieteinnahmen werden berücksichtigt (konservativer Ansatz)'}
        </p>
      </div>
    </div>
  )
}
