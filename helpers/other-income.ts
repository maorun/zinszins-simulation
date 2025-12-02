/**
 * Types and utilities for other income sources (Andere Einkünfte)
 * This includes rental income, pension, side business income, etc.
 */

/**
 * Type of income source
 */
export type IncomeType =
  | 'rental'
  | 'pension'
  | 'business'
  | 'investment'
  | 'kindergeld'
  | 'elterngeld'
  | 'bu_rente'
  | 'kapitallebensversicherung'
  | 'pflegezusatzversicherung'
  | 'risikolebensversicherung'
  | 'kinder_bildung'
  | 'ruerup_rente'
  | 'other'

/**
 * Real estate-specific configuration for rental income
 */
export interface RealEstateConfig {
  /** Annual maintenance costs as percentage of rental income */
  maintenanceCostPercent: number

  /** Expected vacancy rate as percentage (0-100) */
  vacancyRatePercent: number

  /** Annual property value appreciation rate */
  propertyAppreciationRate: number

  /** Property purchase price (for appreciation calculation) */
  propertyValue: number

  /** Monthly mortgage payment (if financed) */
  monthlyMortgagePayment: number

  /** Whether to include property appreciation in calculations */
  includeAppreciation: boolean
}

/**
 * Kindergeld-specific configuration
 */
export interface KindergeldConfig {
  /** Number of children receiving Kindergeld */
  numberOfChildren: number

  /** Birth year of the child (used to calculate when Kindergeld ends) */
  childBirthYear: number

  /** Whether the child is in education/training (extends Kindergeld until age 25) */
  inEducation: boolean

  /** Child order number (1st, 2nd, 3rd, etc.) - affects the amount */
  childOrderNumber: number
}

/**
 * BU-Rente (Disability Insurance) specific configuration
 */
export interface BURenteConfig {
  /** Year when disability starts */
  disabilityStartYear: number

  /** Year when disability ends (null = permanent disability until retirement) */
  disabilityEndYear: number | null

  /** Birth year of the insured person (for age-based taxation) */
  birthYear: number

  /** Disability degree in percent (0-100%, for documentation purposes) */
  disabilityDegree: number

  /** Whether to apply special tax treatment for disability pensions (Leibrenten-Besteuerung) */
  applyLeibrentenBesteuerung: boolean

  /** Age when BU benefits started (used for Ertragsanteil calculation) */
  ageAtDisabilityStart: number
}

/**
 * Kapitallebensversicherung (Capital Life Insurance) specific configuration
 */
export interface KapitallebensversicherungConfig {
  /** Year when policy was taken out */
  policyStartYear: number

  /** Year when policy matures and payout occurs */
  policyMaturityYear: number

  /** Total lump sum payout amount in EUR */
  totalPayoutAmount: number

  /** Total premiums paid over the policy lifetime in EUR */
  totalPremiumsPaid: number

  /** Whether policy qualifies for Halbeinkünfteverfahren (50% tax exemption) */
  qualifiesForHalbeinkuenfte: boolean

  /** Birth year of insured person (for age-based tax calculation) */
  birthYear: number

  /** Whether to apply tax-free portion for policies held 12+ years */
  applyTaxFreePortionAfter12Years: boolean
}

/**
 * Pflegezusatzversicherung (Long-term Care Insurance) specific configuration
 */
export interface PflegezusatzversicherungConfig {
  /** Year when care need starts (when benefits begin) */
  careStartYear: number

  /** Year when care need ends (null = lifelong care need) */
  careEndYear: number | null

  /** Pflegegrad (care level) from 1 to 5 according to German law */
  pflegegrad: 1 | 2 | 3 | 4 | 5

  /** Birth year of insured person (for age-based calculations) */
  birthYear: number

  /** Monthly premium paid for the insurance in EUR */
  monthlyPremium: number

  /** Year when policy was taken out */
  policyStartYear: number

  /** Whether tax benefits apply (Basisabsicherung nach § 10 Abs. 1 Nr. 3 EStG) */
  applyTaxBenefits: boolean

  /** Maximum annual tax-deductible amount for care insurance premiums */
  maxAnnualTaxDeduction: number
}

/**
 * Risikolebensversicherung (Term Life Insurance) specific configuration
 */
export interface RisikolebensversicherungConfig {
  /** Coverage amount in EUR */
  coverageAmount: number

  /** Coverage type: level (constant) or decreasing */
  coverageType: 'level' | 'decreasing'

  /** For decreasing coverage: annual reduction rate in percent */
  annualDecreasePercent: number

  /** Birth year of insured person */
  birthYear: number

  /** Gender of insured person (affects mortality rates) */
  gender: 'male' | 'female'

  /** Health status of insured person */
  healthStatus: 'excellent' | 'good' | 'average' | 'fair' | 'poor'

  /** Smoking status of insured person */
  smokingStatus: 'non-smoker' | 'smoker' | 'former-smoker'
}

/**
 * Kinder-Bildung (Children's Education) specific configuration
 * This represents education costs as negative income (expenses)
 */
export interface KinderBildungConfig {
  /** Child's name for identification */
  childName: string

  /** Birth year of the child */
  birthYear: number

  /** Education path type */
  educationPath: 'regelweg' | 'ausbildung' | 'individuell'

  /** Individual education phase configurations */
  phases: Array<{
    /** Education phase type */
    phase: 'kita' | 'grundschule' | 'weiterfuehrend' | 'ausbildung' | 'studium' | 'sonstiges'
    /** Monthly costs in EUR */
    monthlyCost: number
    /** Starting year for this phase */
    startYear: number
    /** Ending year for this phase (inclusive) */
    endYear: number
    /** Annual inflation rate for costs (default: 2%) */
    inflationRate: number
    /** Whether costs are tax-deductible */
    taxDeductible: boolean
    /** Maximum annual tax deduction amount in EUR */
    maxAnnualTaxDeduction: number
  }>

  /** BAföG configuration (only applicable for university studies) */
  bafoegConfig?: {
    /** Whether BAföG is enabled for this child */
    enabled: boolean
    /** Monthly BAföG amount in EUR */
    monthlyAmount: number
    /** Starting year for BAföG */
    startYear: number
    /** Ending year for BAföG */
    endYear: number
    /** Whether living with parents (affects BAföG amount) */
    livingWithParents: boolean
    /** Parental income in EUR (affects eligibility and amount) */
    parentalIncome: number
    /** Number of siblings in education (affects BAföG calculation) */
    siblingsInEducation: number
    /** Whether student has own income */
    hasOwnIncome: boolean
    /** Student's own annual income in EUR */
    ownIncome: number
    /** BAföG eligibility status */
    eligibility: 'eligible' | 'partial' | 'ineligible'
    /** Percentage of BAföG that must be repaid (50% as grant, 50% as loan) */
    repaymentRate: number
  }

  /** Whether to account for Kindergeld (this is already handled separately) */
  includeKindergeld: boolean

  /** Notes or special considerations */
  notes?: string
}

/**
 * Elterngeld (Parental Allowance) specific configuration
 * Implements German Elterngeld calculations according to BEEG (Bundeselterngeld- und Elternzeitgesetz)
 */
export interface ElterngeldConfig {
  /** Previous monthly net income before parental leave (used for Elterngeld calculation) */
  previousMonthlyNetIncome: number

  /** Birth year of the child (for documentation and Kindergeld coordination) */
  childBirthYear: number

  /** Birth month of the child (1-12, determines when Elterngeld starts) */
  childBirthMonth: number

  /** Number of months of Elterngeld to receive (max 12 for Basiselterngeld, max 24 for ElterngeldPlus) */
  durationMonths: number

  /** Whether using ElterngeldPlus (50% amount but double duration) */
  useElterngeldPlus: boolean

  /** Whether partner also takes Elterngeld (enables Partnerschaftsbonus) */
  partnerParticipation: boolean

  /** Additional months from Partnerschaftsbonus (0, 2, or 4 months) */
  partnerschaftsBonusMonths: number

  /** Whether this person is working part-time during Elterngeld (affects ElterngeldPlus calculation) */
  workingPartTime: boolean

  /** If working part-time: monthly net income during Elterngeld period */
  partTimeMonthlyNetIncome: number

  /** Year when Elterngeld starts */
  elterngeldStartYear: number

  /** Month when Elterngeld starts (1-12) */
  elterngeldStartMonth: number
}

/**
 * Rürup-Rente (Basis-Rente) specific configuration
 * German tax-advantaged pension product for self-employed and high earners
 */
export interface RuerupRenteConfig {
  /** Annual contribution amount in EUR during accumulation phase */
  annualContribution: number

  /** Civil status affecting contribution limits (single/married) */
  civilStatus: 'single' | 'married'

  /** Year when pension payments start */
  pensionStartYear: number

  /** Expected monthly pension payment in EUR */
  expectedMonthlyPension: number

  /** Annual pension increase rate (e.g., 0.01 for 1% annual increase) */
  pensionIncreaseRate: number

  /** Personal tax rate during contribution phase (for tax savings calculation) */
  contributionPhaseTaxRate: number

  /** Expected tax rate during pension phase (typically lower in retirement) */
  pensionPhaseTaxRate: number

