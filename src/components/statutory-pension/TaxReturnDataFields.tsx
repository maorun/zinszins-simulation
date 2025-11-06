import { Label } from '../ui/label'
import { Input } from '../ui/input'

interface TaxReturnDataFieldsProps {
  values: {
    taxYear: number
    annualPensionReceived: number
    taxablePortion: number
    hasTaxReturnData: boolean
  }
  onChange: (data: {
    hasTaxReturnData: boolean
    taxYear: number
    annualPensionReceived: number
    taxablePortion: number
  }) => void
  currentYear: number
}

function TaxYearField({
  value,
  onChange,
  currentYear,
}: {
  value: number
  onChange: (year: number) => void
  currentYear: number
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="tax-year">Steuerjahr</Label>
      <Input
        id="tax-year"
        type="number"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        min={2000}
        max={currentYear}
        step={1}
        className="w-32"
      />
    </div>
  )
}

function AnnualPensionField({ value, onChange }: { value: number; onChange: (amount: number) => void }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="annual-pension-received">Jahresrente (brutto) €</Label>
      <Input
        id="annual-pension-received"
        type="number"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        min={0}
        step={100}
        className="w-40"
      />
    </div>
  )
}

function TaxablePortionField({ value, onChange }: { value: number; onChange: (amount: number) => void }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="taxable-portion">Steuerpflichtiger Anteil €</Label>
      <Input
        id="taxable-portion"
        type="number"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        min={0}
        step={100}
        className="w-40"
      />
    </div>
  )
}

export function TaxReturnDataFields({ values, onChange, currentYear }: TaxReturnDataFieldsProps) {
  const updateField = (field: Partial<typeof values>) => {
    onChange({
      hasTaxReturnData: values.hasTaxReturnData,
      taxYear: values.taxYear,
      annualPensionReceived: values.annualPensionReceived,
      taxablePortion: values.taxablePortion,
      ...field,
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <TaxYearField value={values.taxYear} onChange={taxYear => updateField({ taxYear })} currentYear={currentYear} />
      <AnnualPensionField
        value={values.annualPensionReceived}
        onChange={annualPensionReceived => updateField({ annualPensionReceived })}
      />
      <TaxablePortionField value={values.taxablePortion} onChange={taxablePortion => updateField({ taxablePortion })} />
    </div>
  )
}
