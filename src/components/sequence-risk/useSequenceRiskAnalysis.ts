import { useState, useMemo } from 'react'
import { generateFormId } from '../../utils/unique-id'
import {
  analyzeSequenceRisk,
  getDefaultSequenceRiskConfig,
} from '../../../helpers/sequence-risk'

export function useSequenceRiskAnalysis() {
  const defaultConfig = getDefaultSequenceRiskConfig()

  const [startingPortfolio, setStartingPortfolio] = useState(defaultConfig.startingPortfolio)
  const [annualWithdrawal, setAnnualWithdrawal] = useState(defaultConfig.annualWithdrawal)
  const [years, setYears] = useState(defaultConfig.years)
  const [averageReturn, setAverageReturn] = useState(defaultConfig.averageReturn * 100)
  const [volatility, setVolatility] = useState(defaultConfig.volatility * 100)

  const ids = useMemo(
    () => ({
      startingPortfolio: generateFormId('sequence-risk', 'starting-portfolio'),
      annualWithdrawal: generateFormId('sequence-risk', 'annual-withdrawal'),
      years: generateFormId('sequence-risk', 'years'),
      averageReturn: generateFormId('sequence-risk', 'average-return'),
      volatility: generateFormId('sequence-risk', 'volatility'),
    }),
    [],
  )

  const analysis = useMemo(
    () => analyzeSequenceRisk(startingPortfolio, annualWithdrawal, years, averageReturn / 100, volatility / 100),
    [startingPortfolio, annualWithdrawal, years, averageReturn, volatility],
  )

  const withdrawalRate = (annualWithdrawal / startingPortfolio) * 100

  return {
    ids,
    startingPortfolio,
    annualWithdrawal,
    years,
    averageReturn,
    volatility,
    withdrawalRate,
    analysis,
    setStartingPortfolio,
    setAnnualWithdrawal,
    setYears,
    setAverageReturn,
    setVolatility,
  }
}
