import type { EventFormValues } from './EventFormFields'
import { BusinessSaleInfoBox } from './BusinessSaleInfoBox'
import { BusinessSaleInputField, BusinessSaleSwitchField } from './BusinessSaleInputFields'
import { useMemo } from 'react'
import { generateFormId } from '../../utils/unique-id'

interface BusinessSaleFieldsProps {
  formValues: EventFormValues
  onFormChange: (values: EventFormValues) => void
}

export function BusinessSaleFields({ formValues, onFormChange }: BusinessSaleFieldsProps) {
  const ids = useMemo(
    () => ({
      salePrice: generateFormId('business-sale', 'sale-price'),
      bookValue: generateFormId('business-sale', 'book-value'),
      sellerAge: generateFormId('business-sale', 'seller-age'),
      disabled: generateFormId('business-sale', 'disabled-switch'),
      otherIncome: generateFormId('business-sale', 'other-income'),
      fifthRule: generateFormId('business-sale', 'fifth-rule'),
    }),
    [],
  )

  return (
    <div className="space-y-4 p-4 bg-blue-50 rounded-md mb-4">
      <h3 className="font-semibold text-lg mb-2">🏢 Unternehmensverkauf-Details</h3>
      <BusinessSaleInputField id={ids.salePrice} label="Verkaufspreis (€)" value={formValues.businessSalePrice}
        onChange={v => onFormChange({ ...formValues, businessSalePrice: v })} placeholder="z.B. 500000"
        helpText="Der vereinbarte Verkaufspreis Ihres Unternehmens" />
      <BusinessSaleInputField id={ids.bookValue} label="Buchwert / Anschaffungskosten (€)"
        value={formValues.businessBookValue} onChange={v => onFormChange({ ...formValues, businessBookValue: v })}
        placeholder="z.B. 200000" helpText="Ursprüngliche Anschaffungs- oder Gründungskosten" />
      <BusinessSaleInputField id={ids.sellerAge} label="Alter beim Verkauf (Jahre)" value={formValues.sellerAge}
        onChange={v => onFormChange({ ...formValues, sellerAge: v })} placeholder="z.B. 60" min="18" max="100"
        step="1" helpText="Ab 55 Jahren: §16 EStG Freibetrag bis zu 45.000€" />
      <BusinessSaleSwitchField id={ids.disabled} label="Dauerhaft erwerbsgemindert"
        checked={formValues.permanentlyDisabled}
        onChange={c => onFormChange({ ...formValues, permanentlyDisabled: c })}
        helpText="Freibetrag gilt auch bei Erwerbsminderung unter 55 Jahren" />
      <BusinessSaleInputField id={ids.otherIncome} label="Sonstiges zu versteuerndes Einkommen (€)"
        value={formValues.businessSaleOtherIncome}
        onChange={v => onFormChange({ ...formValues, businessSaleOtherIncome: v })} placeholder="z.B. 50000"
        helpText="Gehalt, Rente oder andere Einkünfte im Verkaufsjahr" />
      <BusinessSaleSwitchField id={ids.fifthRule} label="Fünftelregelung anwenden"
        checked={formValues.applyFifthRule ?? true}
        onChange={c => onFormChange({ ...formValues, applyFifthRule: c })}
        helpText="Ermäßigte Besteuerung für außerordentliche Einkünfte (§ 34 EStG)" />
      <BusinessSaleInfoBox />
    </div>
  )
}
