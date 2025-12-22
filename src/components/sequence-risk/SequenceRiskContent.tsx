import { CardContent } from '../ui/card'
import { InfoPanel, MitigationStrategiesPanel } from './components'
import { ConfigurationForm } from './ConfigurationForm'
import { AnalysisResults } from './AnalysisResults'
import type { useSequenceRiskAnalysis } from './useSequenceRiskAnalysis'

interface SequenceRiskContentProps {
  data: ReturnType<typeof useSequenceRiskAnalysis>
}

export function SequenceRiskContent({ data }: SequenceRiskContentProps) {
  const {
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
  } = data

  return (
    <CardContent className="space-y-6">
      <InfoPanel />

      <ConfigurationForm
        startingPortfolioId={ids.startingPortfolio}
        annualWithdrawalId={ids.annualWithdrawal}
        yearsId={ids.years}
        averageReturnId={ids.averageReturn}
        volatilityId={ids.volatility}
        startingPortfolio={startingPortfolio}
        annualWithdrawal={annualWithdrawal}
        years={years}
        averageReturn={averageReturn}
        volatility={volatility}
        withdrawalRate={withdrawalRate}
        onStartingPortfolioChange={setStartingPortfolio}
        onAnnualWithdrawalChange={setAnnualWithdrawal}
        onYearsChange={setYears}
        onAverageReturnChange={setAverageReturn}
        onVolatilityChange={setVolatility}
      />

      <AnalysisResults analysis={analysis} />

      <MitigationStrategiesPanel />
    </CardContent>
  )
}
