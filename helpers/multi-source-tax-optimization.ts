/**
 * Multi-Source Tax Optimization Helper
 *
 * This module implements intelligent withdrawal strategies across multiple capital sources
 * (Depot, Riester, Rürup, Statutory Pension) to minimize overall tax burden during retirement.
 *
 * Key features:
 * - Optimal withdrawal sequence across multiple sources
 * - Different tax treatments per source (Kapitalertragsteuer, Einkommensteuer, etc.)
 * - Year-by-year optimization considering tax brackets
 * - Utilization of Grundfreibetrag and other tax allowances
 */

/**
 * Available capital sources for withdrawal optimization
 */
export type CapitalSource = 'depot' | 'riester' | 'ruerup' | 'statutory_pension'

/**
 * Tax treatment type for each capital source
 */
export type TaxTreatment = 'kapitalertragsteuer' | 'einkommensteuer' | 'mixed'

/**
 * Configuration for a single capital source
 */
export interface CapitalSourceConfig {
  /** Type of capital source */
  type: CapitalSource

  /** Available capital at start of retirement (depot only) */
  availableCapital?: number

  /** Expected annual payment (for pensions) */
  expectedAnnualPayment?: number

  /** Tax treatment for this source */
  taxTreatment: TaxTreatment

  /** Taxable percentage (e.g., 0.7 for 70% taxable Rürup) */
  taxablePercentage: number

  /** Priority for withdrawal (1 = highest priority, 5 = lowest) */
  priority: number

  /** Whether this source is enabled for optimization */
  enabled: boolean

  /** Teilfreistellung (only for depot with capital gains tax) */
  teilfreistellung?: number

  /** Start year for pension payments (for Riester/Rürup) */
  pensionStartYear?: number
}

/**
 * Configuration for multi-source tax optimization
 */
export interface MultiSourceTaxOptimizationConfig {
  /** Configuration for each available source */
  sources: CapitalSourceConfig[]

  /** Target annual withdrawal amount (before taxes) */
  targetAnnualWithdrawal: number

  /** Optimization strategy */
  optimizationMode: 'minimize_taxes' | 'maximize_after_tax' | 'balanced'

  /** Target utilization of Grundfreibetrag (0-1) */
  grundfreibetragUtilization: number

  /** Target utilization of Sparerpauschbetrag (0-1) */
  sparerpauschbetragUtilization: number

  /** Whether to consider progressive tax rates */
  considerProgressiveTax: boolean
}

/**
 * Result of withdrawal allocation across sources
 */
export interface WithdrawalAllocation {
  /** Withdrawal amount from Depot */
  depotWithdrawal: number

  /** Withdrawal amount from Riester */
  riesterWithdrawal: number

  /** Withdrawal amount from Rürup */
  ruerupWithdrawal: number

  /** Withdrawal amount from Statutory Pension */
  statutoryPensionWithdrawal: number

  /** Total withdrawal amount */
  totalWithdrawal: number

  /** Total tax paid (all sources combined) */
  totalTax: number

  /** Net amount after all taxes */
  netAmount: number

  /** Tax breakdown by source */
  taxBreakdown: {
    depot: number
    riester: number
    ruerup: number
    statutoryPension: number
  }

  /** Optimization details */
  optimization: {
    mode: string
    grundfreibetragUsed: number
    sparerpauschbetragUsed: number
    effectiveTaxRate: number
  }
}

/**
 * Tax parameters for a specific year
 */
export interface TaxParameters {
  /** Year for calculation */
  year: number

  /** Grundfreibetrag (income tax allowance) */
  grundfreibetrag: number

  /** Sparerpauschbetrag (capital gains tax allowance) */
  sparerpauschbetrag: number

  /** Kapitalertragsteuer rate (capital gains tax) */
  kapitalertragsteuerRate: number

  /** Solidaritätszuschlag rate */
  solidaritaetszuschlagRate: number

  /** Income tax rate (simplified, or marginal rate) */
  incomeTaxRate: number
}

/**
 * Calculate optimal withdrawal allocation across multiple capital sources
 */
