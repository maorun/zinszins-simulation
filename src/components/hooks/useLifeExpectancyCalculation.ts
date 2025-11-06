import { useCallback, useEffect } from 'react'
import { calculateEndOfLifeYear, calculateCurrentAge } from '../../../helpers/life-expectancy'
import { calculateJointLifeExpectancy } from '../../../helpers/rmd-tables'

type PlanningMode = 'individual' | 'couple'
type Gender = 'male' | 'female'
type SpouseConfig = { birthYear?: number; gender: Gender; expectedLifespan?: number }

interface UseLifeExpectancyCalculationParams {
  birthYear: number | undefined
  expectedLifespan: number | undefined
  planningMode: PlanningMode
  gender: Gender | undefined
  spouse: SpouseConfig | undefined
  useAutomaticCalculation: boolean
  setEndOfLife: (year: number) => void
}

// Helper function to calculate individual end of life
function calculateIndividual(birthYear: number, expectedLifespan: number): number {
  return Math.round(calculateEndOfLifeYear(birthYear, expectedLifespan))
}

// Helper function to calculate couple end of life
function calculateCouple(birthYear: number, spouseBirthYear: number, gender: Gender, spouseGender: Gender): number {
  const age1 = calculateCurrentAge(birthYear)
  const age2 = calculateCurrentAge(spouseBirthYear)
  const jointLifeExpectancy = calculateJointLifeExpectancy(age1, age2, gender, spouseGender)
  const olderBirthYear = Math.min(birthYear, spouseBirthYear)
  return Math.round(calculateEndOfLifeYear(olderBirthYear, jointLifeExpectancy + calculateCurrentAge(olderBirthYear)))
}

// Helper to check if we have all data for individual calculation
function hasIndividualData(birthYear: number | undefined, expectedLifespan: number | undefined): birthYear is number {
  return birthYear !== undefined && expectedLifespan !== undefined
}

// Helper to check if we have all data for couple calculation
function hasCoupleData(
  birthYear: number | undefined,
  spouse: SpouseConfig | undefined,
  gender: Gender | undefined,
): birthYear is number {
  return (
    birthYear !== undefined && spouse?.birthYear !== undefined && gender !== undefined && spouse?.gender !== undefined
  )
}

/**
 * Custom hook to handle automatic life expectancy calculation
 * for both individual and couple planning modes.
 */
export function useLifeExpectancyCalculation({
  birthYear,
  expectedLifespan,
  planningMode,
  gender,
  spouse,
  useAutomaticCalculation,
  setEndOfLife,
}: UseLifeExpectancyCalculationParams) {
  // Unified calculation function
  const calculateEndOfLife = useCallback(() => {
    if (planningMode === 'individual' && hasIndividualData(birthYear, expectedLifespan)) {
      setEndOfLife(calculateIndividual(birthYear, expectedLifespan!))
      return
    }
    if (planningMode === 'couple' && hasCoupleData(birthYear, spouse, gender)) {
      setEndOfLife(calculateCouple(birthYear, spouse!.birthYear!, gender!, spouse!.gender))
    }
  }, [birthYear, expectedLifespan, planningMode, gender, spouse, setEndOfLife])

  // Automatic calculation effect
  useEffect(() => {
    if (useAutomaticCalculation) {
      calculateEndOfLife()
    }
  }, [useAutomaticCalculation, calculateEndOfLife])

  return { calculateEndOfLife }
}
