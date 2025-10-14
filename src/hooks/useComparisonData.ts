import { useMemo } from 'react'
import type { WithdrawalFormValue } from '../utils/config-storage'

// Type for withdrawal array elements
type WithdrawalArrayElement = {
  endkapital?: number
  entnahme?: number
  jahr?: number
  year?: number
  [key: string]: unknown
}

interface UseComparisonDataProps {
  withdrawalData: {
    startingCapital: number
    withdrawalArray: WithdrawalArrayElement[]
    duration: number | null
  }
  formValue: WithdrawalFormValue
}

// Helper function for strategy display names
export function getStrategyDisplayName(strategy: string): string {
  switch (strategy) {
    case '4prozent':
      return '4% Regel'
    case '3prozent':
      return '3% Regel'
    case 'variabel_prozent':
      return 'Variable Prozent'
    case 'monatlich_fest':
      return 'Monatlich fest'
    case 'dynamisch':
      return 'Dynamische Strategie'
    default:
      return strategy
  }
}

/**
 * Custom hook for preparing comparison data
 * Handles base strategy calculations and data transformations
 */
export function useComparisonData({ withdrawalData, formValue }: UseComparisonDataProps) {
  // Calculate base strategy metrics
  const baseStrategyData = useMemo(() => {
    const totalWithdrawal = withdrawalData.withdrawalArray.reduce(
      (sum, year) => sum + (year.entnahme || 0),
      0,
    )
    const averageAnnualWithdrawal = totalWithdrawal / withdrawalData.withdrawalArray.length

    // Calculate strategy-specific withdrawal amount
    let withdrawalAmount: number | null = null
    let withdrawalLabel = ''

    if (formValue.strategie === '4prozent' || formValue.strategie === '3prozent') {
      const rate = formValue.strategie === '4prozent' ? 0.04 : 0.03
      withdrawalAmount = withdrawalData.startingCapital * rate
      withdrawalLabel = 'Jährliche Entnahme:'
    }
    else if (formValue.strategie === 'variabel_prozent') {
      withdrawalAmount = withdrawalData.startingCapital * (formValue.variabelProzent / 100)
      withdrawalLabel = 'Jährliche Entnahme:'
    }
    else if (formValue.strategie === 'monatlich_fest') {
      withdrawalAmount = formValue.monatlicheBetrag
      withdrawalLabel = 'Monatliche Entnahme:'
    }
    else if (formValue.strategie === 'dynamisch') {
      withdrawalAmount = withdrawalData.startingCapital * (formValue.dynamischBasisrate / 100)
      withdrawalLabel = 'Basis-Entnahme:'
    }

    return {
      displayName: getStrategyDisplayName(formValue.strategie),
      rendite: formValue.rendite,
      endkapital: withdrawalData.withdrawalArray[0]?.endkapital || 0,
      duration: withdrawalData.duration
        ? `${withdrawalData.duration} Jahr${withdrawalData.duration === 1 ? '' : 'e'}`
        : 'unbegrenzt',
      durationYears: withdrawalData.duration ? `${withdrawalData.duration} Jahre` : 'unbegrenzt',
      averageAnnualWithdrawal,
      withdrawalAmount,
      withdrawalLabel,
    }
  }, [withdrawalData, formValue])

  return {
    baseStrategyData,
  }
}
