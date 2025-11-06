import type { SimulationContextState } from '../contexts/SimulationContext'
import type { SpecialEventData, Sparplan } from './sparplan-utils'

/**
 * Helper function to format basic financial parameters
 */
function formatBasicParameters(context: SimulationContextState): string[] {
  const lines: string[] = []

  lines.push(`Rendite: ${context.rendite.toFixed(2)} %`)
  lines.push(`Kapitalertragsteuer: ${context.steuerlast.toFixed(2)} %`)
  lines.push(`Teilfreistellungsquote: ${context.teilfreistellungsquote.toFixed(2)} %`)
  lines.push(`Steuerreduzierung Sparphase: ${context.steuerReduzierenEndkapitalSparphase ? 'Ja' : 'Nein'}`)
  lines.push(`Steuerreduzierung Entnahmephase: ${context.steuerReduzierenEndkapitalEntspharphase ? 'Ja' : 'Nein'}`)
  lines.push(`Zeitraum: ${context.startEnd[0]} - ${context.startEnd[1]}`)
  lines.push(`Simulationsmodus: ${context.simulationAnnual === 'yearly' ? 'Jährlich' : 'Monatlich'}`)
  lines.push(`Rendite-Modus: ${getReturnModeLabel(context.returnMode)}`)

  return lines
}

/**
 * Helper function to format inflation and return settings
 */
function formatInflationAndReturns(context: SimulationContextState): string[] {
  const lines: string[] = []

  // Inflation settings for savings phase
  lines.push(`Inflation Sparphase: ${context.inflationAktivSparphase ? 'Ja' : 'Nein'}`)
  if (context.inflationAktivSparphase) {
    lines.push(`Inflationsrate Sparphase: ${context.inflationsrateSparphase.toFixed(2)} %`)
    const anwendung = context.inflationAnwendungSparphase === 'sparplan' ? 'Auf Sparplan' : 'Auf Gesamtmenge'
    lines.push(`Inflationsanwendung Sparphase: ${anwendung}`)
  }

  if (context.returnMode === 'random') {
    lines.push(`Durchschnittsrendite: ${context.averageReturn.toFixed(2)} %`)
    lines.push(`Standardabweichung: ${context.standardDeviation.toFixed(2)} %`)
    if (context.randomSeed !== undefined) {
      lines.push(`Zufallsseed: ${context.randomSeed}`)
    }
  }

  return lines
}

/**
 * Helper function to format variable returns
 */
function formatVariableReturns(variableReturns: Record<number, number>): string[] {
  const lines: string[] = []
  const entries = Object.entries(variableReturns)

  if (entries.length > 0) {
    lines.push(`Variable Renditen:`)
    entries
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .forEach(([year, returnRate]) => {
        lines.push(`  ${year}: ${returnRate.toFixed(2)} %`)
      })
  }

  return lines
}

/**
 * Helper function to format tax allowances per year
 */
function formatTaxAllowances(freibetragPerYear: Record<number, number>): string[] {
  const lines: string[] = []
  const entries = Object.entries(freibetragPerYear)

  if (entries.length > 0) {
    lines.push(`Freibeträge pro Jahr:`)
    entries
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .forEach(([year, amount]) => {
        lines.push(`  ${year}: ${formatCurrency(amount)}`)
      })
  }

  return lines
}

/**
 * Helper function to format withdrawal configuration
 */
function formatWithdrawalConfiguration(context: SimulationContextState): string[] {
  const lines: string[] = []
  lines.push(`Entnahme-Konfiguration:`)

  if (context.withdrawalConfig && context.withdrawalConfig.formValue) {
    lines.push(...formatWithdrawalConfigDetails(context))
  } else {
    lines.push(...formatDefaultWithdrawalConfig(context))
  }

  return lines
}

/**
 * Helper function to format withdrawal config details when config exists
 */
function formatWithdrawalConfigDetails(context: SimulationContextState): string[] {
  const lines: string[] = []
  const wc = context.withdrawalConfig!
  const fv = wc.formValue

  lines.push(`  Lebensende: ${context.endOfLife}`)
  lines.push(`  Strategie: ${getWithdrawalStrategyLabel(fv.strategie)}`)
  lines.push(`  Entnahme-Rendite: ${fv.rendite.toFixed(2)} %`)
  lines.push(`  Entnahme-Häufigkeit: ${fv.withdrawalFrequency === 'yearly' ? 'Jährlich' : 'Monatlich'}`)

  lines.push(...formatWithdrawalInflation(fv))
  lines.push(...formatWithdrawalStrategyDetails(fv))
  lines.push(...formatGrundfreibetragConfig(context, fv))
  lines.push(...formatWithdrawalReturnMode(wc))
  lines.push(...formatSegmentedWithdrawal(wc))
  lines.push(...formatComparisonMode(wc))

  return lines
}

