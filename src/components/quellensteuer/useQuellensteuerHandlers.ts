import { useState, useMemo } from 'react'
import { COMMON_WITHHOLDING_TAX_RATES, calculateQuellensteuerconfigCredit } from '../../../helpers/quellensteuer'

export function useQuellensteuerHandlers(
  enabled: boolean,
  foreignIncome: number,
  withholdingTaxRate: number,
  countryCode: string,
  germanCapitalGainsTaxRate: number,
  teilfreistellung: number,
  onCountryCodeChange: (code: string) => void,
  onWithholdingTaxRateChange: (rate: number) => void,
) {
  const [showCustomRate, setShowCustomRate] = useState(false)

  const handleCountryChange = (newCountryCode: string) => {
    onCountryCodeChange(newCountryCode)
    const country = COMMON_WITHHOLDING_TAX_RATES.find((c) => c.countryCode === newCountryCode)
    if (country) {
      onWithholdingTaxRateChange(country.dbaRate)
      setShowCustomRate(false)
    }
  }

  const handleCustomRateToggle = () => {
    setShowCustomRate(!showCustomRate)
  }

  const calculationResult = useMemo(() => {
    if (!enabled || foreignIncome <= 0) {
      return null
    }
    return calculateQuellensteuerconfigCredit(foreignIncome, withholdingTaxRate, germanCapitalGainsTaxRate, teilfreistellung)
  }, [enabled, foreignIncome, withholdingTaxRate, germanCapitalGainsTaxRate, teilfreistellung])

  const selectedCountry = useMemo(
    () => COMMON_WITHHOLDING_TAX_RATES.find((c) => c.countryCode === countryCode),
    [countryCode],
  )

  return {
    showCustomRate,
    handleCountryChange,
    handleCustomRateToggle,
    calculationResult,
    selectedCountry,
  }
}
