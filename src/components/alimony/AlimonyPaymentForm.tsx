import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Trash2 } from 'lucide-react'
import { generateFormId } from '../../utils/unique-id'
import { getSuggestedDescription, type AlimonyPaymentConfig } from '../../../helpers/alimony'
import { BasicFields } from './BasicFields'
import { TaxFields } from './TaxFields'

interface AlimonyPaymentFormProps {
  payment: AlimonyPaymentConfig
  index: number
  onUpdate: (index: number, payment: AlimonyPaymentConfig) => void
  onRemove: (index: number) => void
}

export function AlimonyPaymentForm({ payment, index, onUpdate, onRemove }: AlimonyPaymentFormProps) {
  const typeId = useMemo(() => generateFormId('alimony-payment', 'type', index.toString()), [index])
  const monthlyAmountId = useMemo(() => generateFormId('alimony-payment', 'monthly-amount', index.toString()), [index])
  const startYearId = useMemo(() => generateFormId('alimony-payment', 'start-year', index.toString()), [index])
  const endYearId = useMemo(() => generateFormId('alimony-payment', 'end-year', index.toString()), [index])
  const recipientsId = useMemo(() => generateFormId('alimony-payment', 'recipients', index.toString()), [index])
  const frequencyId = useMemo(() => generateFormId('alimony-payment', 'frequency', index.toString()), [index])
  const taxTreatmentId = useMemo(() => generateFormId('alimony-payment', 'tax-treatment', index.toString()), [index])
  const realsplittingId = useMemo(() => generateFormId('alimony-payment', 'realsplitting', index.toString()), [index])

  const handleFieldChange = (field: keyof AlimonyPaymentConfig, value: unknown) => {
    onUpdate(index, { ...payment, [field]: value })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">
            {payment.description || getSuggestedDescription(payment.type)} #{index + 1}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onRemove(index)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BasicFields
            payment={payment}
            typeId={typeId}
            monthlyAmountId={monthlyAmountId}
            startYearId={startYearId}
            endYearId={endYearId}
            recipientsId={recipientsId}
            frequencyId={frequencyId}
            handleFieldChange={handleFieldChange}
          />

          <TaxFields
            payment={payment}
            taxTreatmentId={taxTreatmentId}
            realsplittingId={realsplittingId}
            handleFieldChange={handleFieldChange}
          />
        </div>
      </CardContent>
    </Card>
  )
}
