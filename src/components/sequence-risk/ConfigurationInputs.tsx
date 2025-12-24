import { ConfigInputField } from './components'

interface PortfolioInputsProps {
  startingPortfolioId: string
  annualWithdrawalId: string
  yearsId: string
  startingPortfolio: number
  annualWithdrawal: number
  years: number
  withdrawalRate: number
  onStartingPortfolioChange: (value: number) => void
  onAnnualWithdrawalChange: (value: number) => void
  onYearsChange: (value: number) => void
}

export function PortfolioInputs({
  startingPortfolioId,
  annualWithdrawalId,
  yearsId,
  startingPortfolio,
  annualWithdrawal,
  years,
  withdrawalRate,
  onStartingPortfolioChange,
  onAnnualWithdrawalChange,
  onYearsChange,
}: PortfolioInputsProps) {
  return (
    <>
      <ConfigInputField
        id={startingPortfolioId}
        label="Startkapital"
        value={startingPortfolio}
        min="0"
        step="10000"
        onChange={onStartingPortfolioChange}
      />
      <ConfigInputField
        id={annualWithdrawalId}
        label="Jährliche Entnahme"
        value={annualWithdrawal}
        min="0"
        step="1000"
        helperText={`Entnahmerate: ${withdrawalRate.toFixed(2)}%`}
        onChange={onAnnualWithdrawalChange}
      />
      <ConfigInputField
        id={yearsId}
        label="Zeitraum (Jahre)"
        value={years}
        min="5"
        max="50"
        step="1"
        onChange={onYearsChange}
        parseValue={v => parseInt(v) || 30}
      />
    </>
  )
}

interface ReturnInputsProps {
  averageReturnId: string
  volatilityId: string
  averageReturn: number
  volatility: number
  onAverageReturnChange: (value: number) => void
  onVolatilityChange: (value: number) => void
}

export function ReturnInputs({
  averageReturnId,
  volatilityId,
  averageReturn,
  volatility,
  onAverageReturnChange,
  onVolatilityChange,
}: ReturnInputsProps) {
  return (
    <>
      <ConfigInputField
        id={averageReturnId}
        label="Durchschnittliche Rendite (%)"
        value={averageReturn}
        min="0"
        max="20"
        step="0.5"
        onChange={onAverageReturnChange}
      />
      <ConfigInputField
        id={volatilityId}
        label="Volatilität (%)"
        value={volatility}
        min="0"
        max="50"
        step="1"
        helperText="Standardabweichung der jährlichen Renditen"
        onChange={onVolatilityChange}
      />
    </>
  )
}
