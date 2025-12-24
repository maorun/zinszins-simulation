import { Info } from 'lucide-react'
import { Label } from '../ui/label'
import type { AlimonyPaymentConfig } from '../../../helpers/alimony'
import { TAX_TREATMENT_LABELS } from './formConstants'

interface TaxFieldsProps {
  payment: AlimonyPaymentConfig
  taxTreatmentId: string
  realsplittingId: string
  handleFieldChange: (field: keyof AlimonyPaymentConfig, value: unknown) => void
}

function ChildSupportInfo() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
      <div className="flex gap-2 items-start">
        <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-amber-900">
          <p>Kindesunterhalt ist steuerlich nicht absetzbar.</p>
        </div>
      </div>
    </div>
  )
}

function TaxTreatmentSelect({
  payment,
  taxTreatmentId,
  handleFieldChange,
}: Pick<TaxFieldsProps, 'payment' | 'taxTreatmentId' | 'handleFieldChange'>) {
  return (
    <div className="space-y-2 md:col-span-2">
      <Label htmlFor={taxTreatmentId}>Steuerliche Behandlung</Label>
      <select
        id={taxTreatmentId}
        value={payment.taxTreatment}
        onChange={e => handleFieldChange('taxTreatment', e.target.value)}
        className="w-full px-3 py-2 border rounded-md"
      >
        {Object.entries(TAX_TREATMENT_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  )
}

function RealsplittingField({
  payment,
  realsplittingId,
  handleFieldChange,
}: Pick<TaxFieldsProps, 'payment' | 'realsplittingId' | 'handleFieldChange'>) {
  if (payment.type !== 'spousal_support' || payment.taxTreatment !== 'sonderausgaben') {
    return null
  }

  return (
    <div className="space-y-2 md:col-span-2">
      <div className="flex items-center space-x-2">
        <input
          id={realsplittingId}
          type="checkbox"
          checked={payment.realsplittingAgreement}
          onChange={e => handleFieldChange('realsplittingAgreement', e.target.checked)}
          className="h-4 w-4"
        />
        <Label htmlFor={realsplittingId}>Realsplitting-Vereinbarung vorhanden</Label>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex gap-2 items-start">
          <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-900">
            <p>
              Mit Realsplitting-Vereinbarung sind bis zu 13.805€ pro Jahr als Sonderausgaben absetzbar (§10 Abs. 1a Nr.
              1 EStG).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function TaxFields(props: TaxFieldsProps) {
  if (props.payment.type === 'child_support') {
    return <ChildSupportInfo />
  }

  return (
    <>
      <TaxTreatmentSelect {...props} />
      <RealsplittingField {...props} />
    </>
  )
}
