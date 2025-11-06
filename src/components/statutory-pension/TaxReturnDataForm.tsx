import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Calculator } from 'lucide-react'
import { TaxReturnDataFields } from './TaxReturnDataFields'

interface TaxReturnDataFormProps {
  values: {
    hasTaxReturnData: boolean
    taxYear: number
    annualPensionReceived: number
    taxablePortion: number
  }
  onChange: (data: {
    hasTaxReturnData: boolean
    taxYear: number
    annualPensionReceived: number
    taxablePortion: number
  }) => void
  currentYear: number
  onImportFromTaxReturn: () => void
}

export function TaxReturnDataForm({ values, onChange, currentYear, onImportFromTaxReturn }: TaxReturnDataFormProps) {
  return (
    <>
      <div className="flex items-center space-x-2">
        <Switch
          checked={values.hasTaxReturnData}
          onCheckedChange={hasTaxReturnData =>
            onChange({
              hasTaxReturnData,
              taxYear: values.taxYear,
              annualPensionReceived: values.annualPensionReceived,
              taxablePortion: values.taxablePortion,
            })
          }
          id="has-tax-return-data"
        />
        <Label htmlFor="has-tax-return-data">Daten aus Rentenbescheid verfügbar</Label>
      </div>

      {values.hasTaxReturnData && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <TaxReturnDataFields values={values} onChange={onChange} currentYear={currentYear} />

          <Button
            onClick={onImportFromTaxReturn}
            disabled={values.annualPensionReceived === 0}
            className="w-full md:w-auto"
          >
            <Calculator className="h-4 w-4 mr-2" />
            Werte automatisch berechnen
          </Button>
        </div>
      )}
    </>
  )
}
