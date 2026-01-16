/**
 * Tax Loss Harvesting Tracker - Advanced Portfolio Analysis
 *
 * This module extends the basic tax loss harvesting with comprehensive portfolio tracking,
 * wash-sale rule enforcement, and replacement investment suggestions following German tax law.
 *
 * Key features:
 * - Automatic loss opportunity detection from portfolio positions
 * - Wash-Sale rule enforcement (30-day rule § 20 Abs. 6 EStG)
 * - Replacement investment suggestions for similar assets
 * - Transaction cost consideration for cost-benefit analysis
 * - Priority ranking by tax efficiency
 *
 * German tax law references:
 * - § 20 Abs. 6 EStG: Verlustverrechnung bei Kapitalerträgen
 * - § 20 Abs. 2 Nr. 1 EStG: Kapitalerträge aus Aktienverkäufen
 */

/**
 * Portfolio position representing an investment holding
 */
export interface PortfolioPosition {
  /** Unique identifier for the position */
  id: string
  /** Name of the investment (e.g., "MSCI World ETF") */
  name: string
  /** ISIN or ticker symbol */
  symbol: string
  /** Asset class category */
  assetClass: 'stocks' | 'bonds' | 'reits' | 'commodities' | 'mixed' | 'other'
  /** Acquisition date */
  acquisitionDate: Date
  /** Purchase price per unit in EUR */
  purchasePrice: number
  /** Current market price per unit in EUR */
  currentPrice: number
  /** Number of units held */
  quantity: number
  /** Total purchase cost (including transaction fees) */
  totalCost: number
  /** Current market value */
  currentValue: number
  /** Unrealized gain/loss in EUR */
  unrealizedGainLoss: number
  /** Unrealized gain/loss in percentage */
  unrealizedGainLossPercent: number
  /** Whether this is a stock fund (for Teilfreistellung) */
  isStockFund: boolean
}

/**
 * Configuration for wash-sale rule checking
 */
export interface WashSaleConfig {
  /** Number of days before sale to check for purchases (default: 30) */
  daysBefore: number
  /** Number of days after sale to check for purchases (default: 30) */
  daysAfter: number
  /** Whether to enforce wash-sale rule (default: true) */
  enabled: boolean
}

/**
 * Wash-sale violation result
 */
export interface WashSaleViolation {
  /** Original sale date */
  saleDate: Date
  /** Position that was sold */
  soldPosition: PortfolioPosition
  /** Date of disallowing purchase */
  purchaseDate: Date
  /** Similar position that was purchased */
  purchasedPosition: PortfolioPosition
  /** Number of days between sale and purchase */
  daysBetween: number
  /** Whether this is a before or after violation */
  violationType: 'before' | 'after'
  /** Amount of loss disallowed in EUR */
  disallowedLoss: number
}

/**
 * Transaction cost configuration
 */
export interface TransactionCostConfig {
  /** Percentage fee (e.g., 0.25 for 0.25%) */
  percentageFee: number
  /** Fixed fee per transaction in EUR */
  fixedFee: number
  /** Minimum transaction amount in EUR to avoid */
  minTransactionAmount: number
}

/**
 * Loss harvesting opportunity identified from portfolio
 */
export interface LossHarvestingOpportunity {
  /** Position with unrealized loss */
  position: PortfolioPosition
  /** Unrealized loss amount in EUR */
  lossAmount: number
  /** Potential tax savings from harvesting this loss */
  potentialTaxSavings: number
  /** Transaction costs to realize this loss */
  transactionCosts: number
  /** Net benefit after transaction costs */
  netBenefit: number
  /** Priority ranking (1 = highest priority) */
  priority: number
  /** Priority level for UI display */
  priorityLevel: 'high' | 'medium' | 'low'
  /** Whether this would trigger wash-sale rule */
  washSaleRisk: boolean
  /** Earliest date position can be sold without wash-sale violation */
  earliestSaleDate: Date
  /** Recommendation text for user */
  recommendation: string
  /** Replacement investment suggestions */
  replacementSuggestions: ReplacementInvestment[]
}

