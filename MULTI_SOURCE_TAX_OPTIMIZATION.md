# Multi-Source Tax-Optimized Withdrawal Strategy

## Overview

This module implements intelligent withdrawal strategies across multiple capital sources (Depot, Riester, Rürup, Statutory Pension) to minimize overall tax burden during retirement in Germany.

## Key Features

- **Multi-Source Optimization**: Coordinates withdrawals across 4 different capital sources
- **Tax-Aware Allocation**: Considers different tax treatments (Kapitalertragsteuer vs. Einkommensteuer)
- **Allowance Utilization**: Maximizes use of Sparerpauschbetrag and Grundfreibetrag
- **Flexible Strategies**: Three optimization modes (minimize_taxes, maximize_after_tax, balanced)
- **Comparison Capability**: Calculate tax savings vs. naive withdrawal

## Capital Sources

### 1. Depot (Investment Portfolio)

- **Tax Treatment**: Kapitalertragsteuer (25% + Solidaritätszuschlag)
- **Allowances**: Sparerpauschbetrag (€1,000 for single, €2,000 for couples in 2024)
- **Benefits**: Teilfreistellung for equity funds (30% tax-free)

### 2. Riester-Rente

- **Tax Treatment**: Einkommensteuer (100% taxable)
- **Characteristics**: State-subsidized pension, full taxation during payout
- **Strategy**: Use to fill Grundfreibetrag before other income sources

### 3. Rürup-Rente (Basis-Rente)

- **Tax Treatment**: Einkommensteuer (partially taxable, percentage increases yearly)
- **Characteristics**: Tax-deductible contributions, deferred taxation
- **Strategy**: Lower taxable percentage makes it attractive for Grundfreibetrag utilization

### 4. Statutory Pension (Gesetzliche Rente)

- **Tax Treatment**: Einkommensteuer (partially taxable based on retirement year)
- **Characteristics**: Mandatory state pension, Besteuerungsanteil depends on retirement year
- **Strategy**: Similar to Rürup, optimizes based on taxable percentage

## Optimization Strategies

### Minimize Taxes

1. Use Depot up to Sparerpauschbetrag (tax-free capital gains)
2. Use pension sources up to Grundfreibetrag (tax-free income)
3. Fill remaining need from sources with lowest marginal tax rate

### Maximize After-Tax

- Focuses on net income rather than just tax minimization
- May accept slightly higher taxes for higher gross withdrawal

### Balanced

- Even distribution across sources while remaining tax-aware
- Provides diversification and steady depletion of all sources

## Usage Example

```typescript
import {
  calculateOptimalWithdrawalAllocation,
  calculateNaiveWithdrawal,
  calculateTaxSavings,
  type MultiSourceTaxOptimizationConfig,
  type TaxParameters,
} from './helpers/multi-source-tax-optimization'

// Define configuration
const config: MultiSourceTaxOptimizationConfig = {
  sources: [
    {
      type: 'depot',
      availableCapital: 600000,
      taxTreatment: 'kapitalertragsteuer',
      taxablePercentage: 1.0,
      priority: 1,
      enabled: true,
      teilfreistellung: 0.3, // 30% for equity funds
    },
    {
      type: 'riester',
      expectedAnnualPayment: 8400,
      taxTreatment: 'einkommensteuer',
      taxablePercentage: 1.0,
      priority: 2,
      enabled: true,
    },
    {
      type: 'ruerup',
      expectedAnnualPayment: 12000,
      taxTreatment: 'einkommensteuer',
      taxablePercentage: 0.83, // 83% taxable for 2040 retirement
      priority: 3,
      enabled: true,
    },
    {
      type: 'statutory_pension',
      expectedAnnualPayment: 18000,
      taxTreatment: 'einkommensteuer',
      taxablePercentage: 0.83,
      priority: 4,
      enabled: true,
    },
  ],
  targetAnnualWithdrawal: 48000,
  optimizationMode: 'minimize_taxes',
  grundfreibetragUtilization: 0.9,
  sparerpauschbetragUtilization: 0.95,
  considerProgressiveTax: true,
}

// Tax parameters for 2024
const taxParams: TaxParameters = {
  year: 2024,
  grundfreibetrag: 11604,
  sparerpauschbetrag: 1000,
  kapitalertragsteuerRate: 0.25,
  solidaritaetszuschlagRate: 0.055,
  incomeTaxRate: 0.30,
}

// Calculate optimal allocation
const optimized = calculateOptimalWithdrawalAllocation(config, taxParams)

// Calculate naive allocation for comparison
const naive = calculateNaiveWithdrawal(config, taxParams)

// Calculate savings
const savings = calculateTaxSavings(optimized, naive)

console.log('Optimized Withdrawal:', optimized)
console.log('Annual Tax Savings:', savings.annualTaxSavings, '€')
console.log('Net Income Improvement:', savings.netIncomeImprovement, '€')
```

