import { useEffect } from 'react'
import {
  estimateMonthlyPensionFromTaxReturn,
  estimateTaxablePercentageFromTaxReturn,
  calculateRetirementStartYear,
} from '../../helpers/statutory-pension'

interface PensionCalculationsProps {
  values: {
    hasTaxReturnData: boolean
    taxYear: number
    annualPensionReceived: number
    taxablePortion: number
    startYear: number
    retirementAge?: number
  }
  onChange: {
    onStartYearChange: (year: number) => void
    onMonthlyAmountChange: (amount: number) => void
    onTaxablePercentageChange: (percentage: number) => void
  }
  birthYear?: number
  spouseBirthYear?: number
  planningMode: 'individual' | 'couple'
}

/**
 * Custom hook for pension calculations
 * Handles automatic start year calculation and tax return data import
 */
export function usePensionCalculations({
  values,
  onChange,
  birthYear,
  spouseBirthYear,
  planningMode,
}: PensionCalculationsProps) {
  // Auto-calculate retirement start year when birth year or retirement age changes
  useEffect(() => {
    const calculatedStartYear = calculateRetirementStartYear(
      planningMode,
      birthYear,
      spouseBirthYear,
      values.retirementAge || 67,
      values.retirementAge || 67, // Use same retirement age for both unless we add spouse retirement age support
    )
    if (calculatedStartYear && calculatedStartYear !== values.startYear) {
      onChange.onStartYearChange(calculatedStartYear)
    }
  }, [birthYear, spouseBirthYear, planningMode, values.retirementAge, values.startYear, onChange])

  // Handler for importing values from tax return data
  const handleImportFromTaxReturn = () => {
    if (values.hasTaxReturnData && values.annualPensionReceived > 0) {
      const estimatedMonthly = estimateMonthlyPensionFromTaxReturn({
        taxYear: values.taxYear,
        annualPensionReceived: values.annualPensionReceived,
        taxablePortion: values.taxablePortion,
      })

      const estimatedTaxablePercentage = estimateTaxablePercentageFromTaxReturn({
        taxYear: values.taxYear,
        annualPensionReceived: values.annualPensionReceived,
        taxablePortion: values.taxablePortion,
      })

      onChange.onMonthlyAmountChange(Math.round(estimatedMonthly))
      onChange.onTaxablePercentageChange(Math.round(estimatedTaxablePercentage))
    }
  }

  return {
    handleImportFromTaxReturn,
  }
}