/**
 * Helper function to format default withdrawal config
 */
function formatDefaultWithdrawalConfig(context: SimulationContextState): string[] {
  const lines: string[] = []
  const defaultEndOfLife = context.startEnd[1]

  lines.push(`  Lebensende: ${defaultEndOfLife} (Standard)`)
  lines.push(`  Strategie: 4% Regel (Standard)`)
  lines.push(`  Entnahme-Rendite: 5.00 % (Standard)`)
  lines.push(`  Entnahme-Häufigkeit: Jährlich (Standard)`)
  lines.push(`  Inflation aktiv: Nein (Standard)`)
  lines.push(`  Grundfreibetrag aktiv: ${context.grundfreibetragAktiv ? 'Ja' : 'Nein (Standard)'}`)
  lines.push(`  Entnahme-Rendite-Modus: Fest (Standard)`)

  return lines
}

/**
 * Parameters for formatWithdrawalInflation helper function
 */
interface FormValue {
  inflationAktiv: boolean
  inflationsrate: number
  strategie: string
  monatlicheBetrag: number
  guardrailsAktiv: boolean
  guardrailsSchwelle: number
  variabelProzent: number
  dynamischBasisrate: number
  dynamischObereSchwell: number
  dynamischObereAnpassung: number
  dynamischUntereSchwell: number
  dynamischUntereAnpassung: number
  rendite: number
  withdrawalFrequency: string
  einkommensteuersatz: number
}

/**
 * Helper function to format withdrawal inflation settings
 */
function formatWithdrawalInflation(fv: FormValue): string[] {
  const lines: string[] = []

  if (fv.inflationAktiv) {
    lines.push(`  Inflation aktiv: Ja (${fv.inflationsrate.toFixed(2)} %)`)
  } else {
    lines.push(`  Inflation aktiv: Nein`)
  }

  return lines
}

/**
 * Format monthly fixed withdrawal details
 */
function formatMonthlyFixedDetails(fv: FormValue): string[] {
  const lines: string[] = []
  lines.push(`  Monatlicher Betrag: ${formatCurrency(fv.monatlicheBetrag)}`)
  if (fv.guardrailsAktiv) {
    lines.push(`  Guardrails aktiv: Ja (${fv.guardrailsSchwelle.toFixed(1)} %)`)
  } else {
    lines.push(`  Guardrails aktiv: Nein`)
  }
  return lines
}

/**
 * Format dynamic withdrawal details
 */
function formatDynamicWithdrawalDetails(fv: FormValue): string[] {
  return [
    `  Dynamische Basisrate: ${fv.dynamischBasisrate.toFixed(2)} %`,
    `  Obere Schwelle: ${fv.dynamischObereSchwell.toFixed(2)} %`,
    `  Obere Anpassung: ${fv.dynamischObereAnpassung.toFixed(2)} %`,
    `  Untere Schwelle: ${fv.dynamischUntereSchwell.toFixed(2)} %`,
    `  Untere Anpassung: ${fv.dynamischUntereAnpassung.toFixed(2)} %`,
  ]
}

/**
 * Helper function to format withdrawal strategy-specific details
 */
function formatWithdrawalStrategyDetails(fv: FormValue): string[] {
  if (fv.strategie === 'monatlich_fest') {
    return formatMonthlyFixedDetails(fv)
  }

  if (fv.strategie === 'variabel_prozent') {
    return [`  Variabler Prozentsatz: ${fv.variabelProzent.toFixed(2)} %`]
  }

  if (fv.strategie === 'dynamisch') {
    return formatDynamicWithdrawalDetails(fv)
  }

  return []
}

/**
 * Helper function to format Grundfreibetrag configuration
 */
