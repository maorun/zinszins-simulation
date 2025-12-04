/**
 * EM-Rente Calculation Examples
 * 
 * This file demonstrates the EM-Rente (Erwerbsminderungsrente) calculation functionality
 * with realistic scenarios. Run this file to verify calculations work correctly.
 * 
 * To run: node helpers/em-rente-examples.js (requires TypeScript compilation or ts-node)
 */

import {
  calculateEMRenteForYear,
  calculateEMRente,
  estimatePensionPointsFromMonthlyPension,
  type EMRenteConfig,
} from './em-rente'

console.log('='.repeat(80))
console.log('EM-Rente (Erwerbsminderungsrente) Calculation Examples')
console.log('='.repeat(80))
console.log('')

// Example 1: Typical case - 45-year-old with 25 years of contributions
console.log('Example 1: 45-year-old with full disability (volle EM-Rente)')
console.log('-'.repeat(80))

const example1Config: EMRenteConfig = {
  enabled: true,
  type: 'volle',
  disabilityStartYear: 2024,
  birthYear: 1979, // Age 45 in 2024
  accumulatedPensionPoints: 25.0, // 1 point per year on average
  contributionYears: 25,
  region: 'west',
  annualIncreaseRate: 1.0,
  applyZurechnungszeiten: true,
  applyAbschlaege: true,
  taxablePercentage: 80,
}

const result1 = calculateEMRenteForYear(example1Config, 2024)

console.log(`Birth Year: ${example1Config.birthYear}`)
console.log(`Disability Start: ${example1Config.disabilityStartYear} (Age ${2024 - 1979})`)
console.log(`Contribution Years: ${example1Config.contributionYears}`)
console.log(`Accumulated Pension Points: ${example1Config.accumulatedPensionPoints}`)
console.log('')
console.log('Calculation Results:')
console.log(`  Zurechnungszeiten Points: ${result1.zurechnungszeitenPoints.toFixed(2)}`)
console.log(`  Total Pension Points: ${result1.pensionPoints.toFixed(2)}`)
console.log(`  Abschlag Percentage: ${result1.abschlagPercentage.toFixed(2)}%`)
console.log(`  Gross Monthly Pension (before Abschlag): ${result1.grossMonthlyPensionBeforeAbschlaege.toFixed(2)} €`)
console.log(`  Abschlag Amount: -${result1.abschlagAmount.toFixed(2)} €`)
console.log(`  Gross Monthly Pension (after Abschlag): ${result1.grossMonthlyPension.toFixed(2)} €`)
console.log(`  Gross Annual Pension: ${result1.grossAnnualPension.toFixed(2)} €`)
console.log(`  Net Annual Pension: ${result1.netAnnualPension.toFixed(2)} €`)
console.log('')

// Example 2: Partial disability (teilweise EM-Rente)
console.log('Example 2: 50-year-old with partial disability (teilweise EM-Rente)')
console.log('-'.repeat(80))

const example2Config: EMRenteConfig = {
  enabled: true,
  type: 'teilweise',
  disabilityStartYear: 2024,
  birthYear: 1974, // Age 50 in 2024
  accumulatedPensionPoints: 30.0,
  contributionYears: 30,
  region: 'west',
  annualIncreaseRate: 1.0,
  applyZurechnungszeiten: true,
  applyAbschlaege: true,
  taxablePercentage: 80,
}

const result2 = calculateEMRenteForYear(example2Config, 2024)

console.log(`Birth Year: ${example2Config.birthYear}`)
console.log(`Disability Start: ${example2Config.disabilityStartYear} (Age ${2024 - 1974})`)
console.log(`Contribution Years: ${example2Config.contributionYears}`)
console.log(`Type: Teilweise EM-Rente (50% of volle EM-Rente)`)
console.log('')
console.log('Calculation Results:')
console.log(`  Zurechnungszeiten Points: ${result2.zurechnungszeitenPoints.toFixed(2)}`)
console.log(`  Total Pension Points: ${result2.pensionPoints.toFixed(2)}`)
console.log(`  Gross Monthly Pension: ${result2.grossMonthlyPension.toFixed(2)} €`)
console.log(`  Gross Annual Pension: ${result2.grossAnnualPension.toFixed(2)} €`)
console.log(`  Hinzuverdienstgrenze: ${result2.hinzuverdienstgrenze.toFixed(2)} € per month`)
console.log('')

// Example 3: Disability near retirement age
console.log('Example 3: 65-year-old near retirement (minimal Zurechnungszeiten)')
console.log('-'.repeat(80))

const example3Config: EMRenteConfig = {
  enabled: true,
  type: 'volle',
  disabilityStartYear: 2024,
  birthYear: 1959, // Age 65 in 2024
  accumulatedPensionPoints: 40.0,
  contributionYears: 40,
  region: 'west',
  annualIncreaseRate: 1.0,
  applyZurechnungszeiten: true,
  applyAbschlaege: true,
  taxablePercentage: 80,
}

