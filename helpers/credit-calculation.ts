import type { CreditTerms } from '../src/utils/sparplan-utils'

/**
 * Calculate monthly payment for a loan using the standard loan payment formula
 * PMT = P * [r(1+r)^n] / [(1+r)^n - 1]
 * Where: P = principal, r = monthly interest rate, n = number of payments
 */
export function calculateMonthlyPayment(
  principal: number,
  annualInterestRate: number,
  termYears: number,
): number {
  if (annualInterestRate === 0) {
    // If no interest, just divide evenly
    return principal / (termYears * 12)
  }

  const monthlyRate = annualInterestRate / 12
  const numberOfPayments = termYears * 12

  const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))
    / (Math.pow(1 + monthlyRate, numberOfPayments) - 1)

  return monthlyPayment
}

/**
 * Calculate total interest paid over the life of a loan
 */
export function calculateTotalInterest(
  principal: number,
  annualInterestRate: number,
  termYears: number,
): number {
  const monthlyPayment = calculateMonthlyPayment(principal, annualInterestRate, termYears)
  const totalPayments = monthlyPayment * termYears * 12
  return totalPayments - principal
}

/**
 * Generate amortization schedule for a loan
 * Returns array of yearly payment breakdowns
 */
export function generateAmortizationSchedule(
  principal: number,
  annualInterestRate: number,
  termYears: number,
): Array<{
  year: number
  beginningBalance: number
  payment: number
  principal: number
  interest: number
  endingBalance: number
}> {
  if (annualInterestRate === 0) {
    // Handle zero interest case
    const yearlyPayment = principal / termYears
    return Array.from({ length: termYears }, (_, index) => ({
      year: index + 1,
      beginningBalance: principal - (yearlyPayment * index),
      payment: yearlyPayment,
      principal: yearlyPayment,
      interest: 0,
      endingBalance: principal - (yearlyPayment * (index + 1)),
    }))
  }

  const monthlyPayment = calculateMonthlyPayment(principal, annualInterestRate, termYears)
  const monthlyRate = annualInterestRate / 12
  const schedule: Array<{
    year: number
    beginningBalance: number
    payment: number
    principal: number
    interest: number
    endingBalance: number
  }> = []

  let balance = principal

  for (let year = 1; year <= termYears; year++) {
    let yearlyInterest = 0
    let yearlyPrincipal = 0
    const beginningBalance = balance

    // Calculate 12 months for this year
    for (let month = 1; month <= 12; month++) {
      const interestPayment = balance * monthlyRate
      const principalPayment = monthlyPayment - interestPayment

      yearlyInterest += interestPayment
      yearlyPrincipal += principalPayment
      balance -= principalPayment

      // Prevent negative balance due to floating point precision
      if (balance < 0.01) balance = 0
    }

    schedule.push({
      year,
      beginningBalance,
      payment: monthlyPayment * 12,
      principal: yearlyPrincipal,
      interest: yearlyInterest,
      endingBalance: balance,
    })
  }

  return schedule
}

/**
 * Calculate the remaining balance on a loan after a certain number of payments
 */
export function calculateRemainingBalance(
  principal: number,
  annualInterestRate: number,
  termYears: number,
  paymentsMode: number,
): number {
  if (annualInterestRate === 0) {
    const totalPayments = termYears * 12
    const remainingPayments = totalPayments - paymentsMode
    return (principal / totalPayments) * remainingPayments
  }

  // Calculate monthly payment - for reference only, not used in remaining balance calculation
  const monthlyRate = annualInterestRate / 12
  const numberOfPayments = termYears * 12

  if (paymentsMode >= numberOfPayments) return 0

  // Calculate remaining balance using the formula:
  // B = P * [(1+r)^n - (1+r)^p] / [(1+r)^n - 1]
  // Where B = balance, P = principal, r = monthly rate, n = total payments, p = payments made
  const remainingBalance = principal * (
    (Math.pow(1 + monthlyRate, numberOfPayments) - Math.pow(1 + monthlyRate, paymentsMode))
    / (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
  )

  return Math.max(0, remainingBalance)
}

/**
 * Create default credit terms for different expense types
 */
export function getDefaultCreditTerms(expenseType: string, amount: number): CreditTerms {
  const defaults: Record<string, Partial<CreditTerms>> = {
    car: { interestRate: 0.045, termYears: 5 }, // 4.5% for 5 years
    real_estate: { interestRate: 0.035, termYears: 20 }, // 3.5% for 20 years
    education: { interestRate: 0.025, termYears: 10 }, // 2.5% for 10 years
    medical: { interestRate: 0.040, termYears: 3 }, // 4.0% for 3 years
    other: { interestRate: 0.050, termYears: 5 }, // 5.0% for 5 years
  }

  const defaultTerms = defaults[expenseType] || defaults.other
  const monthlyPayment = calculateMonthlyPayment(
    amount,
    defaultTerms.interestRate!,
    defaultTerms.termYears!,
  )

  return {
    interestRate: defaultTerms.interestRate!,
    termYears: defaultTerms.termYears!,
    monthlyPayment,
  }
}
