import { InputField } from './InputField'

interface TeilverkaufFormFieldsProps {
  ids: {
    propertyValue: string
    salePercentage: string
    saleAge: string
    niessbrauchFeeRate: string
    transactionCostsRate: string
    appreciationRate: string
  }
  values: {
    propertyValue: number
    salePercentage: number
    saleAge: number
    niessbrauchFeeRate: number
    transactionCostsRate: number
    appreciationRate: number
  }
  onChange: (updates: Partial<TeilverkaufFormFieldsProps['values']>) => void
}

export function TeilverkaufFormFields({ ids, values, onChange }: TeilverkaufFormFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputField id={ids.propertyValue} label="Immobilienwert (€)" value={values.propertyValue} onChange={(v) => onChange({ propertyValue: parseFloat(v) || 0 })} min={0} step={10000} />
      <InputField id={ids.salePercentage} label="Verkaufsanteil (%)" value={values.salePercentage} onChange={(v) => onChange({ salePercentage: parseFloat(v) || 0 })} min={20} max={50} step={5} helpText="Typischerweise 20-50%" />
      <InputField id={ids.saleAge} label="Alter bei Verkauf" value={values.saleAge} onChange={(v) => onChange({ saleAge: parseInt(v) || 0 })} min={60} max={85} step={1} />
      <InputField
        id={ids.niessbrauchFeeRate}
        label="Nießbrauch-Gebühr p.a. (%)"
        value={values.niessbrauchFeeRate}
        onChange={(v) => onChange({ niessbrauchFeeRate: parseFloat(v) || 0 })}
        min={0}
        max={10}
        step={0.1}
        helpText="Jährliche Gebühr für Wohnrecht"
      />
      <InputField id={ids.transactionCostsRate} label="Transaktionskosten (%)" value={values.transactionCostsRate} onChange={(v) => onChange({ transactionCostsRate: parseFloat(v) || 0 })} min={0} max={15} step={0.5} helpText="Notar, Grundbuch, Steuern" />
      <InputField id={ids.appreciationRate} label="Wertsteigerung p.a. (%)" value={values.appreciationRate} onChange={(v) => onChange({ appreciationRate: parseFloat(v) || 0 })} min={-5} max={10} step={0.1} />
    </div>
  )
}
