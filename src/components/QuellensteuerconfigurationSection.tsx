import { useMemo } from 'react'
import { generateFormId } from '../utils/unique-id'
import { SectionHeader } from './quellensteuer/SectionHeader'
import { ConfigurationContent } from './quellensteuer/ConfigurationContent'
import { useQuellensteuerHandlers } from './quellensteuer/useQuellensteuerHandlers'

interface QuellensteuerconfigurationProps {
  enabled: boolean
  foreignIncome: number
  withholdingTaxRate: number
  countryCode?: string
  germanCapitalGainsTaxRate: number
  teilfreistellung: number
  onEnabledChange: (enabled: boolean) => void
  onForeignIncomeChange: (amount: number) => void
  onWithholdingTaxRateChange: (rate: number) => void
  onCountryCodeChange: (code: string) => void
}

export function QuellensteuerconfigurationSection({
  enabled,
  foreignIncome,
  withholdingTaxRate,
  countryCode = 'US',
  germanCapitalGainsTaxRate,
  teilfreistellung,
  onEnabledChange,
  onForeignIncomeChange,
  onWithholdingTaxRateChange,
  onCountryCodeChange,
}: QuellensteuerconfigurationProps) {
  const { showCustomRate, handleCountryChange, handleCustomRateToggle, calculationResult, selectedCountry } =
    useQuellensteuerHandlers(
      enabled,
      foreignIncome,
      withholdingTaxRate,
      countryCode,
      germanCapitalGainsTaxRate,
      teilfreistellung,
      onCountryCodeChange,
      onWithholdingTaxRateChange,
    )

  // Generate stable IDs
  const enabledSwitchId = useMemo(() => generateFormId('quellensteuer', 'enabled'), [])
  const foreignIncomeInputId = useMemo(() => generateFormId('quellensteuer', 'foreign-income'), [])
  const countrySelectId = useMemo(() => generateFormId('quellensteuer', 'country'), [])
  const customRateInputId = useMemo(() => generateFormId('quellensteuer', 'custom-rate'), [])

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-green-50/50">
      <SectionHeader enabled={enabled} enabledSwitchId={enabledSwitchId} onEnabledChange={onEnabledChange} />

      {enabled && (
        <ConfigurationContent
          countryCode={countryCode}
          countrySelectId={countrySelectId}
          foreignIncome={foreignIncome}
          foreignIncomeInputId={foreignIncomeInputId}
          showCustomRate={showCustomRate}
          withholdingTaxRate={withholdingTaxRate}
          selectedCountry={selectedCountry}
          customRateInputId={customRateInputId}
          calculationResult={calculationResult}
          onCountryChange={handleCountryChange}
          onForeignIncomeChange={onForeignIncomeChange}
          onCustomRateToggle={handleCustomRateToggle}
          onWithholdingTaxRateChange={onWithholdingTaxRateChange}
        />
      )}
    </div>
  )
}
