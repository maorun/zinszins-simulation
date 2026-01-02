import { Label } from '../ui/label'
import { Input } from '../ui/input'
import type { EventFormValues } from './EventFormFields'

interface CareCostInputFieldsProps {
  customCostsId: string
  durationId: string
  inflationId: string
  formValues: EventFormValues
  onFormChange: (values: EventFormValues) => void
  typicalMonthlyCost: number
}

function CustomMonthlyCostsField({
  customCostsId,
  formValues,
  onFormChange,
  typicalMonthlyCost,
}: Pick<CareCostInputFieldsProps, 'customCostsId' | 'formValues' | 'onFormChange' | 'typicalMonthlyCost'>) {
  return (
    <div>
      <Label htmlFor={customCostsId}>Individuelle monatliche Kosten (optional)</Label>
      <Input
        id={customCostsId}
        type="number"
        min="0"
        step="100"
        placeholder={`Standard: ${typicalMonthlyCost.toLocaleString('de-DE')} €`}
        value={formValues.customMonthlyCosts}
        onChange={e => onFormChange({ ...formValues, customMonthlyCosts: e.target.value })}
      />
      <p className="text-xs text-gray-500 mt-1">Leer lassen für typische Kosten des gewählten Pflegegrads</p>
    </div>
  )
}

function CareDurationField({
  durationId,
  formValues,
  onFormChange,
}: Pick<CareCostInputFieldsProps, 'durationId' | 'formValues' | 'onFormChange'>) {
  return (
    <div>
      <Label htmlFor={durationId}>Pflegedauer (Jahre)</Label>
      <Input
        id={durationId}
        type="number"
        min="0"
        step="1"
        placeholder="0 = bis Lebensende"
        value={formValues.careDurationYears}
        onChange={e => onFormChange({ ...formValues, careDurationYears: e.target.value })}
      />
      <p className="text-xs text-gray-500 mt-1">0 oder leer = Pflegekosten bis zum Lebensende</p>
    </div>
  )
}

function CareInflationField({
  inflationId,
  formValues,
  onFormChange,
}: Pick<CareCostInputFieldsProps, 'inflationId' | 'formValues' | 'onFormChange'>) {
  return (
    <div>
      <Label htmlFor={inflationId}>Inflationsrate für Pflegekosten (%)</Label>
      <Input
        id={inflationId}
        type="number"
        min="0"
        max="20"
        step="0.5"
        value={formValues.careInflationRate}
        onChange={e => onFormChange({ ...formValues, careInflationRate: e.target.value })}
      />
      <p className="text-xs text-gray-500 mt-1">
        Pflegekosten steigen oft stärker als die allgemeine Inflation (typisch: 3-5%)
      </p>
    </div>
  )
}

export function CareCostInputFields(props: CareCostInputFieldsProps) {
  return (
    <>
      <CustomMonthlyCostsField {...props} />
      <CareDurationField {...props} />
      <CareInflationField {...props} />
    </>
  )
}
