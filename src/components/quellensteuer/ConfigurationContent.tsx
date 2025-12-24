import { CountrySelection } from './CountrySelection'
import { ForeignIncomeInput } from './ForeignIncomeInput'
import { WithholdingTaxRateSection } from './WithholdingTaxRateSection'
import { CalculationResult } from './CalculationResult'
import { InformationalHints } from './InformationalHints'
import type { CountryWithholdingTaxRate, QuellensteuerconfigCalculationResult } from '../../../helpers/quellensteuer'

interface ConfigurationContentProps {
  countryCode: string
  countrySelectId: string
  foreignIncome: number
  foreignIncomeInputId: string
  showCustomRate: boolean
  withholdingTaxRate: number
  selectedCountry?: CountryWithholdingTaxRate
  customRateInputId: string
  calculationResult: QuellensteuerconfigCalculationResult | null
  onCountryChange: (countryCode: string) => void
  onForeignIncomeChange: (amount: number) => void
  onCustomRateToggle: () => void
  onWithholdingTaxRateChange: (rate: number) => void
}

export function ConfigurationContent({
  countryCode,
  countrySelectId,
  foreignIncome,
  foreignIncomeInputId,
  showCustomRate,
  withholdingTaxRate,
  selectedCountry,
  customRateInputId,
  calculationResult,
  onCountryChange,
  onForeignIncomeChange,
  onCustomRateToggle,
  onWithholdingTaxRateChange,
}: ConfigurationContentProps) {
  return (
    <div className="space-y-4 mt-4">
      <CountrySelection countryCode={countryCode} countrySelectId={countrySelectId} onCountryChange={onCountryChange} />
      <ForeignIncomeInput
        foreignIncome={foreignIncome}
        foreignIncomeInputId={foreignIncomeInputId}
        onForeignIncomeChange={onForeignIncomeChange}
      />
      <WithholdingTaxRateSection
        showCustomRate={showCustomRate}
        withholdingTaxRate={withholdingTaxRate}
        selectedCountry={selectedCountry}
        customRateInputId={customRateInputId}
        onCustomRateToggle={onCustomRateToggle}
        onWithholdingTaxRateChange={onWithholdingTaxRateChange}
      />
      {calculationResult && <CalculationResult result={calculationResult} />}
      <InformationalHints />
    </div>
  )
}