const result3 = calculateEMRenteForYear(example3Config, 2024)

console.log(`Birth Year: ${example3Config.birthYear}`)
console.log(`Disability Start: ${example3Config.disabilityStartYear} (Age ${2024 - 1959})`)
console.log(`Note: Only 2 years until regular retirement age`)
console.log('')
console.log('Calculation Results:')
console.log(`  Zurechnungszeiten Points: ${result3.zurechnungszeitenPoints.toFixed(2)} (minimal - only 2 years)`)
console.log(`  Total Pension Points: ${result3.pensionPoints.toFixed(2)}`)
console.log(`  Abschlag Percentage: ${result3.abschlagPercentage.toFixed(2)}% (24 months × 0.3%)`)
console.log(`  Gross Monthly Pension: ${result3.grossMonthlyPension.toFixed(2)} €`)
console.log(`  Gross Annual Pension: ${result3.grossAnnualPension.toFixed(2)} €`)
console.log('')

// Example 4: With Hinzuverdienst (additional income)
console.log('Example 4: EM-Rente with Hinzuverdienst exceeding limit')
console.log('-'.repeat(80))

const example4Config: EMRenteConfig = {
  enabled: true,
  type: 'volle',
  disabilityStartYear: 2024,
  birthYear: 1979,
  accumulatedPensionPoints: 25.0,
  contributionYears: 25,
  region: 'west',
  annualIncreaseRate: 1.0,
  applyZurechnungszeiten: true,
  applyAbschlaege: true,
  taxablePercentage: 80,
  monthlyAdditionalIncome: 1000, // 1000€ additional income
}

const result4 = calculateEMRenteForYear(example4Config, 2024)

console.log(`Monthly Additional Income: ${example4Config.monthlyAdditionalIncome} €`)
console.log(`Hinzuverdienstgrenze: ${result4.hinzuverdienstgrenze.toFixed(2)} €`)
console.log(`Exceeds Limit: ${result4.exceedsHinzuverdienstgrenze ? 'Yes' : 'No'}`)
console.log(`Hinzuverdienst Reduction: -${result4.hinzuverdienstReduction.toFixed(2)} €`)
console.log(`Gross Monthly Pension (after reduction): ${result4.grossMonthlyPension.toFixed(2)} €`)
console.log('')

// Example 5: Multi-year projection
console.log('Example 5: 5-year projection with annual increases')
console.log('-'.repeat(80))

const example5Config: EMRenteConfig = {
  enabled: true,
  type: 'volle',
  disabilityStartYear: 2024,
  birthYear: 1979,
  accumulatedPensionPoints: 25.0,
  contributionYears: 25,
  region: 'west',
  annualIncreaseRate: 1.5, // 1.5% annual increase
  applyZurechnungszeiten: true,
  applyAbschlaege: true,
  taxablePercentage: 80,
}

const results5 = calculateEMRente(example5Config, 2024, 2028)

console.log('Year-by-year projection:')
console.log('')
console.log('Year  | Adjustment | Monthly Gross | Annual Gross | Net Annual')
console.log('------|------------|---------------|--------------|------------')
for (let year = 2024; year <= 2028; year++) {
  const r = results5[year]
  console.log(
    `${year} | ${r.adjustmentFactor.toFixed(4)}    | ${r.grossMonthlyPension.toFixed(2)} €   | ${r.grossAnnualPension.toFixed(2)} € | ${r.netAnnualPension.toFixed(2)} €`
  )
}
console.log('')

// Example 6: Estimating pension points from known pension amount
console.log('Example 6: Estimate pension points from monthly pension')
console.log('-'.repeat(80))

const knownMonthlyPension = 1500 // User knows they get 1500€/month
const estimatedPoints = estimatePensionPointsFromMonthlyPension(knownMonthlyPension, 'west', 'volle')

console.log(`Known Monthly Pension: ${knownMonthlyPension} €`)
console.log(`Estimated Pension Points: ${estimatedPoints.toFixed(2)}`)
console.log('This can be used to configure EM-Rente when pension amount is known')
console.log('but pension points are not.')
console.log('')

// Summary
console.log('='.repeat(80))
console.log('Summary')
console.log('='.repeat(80))
console.log('')
console.log('The EM-Rente calculation system provides:')
console.log('✓ Zurechnungszeiten calculation (attribution periods to age 67)')
console.log('✓ Abschläge calculation (pension reductions, max 10.8%)')
console.log('✓ Hinzuverdienstgrenzen (permissible additional income limits)')
console.log('✓ Taxation according to German law')
console.log('✓ Support for both volle and teilweise EM-Rente')
console.log('✓ Multi-year projections with annual adjustments')
console.log('✓ Estimation tools for unknown parameters')
console.log('')
console.log('All calculations follow official German statutory pension regulations.')
console.log('='.repeat(80))