  /** Birth year of the insured person (for age-based taxation) */
  birthYear: number
}

/**
 * Whether the income amount is gross or net
 */
export type IncomeAmountType = 'gross' | 'net'

/**
 * Configuration for a single other income source
 */
export interface OtherIncomeSource {
  /** Unique identifier for this income source */
  id: string

  /** Display name for this income source */
  name: string

  /** Type of income */
  type: IncomeType

  /** Whether the amount is gross or net */
  amountType: IncomeAmountType

  /** Monthly amount in EUR */
  monthlyAmount: number

  /** Starting year for this income */
  startYear: number

  /** Optional ending year for this income (null = permanent) */
  endYear: number | null

  /** Annual increase rate for inflation adjustment (default: 2% inflation) */
  inflationRate: number

  /** Tax rate applied to this income (for gross amounts) */
  taxRate: number

  /** Whether this income is enabled in calculations */
  enabled: boolean

  /** Optional notes/description */
  notes?: string

  /** Real estate-specific configuration (only for rental income) */
  realEstateConfig?: RealEstateConfig

  /** Kindergeld-specific configuration (only for kindergeld income) */
  kindergeldConfig?: KindergeldConfig

  /** BU-Rente-specific configuration (only for bu_rente income) */
  buRenteConfig?: BURenteConfig

  /** Kapitallebensversicherung-specific configuration (only for kapitallebensversicherung income) */
  kapitallebensversicherungConfig?: KapitallebensversicherungConfig

  /** Pflegezusatzversicherung-specific configuration (only for pflegezusatzversicherung income) */
  pflegezusatzversicherungConfig?: PflegezusatzversicherungConfig

  /** Risikolebensversicherung-specific configuration (only for risikolebensversicherung income) */
  risikolebensversicherungConfig?: RisikolebensversicherungConfig

  /** Kinder-Bildung-specific configuration (only for kinder_bildung type) */
  kinderBildungConfig?: KinderBildungConfig

  /** Elterngeld-specific configuration (only for elterngeld type) */
  elterngeldConfig?: ElterngeldConfig

  /** Rürup-Rente-specific configuration (only for ruerup_rente type) */
  ruerupRenteConfig?: RuerupRenteConfig
}

/**
 * Result of other income calculation for a specific year
 */
export interface OtherIncomeYearResult {
  /** Income source configuration */
  source: OtherIncomeSource

  /** Total annual amount (before taxes if gross) */
  grossAnnualAmount: number

  /** Monthly amount (before taxes if gross) */
  grossMonthlyAmount: number

  /** Tax amount (only for gross income) */
  taxAmount: number

  /** Net annual amount after taxes */
  netAnnualAmount: number

  /** Net monthly amount after taxes */
  netMonthlyAmount: number

  /** Inflation adjustment factor applied this year */
  inflationFactor: number

  /** Real estate-specific calculations (only for rental income) */
  realEstateDetails?: {
    /** Annual maintenance costs */
    maintenanceCosts: number
    /** Lost income due to vacancy */
    vacancyLoss: number
    /** Property value this year (with appreciation) */
    propertyValue: number
    /** Property appreciation this year */
    annualAppreciation: number
    /** Net rental income after all real estate costs */
    netRentalIncome: number
  }

  /** Kindergeld-specific calculations (only for kindergeld income) */
  kindergeldDetails?: {
    /** Child's age this year */
    childAge: number
    /** Whether Kindergeld is still being paid */
    isActive: boolean
    /** Reason if Kindergeld ended */
    endReason?: string
  }

  /** BU-Rente-specific calculations (only for bu_rente income) */
  buRenteDetails?: {
    /** Person's age this year */
    age: number
    /** Whether BU benefits are active */
    isActive: boolean
    /** Tax-free portion (Ertragsanteil) percentage */
    ertragsanteilPercent: number
    /** Taxable amount based on Leibrenten-Besteuerung */
    taxableAmount: number
    /** Reason if BU benefits ended */
    endReason?: string
  }

  /** Kapitallebensversicherung-specific calculations (only for kapitallebensversicherung income) */
  kapitallebensversicherungDetails?: {
    /** Person's age at payout */
    ageAtPayout: number
    /** Whether payout occurred this year */
    isPayoutYear: boolean
    /** Investment gains (payout - premiums) */
    investmentGains: number
    /** Taxable portion of the gains */
    taxableGains: number
    /** Tax exemption percentage applied */
    taxExemptionPercent: number
    /** Reason if conditions not met */
    notes?: string
  }

  /** Pflegezusatzversicherung-specific calculations (only for pflegezusatzversicherung income) */
  pflegezusatzversicherungDetails?: {
    /** Person's age this year */
    age: number
    /** Whether care benefits are active this year */
    isActive: boolean
    /** Care level (Pflegegrad) 1-5 */
    pflegegrad: 1 | 2 | 3 | 4 | 5
    /** Monthly benefit amount from insurance */
    monthlyBenefit: number
    /** Annual premiums paid (negative value as cost) */
    annualPremiumsCost: number
    /** Tax deduction benefit from premiums */
    taxDeductionBenefit: number
    /** Net benefit (benefits - premiums + tax deduction) */
    netBenefit: number
    /** Reason if benefits not active */
    endReason?: string
  }

  /** Risikolebensversicherung-specific calculations (only for risikolebensversicherung income) */
  risikolebensversicherungDetails?: {
    /** Person's age this year */
    age: number
    /** Current coverage amount (may decrease over time) */
    coverageAmount: number
    /** Annual premium paid (negative value as cost) */
    annualPremium: number
    /** Cumulative premiums paid so far */
    totalPremiumsPaid: number
    /** Death benefit amount (tax-free) */
    deathBenefitAmount: number
    /** Whether policy is active */
    isActive: boolean
  }

  /** Kinder-Bildung-specific calculations (only for kinder_bildung type) */
  kinderBildungDetails?: {
    /** Child's age this year */
    childAge: number
    /** Active education phases this year */
    activePhases: string[]
    /** Total monthly education costs before BAföG */
    totalMonthlyCost: number
    /** BAföG support received this year (if applicable) */
    bafoegSupport: number
    /** Net annual education costs (costs - BAföG) */
    netAnnualCost: number
    /** Tax deduction amount for the year */
    taxDeduction: number
  }

  /** Elterngeld-specific calculations (only for elterngeld type) */
  elterngeldDetails?: {
    /** Child's age this year (in months) */
    childAgeMonths: number
    /** Whether Elterngeld is active this year */
    isActive: boolean
    /** Monthly Elterngeld amount (before ElterngeldPlus reduction if applicable) */
    baseMonthlyAmount: number
    /** Actual monthly Elterngeld amount (after ElterngeldPlus reduction) */
    actualMonthlyAmount: number
    /** Replacement rate percentage (65-67% of previous net income) */
    replacementRatePercent: number
    /** Whether using ElterngeldPlus this year */
    usingElterngeldPlus: boolean
    /** Whether receiving Partnerschaftsbonus this year */
    receivingPartnerschaftsbonus: boolean
    /** Number of months of Elterngeld received this year */
    monthsReceivedThisYear: number
    /** Reason if Elterngeld not active or ended */
    endReason?: string
  }

  /** Rürup-Rente-specific calculations (only for ruerup_rente type) */
  ruerupRenteDetails?: {
    /** Person's age this year */
    age: number
    /** Whether in contribution phase (before pension starts) */
    isContributionPhase: boolean
    /** Whether in pension phase (pension payments active) */
    isPensionPhase: boolean
    /** Annual contribution amount (only in contribution phase) */
    annualContribution: number
    /** Tax deduction from contributions (only in contribution phase) */
    taxDeduction: number
    /** Tax savings from deduction (only in contribution phase) */
    taxSavings: number
    /** Percentage of contribution that is tax-deductible */
    deductiblePercentage: number
    /** Monthly pension payment this year (only in pension phase) */
    monthlyPension: number
    /** Percentage of pension that is taxable */
    taxablePercentage: number
    /** Taxable portion of annual pension */
    taxableAmount: number
    /** Income tax on pension */
    incomeTax: number
    /** Net annual pension after taxes */
    netAnnualPension: number
  }
}

/**
 * Complete other income calculation result across years for all sources
 */
export interface OtherIncomeResult {
  [year: number]: {
    /** Results for each income source */
    sources: OtherIncomeYearResult[]
    /** Total net annual income from all sources */
    totalNetAnnualAmount: number
    /** Total tax amount from all sources */
    totalTaxAmount: number
  }
}

/**
 * Configuration for all other income sources
 */
export interface OtherIncomeConfiguration {
  /** Whether other income sources are enabled */
  enabled: boolean

  /** List of configured income sources */
  sources: OtherIncomeSource[]
}

/**
 * Calculate other income for a specific source and year
 */
// Helper: Check if income source is active for year
function isIncomeActiveForYear(source: OtherIncomeSource, year: number): boolean {
  return source.enabled && year >= source.startYear && (!source.endYear || year <= source.endYear)
}