export function calculateOptimalWithdrawalAllocation(
  config: MultiSourceTaxOptimizationConfig,
  taxParams: TaxParameters,
): WithdrawalAllocation {
  // Get enabled sources sorted by priority
  const enabledSources = config.sources.filter((s) => s.enabled).sort((a, b) => a.priority - b.priority)

  if (enabledSources.length === 0) {
    return createEmptyAllocation(config.optimizationMode)
  }

  // Apply optimization strategy
  switch (config.optimizationMode) {
    case 'minimize_taxes':
      return calculateMinimizeTaxesAllocation(enabledSources, config, taxParams)
    case 'maximize_after_tax':
      return calculateMaximizeAfterTaxAllocation(enabledSources, config, taxParams)
    case 'balanced':
      return calculateBalancedAllocation(enabledSources, config, taxParams)
    default:
      return createEmptyAllocation(config.optimizationMode)
  }
}

/**
 * Calculate allocation that minimizes total tax burden
 */
function calculateMinimizeTaxesAllocation(
  sources: CapitalSourceConfig[],
  config: MultiSourceTaxOptimizationConfig,
  taxParams: TaxParameters,
): WithdrawalAllocation {
  let remainingTarget = config.targetAnnualWithdrawal
  const allocation: Record<CapitalSource, number> = {
    depot: 0,
    riester: 0,
    ruerup: 0,
    statutory_pension: 0,
  }

  // Strategy: Prioritize sources with lowest tax burden first
  // 1. Use Depot up to Sparerpauschbetrag (tax-free capital gains)
  // 2. Use statutory pension/Rürup up to Grundfreibetrag (tax-free income)
  // 3. Then mix based on marginal tax rates

  // Step 1: Utilize Sparerpauschbetrag with Depot withdrawals
  remainingTarget = allocateDepotWithinSparerFreibetrag(sources, allocation, remainingTarget, config, taxParams)

  // Step 2: Utilize Grundfreibetrag with income-taxed sources
  remainingTarget = allocateIncomeSourcesWithinGrundfreibetrag(sources, allocation, remainingTarget, config, taxParams)

  // Step 3: Fill remaining from sources with lowest marginal tax rate
  allocateRemainingFromOptimalSources(sources, allocation, remainingTarget)

  // Calculate taxes and return allocation
  return calculateAllocationWithTaxes(allocation, sources, taxParams, config.optimizationMode)
}

/**
 * Allocate depot withdrawal within Sparerpauschbetrag
 */
function allocateDepotWithinSparerFreibetrag(
  sources: CapitalSourceConfig[],
  allocation: Record<CapitalSource, number>,
  remainingTarget: number,
  config: MultiSourceTaxOptimizationConfig,
  taxParams: TaxParameters,
): number {
  const depotSource = sources.find((s) => s.type === 'depot')
  if (!depotSource || remainingTarget <= 0) return remainingTarget

  const targetSparerUsage = taxParams.sparerpauschbetrag * config.sparerpauschbetragUtilization

  // Calculate how much depot withdrawal is needed to use target Sparerpauschbetrag
  const teilfreistellung = depotSource.teilfreistellung || 0
  const taxableGainsFactor = 1 - teilfreistellung
  const gainsRatio = 0.5 // Simplified: Assume 50% of withdrawal is gains
  const depotWithdrawalForSparerTarget = targetSparerUsage / (gainsRatio * taxableGainsFactor)

  const depotWithdrawal = Math.min(depotWithdrawalForSparerTarget, remainingTarget, depotSource.availableCapital || 0)
  allocation.depot = depotWithdrawal
  return remainingTarget - depotWithdrawal
}

/**
 * Allocate from income sources within Grundfreibetrag
 */