function formatGrundfreibetragConfig(context: SimulationContextState, fv: FormValue): string[] {
  const lines: string[] = []

  if (context.grundfreibetragAktiv) {
    lines.push(`  Grundfreibetrag aktiv: Ja`)
    lines.push(`  Grundfreibetrag: ${formatCurrency(context.grundfreibetragBetrag)}`)
    lines.push(`  Einkommensteuersatz: ${fv.einkommensteuersatz.toFixed(2)} %`)
  } else {
    lines.push(`  Grundfreibetrag aktiv: Nein`)
  }

  return lines
}

/**
 * Parameters for formatWithdrawalReturnMode helper function
 */
interface WithdrawalConfig {
  withdrawalReturnMode: string
  withdrawalAverageReturn: number
  withdrawalStandardDeviation: number
  useSegmentedWithdrawal: boolean
  withdrawalSegments: Array<{
    name: string
    startYear: number
    endYear: number
    strategy: string
    withdrawalFrequency: string
    returnConfig: {
      mode: string
      fixedRate?: number
      randomConfig?: {
        averageReturn: number
        standardDeviation?: number
      }
    }
    customPercentage?: number
    monthlyConfig?: {
      monthlyAmount: number
      enableGuardrails?: boolean
      guardrailsThreshold?: number
    }
    dynamicConfig?: {
      baseWithdrawalRate: number
      upperThresholdReturn: number
      upperThresholdAdjustment: number
      lowerThresholdReturn: number
      lowerThresholdAdjustment: number
    }
    bucketConfig?: {
      subStrategy?: string
      initialCashCushion: number
      refillThreshold: number
      refillPercentage: number
      variabelProzent?: number
      monatlicheBetrag?: number
      dynamischBasisrate?: number
      dynamischObereSchwell?: number
      dynamischObereAnpassung?: number
      dynamischUntereSchwell?: number
      dynamischUntereAnpassung?: number
    }
    inflationConfig?: {
      inflationRate?: number
    }
    incomeTaxRate?: number
    steuerReduzierenEndkapital?: boolean
  }>
  useComparisonMode: boolean
  comparisonStrategies: unknown[]
  formValue: FormValue
}

/**
 * Helper function to format withdrawal return mode
 */
function formatWithdrawalReturnMode(wc: WithdrawalConfig): string[] {
  const lines: string[] = []

  lines.push(`  Entnahme-Rendite-Modus: ${getReturnModeLabel(wc.withdrawalReturnMode)}`)
  if (wc.withdrawalReturnMode === 'random') {
    lines.push(`  Entnahme-Durchschnittsrendite: ${wc.withdrawalAverageReturn.toFixed(2)} %`)
    lines.push(`  Entnahme-Standardabweichung: ${wc.withdrawalStandardDeviation.toFixed(2)} %`)
  }

  return lines
}

/**
 * Helper function to format segmented withdrawal configuration
 */
function formatSegmentedWithdrawal(wc: WithdrawalConfig): string[] {
  const lines: string[] = []

  if (wc.useSegmentedWithdrawal) {
    lines.push(`  Segmentierte Entnahme: Ja`)
    lines.push(`  Anzahl Segmente: ${wc.withdrawalSegments.length}`)

    if (wc.withdrawalSegments.length > 0) {
      lines.push(`  Segment-Details:`)
      wc.withdrawalSegments.forEach((segment, index) => {
        lines.push(...formatWithdrawalSegment({ segment, index }))
      })
    }
  }

  return lines
}

/**
 * Helper function to format comparison mode
 */
function formatComparisonMode(wc: WithdrawalConfig): string[] {
  const lines: string[] = []

  if (wc.useComparisonMode) {
    lines.push(`  Vergleichsmodus: Ja`)
    lines.push(`  Anzahl Strategien: ${wc.comparisonStrategies.length}`)
  }

  return lines
}

/**
 * Formats all simulation parameters into a human-readable German text format
 * for export to clipboard to help with development and bug reporting.
 */
export function formatParametersForExport(context: SimulationContextState): string {
  const lines: string[] = []

  lines.push(...formatBasicParameters(context))
  lines.push(...formatInflationAndReturns(context))
  lines.push(...formatVariableReturns(context.variableReturns))
  lines.push(...formatTaxAllowances(context.freibetragPerYear))

  // Savings plans and special events
  if (context.sparplan.length > 0) {
    lines.push(`Sparpläne und Sonderereignisse:`)
    context.sparplan.forEach((plan, index) => {
      lines.push(...formatSparplanItem({ plan, index }))
    })
  }

  // Withdrawal configuration
  lines.push(...formatWithdrawalConfiguration(context))

  return lines.join('\n')
}