// Helper: Calculate rental income details
function calculateRealEstateIncome(
  config: RealEstateConfig,
  grossAnnualAmount: number,
  yearsFromStart: number,
): { netIncome: number; details: OtherIncomeYearResult['realEstateDetails'] } {
  const vacancyLoss = grossAnnualAmount * (config.vacancyRatePercent / 100)
  const incomeAfterVacancy = grossAnnualAmount - vacancyLoss
  const maintenanceCosts = grossAnnualAmount * (config.maintenanceCostPercent / 100)
  const annualMortgagePayment = config.monthlyMortgagePayment * 12
  const netRentalIncome = incomeAfterVacancy - maintenanceCosts - annualMortgagePayment

  const appreciationFactor = Math.pow(1 + config.propertyAppreciationRate / 100, yearsFromStart)
  const currentPropertyValue = config.propertyValue * appreciationFactor
  const previousValue =
    yearsFromStart > 0
      ? config.propertyValue * Math.pow(1 + config.propertyAppreciationRate / 100, yearsFromStart - 1)
      : config.propertyValue
  const annualAppreciation = config.includeAppreciation ? currentPropertyValue - previousValue : 0

  return {
    netIncome: Math.max(0, netRentalIncome),
    details: {
      maintenanceCosts,
      vacancyLoss,
      propertyValue: currentPropertyValue,
      annualAppreciation,
      netRentalIncome: Math.max(0, netRentalIncome),
    },
  }
}

// Helper: Calculate Kindergeld status
function calculateKindergeldStatus(
  config: KindergeldConfig,
  year: number,
): { isActive: boolean; childAge: number; endReason?: string } {
  const childAge = year - config.childBirthYear
  let isActive = true
  let endReason: string | undefined

  if (childAge < 0) {
    isActive = false
    endReason = 'Kind noch nicht geboren'
  } else if (childAge >= 18 && !config.inEducation) {
    isActive = false
    endReason = 'Kind ist 18 oder älter (nicht in Ausbildung)'
  } else if (childAge >= 25) {
    isActive = false
    endReason = 'Kind ist 25 oder älter'
  }

  return { isActive, childAge, endReason }
}

/**
 * Calculate Elterngeld (Parental Allowance) according to German BEEG
 * (Bundeselterngeld- und Elternzeitgesetz)
 *
 * Key rules:
 * - Basiselterngeld: 65-67% of previous net income, max 1,800€/month, min 300€/month
 * - ElterngeldPlus: 50% of Basiselterngeld amount, but can be received for double duration
 * - Partnerschaftsbonus: Additional months if both parents work part-time
 * - Maximum duration: 12/14 months for Basiselterngeld, up to 24/28 months for ElterngeldPlus
 */
function calculateElterngeldAmount(
  previousMonthlyNetIncome: number,
  useElterngeldPlus: boolean,
  workingPartTime: boolean,
  partTimeMonthlyNetIncome: number,
): { baseAmount: number; actualAmount: number; replacementRate: number } {
  // Determine replacement rate based on income level
  // 67% for income up to 1,200€, 65% for income above 1,240€, graduated in between
  let replacementRate = 0.67

  if (previousMonthlyNetIncome >= 1240) {
    replacementRate = 0.65
  } else if (previousMonthlyNetIncome > 1200) {
    // Graduated decrease from 67% to 65%
    const graduatedIncome = previousMonthlyNetIncome - 1200
    replacementRate = 0.67 - (graduatedIncome / 40) * 0.02
  }

  // Calculate base Elterngeld amount
  let baseAmount = previousMonthlyNetIncome * replacementRate

  // Apply minimum and maximum limits for Basiselterngeld
  const MIN_ELTERNGELD = 300
  const MAX_ELTERNGELD = 1800

  baseAmount = Math.max(MIN_ELTERNGELD, Math.min(MAX_ELTERNGELD, baseAmount))

  // Calculate actual amount based on ElterngeldPlus and part-time work
  let actualAmount = baseAmount

  if (useElterngeldPlus) {
    if (workingPartTime) {
      // ElterngeldPlus with part-time work: complex calculation
      // Income loss = previous income - current part-time income
      const incomeLoss = previousMonthlyNetIncome - partTimeMonthlyNetIncome
      // ElterngeldPlus is 50% of what Basiselterngeld would be for the income loss
      const elterngeldPlusBase = incomeLoss * replacementRate
      actualAmount = Math.max(MIN_ELTERNGELD / 2, Math.min(MAX_ELTERNGELD / 2, elterngeldPlusBase))
    } else {
      // ElterngeldPlus without work: 50% of Basiselterngeld
      actualAmount = baseAmount / 2
    }
  }

  return {
    baseAmount,
    actualAmount,
    replacementRate: replacementRate * 100, // Convert to percentage
  }
}

/**
 * Helper: Calculate child's age in months from birth year/month to current year
 */
function calculateChildAgeMonths(childBirthYear: number, childBirthMonth: number, year: number): number {
  const yearsSinceBirth = year - childBirthYear
  const monthsSinceBirth = yearsSinceBirth * 12 + (12 - childBirthMonth + 1)
  return Math.max(0, monthsSinceBirth)
}

/**
 * Helper: Calculate Elterngeld period start and end in months since birth
 */
function calculateElterngeldPeriod(config: ElterngeldConfig): {
  startMonthsSinceBirth: number
  endMonthsSinceBirth: number
} {
  const startMonthsSinceBirth =
    (config.elterngeldStartYear - config.childBirthYear) * 12 +
    (config.elterngeldStartMonth - config.childBirthMonth)

  const totalElterngeldMonths = config.durationMonths + config.partnerschaftsBonusMonths
  const endMonthsSinceBirth = startMonthsSinceBirth + totalElterngeldMonths

  return { startMonthsSinceBirth, endMonthsSinceBirth }
}

/**
 * Helper: Determine Elterngeld active status and months received in a given year
 */
function calculateElterngeldYearStatus(
  config: ElterngeldConfig,
  year: number,
  elterngeldStartMonthsSinceBirth: number,
  elterngeldEndMonthsSinceBirth: number,
): { isActive: boolean; monthsReceivedThisYear: number; endReason?: string } {
  // Calculate year boundaries in months since birth (using same calculation as elterngeld period)
  const yearStartMonthsSinceBirth = (year - config.childBirthYear) * 12 + (1 - config.childBirthMonth)
  const yearEndMonthsSinceBirth = (year + 1 - config.childBirthYear) * 12 + (1 - config.childBirthMonth)

  if (yearEndMonthsSinceBirth <= elterngeldStartMonthsSinceBirth) {
    return {
      isActive: false,
      monthsReceivedThisYear: 0,
      endReason: 'Elterngeld noch nicht gestartet',
    }
  }

  if (yearStartMonthsSinceBirth >= elterngeldEndMonthsSinceBirth) {
    return {
      isActive: false,
      monthsReceivedThisYear: 0,
      endReason: 'Elterngeld-Bezugsdauer abgelaufen',
    }
  }

  // Calculate how many months in this year Elterngeld is received
  const monthsStart = Math.max(yearStartMonthsSinceBirth, elterngeldStartMonthsSinceBirth)
  const monthsEnd = Math.min(yearEndMonthsSinceBirth, elterngeldEndMonthsSinceBirth)
  const monthsReceivedThisYear = monthsEnd - monthsStart

  return {
    isActive: true,
    monthsReceivedThisYear,
  }
}

/**
 * Calculate Elterngeld status and details for a specific year
 */
function calculateElterngeldStatus(
  config: ElterngeldConfig,
  year: number,
): {
  isActive: boolean
  childAgeMonths: number
  baseMonthlyAmount: number
  actualMonthlyAmount: number
  replacementRatePercent: number
  usingElterngeldPlus: boolean
  receivingPartnerschaftsbonus: boolean
  monthsReceivedThisYear: number
  endReason?: string
} {
  // Calculate child's age in months
  const childAgeMonths = calculateChildAgeMonths(config.childBirthYear, config.childBirthMonth, year)
  const monthsSinceBirth = childAgeMonths

  // Calculate when Elterngeld starts and ends
  const { startMonthsSinceBirth: elterngeldStartMonthsSinceBirth, endMonthsSinceBirth: elterngeldEndMonthsSinceBirth } =
    calculateElterngeldPeriod(config)

  // Calculate Elterngeld amount
  const amounts = calculateElterngeldAmount(
    config.previousMonthlyNetIncome,
    config.useElterngeldPlus,
    config.workingPartTime,
    config.partTimeMonthlyNetIncome,
  )

  // Determine if Elterngeld is active this year
  const { isActive, monthsReceivedThisYear, endReason } = calculateElterngeldYearStatus(
    config,
    year,
    elterngeldStartMonthsSinceBirth,
    elterngeldEndMonthsSinceBirth,
  )

  // Determine if receiving Partnerschaftsbonus this year
  const receivingPartnerschaftsbonus =
    isActive &&
    config.partnerParticipation &&
    config.partnerschaftsBonusMonths > 0 &&
    monthsSinceBirth >= elterngeldStartMonthsSinceBirth + config.durationMonths

  return {
    isActive,
    childAgeMonths,
    baseMonthlyAmount: amounts.baseAmount,
    actualMonthlyAmount: amounts.actualAmount,
    replacementRatePercent: amounts.replacementRate,
    usingElterngeldPlus: config.useElterngeldPlus,
    receivingPartnerschaftsbonus,
    monthsReceivedThisYear,
    endReason,
  }
}

