import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import type { LeverageScenarioResults } from '../../../helpers/immobilien-leverage'
import { KeyMetricsGrid } from './KeyMetricsGrid'
import { RiskMetrics } from './RiskMetrics'

interface ScenarioDetailCardProps {
  result: LeverageScenarioResults
}

export function ScenarioDetailCard({ result }: ScenarioDetailCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50">
        <CardTitle className="text-base">{result.scenario.name}</CardTitle>
        <CardDescription>
          {result.scenario.downPaymentPercent}% Eigenkapital, {result.scenario.termYears} Jahre Laufzeit
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <KeyMetricsGrid
          annualNetCashFlow={result.annualNetCashFlow}
          totalInterestCost={result.totalInterestCost}
          totalTaxBenefit={result.totalTaxBenefit}
          returnWithoutLeverage={result.returnWithoutLeverage}
        />

        <RiskMetrics
          warnings={result.riskIndicators.warnings}
          interestCoverageRatio={result.riskIndicators.interestCoverageRatio}
          debtServiceCoverageRatio={result.riskIndicators.debtServiceCoverageRatio}
          mortgageToIncomeRatio={result.riskIndicators.mortgageToIncomeRatio}
          annualAfa={result.annualAfa}
        />
      </CardContent>
    </Card>
  )
}
