import { useEffect } from 'react'
import { calculateRetirementStartYear } from '../../helpers/statutory-pension'

interface UseRetirementStartYearAutoCalculationProps {
  planningMode: 'individual' | 'couple'
  birthYear?: number
  spouseBirthYear?: number
  currentRetirementStartYear: number
  onRetirementStartYearChange: (year: number) => void
}

/**
 * Custom hook to automatically calculate and update retirement start year
 * based on birth year changes.
 */
export function useRetirementStartYearAutoCalculation({
  planningMode,
  birthYear,
  spouseBirthYear,
  currentRetirementStartYear,
  onRetirementStartYearChange,
}: UseRetirementStartYearAutoCalculationProps) {
  useEffect(() => {
    const calculatedStartYear = calculateRetirementStartYear(
      planningMode,
      birthYear,
      spouseBirthYear,
      67, // Default retirement age
      67, // Default retirement age for spouse
    )

    if (calculatedStartYear && calculatedStartYear !== currentRetirementStartYear) {
      onRetirementStartYearChange(calculatedStartYear)
    }
  }, [birthYear, spouseBirthYear, planningMode, currentRetirementStartYear, onRetirementStartYearChange])
}