// Ertragsanteil table according to § 22 Nr. 1 Satz 3 Buchstabe a Doppelbuchstabe bb EStG
// Maps age ranges to their taxable percentage
const ERTRAGSANTEIL_TABLE: Array<{ maxAge: number; percentage: number }> = [
  { maxAge: 1, percentage: 59 },
  { maxAge: 2, percentage: 58 },
  { maxAge: 3, percentage: 57 },
  { maxAge: 4, percentage: 56 },
  { maxAge: 5, percentage: 55 },
  { maxAge: 6, percentage: 54 },
  { maxAge: 7, percentage: 53 },
  { maxAge: 8, percentage: 52 },
  { maxAge: 9, percentage: 51 },
  { maxAge: 10, percentage: 50 },
  { maxAge: 11, percentage: 49 },
  { maxAge: 12, percentage: 48 },
  { maxAge: 13, percentage: 47 },
  { maxAge: 14, percentage: 46 },
  { maxAge: 15, percentage: 45 },
  { maxAge: 16, percentage: 44 },
  { maxAge: 17, percentage: 43 },
  { maxAge: 27, percentage: 42 },
  { maxAge: 31, percentage: 40 },
  { maxAge: 36, percentage: 38 },
  { maxAge: 41, percentage: 36 },
  { maxAge: 46, percentage: 34 },
  { maxAge: 51, percentage: 32 },
  { maxAge: 56, percentage: 30 },
  { maxAge: 61, percentage: 28 },
  { maxAge: 63, percentage: 26 },
  { maxAge: 64, percentage: 25 },
  { maxAge: 65, percentage: 24 },
  { maxAge: 66, percentage: 23 },
  { maxAge: 67, percentage: 22 },
  { maxAge: Infinity, percentage: 21 }, // Age 68+
]

// Helper: Get Ertragsanteil (taxable portion) for BU-Rente based on age at disability start
// Based on § 22 EStG - Leibrenten-Besteuerung
function getErtragsanteil(ageAtDisabilityStart: number): number {
  // Returns the percentage of the pension that is subject to taxation
  const entry = ERTRAGSANTEIL_TABLE.find(item => ageAtDisabilityStart <= item.maxAge)
  return entry?.percentage ?? 21 // Default to 21% for ages 68+
}

// Helper: Calculate BU-Rente status
function calculateBURenteStatus(
  config: BURenteConfig,
  year: number,
  grossAnnualAmount: number,
): {
  isActive: boolean
  age: number
  ertragsanteilPercent: number
  taxableAmount: number
  endReason?: string
} {
  const age = year - config.birthYear
  let isActive = true
  let endReason: string | undefined

  // Check if BU benefits have started
  if (year < config.disabilityStartYear) {
    isActive = false
    endReason = 'BU-Leistungen noch nicht begonnen'
  }
  // Check if BU benefits have ended
  else if (config.disabilityEndYear !== null && year > config.disabilityEndYear) {
    isActive = false
    endReason = 'BU-Leistungen beendet'
  }

  // Calculate taxable amount based on Leibrenten-Besteuerung
  const ertragsanteilPercent = config.applyLeibrentenBesteuerung ? getErtragsanteil(config.ageAtDisabilityStart) : 100

  // Only the Ertragsanteil is taxable, the rest is tax-free
  const taxableAmount = (grossAnnualAmount * ertragsanteilPercent) / 100

  return {
    isActive,
    age,
    ertragsanteilPercent,
    taxableAmount,
    endReason,
  }
}

// Helper: Calculate Kapitallebensversicherung status and taxation
function calculateKapitallebensversicherungStatus(
  config: KapitallebensversicherungConfig,
  year: number,
): {
  isPayoutYear: boolean
  ageAtPayout: number
  investmentGains: number
  taxableGains: number
  taxExemptionPercent: number
  notes?: string
} {
  const ageAtPayout = year - config.birthYear
  const isPayoutYear = year === config.policyMaturityYear
  const investmentGains = config.totalPayoutAmount - config.totalPremiumsPaid
  const policyDuration = config.policyMaturityYear - config.policyStartYear

  let taxableGains = investmentGains
  let taxExemptionPercent = 0
  let notes: string | undefined

  // German tax rules for Kapitallebensversicherung (§ 20 Abs. 1 Nr. 6 EStG)
  // Tax-free if:
  // 1. Policy held for at least 12 years, AND
  // 2. Payout occurs after age 60 (for policies taken out before 2012) or age 62 (after 2011), AND
  // 3. Premiums paid for at least 5 years

  const meetsAgeCriteria = ageAtPayout >= 60 // Simplified: using age 60 as threshold
  const meetsDurationCriteria = policyDuration >= 12

  if (config.applyTaxFreePortionAfter12Years && meetsDurationCriteria && meetsAgeCriteria) {
    // 100% tax-free
    taxableGains = 0
    taxExemptionPercent = 100
    notes = 'Steuerfrei nach § 20 Abs. 1 Nr. 6 EStG (12+ Jahre Laufzeit, Auszahlung nach Alter 60)'
  } else if (config.qualifiesForHalbeinkuenfte) {
    // Halbeinkünfteverfahren: 50% tax exemption (older policies)
    taxableGains = investmentGains * 0.5
    taxExemptionPercent = 50
    notes = 'Halbeinkünfteverfahren (50% steuerfrei)'
  } else {
    // Full taxation of gains
    taxableGains = investmentGains
    taxExemptionPercent = 0
    notes = 'Volle Besteuerung der Erträge'
  }

  return {
    isPayoutYear,
    ageAtPayout,
    investmentGains: Math.max(0, investmentGains),
    taxableGains: Math.max(0, taxableGains),
    taxExemptionPercent,
    notes,
  }
}

// Helper: Calculate Pflegezusatzversicherung (Long-term Care Insurance) status and benefits
function calculatePflegezusatzversicherungStatus(
  config: PflegezusatzversicherungConfig,
  year: number,
  grossAnnualAmount: number,
): {
  isActive: boolean
  age: number
  pflegegrad: 1 | 2 | 3 | 4 | 5
  monthlyBenefit: number
  annualPremiumsCost: number
  taxDeductionBenefit: number
  netBenefit: number
  endReason?: string
} {
  const age = year - config.birthYear
  let isActive = true
  let endReason: string | undefined

  // Check if care need has started
  if (year < config.careStartYear) {
    isActive = false
    endReason = 'Pflegebedarf noch nicht eingetreten'
  }
  // Check if care need has ended
  else if (config.careEndYear !== null && year > config.careEndYear) {
    isActive = false
    endReason = 'Pflegebedarf beendet'
  }

  // Calculate monthly benefit based on Pflegegrad and gross annual amount
  // The gross annual amount represents the monthly benefit * 12
  const monthlyBenefit = isActive ? grossAnnualAmount / 12 : 0

  // Annual premiums are always paid (until care starts or policy ends)
  const annualPremiumsCost = config.monthlyPremium * 12

  // Tax deduction benefit: Pflegepflichtversicherung premiums are tax-deductible as Vorsorgeaufwendungen
  // Maximum deduction according to § 10 Abs. 1 Nr. 3 EStG
  // Simplified: Use the configured max annual deduction or actual premiums, whichever is lower
  const taxDeductionBenefit = config.applyTaxBenefits
    ? Math.min(annualPremiumsCost, config.maxAnnualTaxDeduction)
    : 0

  // Net benefit: Benefits received minus premiums paid, plus tax deduction benefit
  const netBenefit = monthlyBenefit * 12 - annualPremiumsCost + taxDeductionBenefit

  return {
    isActive,
    age,
    pflegegrad: config.pflegegrad,
    monthlyBenefit,
    annualPremiumsCost,
    taxDeductionBenefit,
    netBenefit,
    endReason,
  }
}

/**
 * Calculate coverage amount for a given year and configuration
 */
function calculateTermLifeCoverageAmount(
  config: RisikolebensversicherungConfig,
  year: number,
  startYear: number,
  isActive: boolean,
): number {
  if (!isActive) return 0

  if (config.coverageType === 'level') {
    return config.coverageAmount
  }

  // Decreasing coverage
  const yearsElapsed = year - startYear
  const decreaseMultiplier = Math.pow(1 - config.annualDecreasePercent / 100, yearsElapsed)
  return Math.max(0, config.coverageAmount * decreaseMultiplier)
}

/**
 * Get base mortality rate for a given age
 */
function getTermLifeBaseMortalityRate(age: number): number {
  const baseMortalityRates: Record<number, number> = {
    20: 0.5,
    25: 0.6,
    30: 0.7,
    35: 0.9,
    40: 1.2,
    45: 1.8,
    50: 2.8,
    55: 4.5,
    60: 7.0,
    65: 11.0,
    70: 17.0,
    75: 27.0,
  }

  const ages = Object.keys(baseMortalityRates)
    .map(Number)
    .sort((a, b) => a - b)
  let closestAge = ages[0] ?? 30
  for (const ageKey of ages) {
    if (age >= ageKey) {
      closestAge = ageKey
    } else {
      break
    }
  }
  return baseMortalityRates[closestAge] ?? 1.0
}