/**
 * Replacement investment suggestion
 */
export interface ReplacementInvestment {
  /** Name of the replacement investment */
  name: string
  /** Ticker or ISIN */
  symbol: string
  /** Asset class */
  assetClass: string
  /** Reason why this is a good replacement */
  reason: string
  /** Expected correlation with sold position (0-1) */
  correlation: number
  /** Risk level compared to sold position */
  riskLevel: 'lower' | 'similar' | 'higher'
  /** Whether this maintains similar market exposure */
  maintainsExposure: boolean
}

/**
 * Calculate unrealized gain/loss for a position
 */
export function calculatePositionGainLoss(
  _purchasePrice: number,
  currentPrice: number,
  quantity: number,
  totalCost: number,
): { unrealizedGainLoss: number; unrealizedGainLossPercent: number; currentValue: number } {
  const currentValue = currentPrice * quantity
  const unrealizedGainLoss = currentValue - totalCost
  const unrealizedGainLossPercent = totalCost > 0 ? (unrealizedGainLoss / totalCost) * 100 : 0

  return {
    currentValue,
    unrealizedGainLoss,
    unrealizedGainLossPercent,
  }
}

/**
 * Check if two positions are substantially identical (for wash-sale rule)
 *
 * German interpretation: Same ISIN or very similar investment
 * (e.g., two MSCI World ETFs from different providers)
 */
export function arePositionsSubstantiallyIdentical(pos1: PortfolioPosition, pos2: PortfolioPosition): boolean {
  // Exact match on symbol/ISIN
  if (pos1.symbol === pos2.symbol) {
    return true
  }

  // Same asset class and very similar name (fuzzy matching)
  if (pos1.assetClass === pos2.assetClass) {
    const name1 = pos1.name.toLowerCase().replace(/\s+/g, '')
    const name2 = pos2.name.toLowerCase().replace(/\s+/g, '')

    // Check if names are very similar (simplified check)
    const similarity = calculateStringSimilarity(name1, name2)
    if (similarity > 0.8) {
      return true
    }
  }

  return false
}

/**
 * Simple string similarity calculation (Jaccard similarity)
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  const set1 = new Set(str1.split(''))
  const set2 = new Set(str2.split(''))

  const intersection = new Set([...set1].filter(x => set2.has(x)))
  const union = new Set([...set1, ...set2])

  return union.size > 0 ? intersection.size / union.size : 0
}

/**
 * Check for wash-sale rule violations
 *
 * German context: While Germany doesn't have an explicit "wash sale rule" like the US,
 * the tax authorities can deny loss recognition if they determine that a loss was
 * artificially created (Gestaltungsmissbrauch § 42 AO). This function implements
 * a conservative 30-day window approach.
 */
export function checkWashSaleViolation(
  soldPosition: PortfolioPosition,
  saleDate: Date,
  portfolio: PortfolioPosition[],
  config: WashSaleConfig = getDefaultWashSaleConfig(),
): WashSaleViolation | null {
  if (!config.enabled) {
    return null
  }

  const daysBefore = config.daysBefore * 24 * 60 * 60 * 1000 // Convert to milliseconds
  const daysAfter = config.daysAfter * 24 * 60 * 60 * 1000
  const saleTime = saleDate.getTime()

  // Check for purchases of substantially identical positions
  for (const position of portfolio) {
    if (position.id === soldPosition.id || !arePositionsSubstantiallyIdentical(soldPosition, position)) {
      continue
    }

    const violation = checkSinglePositionWashSale(soldPosition, saleDate, position, saleTime, daysBefore, daysAfter)
    if (violation) {
      return violation
    }
  }

  return null
}

/**
 * Check wash-sale violation for a single position pair
 */
