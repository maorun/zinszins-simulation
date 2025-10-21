/**
 * Freistellungsaufträge-Optimierung (Tax Allowance Distribution Optimizer)
 *
 * This module helps optimize the distribution of Freistellungsaufträge (tax exemption orders)
 * across multiple bank accounts/depots to minimize overall tax burden.
 *
 * Key German Tax Rules:
 * - Sparerpauschbetrag (investor's lump sum): €1,000 per person (€2,000 for married couples)
 * - Can be distributed across multiple banks via Freistellungsauftrag
 * - Total across all banks cannot exceed the Sparerpauschbetrag
 * - Optimal distribution depends on expected capital gains at each bank
 */

/**
 * Represents a single bank account/depot with its expected capital gains
 */
export interface BankAccount {
  id: string
  name: string
  expectedCapitalGains: number // Expected annual capital gains in €
  assignedFreibetrag: number // Assigned Freistellungsauftrag amount in €
}

/**
 * Configuration for Freistellungsauftrag optimization
 */
export interface FreistellungsauftragConfig {
  totalFreibetrag: number // Total available Sparerpauschbetrag (1000 for individual, 2000 for couple)
  accounts: BankAccount[]
}

/**
 * Result of Freistellungsauftrag optimization
 */
export interface OptimizationResult {
  accounts: BankAccount[]
  totalTaxSaved: number // Total tax saved compared to no Freistellungsauftrag
  totalAssignedFreibetrag: number // Total Freibetrag assigned (should equal totalFreibetrag if fully utilized)
  remainingFreibetrag: number // Unused Freibetrag
  isOptimal: boolean // Whether the distribution is optimal
  recommendations: string[] // Optimization recommendations
}

/**
 * Distribute Freibetrag to accounts with highest expected gains first
 */
function distributeFreibetrag(
  sortedAccounts: BankAccount[],
  totalFreibetrag: number,
  teilfreistellungsquote: number,
): { optimizedAccounts: BankAccount[], remainingFreibetrag: number, recommendations: string[] } {
  let remainingFreibetrag = totalFreibetrag
  const optimizedAccounts: BankAccount[] = []
  const recommendations: string[] = []

  for (const account of sortedAccounts) {
    const taxableGains = account.expectedCapitalGains * (1 - teilfreistellungsquote)
    const assignedAmount = Math.min(taxableGains, remainingFreibetrag)

    optimizedAccounts.push({ ...account, assignedFreibetrag: assignedAmount })
    remainingFreibetrag -= assignedAmount

    if (taxableGains > assignedAmount && assignedAmount > 0) {
      recommendations.push(
        `${account.name}: Erwartete Gewinne (${taxableGains.toFixed(2)} €) `
        + `übersteigen zugewiesenen Freibetrag (${assignedAmount.toFixed(2)} €)`,
      )
    }

    if (remainingFreibetrag <= 0) break
  }

  // Add remaining accounts with no Freibetrag assignment
  for (const account of sortedAccounts.slice(optimizedAccounts.length)) {
    optimizedAccounts.push({ ...account, assignedFreibetrag: 0 })
  }

  return { optimizedAccounts, remainingFreibetrag, recommendations }
}

/**
 * Calculate the optimal distribution of Freistellungsauftrag across multiple accounts.
 *
 * Strategy: Prioritize accounts with highest expected capital gains to maximize tax savings.
 *
 * @param config - Freistellungsauftrag configuration
 * @param steuerlast - Tax rate (e.g., 0.26375 for 26.375%)
 * @param teilfreistellungsquote - Partial exemption rate (e.g., 0.3 for 30% equity fund exemption)
 * @returns Optimization result with recommended Freistellungsauftrag distribution
 */
export function optimizeFreistellungsauftrag(
  config: FreistellungsauftragConfig,
  steuerlast: number,
  teilfreistellungsquote: number,
): OptimizationResult {
  const { totalFreibetrag, accounts } = config

  // Sort accounts by expected capital gains (descending) to prioritize high-gain accounts
  const sortedAccounts = [...accounts].sort((a, b) => b.expectedCapitalGains - a.expectedCapitalGains)

  const { optimizedAccounts, remainingFreibetrag, recommendations } = distributeFreibetrag(
    sortedAccounts,
    totalFreibetrag,
    teilfreistellungsquote,
  )

  // Calculate total tax saved
  const totalTaxSaved = calculateTotalTaxSaved(optimizedAccounts, steuerlast, teilfreistellungsquote)

  // Check if distribution is optimal
  const isOptimal = remainingFreibetrag === 0 || sortedAccounts.every((acc) => {
    const optimizedAccount = optimizedAccounts.find(oa => oa.id === acc.id)
    const assigned = optimizedAccount?.assignedFreibetrag || 0
    return acc.expectedCapitalGains * (1 - teilfreistellungsquote) <= assigned
  })

  if (remainingFreibetrag > 0) {
    recommendations.push(
      `${remainingFreibetrag.toFixed(2)} € Freibetrag nicht genutzt - erwägen Sie zusätzliche Investments`,
    )
  }

  return {
    accounts: optimizedAccounts,
    totalTaxSaved,
    totalAssignedFreibetrag: totalFreibetrag - remainingFreibetrag,
    remainingFreibetrag,
    isOptimal,
    recommendations,
  }
}