/**
 * Calculate risk multipliers for term life insurance
 */
function calculateTermLifeRiskMultipliers(config: RisikolebensversicherungConfig): number {
  const healthMultipliers = { excellent: 0.85, good: 1.0, average: 1.15, fair: 1.35, poor: 1.7 }
  const smokingMultipliers = { 'non-smoker': 1.0, 'former-smoker': 1.25, smoker: 1.8 }

  const healthMultiplier = healthMultipliers[config.healthStatus] ?? 1.0
  const smokingMultiplier = smokingMultipliers[config.smokingStatus] ?? 1.0
  const genderMultiplier = config.gender === 'female' ? 0.85 : 1.0

  return healthMultiplier * smokingMultiplier * genderMultiplier
}

/**
 * Calculate annual premium for term life insurance based on age and risk factors
 */
function calculateTermLifeAnnualPremium(
  coverageAmount: number,
  age: number,
  config: RisikolebensversicherungConfig,
): number {
  if (coverageAmount <= 0) return 0

  const baseMortality = getTermLifeBaseMortalityRate(age)
  const riskMultipliers = calculateTermLifeRiskMultipliers(config)
  const adjustedMortality = baseMortality * riskMultipliers

  const basePremiumPer1000 = 0.8
  const riskPremium = (coverageAmount / 1000) * (adjustedMortality / 1000) * coverageAmount
  const administrativeCosts = coverageAmount * 0.0002
  const safetyMargin = 1.25

  const annualPremium =
    (riskPremium + administrativeCosts + (coverageAmount / 1000) * basePremiumPer1000) * safetyMargin
  return Math.round(annualPremium * 100) / 100
}

/**
 * Calculate total premiums paid up to a given year
 */
function calculateTotalTermLifePremiums(
  config: RisikolebensversicherungConfig,
  year: number,
  startYear: number,
  endYear: number | null,
): number {
  let total = 0
  for (let y = startYear; y <= year; y++) {
    const isYearActive = y >= startYear && (endYear === null || y <= endYear)
    if (isYearActive) {
      const yearCoverage = calculateTermLifeCoverageAmount(config, y, startYear, true)
      const yearAge = y - config.birthYear
      const yearPremium = calculateTermLifeAnnualPremium(yearCoverage, yearAge, config)
      if (yearCoverage > 0) {
        total += yearPremium
      }
    }
  }
  return total
}

/**
 * Calculate Risikolebensversicherung status for a given year
 * Uses the term-life-insurance helper module for premium calculations
 */
function calculateRisikolebensversicherungStatus(
  config: RisikolebensversicherungConfig,
  year: number,
  startYear: number,
  endYear: number | null,
): {
  isActive: boolean
  age: number
  coverageAmount: number
  annualPremium: number
  totalPremiumsPaid: number
  deathBenefitAmount: number
} {
  const age = year - config.birthYear
  const isActive = year >= startYear && (endYear === null || year <= endYear)

  const coverageAmount = calculateTermLifeCoverageAmount(config, year, startYear, isActive)
  const annualPremium = isActive ? calculateTermLifeAnnualPremium(coverageAmount, age, config) : 0
  const totalPremiumsPaid = calculateTotalTermLifePremiums(config, year, startYear, endYear)

  return {
    isActive,
    age,
    coverageAmount,
    annualPremium,
    totalPremiumsPaid,
    deathBenefitAmount: coverageAmount, // Always tax-free in Germany
  }
}

function calculateGrossAmounts(
  source: OtherIncomeSource,
  yearsFromStart: number,
  inflationFactor: number,
): {
  grossMonthlyAmount: number
  grossAnnualAmount: number
  realEstateDetails?: OtherIncomeYearResult['realEstateDetails']
  kindergeldDetails?: OtherIncomeYearResult['kindergeldDetails']
  buRenteDetails?: OtherIncomeYearResult['buRenteDetails']
  kapitallebensversicherungDetails?: OtherIncomeYearResult['kapitallebensversicherungDetails']
  pflegezusatzversicherungDetails?: OtherIncomeYearResult['pflegezusatzversicherungDetails']
} {
  let grossMonthlyAmount = source.monthlyAmount * inflationFactor
  let grossAnnualAmount = grossMonthlyAmount * 12
  let realEstateDetails: OtherIncomeYearResult['realEstateDetails']
  let kindergeldDetails: OtherIncomeYearResult['kindergeldDetails']
  let buRenteDetails: OtherIncomeYearResult['buRenteDetails']
  let kapitallebensversicherungDetails: OtherIncomeYearResult['kapitallebensversicherungDetails']
  let pflegezusatzversicherungDetails: OtherIncomeYearResult['pflegezusatzversicherungDetails']

  if (source.type === 'rental' && source.realEstateConfig) {
    const result = calculateRealEstateIncome(source.realEstateConfig, grossAnnualAmount, yearsFromStart)
    grossAnnualAmount = result.netIncome
    grossMonthlyAmount = grossAnnualAmount / 12
    realEstateDetails = result.details
  }

  return {
    grossMonthlyAmount,
    grossAnnualAmount,
    realEstateDetails,
    kindergeldDetails,
    buRenteDetails,
    kapitallebensversicherungDetails,
    pflegezusatzversicherungDetails,
  }
}

function applyKindergeldLogic(
  source: OtherIncomeSource,
  year: number,
  amounts: { grossMonthlyAmount: number; grossAnnualAmount: number },
): {
  grossMonthlyAmount: number
  grossAnnualAmount: number
  kindergeldDetails?: OtherIncomeYearResult['kindergeldDetails']
} {
  if (source.type !== 'kindergeld' || !source.kindergeldConfig) {
    return amounts
  }

  const status = calculateKindergeldStatus(source.kindergeldConfig, year)
  if (!status.isActive) {
    return {
      grossMonthlyAmount: 0,
      grossAnnualAmount: 0,
      kindergeldDetails: status,
    }
  }

  return {
    ...amounts,
    kindergeldDetails: status,
  }
}

function applyElterngeldLogic(
  source: OtherIncomeSource,
  year: number,
  amounts: { grossMonthlyAmount: number; grossAnnualAmount: number },
): {
  grossMonthlyAmount: number
  grossAnnualAmount: number
  elterngeldDetails?: OtherIncomeYearResult['elterngeldDetails']
} {
  if (source.type !== 'elterngeld' || !source.elterngeldConfig) {
    return amounts
  }

  const status = calculateElterngeldStatus(source.elterngeldConfig, year)
  if (!status.isActive || status.monthsReceivedThisYear === 0) {
    return {
      grossMonthlyAmount: 0,
      grossAnnualAmount: 0,
      elterngeldDetails: status,
    }
  }

  // Calculate annual amount based on months received this year
  const actualGrossAnnualAmount = status.actualMonthlyAmount * status.monthsReceivedThisYear
  const actualGrossMonthlyAmount = actualGrossAnnualAmount / 12 // Spread across the year for calculation purposes

  return {
    grossMonthlyAmount: actualGrossMonthlyAmount,
    grossAnnualAmount: actualGrossAnnualAmount,
    elterngeldDetails: status,
  }
}

function applyBURenteLogic(
  source: OtherIncomeSource,
  year: number,
  amounts: { grossMonthlyAmount: number; grossAnnualAmount: number },
): {
  grossMonthlyAmount: number
  grossAnnualAmount: number
  buRenteDetails?: OtherIncomeYearResult['buRenteDetails']
} {
  if (source.type !== 'bu_rente' || !source.buRenteConfig) {
    return amounts
  }

  const status = calculateBURenteStatus(source.buRenteConfig, year, amounts.grossAnnualAmount)
  if (!status.isActive) {
    return {
      grossMonthlyAmount: 0,
      grossAnnualAmount: 0,
      buRenteDetails: status,
    }
  }

  return {
    ...amounts,
    buRenteDetails: status,
  }
}

function applyKapitallebensversicherungLogic(
  source: OtherIncomeSource,
  year: number,
  amounts: { grossMonthlyAmount: number; grossAnnualAmount: number },
): {
  grossMonthlyAmount: number
  grossAnnualAmount: number
  kapitallebensversicherungDetails?: OtherIncomeYearResult['kapitallebensversicherungDetails']
} {
  if (source.type !== 'kapitallebensversicherung' || !source.kapitallebensversicherungConfig) {
    return amounts
  }

  const status = calculateKapitallebensversicherungStatus(source.kapitallebensversicherungConfig, year)
  
  // Only pay out in the maturity year
  if (!status.isPayoutYear) {
    return {
      grossMonthlyAmount: 0,
      grossAnnualAmount: 0,
      kapitallebensversicherungDetails: status,
    }
  }

  // The gross amount should be the total payout
  return {
    grossMonthlyAmount: source.kapitallebensversicherungConfig.totalPayoutAmount / 12,
    grossAnnualAmount: source.kapitallebensversicherungConfig.totalPayoutAmount,
    kapitallebensversicherungDetails: status,
  }
}