function checkSinglePositionWashSale(
  soldPosition: PortfolioPosition,
  saleDate: Date,
  position: PortfolioPosition,
  saleTime: number,
  daysBefore: number,
  daysAfter: number,
): WashSaleViolation | null {
  const purchaseTime = position.acquisitionDate.getTime()
  const timeDiff = saleTime - purchaseTime

  // Check if purchase was within wash-sale window
  if (Math.abs(timeDiff) <= daysBefore || (timeDiff < 0 && Math.abs(timeDiff) <= daysAfter)) {
    const violationType = timeDiff >= 0 ? 'before' : 'after'
    const daysBetween = Math.abs(Math.round(timeDiff / (24 * 60 * 60 * 1000)))
    const disallowedLoss = Math.abs(Math.min(0, soldPosition.unrealizedGainLoss))

    return {
      saleDate,
      soldPosition,
      purchaseDate: position.acquisitionDate,
      purchasedPosition: position,
      daysBetween,
      violationType,
      disallowedLoss,
    }
  }

  return null
}

/**
 * Calculate transaction costs for selling a position
 */
export function calculateTransactionCosts(
  positionValue: number,
  config: TransactionCostConfig,
): { totalCost: number; percentageCost: number; fixedCost: number } {
  const percentageCost = (positionValue * config.percentageFee) / 100
  const fixedCost = config.fixedFee
  const totalCost = percentageCost + fixedCost

  return {
    totalCost,
    percentageCost,
    fixedCost,
  }
}

/**
 * Calculate tax savings from harvesting a loss
 *
 * @param lossAmount - Unrealized loss amount in EUR (positive number)
 * @param taxRate - Effective tax rate after Teilfreistellung
 * @param isStockFund - Whether this is a stock fund (for Teilfreistellung)
 * @param teilfreistellungsquote - Teilfreistellung percentage (0-100)
 */
export function calculateTaxSavings(
  lossAmount: number,
  taxRate: number,
  isStockFund: boolean,
  teilfreistellungsquote: number,
): number {
  if (lossAmount <= 0) {
    return 0
  }

  // Apply Teilfreistellung if applicable
  const effectiveTaxRate = isStockFund ? taxRate * (1 - teilfreistellungsquote / 100) : taxRate

  return lossAmount * effectiveTaxRate
}

/**
 * Generate replacement investment suggestions for a sold position
 */
export function generateReplacementSuggestions(position: PortfolioPosition): ReplacementInvestment[] {
  const suggestions: ReplacementInvestment[] = []

  // Add asset class specific suggestions
  suggestions.push(...getAssetClassSpecificSuggestions(position))

  // Always add a cash option
  suggestions.push(getCashSuggestion())

  return suggestions
}

/**
 * Get asset class specific replacement suggestions
 */
function getAssetClassSpecificSuggestions(position: PortfolioPosition): ReplacementInvestment[] {
  const suggestionMap: Record<PortfolioPosition['assetClass'], ReplacementInvestment[]> = {
    stocks: getStockSuggestions(),
    bonds: getBondSuggestions(),
    reits: getReitSuggestions(),
    commodities: getCommoditySuggestions(),
    mixed: getMixedSuggestions(),
    other: getOtherSuggestions(position),
  }

  return suggestionMap[position.assetClass] || []
}

/**
 * Get stock-specific suggestions
 */
function getStockSuggestions(): ReplacementInvestment[] {
  return [
    {
      name: 'Alternativer Weltaktien-ETF',
      symbol: 'Alternative MSCI World ETF',
      assetClass: 'stocks',
      reason:
        'Ähnliche Marktabdeckung mit einem anderen Anbieter. Vermeidet Wash-Sale-Problematik bei nahezu identischem Exposure.',
      correlation: 0.95,
      riskLevel: 'similar',
      maintainsExposure: true,
    },
    {
      name: 'Sektor-rotierter ETF',
      symbol: 'Sector Rotation ETF',
      assetClass: 'stocks',
      reason:
        'Diversifizierte Aktienanlage mit anderer Zusammensetzung. Reduziert Ähnlichkeit zur ursprünglichen Position.',
      correlation: 0.75,
      riskLevel: 'similar',
      maintainsExposure: true,
    },
  ]
}