## Results Structure

### WithdrawalAllocation

```typescript
{
  depotWithdrawal: number,          // Amount withdrawn from depot
  riesterWithdrawal: number,        // Amount withdrawn from Riester
  ruerupWithdrawal: number,         // Amount withdrawn from Rürup
  statutoryPensionWithdrawal: number, // Amount from statutory pension
  totalWithdrawal: number,          // Total gross withdrawal
  totalTax: number,                 // Total taxes paid
  netAmount: number,                // Net after-tax income
  taxBreakdown: {                   // Taxes by source
    depot: number,
    riester: number,
    ruerup: number,
    statutoryPension: number,
  },
  optimization: {
    mode: string,                   // Optimization mode used
    grundfreibetragUsed: number,    // Amount of Grundfreibetrag utilized
    sparerpauschbetragUsed: number, // Amount of Sparerpauschbetrag utilized
    effectiveTaxRate: number,       // Overall effective tax rate
  }
}
```

## German Tax Considerations

### Grundfreibetrag (Income Tax Allowance)

- **2024**: €11,604 (single) / €23,208 (married)
- **Purpose**: Income below this threshold is tax-free
- **Strategy**: Fill with pension income before higher-taxed sources

### Sparerpauschbetrag (Investment Income Allowance)

- **2024**: €1,000 (single) / €2,000 (married)
- **Purpose**: Capital gains below this threshold are tax-free
- **Strategy**: Utilize fully with depot withdrawals

### Teilfreistellung (Partial Tax Exemption)

- **Equity Funds**: 30% tax-free
- **Real Estate Funds**: 60% or 80% tax-free
- **Purpose**: Reduces taxable capital gains
- **Strategy**: Increases attractiveness of depot withdrawals

### Progressive Tax Rates

- Income tax increases progressively with taxable income
- Optimization considers marginal vs. average tax rates
- Strategic allocation can keep income in lower tax brackets

## Future Enhancements

### Planned UI Integration

- Visual configuration panel for multi-source settings
- Interactive priority adjustment
- Real-time visualization of tax savings
- Year-by-year optimization display

### Advanced Features

- Dynamic rebalancing across sources
- Roth conversion ladder equivalent for German context
- Estate planning integration
- Healthcare cost consideration (KVdR)

## Testing

The module includes comprehensive test coverage (23 test cases):

- Single source scenarios
- Multi-source optimization
- Edge cases (empty sources, insufficient capital)
- All optimization modes
- Realistic retirement scenarios
- Tax calculation accuracy

Run tests with:

```bash
npm test -- helpers/multi-source-tax-optimization.test.ts
```

## References

- German Income Tax Law (Einkommensteuergesetz - EStG)
- Capital Gains Tax (Abgeltungsteuer)
- Pension Taxation (§ 22 EStG)
- Riester-Rente subsidy rules
- Rürup-Rente (Basis-Rente) tax treatment

## Author

Implementation part of the Zinseszins-Simulation project.

## License

See project LICENSE file.