function applyPflegezusatzversicherungLogic(
  source: OtherIncomeSource,
  year: number,
  amounts: { grossMonthlyAmount: number; grossAnnualAmount: number },
): {
  grossMonthlyAmount: number
  grossAnnualAmount: number
  pflegezusatzversicherungDetails?: OtherIncomeYearResult['pflegezusatzversicherungDetails']
} {
  if (source.type !== 'pflegezusatzversicherung' || !source.pflegezusatzversicherungConfig) {
    return amounts
  }

  const status = calculatePflegezusatzversicherungStatus(
    source.pflegezusatzversicherungConfig,
    year,
    amounts.grossAnnualAmount,
  )

  // If care benefits are not active yet, return zero income (but premiums are still paid in reality)
  if (!status.isActive) {
    return {
      grossMonthlyAmount: 0,
      grossAnnualAmount: 0,
      pflegezusatzversicherungDetails: status,
    }
  }

  // Return the monthly benefit as income
  return {
    grossMonthlyAmount: status.monthlyBenefit,
    grossAnnualAmount: status.monthlyBenefit * 12,
    pflegezusatzversicherungDetails: status,
  }
}

/**
 * Apply Risikolebensversicherung logic
 * Term life insurance represents a cost (negative income), not income
 */
function applyRisikolebensversicherungLogic(
  source: OtherIncomeSource,
  year: number,
  amounts: { grossMonthlyAmount: number; grossAnnualAmount: number },
): {
  grossMonthlyAmount: number
  grossAnnualAmount: number
  risikolebensversicherungDetails?: OtherIncomeYearResult['risikolebensversicherungDetails']
} {
  if (source.type !== 'risikolebensversicherung' || !source.risikolebensversicherungConfig) {
    return amounts
  }

  const status = calculateRisikolebensversicherungStatus(
    source.risikolebensversicherungConfig,
    year,
    source.startYear,
    source.endYear,
  )

  // Term life insurance is a cost (negative income)
  // The annual premium reduces available capital
  const annualCost = status.isActive ? -status.annualPremium : 0

  return {
    grossMonthlyAmount: annualCost / 12,
    grossAnnualAmount: annualCost,
    risikolebensversicherungDetails: status,
  }
}

// Helper: Calculate taxable amount for BU-Rente
function getBURenteTaxableAmount(
  buRenteDetails: OtherIncomeYearResult['buRenteDetails'],
  applyLeibrentenBesteuerung: boolean,
  grossAnnualAmount: number,
): number {
  if (applyLeibrentenBesteuerung && buRenteDetails?.taxableAmount !== undefined) {
    return buRenteDetails.taxableAmount
  }
  return grossAnnualAmount
}

// Helper: Calculate taxable amount for special income types
function calculateTaxableAmount(
  source: OtherIncomeSource,
  grossAnnualAmount: number,
  buRenteDetails?: OtherIncomeYearResult['buRenteDetails'],
  kapitallebensversicherungDetails?: OtherIncomeYearResult['kapitallebensversicherungDetails'],
): number {
  // For Pflegezusatzversicherung, benefits are tax-free in Germany (§ 3 Nr. 1a EStG)
  if (source.type === 'pflegezusatzversicherung') {
    return 0
  }

  // For Kapitallebensversicherung, only tax the taxable portion of gains
  if (source.type === 'kapitallebensversicherung' && kapitallebensversicherungDetails?.taxableGains !== undefined) {
    return kapitallebensversicherungDetails.taxableGains
  }

  // For BU-Rente with Leibrenten-Besteuerung, only tax the Ertragsanteil
  if (source.type === 'bu_rente') {
    return getBURenteTaxableAmount(buRenteDetails, source.buRenteConfig?.applyLeibrentenBesteuerung ?? false, grossAnnualAmount)
  }

  return grossAnnualAmount
}

function calculateTaxAndNet(
  source: OtherIncomeSource,
  grossAnnualAmount: number,
  buRenteDetails?: OtherIncomeYearResult['buRenteDetails'],
  kapitallebensversicherungDetails?: OtherIncomeYearResult['kapitallebensversicherungDetails'],
): { taxAmount: number; netAnnualAmount: number; netMonthlyAmount: number } {
  if (source.amountType !== 'gross') {
    return {
      taxAmount: 0,
      netAnnualAmount: grossAnnualAmount,
      netMonthlyAmount: grossAnnualAmount / 12,
    }
  }

  const taxableAmount = calculateTaxableAmount(
    source,
    grossAnnualAmount,
    buRenteDetails,
    kapitallebensversicherungDetails,
  )

  const taxAmount = taxableAmount * (source.taxRate / 100)
  const netAnnualAmount = grossAnnualAmount - taxAmount
  return {
    taxAmount,
    netAnnualAmount,
    netMonthlyAmount: netAnnualAmount / 12,
  }
}

// Helper: Apply Rürup-Rente-specific logic
function applyRuerupRenteLogic(
  source: OtherIncomeSource,
  year: number,
  amounts: { grossMonthlyAmount: number; grossAnnualAmount: number },
): {
  grossMonthlyAmount: number
  grossAnnualAmount: number
  ruerupRenteDetails?: OtherIncomeYearResult['ruerupRenteDetails']
} {
  if (source.type !== 'ruerup_rente' || !source.ruerupRenteConfig) {
    return amounts
  }

  const config = source.ruerupRenteConfig
  const age = year - config.birthYear
  const isContributionPhase = year < config.pensionStartYear
  const isPensionPhase = year >= config.pensionStartYear

  // Import Rürup calculation helpers
  const { 
    calculateRuerupTaxDeduction,
    calculateRuerupPensionTaxation,
    getRuerupDeductibilityLimits,
    getRuerupPensionTaxablePercentage,
  } = require('./ruerup-rente')

  if (isContributionPhase) {
    // During contribution phase: negative cash flow (contributions)
    // But also tax savings from deductions
    const deductionResult = calculateRuerupTaxDeduction(
      config.annualContribution,
      year,
      config.civilStatus,
      config.contributionPhaseTaxRate
    )

    const limits = getRuerupDeductibilityLimits(year)

    return {
      grossMonthlyAmount: -config.annualContribution / 12, // Negative because it's an outflow
      grossAnnualAmount: -config.annualContribution,
      ruerupRenteDetails: {
        age,
        isContributionPhase: true,
        isPensionPhase: false,
        annualContribution: config.annualContribution,
        taxDeduction: deductionResult.deductibleAmount,
        taxSavings: deductionResult.estimatedTaxSavings,
        deductiblePercentage: limits.deductiblePercentage,
        monthlyPension: 0,
        taxablePercentage: 0,
        taxableAmount: 0,
        incomeTax: 0,
        netAnnualPension: 0,
      },
    }
  }

  if (isPensionPhase) {
    // During pension phase: positive cash flow (pension payments)
    const yearsFromStart = year - config.pensionStartYear
    const inflationFactor = Math.pow(1 + config.pensionIncreaseRate, yearsFromStart)
    const adjustedMonthlyPension = config.expectedMonthlyPension * inflationFactor

    const pensionResult = calculateRuerupPensionTaxation(
      adjustedMonthlyPension,
      config.pensionStartYear,
      year,
      config.pensionIncreaseRate,
      config.pensionPhaseTaxRate
    )

    const taxablePercentage = getRuerupPensionTaxablePercentage(config.pensionStartYear)

    return {
      grossMonthlyAmount: adjustedMonthlyPension,
      grossAnnualAmount: pensionResult.grossAnnualPension,
      ruerupRenteDetails: {
        age,
        isContributionPhase: false,
        isPensionPhase: true,
        annualContribution: 0,
        taxDeduction: 0,
        taxSavings: 0,
        deductiblePercentage: 0,
        monthlyPension: adjustedMonthlyPension,
        taxablePercentage,
        taxableAmount: pensionResult.taxableAmount,
        incomeTax: pensionResult.incomeTax,
        netAnnualPension: pensionResult.netAnnualPension,
      },
    }
  }

  // Should not reach here, but return zero amounts just in case
  return {
    grossMonthlyAmount: 0,
    grossAnnualAmount: 0,
  }
}