/**
 * Get bond-specific suggestions
 */
function getBondSuggestions(): ReplacementInvestment[] {
  return [
    {
      name: 'Alternativer Anleihen-ETF',
      symbol: 'Alternative Bond ETF',
      assetClass: 'bonds',
      reason: 'Anleihen-ETF mit anderer Laufzeitenstruktur oder anderen Emittenten zur Vermeidung von Wash-Sale.',
      correlation: 0.85,
      riskLevel: 'similar',
      maintainsExposure: true,
    },
  ]
}

/**
 * Get REIT-specific suggestions
 */
function getReitSuggestions(): ReplacementInvestment[] {
  return [
    {
      name: 'Alternativer Immobilien-ETF',
      symbol: 'Alternative REIT ETF',
      assetClass: 'reits',
      reason: 'Immobilien-ETF mit anderer geografischer oder Sektor-Ausrichtung.',
      correlation: 0.8,
      riskLevel: 'similar',
      maintainsExposure: true,
    },
  ]
}

/**
 * Get commodity-specific suggestions
 */
function getCommoditySuggestions(): ReplacementInvestment[] {
  return [
    {
      name: 'Diversifizierter Rohstoff-Basket',
      symbol: 'Commodity Basket ETF',
      assetClass: 'commodities',
      reason: 'Breiter Rohstoff-Mix zur Diversifikation und Vermeidung der Wash-Sale-Regel.',
      correlation: 0.7,
      riskLevel: 'similar',
      maintainsExposure: true,
    },
  ]
}

/**
 * Get mixed asset suggestions
 */
function getMixedSuggestions(): ReplacementInvestment[] {
  return [
    {
      name: 'Multi-Asset-Portfolio mit anderer Gewichtung',
      symbol: 'Alternative Multi-Asset Fund',
      assetClass: 'mixed',
      reason: 'Mischfonds mit unterschiedlicher Asset Allocation zur Diversifikation.',
      correlation: 0.75,
      riskLevel: 'similar',
      maintainsExposure: true,
    },
  ]
}

/**
 * Get suggestions for other asset classes
 */
function getOtherSuggestions(position: PortfolioPosition): ReplacementInvestment[] {
  return [
    {
      name: 'Diversifiziertes Ersatz-Investment',
      symbol: 'Alternative Investment',
      assetClass: position.assetClass,
      reason: 'Vergleichbares Investment mit unterschiedlicher Zusammensetzung.',
      correlation: 0.7,
      riskLevel: 'similar',
      maintainsExposure: true,
    },
  ]
}

/**
 * Get cash/liquidity suggestion
 */
function getCashSuggestion(): ReplacementInvestment {
  return {
    name: 'Liquidität (Tagesgeld/Geldmarkt-ETF)',
    symbol: 'Cash / Money Market',
    assetClass: 'cash',
    reason:
      '30-Tage-Pause mit sicherer Anlage. Nach Wash-Sale-Periode erneuter Einstieg in ursprüngliche Position möglich.',
    correlation: 0.0,
    riskLevel: 'lower',
    maintainsExposure: false,
  }
}

/**
 * Identify loss harvesting opportunities from portfolio
 */