function allocateIncomeSourcesWithinGrundfreibetrag(
  sources: CapitalSourceConfig[],
  allocation: Record<CapitalSource, number>,
  remainingTarget: number,
  config: MultiSourceTaxOptimizationConfig,
  taxParams: TaxParameters,
): number {
  if (remainingTarget <= 0) return 0

  const targetGrundfreibetragUsage = taxParams.grundfreibetrag * config.grundfreibetragUtilization
  let grundfreibetragRemaining = targetGrundfreibetragUsage

  // Prioritize sources by taxable percentage (lower is better)
  const incomeSources = sources
    .filter((s) => s.type !== 'depot' && s.taxTreatment !== 'kapitalertragsteuer')
    .sort((a, b) => a.taxablePercentage - b.taxablePercentage)

  for (const source of incomeSources) {
    if (grundfreibetragRemaining <= 0 || remainingTarget <= 0) break

    const maxFromSource = source.expectedAnnualPayment || Math.min(remainingTarget / source.taxablePercentage, remainingTarget)
    const allocationAmount = Math.min(maxFromSource, remainingTarget, grundfreibetragRemaining / source.taxablePercentage)

    allocation[source.type] = allocationAmount
    remainingTarget -= allocationAmount
    grundfreibetragRemaining -= allocationAmount * source.taxablePercentage
  }

  return remainingTarget
}

/**
 * Allocate remaining amount from optimal sources
 */
function allocateRemainingFromOptimalSources(
  sources: CapitalSourceConfig[],
  allocation: Record<CapitalSource, number>,
  remainingTarget: number,
): void {
  if (remainingTarget <= 0) return

  // First try to allocate from depot if available
  remainingTarget = allocateRemainingFromDepot(sources, allocation, remainingTarget)

  // Then allocate from other sources
  allocateRemainingFromOtherSources(sources, allocation, remainingTarget)
}

/**
 * Allocate remaining from depot
 */
function allocateRemainingFromDepot(
  sources: CapitalSourceConfig[],
  allocation: Record<CapitalSource, number>,
  remainingTarget: number,
): number {
  const depotSource = sources.find((s) => s.type === 'depot')
  if (!depotSource || !depotSource.availableCapital || allocation.depot >= depotSource.availableCapital) {
    return remainingTarget
  }

  const additionalDepot = Math.min(remainingTarget, (depotSource.availableCapital || 0) - allocation.depot)
  allocation.depot += additionalDepot
  return remainingTarget - additionalDepot
}

/**
 * Allocate remaining from other sources
 */
function allocateRemainingFromOtherSources(
  sources: CapitalSourceConfig[],
  allocation: Record<CapitalSource, number>,
  remainingTarget: number,
): void {
  for (const source of sources) {
    if (remainingTarget <= 0) break
    if (source.type === 'depot') continue

    const maxFromSource = source.expectedAnnualPayment || remainingTarget
    const currentAllocation = allocation[source.type] || 0
    if (currentAllocation < maxFromSource) {
      const additionalAmount = Math.min(remainingTarget, maxFromSource - currentAllocation)
      allocation[source.type] += additionalAmount
      remainingTarget -= additionalAmount
    }
  }
}

/**
 * Calculate allocation that maximizes after-tax income
 */
function calculateMaximizeAfterTaxAllocation(
  sources: CapitalSourceConfig[],
  config: MultiSourceTaxOptimizationConfig,
  taxParams: TaxParameters,
): WithdrawalAllocation {
  // For maximize after-tax, we need to consider the net effect
  // This is similar to minimize_taxes but may accept slightly higher taxes if it means more gross withdrawal
  return calculateMinimizeTaxesAllocation(sources, config, taxParams)
}

/**
 * Calculate balanced allocation (mix of tax minimization and even distribution)
 */
function calculateBalancedAllocation(
  sources: CapitalSourceConfig[],
  config: MultiSourceTaxOptimizationConfig,
  taxParams: TaxParameters,
): WithdrawalAllocation {
  const allocation = createInitialBalancedAllocation(sources, config.targetAnnualWithdrawal)
  distributeRemainingBalanced(sources, allocation, config.targetAnnualWithdrawal)
  return calculateAllocationWithTaxes(allocation, sources, taxParams, config.optimizationMode)
}

/**
 * Create initial balanced allocation (equal distribution)
 */