/**
 * Helper function to format currency values
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Helper function to get German label for return mode
 */
function getReturnModeLabel(mode: string): string {
  switch (mode) {
    case 'fixed':
      return 'Fest'
    case 'random':
      return 'Zufällig'
    case 'variable':
      return 'Variabel'
    default:
      return mode
  }
}

/**
 * Helper function to get German label for withdrawal strategy
 */
function getWithdrawalStrategyLabel(strategy: string): string {
  switch (strategy) {
    case '4prozent':
      return '4% Regel'
    case '3prozent':
      return '3% Regel'
    case 'variabel_prozent':
      return 'Variabler Prozentsatz'
    case 'monatlich_fest':
      return 'Monatliche Entnahme'
    case 'dynamisch':
      return 'Dynamische Strategie'
    case 'bucket_strategie':
      return 'Drei-Eimer-Strategie'
    default:
      return strategy
  }
}

/**
 * Helper function to get German label for bucket sub-strategy
 */
function getBucketSubStrategyLabel(subStrategy: string): string {
  switch (subStrategy) {
    case '4prozent':
      return '4% Regel'
    case '3prozent':
      return '3% Regel'
    case 'variabel_prozent':
      return 'Variabler Prozentsatz'
    case 'monatlich_fest':
      return 'Monatlich fest'
    case 'dynamisch':
      return 'Dynamische Strategie'
    default:
      return subStrategy
  }
}

/**
 * Parameters for formatSparplanItem helper function
 */
interface FormatSparplanItemParams {
  plan: Sparplan
  index: number
}

/**
 * Helper function to format a single sparplan item
 */
function formatSparplanItem(params: FormatSparplanItemParams): string[] {
  const { plan, index } = params
  const lines: string[] = []

  // Detect event type
  const isSpecialEvent = Boolean(plan.eventType && plan.eventType !== 'normal')
  const isInheritance = plan.eventType === 'inheritance'
  const isExpense = plan.eventType === 'expense'
  const isEinmalzahlung = Boolean(
    plan.end && new Date(plan.start).getTime() === new Date(plan.end).getTime() && !isSpecialEvent,
  )

  let planType = 'Sparplan'
  if (isInheritance) planType = 'Erbschaft'
  else if (isExpense) planType = 'Ausgabe'
  else if (isEinmalzahlung) planType = 'Einmalzahlung'

  lines.push(`  ${planType} ${index + 1}:`)
  lines.push(...formatSparplanBasicInfo({ plan, isExpense, isEinmalzahlung, isSpecialEvent }))
  lines.push(...formatSparplanSpecialEventData({ plan, isInheritance, isExpense }))
  lines.push(...formatSparplanCostFactors(plan))

  return lines
}

/**
 * Parameters for formatSparplanBasicInfo helper function
 */
interface FormatSparplanBasicInfoParams {
  plan: {
    einzahlung: number
    start: Date | string
    end?: Date | string | null
  }
  isExpense: boolean
  isEinmalzahlung: boolean
  isSpecialEvent: boolean
}

/**
 * Helper function to format basic sparplan information
 */
function formatSparplanBasicInfo(params: FormatSparplanBasicInfoParams): string[] {
  const { plan, isExpense, isEinmalzahlung, isSpecialEvent } = params
  const lines: string[] = []

  lines.push(`    Betrag: ${formatCurrency(Math.abs(plan.einzahlung))}${isExpense ? ' (Ausgabe)' : ''}`)
  lines.push(`    Start: ${plan.start}`)

  if (plan.end && !isEinmalzahlung && !isSpecialEvent) {
    lines.push(`    Ende: ${plan.end}`)
  } else if (!isEinmalzahlung && !isSpecialEvent) {
    lines.push(`    Ende: Unbegrenzt`)
  }

  return lines
}

/**
 * Parameters for formatSparplanSpecialEventData helper function
 */
interface FormatSparplanSpecialEventDataParams {
  plan: Sparplan
  isInheritance: boolean
  isExpense: boolean
}

/**
 * Helper function to format special event data
 */
function formatInheritanceData(specialEventData: SpecialEventData): string[] {
  const lines: string[] = []
  if (specialEventData.relationshipType) {
    lines.push(`    Verwandtschaftsgrad: ${specialEventData.relationshipType}`)
    if (specialEventData.grossInheritanceAmount) {
      lines.push(`    Brutto-Erbschaft: ${formatCurrency(specialEventData.grossInheritanceAmount)}`)
    }
  }
  return lines
}