export function identifyLossHarvestingOpportunities(
  portfolio: PortfolioPosition[],
  taxRate: number,
  teilfreistellungsquote: number,
  transactionCostConfig: TransactionCostConfig,
  washSaleConfig: WashSaleConfig = getDefaultWashSaleConfig(),
): LossHarvestingOpportunity[] {
  const opportunities: LossHarvestingOpportunity[] = []
  const today = new Date()

  // Find all positions with unrealized losses
  const lossPositions = portfolio.filter(pos => pos.unrealizedGainLoss < 0)

  for (const position of lossPositions) {
    const opportunity = analyzePosition(position, today, portfolio, taxRate, teilfreistellungsquote, transactionCostConfig, washSaleConfig)
    if (opportunity) {
      opportunities.push(opportunity)
    }
  }

  // Sort by net benefit (descending) and assign priority ranks
  opportunities.sort((a, b) => b.netBenefit - a.netBenefit)
  opportunities.forEach((opp, index) => {
    opp.priority = index + 1
  })

  return opportunities
}

/**
 * Analyze a single position for loss harvesting opportunity
 */
function analyzePosition(
  position: PortfolioPosition,
  today: Date,
  portfolio: PortfolioPosition[],
  taxRate: number,
  teilfreistellungsquote: number,
  transactionCostConfig: TransactionCostConfig,
  washSaleConfig: WashSaleConfig,
): LossHarvestingOpportunity | null {
  const lossAmount = Math.abs(position.unrealizedGainLoss)
  const transactionCosts = calculateTransactionCosts(position.currentValue, transactionCostConfig)
  const potentialTaxSavings = calculateTaxSavings(lossAmount, taxRate, position.isStockFund, teilfreistellungsquote)
  const washSaleViolation = checkWashSaleViolation(position, today, portfolio, washSaleConfig)
  const washSaleRisk = washSaleViolation !== null

  let earliestSaleDate = today
  if (washSaleRisk && washSaleViolation) {
    earliestSaleDate = new Date(washSaleViolation.purchaseDate)
    earliestSaleDate.setDate(earliestSaleDate.getDate() + washSaleConfig.daysAfter)
  }

  const netBenefit = potentialTaxSavings - transactionCosts.totalCost

  // Skip if net benefit is negative or transaction amount is too small
  if (netBenefit <= 0 || position.currentValue < transactionCostConfig.minTransactionAmount) {
    return null
  }

  const replacementSuggestions = generateReplacementSuggestions(position)
  const priorityScore = calculatePriorityScore(netBenefit, lossAmount, washSaleRisk, position.unrealizedGainLossPercent)
  const priorityLevel = getPriorityLevel(priorityScore)
  const recommendation = generateRecommendation(position, netBenefit, washSaleRisk, earliestSaleDate, today)

  return {
    position,
    lossAmount,
    potentialTaxSavings,
    transactionCosts: transactionCosts.totalCost,
    netBenefit,
    priority: 0, // Will be assigned after sorting
    priorityLevel,
    washSaleRisk,
    earliestSaleDate,
    recommendation,
    replacementSuggestions,
  }
}

/**
 * Get priority level from priority score
 */
function getPriorityLevel(priorityScore: number): 'high' | 'medium' | 'low' {
  if (priorityScore >= 80) return 'high'
  if (priorityScore >= 50) return 'medium'
  return 'low'
}

/**
 * Calculate priority score for an opportunity (0-100)
 */
function calculatePriorityScore(
  netBenefit: number,
  lossAmount: number,
  washSaleRisk: boolean,
  lossPercent: number,
): number {
  let score = 0

  // Net benefit contribution (0-40 points)
  score += Math.min(40, (netBenefit / 1000) * 10)

  // Loss amount contribution (0-30 points)
  score += Math.min(30, (lossAmount / 5000) * 30)

  // Loss percentage contribution (0-20 points)
  score += Math.min(20, (Math.abs(lossPercent) / 20) * 20)

  // Wash-sale risk penalty (-20 points)
  if (washSaleRisk) {
    score -= 20
  }

  return Math.max(0, Math.min(100, score))
}

/**
 * Generate recommendation text for an opportunity
 */