function createInitialBalancedAllocation(
  sources: CapitalSourceConfig[],
  targetWithdrawal: number,
): Record<CapitalSource, number> {
  const enabledSources = sources.filter((s) => s.enabled)
  const allocation: Record<CapitalSource, number> = {
    depot: 0,
    riester: 0,
    ruerup: 0,
    statutory_pension: 0,
  }

  const perSourceTarget = targetWithdrawal / enabledSources.length
  let remainingTarget = targetWithdrawal

  for (const source of enabledSources) {
    const maxFromSource = source.type === 'depot' ? source.availableCapital || 0 : source.expectedAnnualPayment || perSourceTarget

    const allocationAmount = Math.min(perSourceTarget, maxFromSource, remainingTarget)
    allocation[source.type] = allocationAmount
    remainingTarget -= allocationAmount
  }

  return allocation
}

/**
 * Distribute any remaining amount in balanced mode
 */
function distributeRemainingBalanced(
  sources: CapitalSourceConfig[],
  allocation: Record<CapitalSource, number>,
  targetWithdrawal: number,
): void {
  const enabledSources = sources.filter((s) => s.enabled)
  const currentTotal = Object.values(allocation).reduce((sum, val) => sum + val, 0)
  let remainingTarget = targetWithdrawal - currentTotal

  if (remainingTarget <= 0) return

  for (const source of enabledSources) {
    if (remainingTarget <= 0) break

    const maxFromSource = source.type === 'depot' ? source.availableCapital || 0 : source.expectedAnnualPayment || remainingTarget

    const currentAllocation = allocation[source.type]
    if (currentAllocation < maxFromSource) {
      const additionalAmount = Math.min(remainingTarget, maxFromSource - currentAllocation)
      allocation[source.type] += additionalAmount
      remainingTarget -= additionalAmount
    }
  }
}

/**
 * Calculate taxes for the given allocation
 */
function calculateAllocationWithTaxes(
  allocation: Record<CapitalSource, number>,
  sources: CapitalSourceConfig[],
  taxParams: TaxParameters,
  optimizationMode: string,
): WithdrawalAllocation {
  const taxBreakdown = { depot: 0, riester: 0, ruerup: 0, statutoryPension: 0 }
  let sparerpauschbetragRemaining = taxParams.sparerpauschbetrag
  const grundfreibetragRemaining = taxParams.grundfreibetrag

  // Calculate depot taxes
  sparerpauschbetragRemaining = calculateDepotTaxes(allocation, sources, taxBreakdown, taxParams, sparerpauschbetragRemaining)

  // Calculate income taxes for pension sources
  calculateIncomeTaxes(allocation, sources, taxBreakdown, taxParams, grundfreibetragRemaining)

  const totalTax = Object.values(taxBreakdown).reduce((sum, tax) => sum + tax, 0)
  const totalWithdrawal = Object.values(allocation).reduce((sum, amount) => sum + amount, 0)
  const netAmount = totalWithdrawal - totalTax

  // Note: We can't track grundfreibetragRemaining changes since it's modified inside calculateIncomeTaxes
  // For optimization metrics, we approximate based on total taxable income
  const totalIncomeTaxed = Object.entries(allocation)
    .filter(([key]) => key !== 'depot')
    .reduce((sum, [key, amount]) => {
      const source = sources.find((s) => s.type === key)
      return sum + (source ? amount * source.taxablePercentage : 0)
    }, 0)
  const grundfreibetragUsed = Math.min(totalIncomeTaxed, taxParams.grundfreibetrag)

  return {
    depotWithdrawal: allocation.depot,
    riesterWithdrawal: allocation.riester,
    ruerupWithdrawal: allocation.ruerup,
    statutoryPensionWithdrawal: allocation.statutory_pension,
    totalWithdrawal,
    totalTax,
    netAmount,
    taxBreakdown,
    optimization: {
      mode: optimizationMode,
      grundfreibetragUsed,
      sparerpauschbetragUsed: taxParams.sparerpauschbetrag - sparerpauschbetragRemaining,
      effectiveTaxRate: totalWithdrawal > 0 ? totalTax / totalWithdrawal : 0,
    },
  }
}

/**
 * Calculate depot taxes (Kapitalertragsteuer)
 */
