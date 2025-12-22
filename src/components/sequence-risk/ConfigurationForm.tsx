import { PortfolioInputs, ReturnInputs } from './ConfigurationInputs'

interface ConfigurationFormProps {
  startingPortfolioId: string
  annualWithdrawalId: string
  yearsId: string
  averageReturnId: string
  volatilityId: string
  startingPortfolio: number
  annualWithdrawal: number
  years: number
  averageReturn: number
  volatility: number
  withdrawalRate: number
  onStartingPortfolioChange: (value: number) => void
  onAnnualWithdrawalChange: (value: number) => void
  onYearsChange: (value: number) => void
  onAverageReturnChange: (value: number) => void
  onVolatilityChange: (value: number) => void
}

export function ConfigurationForm({
  startingPortfolioId,
  annualWithdrawalId,
  yearsId,
  averageReturnId,
  volatilityId,
  startingPortfolio,
  annualWithdrawal,
  years,
  averageReturn,
  volatility,
  withdrawalRate,
  onStartingPortfolioChange,
  onAnnualWithdrawalChange,
  onYearsChange,
  onAverageReturnChange,
  onVolatilityChange,
}: ConfigurationFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Konfiguration</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PortfolioInputs
          startingPortfolioId={startingPortfolioId}
          annualWithdrawalId={annualWithdrawalId}
          yearsId={yearsId}
          startingPortfolio={startingPortfolio}
          annualWithdrawal={annualWithdrawal}
          years={years}
          withdrawalRate={withdrawalRate}
          onStartingPortfolioChange={onStartingPortfolioChange}
          onAnnualWithdrawalChange={onAnnualWithdrawalChange}
          onYearsChange={onYearsChange}
        />
        <ReturnInputs
          averageReturnId={averageReturnId}
          volatilityId={volatilityId}
          averageReturn={averageReturn}
          volatility={volatility}
          onAverageReturnChange={onAverageReturnChange}
          onVolatilityChange={onVolatilityChange}
        />
      </div>
    </div>
  )
}
