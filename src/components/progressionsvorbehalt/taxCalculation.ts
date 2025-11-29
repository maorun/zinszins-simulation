import {
  type ProgressionsvorbehaltConfig,
  calculateIncomeTaxWithProgressionsvorbehalt,
  calculateGermanIncomeTax,
} from '../../../helpers/progressionsvorbehalt'

export function calculateTaxComparisonData(
  config: ProgressionsvorbehaltConfig,
  exampleTaxableIncome: number,
  year: number,
  kirchensteuerAktiv: boolean,
  kirchensteuersatz: number,
) {
  const grundfreibetrag = 11604
  const progressionIncome = config.progressionRelevantIncomePerYear[year] || 0
  const normalTax = calculateGermanIncomeTax(exampleTaxableIncome, grundfreibetrag)
  const progressionTax = calculateIncomeTaxWithProgressionsvorbehalt(
    exampleTaxableIncome,
    progressionIncome,
    grundfreibetrag,
    kirchensteuerAktiv,
    kirchensteuersatz,
  )
  const normalRate = exampleTaxableIncome > 0 ? (normalTax / exampleTaxableIncome) * 100 : 0
  const progressionRate = exampleTaxableIncome > 0 ? (progressionTax / exampleTaxableIncome) * 100 : 0

  return {
    normalTax,
    progressionTax,
    additionalTax: progressionTax - normalTax,
    normalRate,
    progressionRate,
    rateIncrease: progressionRate - normalRate,
  }
}
