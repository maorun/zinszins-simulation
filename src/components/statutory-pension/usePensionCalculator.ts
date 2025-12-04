import { useState, useMemo } from 'react'
import {
  calculatePensionPoints,
  createSalaryHistory,
  type PensionPointsConfig,
  type PensionPointsResult,
} from '../../../helpers/pension-points'

interface UsePensionCalculatorReturn {
  quickMode: boolean
  setQuickMode: (mode: boolean) => void
  startYear: number
  setStartYear: (year: number) => void
  endYear: number
  setEndYear: (year: number) => void
  startingSalary: number
  setStartingSalary: (salary: number) => void
  annualIncrease: number
  setAnnualIncrease: (increase: number) => void
  manualSalaries: { [year: number]: number }
  region: 'west' | 'east'
  setRegion: (region: 'west' | 'east') => void
  calculationResult: PensionPointsResult | null
  handleAddYear: () => void
  handleRemoveYear: (year: number) => void
  handleUpdateSalary: (year: number, salary: number) => void
  handleYearChange: (oldYear: number, newYear: number, salary: number) => void
}

function useManualSalaryHandlers(
  manualSalaries: { [year: number]: number },
  setManualSalaries: (salaries: { [year: number]: number }) => void
) {
  const handleAddYear = () => {
    const currentYear = new Date().getFullYear()
    const newYear = Object.keys(manualSalaries).length > 0 ? Math.max(...Object.keys(manualSalaries).map(Number)) + 1 : currentYear - 10

    setManualSalaries({ ...manualSalaries, [newYear]: 40000 })
  }

  const handleRemoveYear = (year: number) => {
    const newSalaries = { ...manualSalaries }
    delete newSalaries[year]
    setManualSalaries(newSalaries)
  }

  const handleUpdateSalary = (year: number, salary: number) => {
    setManualSalaries({ ...manualSalaries, [year]: salary })
  }

  const handleYearChange = (oldYear: number, newYear: number, salary: number) => {
    const newSalaries = { ...manualSalaries }
    delete newSalaries[oldYear]
    newSalaries[newYear] = salary
    setManualSalaries(newSalaries)
  }

  return { handleAddYear, handleRemoveYear, handleUpdateSalary, handleYearChange }
}

export function usePensionCalculator(): UsePensionCalculatorReturn {
  const [quickMode, setQuickMode] = useState(true)
  const [startYear, setStartYear] = useState(2000)
  const [endYear, setEndYear] = useState(2040)
  const [startingSalary, setStartingSalary] = useState(35000)
  const [annualIncrease, setAnnualIncrease] = useState(3.0)
  const [manualSalaries, setManualSalaries] = useState<{ [year: number]: number }>({})
  const [region, setRegion] = useState<'west' | 'east'>('west')

  const calculationResult = useMemo(() => {
    const salaryHistory = quickMode ? createSalaryHistory(startYear, endYear, startingSalary, annualIncrease) : manualSalaries

    if (Object.keys(salaryHistory).length === 0) {
      return null
    }

    const config: PensionPointsConfig = { salaryHistory, region }
    return calculatePensionPoints(config)
  }, [quickMode, startYear, endYear, startingSalary, annualIncrease, manualSalaries, region])

  const { handleAddYear, handleRemoveYear, handleUpdateSalary, handleYearChange } = useManualSalaryHandlers(manualSalaries, setManualSalaries)

  return {
    quickMode,
    setQuickMode,
    startYear,
    setStartYear,
    endYear,
    setEndYear,
    startingSalary,
    setStartingSalary,
    annualIncrease,
    setAnnualIncrease,
    manualSalaries,
    region,
    setRegion,
    calculationResult,
    handleAddYear,
    handleRemoveYear,
    handleUpdateSalary,
    handleYearChange,
  }
}