function formatExpenseData(specialEventData: SpecialEventData): string[] {
  const lines: string[] = []
  if (specialEventData.expenseType) {
    lines.push(`    Ausgabentyp: ${specialEventData.expenseType}`)
    if (specialEventData.creditTerms) {
      const rate = (specialEventData.creditTerms.interestRate * 100).toFixed(1)
      const years = specialEventData.creditTerms.termYears
      lines.push(`    Kredit: ${rate}% für ${years} Jahre`)
      lines.push(`    Monatliche Rate: ${formatCurrency(specialEventData.creditTerms.monthlyPayment || 0)}`)
    }
  }
  return lines
}

function formatSparplanSpecialEventData(params: FormatSparplanSpecialEventDataParams): string[] {
  const { plan, isInheritance, isExpense } = params
  const lines: string[] = []

  if (!plan.eventType || plan.eventType === 'normal' || !plan.specialEventData) {
    return lines
  }

  if (isInheritance) {
    lines.push(...formatInheritanceData(plan.specialEventData))
  }

  if (isExpense) {
    lines.push(...formatExpenseData(plan.specialEventData))
  }

  if (plan.specialEventData.description) {
    lines.push(`    Beschreibung: ${plan.specialEventData.description}`)
  }

  return lines
}

/**
 * Helper function to format sparplan cost factors
 */
function formatSparplanCostFactors(plan: {
  ter?: number
  transactionCostPercent?: number
  transactionCostAbsolute?: number
}): string[] {
  const lines: string[] = []

  if (plan.ter !== undefined) {
    lines.push(`    TER: ${plan.ter.toFixed(2)} %`)
  }
  if (plan.transactionCostPercent !== undefined) {
    lines.push(`    Transaktionskosten: ${plan.transactionCostPercent.toFixed(2)} %`)
  }
  if (plan.transactionCostAbsolute !== undefined) {
    lines.push(`    Absolute Transaktionskosten: ${formatCurrency(plan.transactionCostAbsolute)}`)
  }

  return lines
}

/**
 * Parameters for formatWithdrawalSegment helper function
 */
interface FormatWithdrawalSegmentParams {
  segment: {
    name: string
    startYear: number
    endYear: number
    strategy: string
    withdrawalFrequency: string
    returnConfig: {
      mode: string
      fixedRate?: number
      randomConfig?: {
        averageReturn: number
        standardDeviation?: number
      }
    }
    customPercentage?: number
    monthlyConfig?: {
      monthlyAmount: number
      enableGuardrails?: boolean
      guardrailsThreshold?: number
    }
    dynamicConfig?: {
      baseWithdrawalRate: number
      upperThresholdReturn: number
      upperThresholdAdjustment: number
      lowerThresholdReturn: number
      lowerThresholdAdjustment: number
    }
    bucketConfig?: {
      subStrategy?: string
      initialCashCushion: number
      refillThreshold: number
      refillPercentage: number
      variabelProzent?: number
      monatlicheBetrag?: number
      dynamischBasisrate?: number
      dynamischObereSchwell?: number
      dynamischObereAnpassung?: number
      dynamischUntereSchwell?: number
      dynamischUntereAnpassung?: number
    }
    inflationConfig?: {
      inflationRate?: number
    }
    incomeTaxRate?: number
    steuerReduzierenEndkapital?: boolean
  }
  index: number
}

/**
 * Helper function to format a single withdrawal segment
 */
function formatWithdrawalSegment(params: FormatWithdrawalSegmentParams): string[] {
  const { segment, index } = params
  const lines: string[] = []

  lines.push(`    Segment ${index + 1} (${segment.name}):`)
  lines.push(`      Zeitraum: ${segment.startYear} - ${segment.endYear}`)
  lines.push(`      Strategie: ${getWithdrawalStrategyLabel(segment.strategy)}`)
  lines.push(`      Häufigkeit: ${segment.withdrawalFrequency === 'yearly' ? 'Jährlich' : 'Monatlich'}`)

  // Return configuration
  lines.push(...formatSegmentReturnConfig(segment.returnConfig))

  // Strategy-specific parameters
  lines.push(...formatSegmentStrategyParams(segment))

  // Inflation and tax configuration
  lines.push(...formatSegmentTaxAndInflation(segment))

  return lines
}