// Helper: Apply all income type-specific logic
function applyIncomeTypeLogic(
  source: OtherIncomeSource,
  year: number,
  initialAmounts: { grossMonthlyAmount: number; grossAnnualAmount: number },
): {
  grossMonthlyAmount: number
  grossAnnualAmount: number
  kindergeldDetails?: OtherIncomeYearResult['kindergeldDetails']
  elterngeldDetails?: OtherIncomeYearResult['elterngeldDetails']
  buRenteDetails?: OtherIncomeYearResult['buRenteDetails']
  kapitallebensversicherungDetails?: OtherIncomeYearResult['kapitallebensversicherungDetails']
  pflegezusatzversicherungDetails?: OtherIncomeYearResult['pflegezusatzversicherungDetails']
  risikolebensversicherungDetails?: OtherIncomeYearResult['risikolebensversicherungDetails']
  ruerupRenteDetails?: OtherIncomeYearResult['ruerupRenteDetails']
} {
  const kindergeldResult = applyKindergeldLogic(source, year, initialAmounts)

  const elterngeldResult = applyElterngeldLogic(source, year, {
    grossMonthlyAmount: kindergeldResult.grossMonthlyAmount,
    grossAnnualAmount: kindergeldResult.grossAnnualAmount,
  })

  const buRenteResult = applyBURenteLogic(source, year, {
    grossMonthlyAmount: elterngeldResult.grossMonthlyAmount,
    grossAnnualAmount: elterngeldResult.grossAnnualAmount,
  })

  const kapitallebensversicherungResult = applyKapitallebensversicherungLogic(source, year, {
    grossMonthlyAmount: buRenteResult.grossMonthlyAmount,
    grossAnnualAmount: buRenteResult.grossAnnualAmount,
  })

  const pflegezusatzversicherungResult = applyPflegezusatzversicherungLogic(source, year, {
    grossMonthlyAmount: kapitallebensversicherungResult.grossMonthlyAmount,
    grossAnnualAmount: kapitallebensversicherungResult.grossAnnualAmount,
  })

  const risikolebensversicherungResult = applyRisikolebensversicherungLogic(source, year, {
    grossMonthlyAmount: pflegezusatzversicherungResult.grossMonthlyAmount,
    grossAnnualAmount: pflegezusatzversicherungResult.grossAnnualAmount,
  })

  const ruerupRenteResult = applyRuerupRenteLogic(source, year, {
    grossMonthlyAmount: risikolebensversicherungResult.grossMonthlyAmount,
    grossAnnualAmount: risikolebensversicherungResult.grossAnnualAmount,
  })

  return {
    grossMonthlyAmount: ruerupRenteResult.grossMonthlyAmount,
    grossAnnualAmount: ruerupRenteResult.grossAnnualAmount,
    kindergeldDetails: kindergeldResult.kindergeldDetails,
    elterngeldDetails: elterngeldResult.elterngeldDetails,
    buRenteDetails: buRenteResult.buRenteDetails,
    kapitallebensversicherungDetails: kapitallebensversicherungResult.kapitallebensversicherungDetails,
    pflegezusatzversicherungDetails: pflegezusatzversicherungResult.pflegezusatzversicherungDetails,
    risikolebensversicherungDetails: risikolebensversicherungResult.risikolebensversicherungDetails,
    ruerupRenteDetails: ruerupRenteResult.ruerupRenteDetails,
  }
}

// Helper: Build the final year result
function buildYearResult(
  source: OtherIncomeSource,
  incomeTypeResult: {
    grossMonthlyAmount: number
    grossAnnualAmount: number
    kindergeldDetails?: OtherIncomeYearResult['kindergeldDetails']
    elterngeldDetails?: OtherIncomeYearResult['elterngeldDetails']
    buRenteDetails?: OtherIncomeYearResult['buRenteDetails']
    kapitallebensversicherungDetails?: OtherIncomeYearResult['kapitallebensversicherungDetails']
    pflegezusatzversicherungDetails?: OtherIncomeYearResult['pflegezusatzversicherungDetails']
    risikolebensversicherungDetails?: OtherIncomeYearResult['risikolebensversicherungDetails']
    ruerupRenteDetails?: OtherIncomeYearResult['ruerupRenteDetails']
  },
  realEstateDetails: OtherIncomeYearResult['realEstateDetails'],
  inflationFactor: number,
): OtherIncomeYearResult {
  const { taxAmount, netAnnualAmount, netMonthlyAmount } = calculateTaxAndNet(
    source,
    incomeTypeResult.grossAnnualAmount,
    incomeTypeResult.buRenteDetails,
    incomeTypeResult.kapitallebensversicherungDetails,
  )

  const result: OtherIncomeYearResult = {
    source,
    grossAnnualAmount: incomeTypeResult.grossAnnualAmount,
    grossMonthlyAmount: incomeTypeResult.grossMonthlyAmount,
    taxAmount,
    netAnnualAmount,
    netMonthlyAmount,
    inflationFactor,
  }

  if (realEstateDetails) result.realEstateDetails = realEstateDetails
  if (incomeTypeResult.kindergeldDetails) result.kindergeldDetails = incomeTypeResult.kindergeldDetails
  if (incomeTypeResult.elterngeldDetails) result.elterngeldDetails = incomeTypeResult.elterngeldDetails
  if (incomeTypeResult.buRenteDetails) result.buRenteDetails = incomeTypeResult.buRenteDetails
  if (incomeTypeResult.kapitallebensversicherungDetails)
    result.kapitallebensversicherungDetails = incomeTypeResult.kapitallebensversicherungDetails
  if (incomeTypeResult.pflegezusatzversicherungDetails)
    result.pflegezusatzversicherungDetails = incomeTypeResult.pflegezusatzversicherungDetails
  if (incomeTypeResult.risikolebensversicherungDetails)
    result.risikolebensversicherungDetails = incomeTypeResult.risikolebensversicherungDetails
  if (incomeTypeResult.ruerupRenteDetails)
    result.ruerupRenteDetails = incomeTypeResult.ruerupRenteDetails

  return result
}

export function calculateOtherIncomeForYear(source: OtherIncomeSource, year: number): OtherIncomeYearResult | null {
  if (!isIncomeActiveForYear(source, year)) {
    return null
  }

  const yearsFromStart = year - source.startYear
  const inflationFactor = Math.pow(1 + source.inflationRate / 100, yearsFromStart)

  const {
    grossMonthlyAmount: initialGrossMonthly,
    grossAnnualAmount: initialGrossAnnual,
    realEstateDetails,
  } = calculateGrossAmounts(source, yearsFromStart, inflationFactor)

  const incomeTypeResult = applyIncomeTypeLogic(source, year, {
    grossMonthlyAmount: initialGrossMonthly,
    grossAnnualAmount: initialGrossAnnual,
  })

  // Return null for Kapitallebensversicherung if not the payout year
  const isNonPayoutKLV =
    source.type === 'kapitallebensversicherung' &&
    incomeTypeResult.kapitallebensversicherungDetails &&
    !incomeTypeResult.kapitallebensversicherungDetails.isPayoutYear

  if (isNonPayoutKLV) {
    return null
  }

  return buildYearResult(source, incomeTypeResult, realEstateDetails, inflationFactor)
}

/**
 * Calculate other income across multiple years for all sources
 */
export function calculateOtherIncome(
  config: OtherIncomeConfiguration,
  startYear: number,
  endYear: number,
): OtherIncomeResult {
  const result: OtherIncomeResult = {}

  if (!config.enabled || !config.sources.length) {
    return result
  }

  for (let year = startYear; year <= endYear; year++) {
    const sources: OtherIncomeYearResult[] = []
    let totalNetAnnualAmount = 0
    let totalTaxAmount = 0

    // Calculate for each income source
    for (const source of config.sources) {
      const yearResult = calculateOtherIncomeForYear(source, year)
      if (yearResult) {
        sources.push(yearResult)
        totalNetAnnualAmount += yearResult.netAnnualAmount
        totalTaxAmount += yearResult.taxAmount
      }
    }

    result[year] = {
      sources,
      totalNetAnnualAmount,
      totalTaxAmount,
    }
  }

  return result
}

/**
 * Get default monthly amount for income type
 */
function getDefaultMonthlyAmount(type: IncomeType): number {
  if (type === 'rental') return 1000
  if (type === 'kindergeld') return 250
  if (type === 'elterngeld') return 1200
  if (type === 'bu_rente') return 1500
  if (type === 'ruerup_rente') return 2000 // Expected monthly pension
  if (type === 'kapitallebensversicherung') return 0 // Lump sum, not monthly
  return 800
}

/**
 * Get default amount type for income type
 */
function getDefaultAmountType(type: IncomeType): 'gross' | 'net' {
  if (type === 'kindergeld') return 'net'
  if (type === 'elterngeld') return 'net'
  return 'gross'
}

/**
 * Get default inflation rate for income type
 */
function getDefaultInflationRate(type: IncomeType): number {
  if (type === 'kindergeld') return 0
  if (type === 'elterngeld') return 0 // Elterngeld is based on previous income, not adjusted for inflation
  if (type === 'bu_rente') return 0 // BU-Rente typically has fixed amounts
  if (type === 'ruerup_rente') return 1.0 // Rürup pension increase rate (handled by config)
  if (type === 'kapitallebensversicherung') return 0 // Lump sum, no inflation adjustment
  return 2.0
}

/**
 * Get default tax rate for income type
 */
function getDefaultTaxRate(type: IncomeType): number {
  if (type === 'kindergeld') return 0
  if (type === 'elterngeld') return 0 // Elterngeld is tax-free but subject to Progressionsvorbehalt
  if (type === 'bu_rente') return 25.0 // Individual income tax rate (typical for disability pensions)
  if (type === 'ruerup_rente') return 25.0 // Tax rate in pension phase (typically lower in retirement)
  if (type === 'kapitallebensversicherung') return 26.375 // Abgeltungsteuer (capital gains tax)
  return 30.0
}