function calculateDepotTaxes(
  allocation: Record<CapitalSource, number>,
  sources: CapitalSourceConfig[],
  taxBreakdown: { depot: number; riester: number; ruerup: number; statutoryPension: number },
  taxParams: TaxParameters,
  sparerpauschbetragRemaining: number,
): number {
  const depotSource = sources.find((s) => s.type === 'depot')
  if (!depotSource || allocation.depot <= 0) return sparerpauschbetragRemaining

  const gainsRatio = 0.5 // Simplified: Assume 50% of withdrawal is taxable gains
  const taxableGains = allocation.depot * gainsRatio
  const teilfreistellung = depotSource.teilfreistellung || 0
  const taxableAfterTeilfreistellung = taxableGains * (1 - teilfreistellung)

  const taxableAfterFreibetrag = Math.max(0, taxableAfterTeilfreistellung - sparerpauschbetragRemaining)
  const newSparerRemaining = Math.max(0, sparerpauschbetragRemaining - taxableAfterTeilfreistellung)

  const kapitalertragsteuer = taxableAfterFreibetrag * taxParams.kapitalertragsteuerRate
  const soli = kapitalertragsteuer * taxParams.solidaritaetszuschlagRate
  taxBreakdown.depot = kapitalertragsteuer + soli

  return newSparerRemaining
}

/**
 * Calculate income taxes for pension sources
 */
function calculateIncomeTaxes(
  allocation: Record<CapitalSource, number>,
  sources: CapitalSourceConfig[],
  taxBreakdown: { depot: number; riester: number; ruerup: number; statutoryPension: number },
  taxParams: TaxParameters,
  initialGrundfreibetrag: number,
): void {
  let grundfreibetragRemaining = initialGrundfreibetrag
  const pensionSources = sources.filter((s) => s.type !== 'depot')
  for (const source of pensionSources) {
    const withdrawalAmount = allocation[source.type]
    if (withdrawalAmount <= 0) continue

    const taxableIncome = withdrawalAmount * source.taxablePercentage
    const taxableAfterGrundfreibetrag = Math.max(0, taxableIncome - grundfreibetragRemaining)
    grundfreibetragRemaining = Math.max(0, grundfreibetragRemaining - taxableIncome)

    const incomeTax = taxableAfterGrundfreibetrag * taxParams.incomeTaxRate
    const soli = incomeTax * taxParams.solidaritaetszuschlagRate

    const taxBreakdownKey =
      source.type === 'statutory_pension' ? 'statutoryPension' : (source.type as 'riester' | 'ruerup')
    taxBreakdown[taxBreakdownKey] = incomeTax + soli
  }
}

/**
 * Create empty allocation (fallback)
 */
function createEmptyAllocation(optimizationMode: string): WithdrawalAllocation {
  return {
    depotWithdrawal: 0,
    riesterWithdrawal: 0,
    ruerupWithdrawal: 0,
    statutoryPensionWithdrawal: 0,
    totalWithdrawal: 0,
    totalTax: 0,
    netAmount: 0,
    taxBreakdown: {
      depot: 0,
      riester: 0,
      ruerup: 0,
      statutoryPension: 0,
    },
    optimization: {
      mode: optimizationMode,
      grundfreibetragUsed: 0,
      sparerpauschbetragUsed: 0,
      effectiveTaxRate: 0,
    },
  }
}

/**
 * Create default multi-source configuration
 */