function generateRecommendation(
  position: PortfolioPosition,
  netBenefit: number,
  washSaleRisk: boolean,
  earliestSaleDate: Date,
  today: Date,
): string {
  let recommendation = `Verkauf von ${position.name} würde ${formatEuro(netBenefit)} Netto-Steuerersparnis bringen. `

  if (washSaleRisk) {
    const daysUntilSafe = Math.ceil((earliestSaleDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))
    if (daysUntilSafe > 0) {
      recommendation += `⚠️ Achtung: Wash-Sale-Risiko! Frühester Verkauf ohne Risiko: ${formatDate(earliestSaleDate)} (in ${daysUntilSafe} Tagen). `
    } else {
      recommendation += `⚠️ Achtung: Kürzlich identische Position gekauft. Vermeiden Sie erneuten Kauf für 30 Tage. `
    }
  } else {
    recommendation += `✅ Kein Wash-Sale-Risiko. Verkauf kann sofort durchgeführt werden. `
  }

  recommendation += `Erwägen Sie Ersatz-Investments zur Aufrechterhaltung der Asset Allocation.`

  return recommendation
}

/**
 * Format Euro amount
 */
function formatEuro(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format date
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

/**
 * Default wash-sale configuration
 */
export function getDefaultWashSaleConfig(): WashSaleConfig {
  return {
    daysBefore: 30,
    daysAfter: 30,
    enabled: true,
  }
}

/**
 * Default transaction cost configuration
 */
export function getDefaultTransactionCostConfig(): TransactionCostConfig {
  return {
    percentageFee: 0.25, // 0.25% typical for German brokers
    fixedFee: 0, // Many German brokers have no fixed fee
    minTransactionAmount: 500, // Minimum 500 EUR to avoid inefficient small transactions
  }
}

/**
 * Create a portfolio position
 */
export function createPortfolioPosition(
  id: string,
  name: string,
  symbol: string,
  assetClass: PortfolioPosition['assetClass'],
  acquisitionDate: Date,
  purchasePrice: number,
  currentPrice: number,
  quantity: number,
  totalCost: number,
  isStockFund = false,
): PortfolioPosition {
  const { currentValue, unrealizedGainLoss, unrealizedGainLossPercent } = calculatePositionGainLoss(
    purchasePrice,
    currentPrice,
    quantity,
    totalCost,
  )

  return {
    id,
    name,
    symbol,
    assetClass,
    acquisitionDate,
    purchasePrice,
    currentPrice,
    quantity,
    totalCost,
    currentValue,
    unrealizedGainLoss,
    unrealizedGainLossPercent,
    isStockFund,
  }
}

/**
 * Validate portfolio position
 */
export function validatePortfolioPosition(position: PortfolioPosition): string[] {
  const errors: string[] = []

  validateId(position.id, errors)
  validateName(position.name, errors)
  validatePrices(position.purchasePrice, position.currentPrice, errors)
  validateQuantityAndCost(position.quantity, position.totalCost, errors)

  return errors
}

/**
 * Validate position ID
 */
function validateId(id: string, errors: string[]): void {
  if (!id || id.trim() === '') {
    errors.push('ID ist erforderlich')
  }
}

/**
 * Validate position name
 */
function validateName(name: string, errors: string[]): void {
  if (!name || name.trim() === '') {
    errors.push('Name ist erforderlich')
  }
}

/**
 * Validate position prices
 */
function validatePrices(purchasePrice: number, currentPrice: number, errors: string[]): void {
  if (purchasePrice <= 0) {
    errors.push('Kaufpreis muss positiv sein')
  }

  if (currentPrice < 0) {
    errors.push('Aktueller Preis kann nicht negativ sein')
  }
}

/**
 * Validate quantity and total cost
 */
function validateQuantityAndCost(quantity: number, totalCost: number, errors: string[]): void {
  if (quantity <= 0) {
    errors.push('Anzahl muss positiv sein')
  }

  if (totalCost <= 0) {
    errors.push('Gesamtkosten müssen positiv sein')
  }
}
