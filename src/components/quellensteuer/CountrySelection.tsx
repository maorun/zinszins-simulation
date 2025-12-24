import { Label } from '../ui/label'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { COMMON_WITHHOLDING_TAX_RATES } from '../../../helpers/quellensteuer'

interface CountrySelectionProps {
  countryCode: string
  countrySelectId: string
  onCountryChange: (countryCode: string) => void
}

export function CountrySelection({ countryCode, countrySelectId, onCountryChange }: CountrySelectionProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={countrySelectId}>Land der ausländischen Kapitalerträge</Label>
      <RadioGroup value={countryCode} onValueChange={onCountryChange} className="space-y-2">
        {COMMON_WITHHOLDING_TAX_RATES.map(country => (
          <div key={country.countryCode} className="flex items-center space-x-2">
            <RadioGroupItem value={country.countryCode} id={`country-${country.countryCode}`} />
            <Label htmlFor={`country-${country.countryCode}`} className="font-normal cursor-pointer">
              {country.description}
            </Label>
          </div>
        ))}
      </RadioGroup>
      <p className="text-xs text-muted-foreground">
        Wählen Sie das Land aus, aus dem Sie ausländische Kapitalerträge beziehen. Die Quellensteuersätze basieren auf
        deutschen Doppelbesteuerungsabkommen (DBA).
      </p>
    </div>
  )
}