/**
 * Helper function to format segment return configuration
 */
function formatSegmentReturnConfig(returnConfig: {
  mode: string
  fixedRate?: number
  randomConfig?: {
    averageReturn: number
    standardDeviation?: number
  }
}): string[] {
  const lines: string[] = []

  lines.push(`      Rendite-Modus: ${getReturnModeLabel(returnConfig.mode)}`)

  if (returnConfig.mode === 'fixed' && returnConfig.fixedRate !== undefined) {
    lines.push(`      Rendite: ${(returnConfig.fixedRate * 100).toFixed(2)} %`)
  } else if (returnConfig.mode === 'random' && returnConfig.randomConfig) {
    lines.push(`      Durchschnittsrendite: ${(returnConfig.randomConfig.averageReturn * 100).toFixed(2)} %`)
    if (returnConfig.randomConfig.standardDeviation !== undefined) {
      lines.push(`      Standardabweichung: ${(returnConfig.randomConfig.standardDeviation * 100).toFixed(2)} %`)
    }
  }

  return lines
}

function formatVariabelProzentStrategy(segment: { customPercentage?: number }): string[] {
  if (segment.customPercentage !== undefined) {
    return [`      Variabler Prozentsatz: ${segment.customPercentage.toFixed(2)} %`]
  }
  return []
}

function formatMonatlichFestStrategy(segment: {
  monthlyConfig?: {
    monthlyAmount: number
    enableGuardrails?: boolean
    guardrailsThreshold?: number
  }
}): string[] {
  const lines: string[] = []
  if (segment.monthlyConfig) {
    lines.push(`      Monatlicher Betrag: ${formatCurrency(segment.monthlyConfig.monthlyAmount)}`)
    if (segment.monthlyConfig.enableGuardrails) {
      lines.push(`      Guardrails: ${segment.monthlyConfig.guardrailsThreshold?.toFixed(1) || 'N/A'} %`)
    }
  }
  return lines
}

/**
 * Helper function to format segment strategy-specific parameters
 */
function formatSegmentStrategyParams(segment: {
  strategy: string
  customPercentage?: number
  monthlyConfig?: {
    monthlyAmount: number
    enableGuardrails?: boolean
    guardrailsThreshold?: number
  }
  dynamicConfig?: {
    baseWithdrawalRate: number
    upperThresholdReturn: number
    upperThresholdAdjustment: number
    lowerThresholdReturn: number
    lowerThresholdAdjustment: number
  }
  bucketConfig?: {
    subStrategy?: string
    initialCashCushion: number
    refillThreshold: number
    refillPercentage: number
    variabelProzent?: number
    monatlicheBetrag?: number
    dynamischBasisrate?: number
    dynamischObereSchwell?: number
    dynamischObereAnpassung?: number
    dynamischUntereSchwell?: number
    dynamischUntereAnpassung?: number
  }
}): string[] {
  const strategyFormatters: Record<string, () => string[]> = {
    variabel_prozent: () => formatVariabelProzentStrategy(segment),
    monatlich_fest: () => formatMonatlichFestStrategy(segment),
    dynamisch: () => (segment.dynamicConfig ? formatDynamicStrategyConfig(segment.dynamicConfig) : []),
    bucket_strategie: () => (segment.bucketConfig ? formatBucketStrategyConfig(segment.bucketConfig) : []),
  }

  const formatter = strategyFormatters[segment.strategy]
  return formatter ? formatter() : []
}

/**
 * Helper function to format dynamic strategy configuration
 */
function formatDynamicStrategyConfig(config: {
  baseWithdrawalRate: number
  upperThresholdReturn: number
  upperThresholdAdjustment: number
  lowerThresholdReturn: number
  lowerThresholdAdjustment: number
}): string[] {
  const lines: string[] = []

  lines.push(`      Dynamische Basisrate: ${config.baseWithdrawalRate.toFixed(2)} %`)
  lines.push(`      Obere Schwelle: ${config.upperThresholdReturn.toFixed(2)} %`)
  lines.push(`      Obere Anpassung: ${config.upperThresholdAdjustment.toFixed(2)} %`)
  lines.push(`      Untere Schwelle: ${config.lowerThresholdReturn.toFixed(2)} %`)
  lines.push(`      Untere Anpassung: ${config.lowerThresholdAdjustment.toFixed(2)} %`)

  return lines
}

