/**
 * KPI Calculation Utilities
 * 
 * This module provides calculation functions for various Key Performance Indicators (KPIs)
 * used in the financial dashboard.
 */

/**
 * Calculate the savings rate (Sparquote) as a percentage of income
 * 
 * @param monthlySavings - Monthly savings amount in EUR
 * @param monthlyIncome - Monthly gross income in EUR
 * @returns Savings rate as a percentage (0-100)
 */
export function calculateSavingsRate(
  monthlySavings: number,
  monthlyIncome: number
): number {
  if (monthlyIncome <= 0) {
    return 0;
  }
  
  const rate = (monthlySavings / monthlyIncome) * 100;
  return Math.max(0, Math.min(100, rate)); // Clamp between 0 and 100
}

/**
 * Calculate the wealth accumulation rate (Vermögensaufbau-Rate)
 * This measures how much wealth is being accumulated relative to the target
 * 
 * @param currentWealth - Current portfolio value in EUR
 * @param targetWealth - Target portfolio value in EUR
 * @param yearsToTarget - Number of years to reach the target
 * @returns Annual wealth accumulation rate as a percentage
 */
export function calculateWealthAccumulationRate(
  currentWealth: number,
  targetWealth: number,
  yearsToTarget: number
): number {
  if (yearsToTarget <= 0 || currentWealth >= targetWealth) {
    return 0;
  }
  
  const wealthGap = targetWealth - currentWealth;
  const annualRequiredGrowth = wealthGap / yearsToTarget;
  const rate = (annualRequiredGrowth / targetWealth) * 100;
  
  return Math.max(0, rate);
}

/**
 * Calculate the expected pension gap (erwartete Rentenlücke)
 * This is the difference between desired retirement income and expected pension
 * 
 * @param desiredMonthlyIncome - Desired monthly income in retirement in EUR
 * @param expectedPension - Expected monthly pension from government/company in EUR
 * @returns Monthly pension gap in EUR (positive means additional income needed)
 */
export function calculatePensionGap(
  desiredMonthlyIncome: number,
  expectedPension: number
): number {
  return Math.max(0, desiredMonthlyIncome - expectedPension);
}

/**
 * Calculate required portfolio size to cover pension gap using the 4% rule
 * 
 * @param monthlyPensionGap - Monthly pension gap in EUR
 * @returns Required portfolio size in EUR
 */
export function calculateRequiredPortfolioForPensionGap(
  monthlyPensionGap: number
): number {
  const annualGap = monthlyPensionGap * 12;
  // Using 4% withdrawal rate (Trinity Study)
  return annualGap / 0.04;
}

/**
 * Evaluate savings rate and provide a category
 * 
 * @param savingsRate - Savings rate as a percentage
 * @returns Category: 'excellent', 'good', 'average', 'low'
 */
export function evaluateSavingsRate(savingsRate: number): 'excellent' | 'good' | 'average' | 'low' {
  if (savingsRate >= 20) return 'excellent';
  if (savingsRate >= 15) return 'good';
  if (savingsRate >= 10) return 'average';
  return 'low';
}

/**
 * Get a color for savings rate visualization
 * 
 * @param savingsRate - Savings rate as a percentage
 * @returns Tailwind color class
 */
export function getSavingsRateColor(savingsRate: number): string {
  if (savingsRate >= 20) return 'text-green-600 dark:text-green-400';
  if (savingsRate >= 15) return 'text-blue-600 dark:text-blue-400';
  if (savingsRate >= 10) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}
