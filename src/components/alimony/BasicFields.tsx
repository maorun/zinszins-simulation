import { Label } from '../ui/label'
import { Input } from '../ui/input'
import type { AlimonyPaymentConfig } from '../../../helpers/alimony'
import { TYPE_LABELS, FREQUENCY_LABELS } from './formConstants'

interface BasicFieldsProps {
  payment: AlimonyPaymentConfig
  typeId: string
  monthlyAmountId: string
  startYearId: string
  endYearId: string
  recipientsId: string
  frequencyId: string
  handleFieldChange: (field: keyof AlimonyPaymentConfig, value: unknown) => void
}

function TypeAndAmountFields({
  payment,
  typeId,
  monthlyAmountId,
  handleFieldChange,
}: Pick<BasicFieldsProps, 'payment' | 'typeId' | 'monthlyAmountId' | 'handleFieldChange'>) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={typeId}>Art der Zahlung</Label>
        <select
          id={typeId}
          value={payment.type}
          onChange={e => handleFieldChange('type', e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        >
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={monthlyAmountId}>Monatlicher Betrag (€)</Label>
        <Input
          id={monthlyAmountId}
          type="number"
          min="0"
          step="50"
          value={payment.monthlyAmount}
          onChange={e => handleFieldChange('monthlyAmount', parseFloat(e.target.value) || 0)}
        />
      </div>
    </>
  )
}

function YearFields({
  payment,
  startYearId,
  endYearId,
  handleFieldChange,
}: Pick<BasicFieldsProps, 'payment' | 'startYearId' | 'endYearId' | 'handleFieldChange'>) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={startYearId}>Startjahr</Label>
        <Input
          id={startYearId}
          type="number"
          min="2000"
          max="2100"
          value={payment.startYear}
          onChange={e => handleFieldChange('startYear', parseInt(e.target.value) || new Date().getFullYear())}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={endYearId}>Endjahr (leer = unbegrenzt)</Label>
        <Input
          id={endYearId}
          type="number"
          min="2000"
          max="2100"
          value={payment.endYear || ''}
          onChange={e => handleFieldChange('endYear', e.target.value ? parseInt(e.target.value) : null)}
          placeholder="Unbegrenzt"
        />
      </div>
    </>
  )
}

function RecipientAndFrequencyFields({
  payment,
  recipientsId,
  frequencyId,
  handleFieldChange,
}: Pick<BasicFieldsProps, 'payment' | 'recipientsId' | 'frequencyId' | 'handleFieldChange'>) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={recipientsId}>Anzahl Empfänger</Label>
        <Input
          id={recipientsId}
          type="number"
          min="1"
          max="10"
          value={payment.numberOfRecipients}
          onChange={e => handleFieldChange('numberOfRecipients', parseInt(e.target.value) || 1)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={frequencyId}>Zahlungsfrequenz</Label>
        <select
          id={frequencyId}
          value={payment.frequency}
          onChange={e => handleFieldChange('frequency', e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        >
          {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </>
  )
}

export function BasicFields(props: BasicFieldsProps) {
  return (
    <>
      <TypeAndAmountFields {...props} />
      <YearFields {...props} />
      <RecipientAndFrequencyFields {...props} />
    </>
  )
}