/**
 * Create a default other income source
 */
export function createDefaultOtherIncomeSource(type: IncomeType = 'rental'): OtherIncomeSource {
  const currentYear = new Date().getFullYear()

  const source: OtherIncomeSource = {
    id: generateId(),
    name: getDefaultNameForType(type),
    type,
    amountType: getDefaultAmountType(type),
    monthlyAmount: getDefaultMonthlyAmount(type),
    startYear: currentYear,
    endYear: null, // Permanent by default
    inflationRate: getDefaultInflationRate(type),
    taxRate: getDefaultTaxRate(type),
    enabled: true,
    notes: '',
  }

  // Add default real estate configuration for rental income
  if (type === 'rental') {
    source.realEstateConfig = createDefaultRealEstateConfig()
  }

  // Add default Kindergeld configuration
  if (type === 'kindergeld') {
    source.kindergeldConfig = createDefaultKindergeldConfig()
  }

  // Add default BU-Rente configuration
  if (type === 'bu_rente') {
    source.buRenteConfig = createDefaultBURenteConfig()
  }

  // Add default Kapitallebensversicherung configuration
  if (type === 'kapitallebensversicherung') {
    source.kapitallebensversicherungConfig = createDefaultKapitallebensversicherungConfig()
  }

  // Add default Rürup-Rente configuration
  if (type === 'ruerup_rente') {
    source.ruerupRenteConfig = createDefaultRuerupRenteConfig()
  }

  return source
}

/**
 * Create default real estate configuration
 */
export function createDefaultRealEstateConfig(): RealEstateConfig {
  return {
    maintenanceCostPercent: 15.0, // 15% for maintenance and repairs
    vacancyRatePercent: 5.0, // 5% vacancy rate
    propertyAppreciationRate: 2.5, // 2.5% annual appreciation
    propertyValue: 300000, // 300k property value
    monthlyMortgagePayment: 0, // No mortgage by default
    includeAppreciation: false, // Don't include appreciation by default
  }
}

/**
 * Create default Kindergeld configuration
 */
export function createDefaultKindergeldConfig(): KindergeldConfig {
  const currentYear = new Date().getFullYear()

  return {
    numberOfChildren: 1,
    childBirthYear: currentYear, // Newborn by default
    inEducation: false, // Not yet in education (but will be considered when child reaches 18)
    childOrderNumber: 1, // First child by default
  }
}

/**
 * Create default Elterngeld configuration
 */
export function createDefaultElterngeldConfig(): ElterngeldConfig {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1 // JavaScript months are 0-indexed

  return {
    previousMonthlyNetIncome: 2000, // 2,000€ previous monthly net income
    childBirthYear: currentYear,
    childBirthMonth: currentMonth,
    durationMonths: 12, // 12 months Basiselterngeld
    useElterngeldPlus: false,
    partnerParticipation: false,
    partnerschaftsBonusMonths: 0,
    workingPartTime: false,
    partTimeMonthlyNetIncome: 0,
    elterngeldStartYear: currentYear,
    elterngeldStartMonth: currentMonth,
  }
}

/**
 * Create default BU-Rente configuration
 */
export function createDefaultBURenteConfig(): BURenteConfig {
  const currentYear = new Date().getFullYear()
  const defaultBirthYear = currentYear - 40 // 40 years old by default
  const disabilityStartYear = currentYear
  const ageAtDisabilityStart = disabilityStartYear - defaultBirthYear

  return {
    disabilityStartYear,
    disabilityEndYear: null, // Permanent disability by default
    birthYear: defaultBirthYear,
    disabilityDegree: 100, // 100% disability by default
    applyLeibrentenBesteuerung: true, // Apply special tax treatment by default
    ageAtDisabilityStart,
  }
}

/**
 * Create default Rürup-Rente configuration
 */
export function createDefaultRuerupRenteConfig(): RuerupRenteConfig {
  const currentYear = new Date().getFullYear()
  const defaultBirthYear = currentYear - 40 // 40 years old by default
  const pensionStartYear = currentYear + 27 // Retire at 67

  return {
    annualContribution: 10000, // €10,000 annual contribution
    civilStatus: 'single',
    pensionStartYear,
    expectedMonthlyPension: 2000, // €2,000 monthly pension
    pensionIncreaseRate: 0.01, // 1% annual increase
    contributionPhaseTaxRate: 0.42, // 42% tax rate during working years
    pensionPhaseTaxRate: 0.25, // 25% tax rate in retirement (typically lower)
    birthYear: defaultBirthYear,
  }
}

/**
 * Create default Kapitallebensversicherung configuration
 */
export function createDefaultKapitallebensversicherungConfig(): KapitallebensversicherungConfig {
  const currentYear = new Date().getFullYear()
  const defaultBirthYear = currentYear - 40 // 40 years old by default
  const policyStartYear = currentYear - 10 // Policy taken out 10 years ago
  const policyMaturityYear = currentYear + 5 // Matures in 5 years (total 15 year policy)

  return {
    policyStartYear,
    policyMaturityYear,
    totalPayoutAmount: 50000, // 50,000€ payout
    totalPremiumsPaid: 40000, // 40,000€ in premiums (10,000€ gains)
    qualifiesForHalbeinkuenfte: false, // Newer policies don't qualify
    birthYear: defaultBirthYear,
    applyTaxFreePortionAfter12Years: true, // Apply tax-free treatment if eligible
  }
}

/**
 * Create default Pflegezusatzversicherung configuration
 */
export function createDefaultPflegezusatzversicherungConfig(): PflegezusatzversicherungConfig {
  const currentYear = new Date().getFullYear()
  const defaultBirthYear = currentYear - 40 // 40 years old by default
  const policyStartYear = currentYear - 5 // Policy taken out 5 years ago
  const careStartYear = currentYear + 20 // Care need expected in 20 years (at age 60)

  return {
    careStartYear,
    careEndYear: null, // Lifelong care need
    pflegegrad: 3, // Medium care level as default
    birthYear: defaultBirthYear,
    monthlyPremium: 50, // 50€ monthly premium as default
    policyStartYear,
    applyTaxBenefits: true, // Apply tax deduction benefits by default
    maxAnnualTaxDeduction: 1900, // Current limit for private care insurance premiums (as of 2024)
  }
}

/**
 * Create default Risikolebensversicherung configuration
 */
export function createDefaultRisikolebensversicherungConfig(): RisikolebensversicherungConfig {
  const currentYear = new Date().getFullYear()
  const defaultBirthYear = currentYear - 35 // 35 years old by default

  return {
    coverageAmount: 250000, // 250,000€ typical coverage
    coverageType: 'level', // Constant coverage as default
    annualDecreasePercent: 5, // For decreasing coverage (not active by default)
    birthYear: defaultBirthYear,
    gender: 'male',
    healthStatus: 'good',
    smokingStatus: 'non-smoker',
  }
}

/**
 * Get the monthly Kindergeld amount based on German law (as of 2024)
 * @param _childOrderNumber - The order of the child (1st, 2nd, 3rd, etc.)
 * @returns Monthly Kindergeld amount in EUR
 */
export function getKindergeldAmount(_childOrderNumber: number): number {
  // As of 2024, all children receive 250€/month
  // This is a simplification - historically amounts varied by child order
  return 250
}

/**
 * Get default name for income type
 */
function getDefaultNameForType(type: IncomeType): string {
  const names = {
    rental: 'Mieteinnahmen',
    pension: 'Private Rente',
    business: 'Gewerbeeinkünfte',
    investment: 'Kapitalerträge',
    kindergeld: 'Kindergeld',
    elterngeld: 'Elterngeld',
    bu_rente: 'BU-Rente',
    ruerup_rente: 'Rürup-Rente (Basis-Rente)',
    kapitallebensversicherung: 'Kapitallebensversicherung',
    pflegezusatzversicherung: 'Pflegezusatzversicherung',
    risikolebensversicherung: 'Risikolebensversicherung',
    kinder_bildung: 'Kinder-Bildungskosten',
    other: 'Sonstige Einkünfte',
  }
  return names[type] || 'Einkommen'
}

/**
 * Generate a unique ID for income sources
 */
function generateId(): string {
  return `income_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Get display name for income type
 */
export function getIncomeTypeDisplayName(type: IncomeType): string {
  const names = {
    rental: 'Mieteinnahmen',
    pension: 'Rente/Pension',
    business: 'Gewerbeeinkünfte',
    investment: 'Kapitalerträge',
    kindergeld: 'Kindergeld',
    elterngeld: 'Elterngeld',
    bu_rente: 'BU-Rente',
    kapitallebensversicherung: 'Kapitallebensversicherung',
    pflegezusatzversicherung: 'Pflegezusatzversicherung',
    risikolebensversicherung: 'Risikolebensversicherung',
    kinder_bildung: 'Kinder-Bildungskosten',
    other: 'Sonstige Einkünfte',
  }
  return names[type] || type
}

/**
 * Get display name for amount type
 */
export function getAmountTypeDisplayName(amountType: IncomeAmountType): string {
  return amountType === 'gross' ? 'Brutto' : 'Netto'
}