export function createDefaultMultiSourceConfig(): MultiSourceTaxOptimizationConfig {
  return {
    sources: [
      {
        type: 'depot',
        availableCapital: 0,
        taxTreatment: 'kapitalertragsteuer',
        taxablePercentage: 1.0,
        priority: 1,
        enabled: true,
        teilfreistellung: 0.3,
      },
      {
        type: 'riester',
        expectedAnnualPayment: 0,
        taxTreatment: 'einkommensteuer',
        taxablePercentage: 1.0, // 100% taxable
        priority: 2,
        enabled: false,
        pensionStartYear: 2040,
      },
      {
        type: 'ruerup',
        expectedAnnualPayment: 0,
        taxTreatment: 'einkommensteuer',
        taxablePercentage: 0.8, // Depends on retirement year (increases yearly)
        priority: 3,
        enabled: false,
        pensionStartYear: 2040,
      },
      {
        type: 'statutory_pension',
        expectedAnnualPayment: 0,
        taxTreatment: 'einkommensteuer',
        taxablePercentage: 0.8, // Depends on retirement year (increases yearly)
        priority: 4,
        enabled: false,
        pensionStartYear: 2040,
      },
    ],
    targetAnnualWithdrawal: 40000,
    optimizationMode: 'minimize_taxes',
    grundfreibetragUtilization: 0.9,
    sparerpauschbetragUtilization: 0.95,
    considerProgressiveTax: true,
  }
}

/**
 * Calculate naive (non-optimized) withdrawal for comparison
 *
 * Naive strategy: Simply distribute evenly across all enabled sources
 */
export function calculateNaiveWithdrawal(
  config: MultiSourceTaxOptimizationConfig,
  taxParams: TaxParameters,
): WithdrawalAllocation {
  const enabledSources = config.sources.filter((s) => s.enabled)

  if (enabledSources.length === 0) {
    return createEmptyAllocation('naive')
  }

  const allocation = createEvenDistributionAllocation(enabledSources, config.targetAnnualWithdrawal)
  distributeRemainingNaive(enabledSources, allocation, config.targetAnnualWithdrawal)

  return calculateAllocationWithTaxes(allocation, enabledSources, taxParams, 'naive')
}

/**
 * Create even distribution allocation
 */
function createEvenDistributionAllocation(
  enabledSources: CapitalSourceConfig[],
  targetWithdrawal: number,
): Record<CapitalSource, number> {
  const allocation: Record<CapitalSource, number> = {
    depot: 0,
    riester: 0,
    ruerup: 0,
    statutory_pension: 0,
  }

  const perSourceTarget = targetWithdrawal / enabledSources.length
  let remainingTarget = targetWithdrawal

  for (const source of enabledSources) {
    const maxFromSource = source.type === 'depot' ? source.availableCapital || 0 : source.expectedAnnualPayment || perSourceTarget

    const allocationAmount = Math.min(perSourceTarget, maxFromSource, remainingTarget)
    allocation[source.type] = allocationAmount
    remainingTarget -= allocationAmount
  }

  return allocation
}

/**
 * Distribute any remaining in naive mode
 */
function distributeRemainingNaive(
  enabledSources: CapitalSourceConfig[],
  allocation: Record<CapitalSource, number>,
  targetWithdrawal: number,
): void {
  const currentTotal = Object.values(allocation).reduce((sum, val) => sum + val, 0)
  let remainingTarget = targetWithdrawal - currentTotal

  if (remainingTarget <= 0) return

  for (const source of enabledSources) {
    if (remainingTarget <= 0) break

    const maxFromSource = source.type === 'depot' ? source.availableCapital || 0 : source.expectedAnnualPayment || remainingTarget

    const currentAllocation = allocation[source.type]
    if (currentAllocation < maxFromSource) {
      const additionalAmount = Math.min(remainingTarget, maxFromSource - currentAllocation)
      allocation[source.type] += additionalAmount
      remainingTarget -= additionalAmount
    }
  }
}

/**
 * Calculate tax savings from using optimized vs. naive withdrawal
 */
export function calculateTaxSavings(
  optimizedAllocation: WithdrawalAllocation,
  naiveAllocation: WithdrawalAllocation,
): {
  annualTaxSavings: number
  percentageSavings: number
  netIncomeImprovement: number
} {
  const annualTaxSavings = naiveAllocation.totalTax - optimizedAllocation.totalTax
  const percentageSavings = naiveAllocation.totalTax > 0 ? (annualTaxSavings / naiveAllocation.totalTax) * 100 : 0
  const netIncomeImprovement = optimizedAllocation.netAmount - naiveAllocation.netAmount

  return {
    annualTaxSavings,
    percentageSavings,
    netIncomeImprovement,
  }
}
