import { useMemo } from 'react'
import type { WithdrawalFormValue } from '../utils/config-storage'
import { getStrategyDisplayName } from '../utils/withdrawal-strategy-utils'

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

/**
 * Calculate strategy-specific withdrawal details
 */
interface WithdrawalDetails {
  amount: number | null
  label: string
}

function calculateWithdrawalDetails(
  strategy: string,
  startingCapital: number,
  formValue: WithdrawalFormValue,
): WithdrawalDetails {
  if (strategy === '4prozent') {
    return {
      amount: startingCapital * 0.04,
      label: 'Jährliche Entnahme:',
    }
  }

  if (strategy === '3prozent') {
    return {
      amount: startingCapital * 0.03,
      label: 'Jährliche Entnahme:',
    }
  }

  if (strategy === 'variabel_prozent') {
    return {
      amount: startingCapital * (formValue.variabelProzent / 100),
      label: 'Jährliche Entnahme:',
    }
  }

  if (strategy === 'monatlich_fest') {
    return {
      amount: formValue.monatlicheBetrag,
      label: 'Monatliche Entnahme:',
    }
  }

  if (strategy === 'dynamisch') {
    return {
      amount: startingCapital * (formValue.dynamischBasisrate / 100),
      label: 'Basis-Entnahme:',
    }
  }

  return {
    amount: null,
    label: '',
  }
}

/**
 * Custom hook for preparing comparison data
 * Handles base strategy calculations and data transformations
 */
export function useComparisonData({ withdrawalData, formValue }: UseComparisonDataProps) {
  // Calculate base strategy metrics
  const baseStrategyData = useMemo(() => {
    const totalWithdrawal = withdrawalData.withdrawalArray.reduce((sum, year) => sum + (year.entnahme || 0), 0)
    const averageAnnualWithdrawal = totalWithdrawal / withdrawalData.withdrawalArray.length

    // Calculate strategy-specific withdrawal amount
    const { amount: withdrawalAmount, label: withdrawalLabel } = calculateWithdrawalDetails(
      formValue.strategie,
      withdrawalData.startingCapital,
      formValue,
    )

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