/**
 * Calculate the total tax saved by using Freistellungsaufträge
 */
function calculateTotalTaxSaved(
  accounts: BankAccount[],
  steuerlast: number,
  teilfreistellungsquote: number,
): number {
  let totalTaxSaved = 0

  for (const account of accounts) {
    const taxableGains = account.expectedCapitalGains * (1 - teilfreistellungsquote)
    const taxableAmountAfterFreibetrag = Math.max(0, taxableGains - account.assignedFreibetrag)

    // Tax saved is the difference between tax without and with Freibetrag
    const taxWithoutFreibetrag = taxableGains * steuerlast
    const taxWithFreibetrag = taxableAmountAfterFreibetrag * steuerlast
    const taxSaved = taxWithoutFreibetrag - taxWithFreibetrag

    totalTaxSaved += taxSaved
  }

  return totalTaxSaved
}

/**
 * Validate Freistellungsauftrag configuration
 *
 * @param config - Configuration to validate
 * @returns Array of validation error messages (empty if valid)
 */
/**
 * Validate total Freibetrag amount
 */
function validateTotalFreibetrag(totalFreibetrag: number): string[] {
  const errors: string[] = []
  if (totalFreibetrag < 0) {
    errors.push('Gesamt-Freibetrag muss positiv sein')
  }
  if (totalFreibetrag > 2000) {
    errors.push('Gesamt-Freibetrag darf 2.000 € nicht überschreiten (max. für Ehepaare)')
  }
  return errors
}

/**
 * Validate account assignments
 */
function validateAccountAssignments(config: FreistellungsauftragConfig): string[] {
  const errors: string[] = []

  if (config.accounts.length === 0) {
    errors.push('Mindestens ein Konto muss vorhanden sein')
  }

  const totalAssigned = config.accounts.reduce((sum, acc) => sum + acc.assignedFreibetrag, 0)
  if (totalAssigned > config.totalFreibetrag) {
    errors.push(
      `Zugewiesener Freibetrag (${totalAssigned.toFixed(2)} €) überschreitet Gesamt-Freibetrag (${config.totalFreibetrag.toFixed(2)} €)`,
    )
  }

  for (const account of config.accounts) {
    if (account.expectedCapitalGains < 0) {
      errors.push(`${account.name}: Erwartete Kapitalerträge müssen positiv sein`)
    }

    if (account.assignedFreibetrag < 0) {
      errors.push(`${account.name}: Zugewiesener Freibetrag muss positiv sein`)
    }
  }

  // Check for duplicate account IDs
  const accountIds = config.accounts.map(acc => acc.id)
  const uniqueIds = new Set(accountIds)
  if (accountIds.length !== uniqueIds.size) {
    errors.push('Doppelte Konto-IDs gefunden')
  }

  return errors
}

export function validateFreistellungsauftragConfig(config: FreistellungsauftragConfig): string[] {
  return [
    ...validateTotalFreibetrag(config.totalFreibetrag),
    ...validateAccountAssignments(config),
  ]
}

/**
 * Calculate the effective tax rate for each account after Freistellungsauftrag
 */
export function calculateEffectiveTaxRates(
  accounts: BankAccount[],
  steuerlast: number,
  teilfreistellungsquote: number,
): Array<{ accountId: string, accountName: string, effectiveTaxRate: number, taxAmount: number }> {
  return accounts.map((account) => {
    const taxableGains = account.expectedCapitalGains * (1 - teilfreistellungsquote)
    const taxableAmountAfterFreibetrag = Math.max(0, taxableGains - account.assignedFreibetrag)
    const taxAmount = taxableAmountAfterFreibetrag * steuerlast

    // Calculate effective rate as percentage of total capital gains
    const effectiveTaxRate = account.expectedCapitalGains > 0
      ? (taxAmount / account.expectedCapitalGains)
      : 0

    return {
      accountId: account.id,
      accountName: account.name,
      effectiveTaxRate,
      taxAmount,
    }
  })
}