/**
 * Helper function to format bucket strategy configuration
 */
function formatBucketStrategyConfig(config: {
  subStrategy?: string
  initialCashCushion: number
  refillThreshold: number
  refillPercentage: number
  variabelProzent?: number
  monatlicheBetrag?: number
  dynamischBasisrate?: number
  dynamischObereSchwell?: number
  dynamischObereAnpassung?: number
  dynamischUntereSchwell?: number
  dynamischUntereAnpassung?: number
}): string[] {
  const lines: string[] = []

  lines.push(`      Sub-Strategie: ${getBucketSubStrategyLabel(config.subStrategy || '4prozent')}`)
  lines.push(`      Initiales Cash-Polster: ${formatCurrency(config.initialCashCushion)}`)
  lines.push(`      Auffüll-Schwellenwert: ${formatCurrency(config.refillThreshold)}`)
  lines.push(`      Auffüll-Anteil: ${(config.refillPercentage * 100).toFixed(0)} %`)

  // Add sub-strategy specific configuration
  if (config.subStrategy === 'variabel_prozent' && config.variabelProzent !== undefined) {
    lines.push(`      Variabler Prozentsatz: ${config.variabelProzent.toFixed(2)} %`)
  }

  if (config.subStrategy === 'monatlich_fest' && config.monatlicheBetrag !== undefined) {
    lines.push(`      Monatlicher Betrag: ${formatCurrency(config.monatlicheBetrag)}`)
  }

  if (config.subStrategy === 'dynamisch') {
    lines.push(...formatBucketDynamicSubStrategy(config))
  }

  return lines
}

/**
 * Helper function to format bucket strategy dynamic sub-strategy config
 */
function formatBucketDynamicSubStrategy(config: {
  dynamischBasisrate?: number
  dynamischObereSchwell?: number
  dynamischObereAnpassung?: number
  dynamischUntereSchwell?: number
  dynamischUntereAnpassung?: number
}): string[] {
  const lines: string[] = []

  if (config.dynamischBasisrate !== undefined) {
    lines.push(`      Dynamische Basisrate: ${config.dynamischBasisrate.toFixed(2)} %`)
  }
  if (config.dynamischObereSchwell !== undefined) {
    lines.push(`      Obere Schwelle: ${config.dynamischObereSchwell.toFixed(2)} %`)
  }
  if (config.dynamischObereAnpassung !== undefined) {
    lines.push(`      Obere Anpassung: ${config.dynamischObereAnpassung.toFixed(2)} %`)
  }
  if (config.dynamischUntereSchwell !== undefined) {
    lines.push(`      Untere Schwelle: ${config.dynamischUntereSchwell.toFixed(2)} %`)
  }
  if (config.dynamischUntereAnpassung !== undefined) {
    lines.push(`      Untere Anpassung: ${config.dynamischUntereAnpassung.toFixed(2)} %`)
  }

  return lines
}

/**
 * Helper function to format segment tax and inflation configuration
 */
function formatSegmentTaxAndInflation(segment: {
  inflationConfig?: {
    inflationRate?: number
  }
  incomeTaxRate?: number
  steuerReduzierenEndkapital?: boolean
}): string[] {
  const lines: string[] = []

  // Inflation configuration
  if (segment.inflationConfig && segment.inflationConfig.inflationRate !== undefined) {
    lines.push(`      Inflation: ${(segment.inflationConfig.inflationRate * 100).toFixed(2)} %`)
  }

  // Tax configuration
  if (segment.incomeTaxRate !== undefined) {
    lines.push(`      Einkommensteuersatz: ${segment.incomeTaxRate.toFixed(2)} %`)
  }

  if (segment.steuerReduzierenEndkapital !== undefined) {
    lines.push(`      Steuerreduzierung: ${segment.steuerReduzierenEndkapital ? 'Ja' : 'Nein'}`)
  }

  return lines
}

/**
 * Copies the formatted parameters to clipboard
 * Returns a promise that resolves to true if successful, false otherwise
 */
export async function copyParametersToClipboard(context: SimulationContextState): Promise<boolean> {
  try {
    const formattedText = formatParametersForExport(context)
    await navigator.clipboard.writeText(formattedText)
    return true
  } catch (error) {
    console.error('Failed to copy parameters to clipboard:', error)
    return false
  }
}
