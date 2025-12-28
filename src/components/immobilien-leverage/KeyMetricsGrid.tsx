import { formatCurrency } from '../../utils/currency'

interface KeyMetricsGridProps {
  annualNetCashFlow: number
  totalInterestCost: number
  totalTaxBenefit: number
  returnWithoutLeverage: number
}

export function KeyMetricsGrid({
  annualNetCashFlow,
  totalInterestCost,
  totalTaxBenefit,
  returnWithoutLeverage,
}: KeyMetricsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div>
        <p className="text-xs text-muted-foreground">Jährlicher Cashflow</p>
        <p className="text-lg font-semibold">{formatCurrency(annualNetCashFlow)}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Gesamtzinskosten</p>
        <p className="text-lg font-semibold">{formatCurrency(totalInterestCost)}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Steuervorteil/Jahr</p>
        <p className="text-lg font-semibold text-green-600">{formatCurrency(totalTaxBenefit)}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Rendite ungehebelt</p>
        <p className="text-lg font-semibold">{returnWithoutLeverage.toFixed(2)}%</p>
      </div>
    </div>
  )
}
