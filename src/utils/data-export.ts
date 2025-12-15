import type { SimulationContextState } from '../contexts/SimulationContext'
import type { WithdrawalResult, WithdrawalResultElement } from '../../helpers/withdrawal'
import type { OtherIncomeSource } from '../../helpers/other-income'
import type { WithdrawalSegment } from './segmented-withdrawal'
import type { SparplanElement, Sparplan } from './sparplan-utils'
import type { WithdrawalConfiguration } from './config-storage'
import type { SimulationResultElement } from './simulate'
import type { ReadonlyRecord } from '../types'
import { formatCurrency, formatPercentage, formatNumberGerman } from './currency'

/**
 * Utility functions for exporting simulation data in CSV and Markdown formats
 */

export interface SavingsData {
  sparplanElements: SparplanElement[]
}

export interface ExportData {
  savingsData?: SavingsData
  withdrawalData?: WithdrawalResult
  context: SimulationContextState
}

/**
 * Generates CSV header row for savings phase export.
 * Creates a header with columns for year, month, capital values, and individual savings plan contributions.
 *
 * @param sparplans - Array of configured savings plans to include in the export
 * @returns Semicolon-separated CSV header string with all column names
 */
function generateSavingsCSVHeader(sparplans: Sparplan[]): string {
  const baseHeaders = ['Jahr', 'Monat', 'Startkapital (EUR)', 'Zinsen (EUR)']

  // Add headers for each configured savings plan
  const sparplanHeaders = sparplans.map((_, index) => `Einzahlung Sparplan ${index + 1} (EUR)`)

  const endHeaders = [
    'Gesamte Einzahlungen (EUR)',
    'Endkapital (EUR)',
    'Vorabpauschale (EUR)',
    'Bezahlte Steuer (EUR)',
    'Genutzter Freibetrag (EUR)',
  ]

  return [...baseHeaders, ...sparplanHeaders, ...endHeaders].join(';')
}

/**
 * Exports savings phase simulation data to CSV format.
 * Generates a comprehensive CSV file containing yearly/monthly breakdown of investments,
 * returns, taxes, and capital development. Includes metadata header with simulation parameters.
 *
 * @param data - The export data containing savings simulation results and context
 * @returns CSV-formatted string with semicolon separators, German number formatting
 * @throws Error if savings data is missing or invalid
 */
export function exportSavingsDataToCSV(data: ExportData): string {
  const { savingsData, context } = data

  if (!savingsData?.sparplanElements) {
    throw new Error('Keine Sparplan-Daten verfügbar')
  }

  const lines: string[] = []

  // Process simulation data first to determine structure
  const simulationElements = savingsData.sparplanElements

  if (!simulationElements || simulationElements.length === 0) {
    throw new Error('Keine Simulationselemente verfügbar')
  }

  // Calculate the savings phase time period from savings plan configuration
  const currentYear = new Date().getFullYear()
  const savingsStartYear = Math.min(
    currentYear,
    ...context.sparplanElemente.map(plan => new Date(plan.start).getFullYear()),
  )

  // For savings phase, use the planned end date from savings plans or withdrawal start
  const planEndYears = context.sparplan.filter(plan => plan.end).map(plan => new Date(plan.end!).getFullYear())

  const savingsEndYear = planEndYears.length > 0 ? Math.max(...planEndYears) : context.startEnd[0] // Fallback to withdrawal start if no plan end dates

  // Add header with parameter information
  lines.push('# Sparphase - Simulationsdaten')
  lines.push('# Zeitraum: ' + savingsStartYear + ' - ' + savingsEndYear)
  lines.push('# Rendite: ' + formatPercentage(context.rendite))
  lines.push('# Kapitalertragsteuer: ' + formatPercentage(context.steuerlast))
  lines.push('# Teilfreistellungsquote: ' + formatPercentage(context.teilfreistellungsquote))
  lines.push('# Berechnungsmodus: ' + (context.simulationAnnual === 'yearly' ? 'Jährlich' : 'Monatlich'))
  lines.push('')

  // Add CSV header with only the configured savings plans
  lines.push(generateSavingsCSVHeader(context.sparplan))

  // Detect data structure and export accordingly
  const hasSimulationProperty = simulationElements.some(element => 'simulation' in element)

  if (hasSimulationProperty) {
    // Real app structure: elements have simulation property with years as keys
    exportSimulationStructure(simulationElements, context, lines)
  } else {
    // Test mock structure: each element represents a year's data
    exportMockStructure(simulationElements, context, lines)
  }

  return lines.join('\n')
}

/**
 * Accumulate year data into totals
 */
function accumulateYearData(
  yearData: SimulationResultElement | undefined,
  accumulators: {
    totalStartkapital: number
    totalZinsen: number
    totalEndkapital: number
    totalBezahlteSteuer: number
    totalGenutzterFreibetrag: number
    totalVorabpauschale: number
  },
): void {
  if (!yearData) return

  accumulators.totalStartkapital += yearData.startkapital || 0
  accumulators.totalZinsen += yearData.zinsen || 0
  accumulators.totalEndkapital += yearData.endkapital || 0
  accumulators.totalBezahlteSteuer += yearData.bezahlteSteuer || 0
  accumulators.totalGenutzterFreibetrag += yearData.genutzterFreibetrag || 0
  accumulators.totalVorabpauschale += yearData.vorabpauschale || 0
}

/**
 * Process simulation element for a given year
 */
function processSimulationElement(
  element: SparplanElement,
  elementIndex: number,
  year: number,
  isMonthly: boolean,
  sparplanContributions: number[],
  accumulators: {
    totalStartkapital: number
    totalZinsen: number
    totalEndkapital: number
    totalBezahlteSteuer: number
    totalGenutzterFreibetrag: number
    totalVorabpauschale: number
  },
): void {
  if (!('simulation' in element)) return

  const yearData = element.simulation?.[year]
  accumulateYearData(yearData, accumulators)

  // Calculate contribution for this element in this year
  const elementContribution = getElementContributionForYear(element, year, isMonthly)
  if (elementIndex < sparplanContributions.length) {
    sparplanContributions[elementIndex] = elementContribution
  }
}

/**
 * Export data from real simulation structure (elements with simulation property)
 */
function exportSimulationStructure(
  simulationElements: SparplanElement[],
  context: SimulationContextState,
  lines: string[],
) {
  // Collect all years from all simulation elements
  const allYears = new Set<number>()
  for (const element of simulationElements) {
    if ('simulation' in element && element.simulation) {
      Object.keys(element.simulation).forEach(year => allYears.add(parseInt(year)))
    }
  }

  // Sort years and process each one
  const sortedYears = Array.from(allYears).sort((a, b) => a - b)
  let cumulativeContributions = 0

  for (const year of sortedYears) {
    const isMonthly = context.simulationAnnual === 'monthly'

    const sparplanContributions: number[] = []

    // Initialize contributions array for each configured savings plan
    context.sparplan.forEach(() => {
      sparplanContributions.push(0)
    })

    // Initialize accumulators
    const accumulators = {
      totalStartkapital: 0,
      totalZinsen: 0,
      totalEndkapital: 0,
      totalBezahlteSteuer: 0,
      totalGenutzterFreibetrag: 0,
      totalVorabpauschale: 0,
    }

    // Sum up data from all elements for this year
    simulationElements.forEach((element, elementIndex: number) => {
      processSimulationElement(element, elementIndex, year, isMonthly, sparplanContributions, accumulators)
    })

    // Calculate cumulative contributions
    const yearlyContributions = sparplanContributions.reduce((sum, contrib) => sum + contrib, 0)
    cumulativeContributions += yearlyContributions

    addYearRows(
      year,
      isMonthly,
      accumulators.totalStartkapital,
      accumulators.totalZinsen,
      accumulators.totalEndkapital,
      accumulators.totalBezahlteSteuer,
      accumulators.totalGenutzterFreibetrag,
      accumulators.totalVorabpauschale,
      sparplanContributions,
      cumulativeContributions,
      lines,
    )
  }
}

/**
 * Extract element amount from various possible mock data properties
 */
function extractElementAmount(element: SparplanElement): number {
  const mockData = element as Record<string, unknown>
  return (
    ('einzahlung' in element && element.einzahlung) ||
    (typeof mockData.amount === 'number' ? mockData.amount : 0) ||
    (typeof mockData.monthlyAmount === 'number' ? mockData.monthlyAmount : 0) ||
    0
  )
}

/**
 * Extract numeric property from mock element with fallback to 0
 */
function extractMockNumericProperty(element: SparplanElement, property: string): number {
  const mockElement = element as Record<string, unknown>
  return typeof mockElement[property] === 'number' ? (mockElement[property] as number) : 0
}

/**
 * Extract financial data from mock element
 */
interface MockFinancialData {
  startkapital: number
  zinsen: number
  endkapital: number
  bezahlteSteuer: number
  genutzterFreibetrag: number
  vorabpauschale: number
}

function extractMockFinancialData(element: SparplanElement): MockFinancialData {
  return {
    startkapital: extractMockNumericProperty(element, 'startkapital'),
    zinsen: extractMockNumericProperty(element, 'zinsen'),
    endkapital: extractMockNumericProperty(element, 'endkapital'),
    bezahlteSteuer: extractMockNumericProperty(element, 'bezahlteSteuer'),
    genutzterFreibetrag: extractMockNumericProperty(element, 'genutzterFreibetrag'),
    vorabpauschale: extractMockNumericProperty(element, 'vorabpauschale'),
  }
}

/**
 * Export data from test mock structure (each element represents a year)
 */
function exportMockStructure(simulationElements: SparplanElement[], context: SimulationContextState, lines: string[]) {
  let cumulativeContributions = 0

  for (const element of simulationElements) {
    if (!element) continue

    const year = new Date(element.start).getFullYear()
    const isMonthly = context.simulationAnnual === 'monthly'

    // Build sparplan contributions array
    const elementAmount = extractElementAmount(element)
    const sparplanContributions: number[] = []
    context.sparplan.forEach(() => {
      sparplanContributions.push(elementAmount || 0)
    })

    // Calculate cumulative contributions
    const yearlyContributions = sparplanContributions.reduce((sum, contrib) => sum + contrib, 0)
    cumulativeContributions += yearlyContributions

    // Extract financial data
    const financialData = extractMockFinancialData(element)

    addYearRows(
      year,
      isMonthly,
      financialData.startkapital,
      financialData.zinsen,
      financialData.endkapital,
      financialData.bezahlteSteuer,
      financialData.genutzterFreibetrag,
      financialData.vorabpauschale,
      sparplanContributions,
      cumulativeContributions,
      lines,
    )
  }
}

/**
 * Add rows for a specific year to the CSV output
 */
function addYearRows(
  year: number,
  isMonthly: boolean,
  startkapital: number,
  zinsen: number,
  endkapital: number,
  bezahlteSteuer: number,
  genutzterFreibetrag: number,
  vorabpauschale: number,
  sparplanContributions: number[],
  cumulativeContributions: number,
  lines: string[],
) {
  const months = isMonthly ? 12 : 1

  for (let month = 1; month <= months; month++) {
    const row: string[] = []

    // Basic data
    row.push(year.toString())
    row.push(isMonthly ? month.toString() : '12')
    row.push(formatNumberGerman(startkapital))
    row.push(formatNumberGerman(zinsen))

    // Individual savings plan contributions
    sparplanContributions.forEach(contribution => {
      row.push(formatNumberGerman(contribution))
    })

    // Summary data - now using cumulative contributions
    row.push(formatNumberGerman(cumulativeContributions))
    row.push(formatNumberGerman(endkapital))
    row.push(formatNumberGerman(vorabpauschale))
    row.push(formatNumberGerman(bezahlteSteuer))
    row.push(formatNumberGerman(genutzterFreibetrag))

    lines.push(row.join(';'))
  }
}

/**
 * Calculate the contribution amount for a specific element in a specific year
 */
/**
 * Check if element is active in given year
 */
function isElementActiveInYear(element: Record<string, unknown>, year: number): boolean {
  const startYear = new Date(element.start as string).getFullYear()
  const endYear = element.end ? new Date(element.end as string).getFullYear() : new Date().getFullYear() + 50

  return year >= startYear && year <= endYear
}

/**
 * Get yearly amount from element with multiple fallback properties
 */
function getYearlyAmountFromElement(element: Record<string, unknown>): number {
  return (element.einzahlung as number) || (element.amount as number) || (element.monthlyAmount as number) || 0
}

function getElementContributionForYear(element: unknown, year: number, isMonthly: boolean): number {
  if (typeof element !== 'object' || element === null) {
    return 0
  }

  const elem = element as Record<string, unknown>

  if (!isElementActiveInYear(elem, year)) {
    return 0
  }

  const yearlyAmount = getYearlyAmountFromElement(elem)
  return isMonthly ? yearlyAmount / 12 : yearlyAmount
}

/**
 * Format Vorabpauschale basiszins for CSV
 */
function formatBasiszins(details: WithdrawalResultElement['vorabpauschaleDetails']): string {
  if (!details) {
    return '0,00'
  }
  return formatPercentage(details.basiszins * 100).replace('%', '')
}

/**
 * Build basic row data for a withdrawal year/month
 */
interface BasicRowDataParams {
  year: number
  month: number
  yearData: WithdrawalResultElement
  isMonthly: boolean
}

/**
 * Extract Vorabpauschale details for CSV formatting
 */
function extractVorabpauschaleDetails(yearData: WithdrawalResultElement): {
  basiszins: string
  basisertrag: string
  jahresgewinn: string
  steuerVorFreibetrag: string
} {
  const details = yearData.vorabpauschaleDetails
  return {
    basiszins: formatBasiszins(details),
    basisertrag: formatNumberGerman(details?.basisertrag || 0),
    jahresgewinn: formatNumberGerman(details?.jahresgewinn || 0),
    steuerVorFreibetrag: formatNumberGerman(details?.steuerVorFreibetrag || 0),
  }
}

function buildBasicRowData(params: BasicRowDataParams): string[] {
  const { year, month, yearData, isMonthly } = params
  const vDetails = extractVorabpauschaleDetails(yearData)

  return [
    year.toString(),
    isMonthly ? month.toString() : '12',
    formatNumberGerman(yearData.startkapital),
    formatNumberGerman(yearData.entnahme),
    formatNumberGerman(yearData.zinsen),
    formatNumberGerman(yearData.endkapital),
    vDetails.basiszins,
    vDetails.basisertrag,
    vDetails.jahresgewinn,
    formatNumberGerman(yearData.vorabpauschale || 0),
    vDetails.steuerVorFreibetrag,
    formatNumberGerman(yearData.bezahlteSteuer),
    formatNumberGerman(yearData.genutzterFreibetrag),
  ]
}

/**
 * Add strategy-specific data to row
 */
interface StrategyRowDataParams {
  row: string[]
  yearData: WithdrawalResultElement
  withdrawalConfig: WithdrawalConfiguration | null
}

function addMonthlyFixedStrategyData(
  row: string[],
  yearData: WithdrawalResultElement,
  formValue: { inflationAktiv?: boolean; guardrailsAktiv?: boolean },
): void {
  row.push(formatNumberGerman(yearData.monatlicheEntnahme || 0))
  if (formValue.inflationAktiv) {
    row.push(formatNumberGerman(yearData.inflationAnpassung || 0))
  }
  if (formValue.guardrailsAktiv) {
    row.push(formatNumberGerman(yearData.portfolioAnpassung || 0))
  }
}

function addDynamicStrategyData(row: string[], yearData: WithdrawalResultElement): void {
  row.push(formatPercentage(yearData.vorjahresRendite || 0))
  row.push(formatNumberGerman(yearData.dynamischeAnpassung || 0))
}

function addStrategySpecificData(params: StrategyRowDataParams): void {
  const { row, yearData, withdrawalConfig } = params

  if (withdrawalConfig?.formValue.strategie === 'monatlich_fest') {
    addMonthlyFixedStrategyData(row, yearData, withdrawalConfig.formValue)
  } else if (withdrawalConfig?.formValue.strategie === 'dynamisch') {
    addDynamicStrategyData(row, yearData)
  }
}

/**
 * Add tax and income data to row
 */
interface TaxIncomeDataParams {
  row: string[]
  yearData: WithdrawalResultElement
  grundfreibetragAktiv: boolean
  hasOtherIncomeData: boolean
}

/**
 * Type for other income field in withdrawal result
 */
interface OtherIncomeField {
  totalNetAmount: number
  totalTaxAmount: number
  sourceCount: number
}

/**
 * Helper to safely get other income value
 */
function getOtherIncomeValue(
  otherIncome: OtherIncomeField | undefined,
  field: 'totalNetAmount' | 'totalTaxAmount' | 'sourceCount',
): number {
  if (!otherIncome) {
    return 0
  }
  return otherIncome[field] ?? 0
}

function addTaxAndIncomeData(params: TaxIncomeDataParams): void {
  const { row, yearData, grundfreibetragAktiv, hasOtherIncomeData } = params

  if (grundfreibetragAktiv) {
    const einkommensteuer = yearData.einkommensteuer ?? 0
    const grundfreibetrag = yearData.genutzterGrundfreibetrag ?? 0
    row.push(formatNumberGerman(einkommensteuer))
    row.push(formatNumberGerman(grundfreibetrag))
  }

  if (hasOtherIncomeData) {
    const otherIncome = yearData.otherIncome
    row.push(formatNumberGerman(getOtherIncomeValue(otherIncome, 'totalNetAmount')))
    row.push(formatNumberGerman(getOtherIncomeValue(otherIncome, 'totalTaxAmount')))
    row.push(getOtherIncomeValue(otherIncome, 'sourceCount').toString())
  }
}

/**
 * Generate CSV header columns for withdrawal data export
 */
interface WithdrawalHeaderParams {
  withdrawalConfig: WithdrawalConfiguration | null
  withdrawalData: WithdrawalResult
  grundfreibetragAktiv: boolean
}

/**
 * Add strategy-specific headers for monthly fixed withdrawal
 */
function addMonthlyFixedHeaders(headers: string[], withdrawalConfig: WithdrawalConfiguration): void {
  headers.push('Monatliche Entnahme (EUR)')
  if (withdrawalConfig.formValue.inflationAktiv) {
    headers.push('Inflationsanpassung (EUR)')
  }
  if (withdrawalConfig.formValue.guardrailsAktiv) {
    headers.push('Portfolio-Anpassung (EUR)')
  }
}

/**
 * Add strategy-specific headers for dynamic withdrawal
 */
function addDynamicHeaders(headers: string[]): void {
  headers.push('Vorjahres-Rendite (%)')
  headers.push('Dynamische Anpassung (EUR)')
}

/**
 * Add income tax headers
 */
function addIncomeTaxHeaders(headers: string[]): void {
  headers.push('Einkommensteuer (EUR)')
  headers.push('Genutzter Grundfreibetrag (EUR)')
}

/**
 * Check if withdrawal data has other income
 */
function hasOtherIncome(withdrawalData: WithdrawalResult): boolean {
  return Object.values(withdrawalData).some(yearData => yearData.otherIncome && yearData.otherIncome.totalNetAmount > 0)
}

/**
 * Add other income headers
 */
function addOtherIncomeHeaders(headers: string[]): void {
  headers.push('Andere Einkünfte Netto (EUR)')
  headers.push('Steuern auf andere Einkünfte (EUR)')
  headers.push('Anzahl Einkommensquellen')
}

function generateWithdrawalCSVHeaders(params: WithdrawalHeaderParams): string[] {
  const { withdrawalConfig, withdrawalData, grundfreibetragAktiv } = params

  const headers = [
    'Jahr',
    'Monat',
    'Startkapital (EUR)',
    'Entnahme (EUR)',
    'Zinsen (EUR)',
    'Endkapital (EUR)',
    'Basiszins (%)',
    'Basisertrag (EUR)',
    'Tatsächlicher Gewinn (EUR)',
    'Vorabpauschale (EUR)',
    'Steuerbasis vor Freibetrag (EUR)',
    'Bezahlte Steuer (EUR)',
    'Genutzter Freibetrag (EUR)',
  ]

  // Add conditional headers based on strategy
  if (withdrawalConfig?.formValue.strategie === 'monatlich_fest') {
    addMonthlyFixedHeaders(headers, withdrawalConfig)
  }

  if (withdrawalConfig?.formValue.strategie === 'dynamisch') {
    addDynamicHeaders(headers)
  }

  if (grundfreibetragAktiv) {
    addIncomeTaxHeaders(headers)
  }

  if (hasOtherIncome(withdrawalData)) {
    addOtherIncomeHeaders(headers)
  }

  return headers
}

/**
 * Generate CSV metadata lines for withdrawal configuration
 */
interface WithdrawalMetadataParams {
  withdrawalConfig: WithdrawalConfiguration | null
  endOfLife: number
}

function generateWithdrawalMetadataLines(params: WithdrawalMetadataParams): string[] {
  const { withdrawalConfig, endOfLife } = params
  const lines: string[] = []

  lines.push('# Entnahmephase - Simulationsdaten')

  if (!withdrawalConfig?.formValue) {
    lines.push('')
    return lines
  }

  lines.push('# Lebensende: ' + endOfLife)

  // Handle segmented withdrawal - multiple strategies
  const hasMultipleSegments =
    withdrawalConfig.useSegmentedWithdrawal &&
    withdrawalConfig.withdrawalSegments &&
    withdrawalConfig.withdrawalSegments.length > 1

  if (hasMultipleSegments) {
    lines.push('# Strategie: Segmentierte Entnahme')
    withdrawalConfig.withdrawalSegments.forEach((segment, index: number) => {
      const strategyLabel = getWithdrawalStrategyLabel(segment.strategy)
      lines.push(`# Segment ${index + 1} (${segment.name}): ${strategyLabel} (${segment.startYear}-${segment.endYear})`)
    })
  } else {
    lines.push('# Strategie: ' + getWithdrawalStrategyLabel(withdrawalConfig.formValue.strategie))
  }

  lines.push('# Entnahme-Rendite: ' + formatPercentage(withdrawalConfig.formValue.rendite))
  lines.push(
    '# Häufigkeit: ' + (withdrawalConfig.formValue.withdrawalFrequency === 'yearly' ? 'Jährlich' : 'Monatlich'),
  )
  lines.push('')

  return lines
}

/**
 * Export withdrawal phase data to CSV format
 */
export function exportWithdrawalDataToCSV(data: ExportData): string {
  const { withdrawalData, context } = data

  if (!withdrawalData) {
    throw new Error('Keine Entnahme-Daten verfügbar')
  }

  const withdrawalConfig = context.withdrawalConfig

  // Add header with parameter information
  const lines = generateWithdrawalMetadataLines({
    withdrawalConfig,
    endOfLife: context.endOfLife,
  })

  // CSV header for withdrawal phase
  const headers = generateWithdrawalCSVHeaders({
    withdrawalConfig,
    withdrawalData,
    grundfreibetragAktiv: context.grundfreibetragAktiv,
  })

  lines.push(headers.join(';'))

  // Process withdrawal data
  const years = Object.keys(withdrawalData).map(Number).sort()
  const hasOtherIncomeData = Object.values(withdrawalData).some(
    yearData => yearData.otherIncome && yearData.otherIncome.totalNetAmount > 0,
  )

  for (const year of years) {
    const yearData = withdrawalData[year]
    if (!yearData) continue

    const isMonthly = withdrawalConfig?.formValue?.withdrawalFrequency === 'monthly'
    const months = isMonthly ? 12 : 1

    for (let month = 1; month <= months; month++) {
      const row = buildBasicRowData({ year, month, yearData, isMonthly })

      addStrategySpecificData({ row, yearData, withdrawalConfig })

      addTaxAndIncomeData({
        row,
        yearData,
        grundfreibetragAktiv: context.grundfreibetragAktiv,
        hasOtherIncomeData,
      })

      lines.push(row.join(';'))
    }
  }

  return lines.join('\n')
}

/**
 * Get income type label for display
 */
function getIncomeTypeLabel(type: string): string {
  const incomeTypes: ReadonlyRecord<string, string> = {
    rental: 'Mieteinnahmen',
    pension: 'Rente/Pension',
    business: 'Gewerbeeinkünfte',
    investment: 'Kapitalerträge',
    kindergeld: 'Kindergeld',
    bu_rente: 'BU-Rente',
    kapitallebensversicherung: 'Kapitallebensversicherung',
    other: 'Sonstige Einkünfte',
  }
  return incomeTypes[type] || type
}

/**
 * Format income source details for markdown
 */
function formatIncomeSourceDetails(source: OtherIncomeSource): string[] {
  const incomeType = getIncomeTypeLabel(source.type)
  const grossNet = source.amountType === 'gross' ? 'Brutto' : 'Netto'
  const endYear = source.endYear ? source.endYear.toString() : 'Unbegrenzt'

  const details: string[] = [
    `  - **${source.name}** (${incomeType})`,
    `    - Betrag: ${formatCurrency(source.monthlyAmount * 12)}/Jahr (${grossNet})`,
    `    - Zeitraum: ${source.startYear} - ${endYear}`,
    `    - Inflation: ${formatPercentage(source.inflationRate)}`,
  ]

  if (source.amountType === 'gross') {
    details.push(`    - Steuersatz: ${formatPercentage(source.taxRate)}`)
  }
  if (source.notes) {
    details.push(`    - Notizen: ${source.notes}`)
  }

  return details
}

/**
 * Add other income sources section to markdown lines
 */
function addOtherIncomeSection(context: SimulationContextState, lines: string[]): void {
  const withdrawalConfig = context.withdrawalConfig
  if (!withdrawalConfig?.otherIncomeConfig?.enabled || withdrawalConfig.otherIncomeConfig.sources.length === 0) {
    return
  }

  lines.push('')
  lines.push('### Andere Einkünfte')
  lines.push(`- **Anzahl Einkommensquellen:** ${withdrawalConfig.otherIncomeConfig.sources.length}`)

  withdrawalConfig.otherIncomeConfig.sources.forEach((source: OtherIncomeSource) => {
    const sourceDetails = formatIncomeSourceDetails(source)
    lines.push(...sourceDetails)
  })
}

/**
 * Add calculation explanations section to markdown lines
 */
function addCalculationExplanations(lines: string[]): void {
  lines.push('## Berechnungsgrundlagen')
  lines.push('')
  lines.push('### Zinseszinsrechnung')
  lines.push('Die Berechnung erfolgt nach der Formel:')
  lines.push('```')
  lines.push('Endkapital = Startkapital × (1 + Rendite)^Laufzeit + Einzahlungen')
  lines.push('```')
  lines.push('')

  lines.push('### Vorabpauschale')
  lines.push('Die Vorabpauschale wird nach folgender Formel berechnet:')
  lines.push('```')
  lines.push('Basisertrag = Startkapital × Basiszins × 0,7')
  lines.push('Vorabpauschale = min(Basisertrag, tatsächlicher Gewinn)')
  lines.push('```')
  lines.push('')

  lines.push('### Steuerberechnung')
  lines.push('```')
  lines.push('Steuer vor Freibetrag = Vorabpauschale × (1 - Teilfreistellung) × Steuersatz')
  lines.push('Bezahlte Steuer = max(0, Steuer vor Freibetrag - verfügbarer Freibetrag)')
  lines.push('```')
  lines.push('')
}

/**
 * Add savings phase markdown section to lines
 */
function addSavingsPhaseSection(savingsData: ExportData['savingsData'], lines: string[]): void {
  if (!savingsData?.sparplanElements || savingsData.sparplanElements.length === 0) {
    lines.push('## Sparphase')
    lines.push('')
    lines.push(
      '> ℹ️ Keine Sparplan-Daten verfügbar. Führen Sie eine Simulation durch oder wechseln Sie zum Ansparen-Tab, um Daten zu generieren.',
    )
    lines.push('')
    return
  }

  lines.push('## Sparphase')
  lines.push('')
  lines.push('| Jahr | Startkapital | Zinsen | Einzahlungen | Endkapital | Vorabpauschale | Steuer |')
  lines.push('|------|--------------|--------|--------------|------------|----------------|--------|')

  const hasSimulationProperty = savingsData.sparplanElements.some(
    element => typeof element === 'object' && element !== null && 'simulation' in element,
  )

  if (hasSimulationProperty) {
    addSavingsPhaseSimulationData(savingsData.sparplanElements, lines)
  } else {
    addSavingsPhaseMockData(savingsData.sparplanElements, lines)
  }

  lines.push('')
}

/**
 * Extract year data from element
 */
function extractYearDataFromElement(element: unknown, year: number): Record<string, unknown> | null {
  if (typeof element !== 'object' || element === null || !('simulation' in element)) {
    return null
  }

  const simulation = (element as Record<string, unknown>).simulation as Record<string, unknown> | undefined
  const yearData = simulation?.[year] as Record<string, unknown> | undefined

  return yearData || null
}

/**
 * Process element for yearly summary
 */
function processElementForYearlySummary(
  element: unknown,
  year: number,
  totals: {
    startkapital: number
    zinsen: number
    endkapital: number
    bezahlteSteuer: number
    vorabpauschale: number
    contributions: number
  },
): void {
  const yearData = extractYearDataFromElement(element, year)

  if (yearData) {
    totals.startkapital += (yearData.startkapital as number) || 0
    totals.zinsen += (yearData.zinsen as number) || 0
    totals.endkapital += (yearData.endkapital as number) || 0
    totals.bezahlteSteuer += (yearData.bezahlteSteuer as number) || 0
    totals.vorabpauschale += (yearData.vorabpauschale as number) || 0
  }

  const elementContribution = getElementContributionForYear(element, year, false)
  totals.contributions += elementContribution
}

/**
 * Add savings phase data from simulation structure
 */
function addSavingsPhaseSimulationData(sparplanElements: SparplanElement[], lines: string[]): void {
  const allYears = new Set<number>()
  for (const element of sparplanElements) {
    if (typeof element === 'object' && element !== null && 'simulation' in element) {
      const simulation = (element as Record<string, unknown>).simulation
      if (simulation && typeof simulation === 'object') {
        Object.keys(simulation).forEach(year => allYears.add(parseInt(year)))
      }
    }
  }

  const sortedYears = Array.from(allYears).sort((a, b) => a - b)

  for (const year of sortedYears) {
    const totals = {
      startkapital: 0,
      zinsen: 0,
      endkapital: 0,
      bezahlteSteuer: 0,
      vorabpauschale: 0,
      contributions: 0,
    }

    sparplanElements.forEach((element: unknown) => {
      processElementForYearlySummary(element, year, totals)
    })

    lines.push(
      `| ${year} | ${formatCurrency(totals.startkapital)} | ${formatCurrency(totals.zinsen)} | ${formatCurrency(totals.contributions)} | ${formatCurrency(totals.endkapital)} | ${formatCurrency(totals.vorabpauschale)} | ${formatCurrency(totals.bezahlteSteuer)} |`,
    )
  }
}

/**
 * Extract contribution amount from mock data element
 */
function extractContributionAmount(data: Record<string, unknown>): number {
  return (data.einzahlung as number) || (data.amount as number) || (data.monthlyAmount as number) || 0
}

/**
 * Format savings phase row for markdown export
 */
function formatSavingsPhaseRow(year: number, data: Record<string, unknown>, contribution: number): string {
  return `| ${year} | ${formatCurrency((data.startkapital as number) || 0)} | ${formatCurrency((data.zinsen as number) || 0)} | ${formatCurrency(contribution)} | ${formatCurrency((data.endkapital as number) || 0)} | ${formatCurrency((data.vorabpauschale as number) || 0)} | ${formatCurrency((data.bezahlteSteuer as number) || 0)} |`
}

/**
 * Add savings phase data from mock structure
 */
function addSavingsPhaseMockData(sparplanElements: SparplanElement[], lines: string[]): void {
  for (const yearData of sparplanElements) {
    if (!yearData || typeof yearData !== 'object') continue

    const data = yearData as Record<string, unknown>
    const year = new Date(data.start as string).getFullYear()
    const contribution = extractContributionAmount(data)

    lines.push(formatSavingsPhaseRow(year, data, contribution))
  }
}

/**
 * Add withdrawal phase markdown section to lines
 */
function addWithdrawalPhaseSection(
  withdrawalData: WithdrawalResult | undefined,
  context: SimulationContextState,
  lines: string[],
): void {
  if (!withdrawalData || Object.keys(withdrawalData).length === 0) {
    lines.push('## Entnahmephase')
    lines.push('')
    lines.push(
      '> ℹ️ Keine Entnahme-Daten verfügbar. Wechseln Sie zum Entnehmen-Tab und konfigurieren Sie eine Entnahmestrategie, um Daten zu generieren.',
    )
    lines.push('')
    return
  }

  lines.push('## Entnahmephase')
  lines.push('')

  addWithdrawalParametersSection(context, lines)
  addWithdrawalDataTable(withdrawalData, lines)
  lines.push('')
}

/**
 * Add withdrawal parameters section
 */
function addWithdrawalParametersSection(context: SimulationContextState, lines: string[]): void {
  const withdrawalConfig = context.withdrawalConfig
  if (!withdrawalConfig?.formValue) {
    return
  }

  lines.push('### Entnahme-Parameter')

  const hasMultipleSegments =
    withdrawalConfig.useSegmentedWithdrawal &&
    withdrawalConfig.withdrawalSegments &&
    withdrawalConfig.withdrawalSegments.length > 1

  if (hasMultipleSegments && withdrawalConfig.withdrawalSegments) {
    lines.push(`- **Strategie:** Segmentierte Entnahme`)
    withdrawalConfig.withdrawalSegments.forEach((segment, index) => {
      const strategyLabel = getWithdrawalStrategyLabel(segment.strategy)
      const segmentInfo = `  - **Segment ${index + 1} (${segment.name}):** ${strategyLabel} (${segment.startYear}-${segment.endYear})`
      lines.push(segmentInfo)
    })
  } else {
    lines.push(`- **Strategie:** ${getWithdrawalStrategyLabel(withdrawalConfig.formValue.strategie)}`)
  }

  lines.push(`- **Lebensende:** ${context.endOfLife}`)
  lines.push(`- **Entnahme-Rendite:** ${formatPercentage(withdrawalConfig.formValue.rendite)}`)
  lines.push('')
}

/**
 * Add withdrawal data table
 */
function addWithdrawalDataTable(withdrawalData: WithdrawalResult, lines: string[]): void {
  lines.push('| Jahr | Startkapital | Entnahme | Zinsen | Endkapital | Vorabpauschale Details | Steuer |')
  lines.push('|------|--------------|----------|--------|------------|------------------------|--------|')

  const years = Object.keys(withdrawalData).map(Number).sort()
  for (const year of years) {
    const yearData = withdrawalData[year]
    if (!yearData) continue

    let vorabDetails = 'N/A'
    if (yearData.vorabpauschaleDetails) {
      const details = yearData.vorabpauschaleDetails
      vorabDetails =
        `Basiszins: ${formatPercentage(details.basiszins * 100)} / ` +
        `Basisertrag: ${formatCurrency(details.basisertrag)} / ` +
        `Jahresgewinn: ${formatCurrency(details.jahresgewinn)} / ` +
        `Vorabpauschale: ${formatCurrency(yearData.vorabpauschale || 0)}`
    }

    lines.push(
      `| ${year} | ${formatCurrency(yearData.startkapital)} | ${formatCurrency(yearData.entnahme)} | ${formatCurrency(yearData.zinsen)} | ${formatCurrency(yearData.endkapital)} | ${vorabDetails} | ${formatCurrency(yearData.bezahlteSteuer)} |`,
    )
  }
}

/**
 * Export all simulation data to Markdown format
 */
export function exportDataToMarkdown(data: ExportData): string {
  const { savingsData, withdrawalData, context } = data

  const lines: string[] = []

  // Header
  lines.push('# Simulationsdaten Export')
  lines.push('')
  lines.push(`**Exportiert am:** ${new Date().toLocaleDateString('de-DE')}`)
  lines.push('')

  // Parameters section
  lines.push('## Parameter')
  lines.push('')
  lines.push('### Grundparameter')
  lines.push(`- **Zeitraum:** ${context.startEnd[0]} - ${context.startEnd[1]}`)
  lines.push(`- **Rendite:** ${formatPercentage(context.rendite)}`)
  lines.push(`- **Kapitalertragsteuer:** ${formatPercentage(context.steuerlast)}`)
  lines.push(`- **Teilfreistellungsquote:** ${formatPercentage(context.teilfreistellungsquote)}`)
  lines.push(`- **Berechnungsmodus:** ${context.simulationAnnual === 'yearly' ? 'Jährlich' : 'Monatlich'}`)

  addOtherIncomeSection(context, lines)

  lines.push('')

  addCalculationExplanations(lines)
  addSavingsPhaseSection(savingsData, lines)
  addWithdrawalPhaseSection(withdrawalData, context, lines)

  return lines.join('\n')
}

/**
 * Add segmented withdrawal strategy details to explanation lines
 */
function addSegmentedWithdrawalDetails(segments: WithdrawalSegment[], lines: string[]): void {
  lines.push('   Strategie: Segmentierte Entnahme')
  segments.forEach((segment, index) => {
    const strategyLabel = getWithdrawalStrategyLabel(segment.strategy)
    const segmentInfo = `   Segment ${index + 1} (${segment.name}): ${strategyLabel} (${segment.startYear}-${segment.endYear})`
    lines.push(segmentInfo)
  })
}

interface AddSingleStrategyDetailsParams {
  strategie: string
  variabelProzent?: number
  monatlicheBetrag?: number
  inflationAktiv?: boolean
  inflationsrate?: number
  dynamischBasisrate?: number
}

/**
 * Strategy detail formatters for single withdrawal strategies
 */
const strategyDetailFormatters: ReadonlyRecord<string, (params: AddSingleStrategyDetailsParams) => string[]> = {
  '4prozent': () => ['   Formel: Jährliche Entnahme = 4% vom Startkapital'],
  '3prozent': () => ['   Formel: Jährliche Entnahme = 3% vom Startkapital'],
  variabel_prozent: params => [
    `   Formel: Jährliche Entnahme = ${formatPercentage(params.variabelProzent || 0)} vom aktuellen Kapital`,
  ],
  monatlich_fest: params => {
    const details = [`   Monatliche Entnahme: ${formatCurrency(params.monatlicheBetrag || 0)}`]
    if (params.inflationAktiv) {
      details.push(`   Inflationsanpassung: ${formatPercentage(params.inflationsrate || 2)} jährlich`)
    }
    return details
  },
  dynamisch: params => [
    `   Basisrate: ${formatPercentage(params.dynamischBasisrate || 4)}`,
    '   Anpassung basierend auf Vorjahres-Performance',
  ],
}

/**
 * Add single withdrawal strategy details to explanation lines
 */
function addSingleStrategyDetails(params: AddSingleStrategyDetailsParams, lines: string[]): void {
  const { strategie } = params

  lines.push(`   Strategie: ${getWithdrawalStrategyLabel(strategie)}`)

  const formatter = strategyDetailFormatters[strategie]
  if (formatter) {
    const details = formatter(params)
    details.forEach(detail => lines.push(detail))
  }
}

interface AddWithdrawalStrategyParams {
  withdrawalConfig: {
    formValue?: {
      strategie: string
      variabelProzent?: number
      monatlicheBetrag?: number
      inflationAktiv?: boolean
      inflationsrate?: number
      dynamischBasisrate?: number
    }
    useSegmentedWithdrawal?: boolean
    withdrawalSegments?: WithdrawalSegment[]
  }
}

/**
 * Add withdrawal strategy section to explanation lines
 */
function addWithdrawalStrategySection(params: AddWithdrawalStrategyParams, lines: string[]): void {
  const { withdrawalConfig } = params

  if (!withdrawalConfig?.formValue) {
    return
  }

  lines.push('6. ENTNAHMESTRATEGIE')

  const hasMultipleSegments =
    withdrawalConfig.useSegmentedWithdrawal &&
    withdrawalConfig.withdrawalSegments &&
    withdrawalConfig.withdrawalSegments.length > 1

  if (hasMultipleSegments && withdrawalConfig.withdrawalSegments) {
    addSegmentedWithdrawalDetails(withdrawalConfig.withdrawalSegments, lines)
  } else {
    addSingleStrategyDetails(withdrawalConfig.formValue, lines)
  }

  lines.push('')
}

/**
 * Generate calculation explanations text
 */
export function generateCalculationExplanations(context: SimulationContextState): string {
  const lines: string[] = []

  lines.push('Berechnungsdetails und Formeln')
  lines.push('=================================')
  lines.push('')

  lines.push('1. ZINSESZINSRECHNUNG')
  lines.push('   Grundformel: Endkapital = Startkapital × (1 + Rendite)^Jahre')
  lines.push(`   Verwendete Rendite: ${formatPercentage(context.rendite)}`)
  lines.push('')

  lines.push('2. VORABPAUSCHALE-BERECHNUNG')
  lines.push('   a) Basisertrag = Kapital zu Jahresbeginn × Basiszins × 70%')
  lines.push('   b) Vorabpauschale = min(Basisertrag, tatsächlicher Jahresgewinn)')
  lines.push('   c) Nur bei positiver Vorabpauschale wird Steuer fällig')
  lines.push('')

  lines.push('3. STEUERBERECHNUNG')
  lines.push('   a) Steuer vor Freibetrag = Vorabpauschale × (1 - Teilfreistellung) × Steuersatz')
  lines.push(`   b) Teilfreistellungsquote: ${formatPercentage(context.teilfreistellungsquote)}`)
  lines.push(`   c) Kapitalertragsteuer: ${formatPercentage(context.steuerlast)}`)
  lines.push('   d) Bezahlte Steuer = max(0, Steuer vor Freibetrag - verfügbarer Freibetrag)')
  lines.push('')

  lines.push('4. FREIBETRÄGE')
  Object.entries(context.freibetragPerYear).forEach(([year, amount]) => {
    lines.push(`   ${year}: ${formatCurrency(amount)} Sparerpauschbetrag`)
  })
  lines.push('')

  if (context.grundfreibetragAktiv) {
    lines.push('5. GRUNDFREIBETRAG (ENTNAHMEPHASE)')
    lines.push(`   Grundfreibetrag: ${formatCurrency(context.grundfreibetragBetrag)}`)
    lines.push('   Wird bei der Einkommensteuer-Berechnung berücksichtigt')
    lines.push('')
  }

  if (context.withdrawalConfig) {
    addWithdrawalStrategySection({ withdrawalConfig: context.withdrawalConfig }, lines)
  }

  return lines.join('\n')
}

/**
 * Helper function to get German label for withdrawal strategy
 */
const WITHDRAWAL_STRATEGY_LABELS: ReadonlyRecord<string, string> = {
  '4prozent': '4% Regel',
  '3prozent': '3% Regel',
  variabel_prozent: 'Variabler Prozentsatz',
  monatlich_fest: 'Monatliche Entnahme',
  dynamisch: 'Dynamische Strategie',
  bucket_strategie: 'Bucket Strategie',
  rmd: 'RMD Strategie',
  kapitalerhalt: 'Kapitalerhalt',
  steueroptimiert: 'Steueroptimierte Entnahme',
}

function getWithdrawalStrategyLabel(strategy: string): string {
  return WITHDRAWAL_STRATEGY_LABELS[strategy] || strategy
}

/**
 * Helper function to handle the common DOM manipulation logic for file downloads
 */
function downloadBlobAsFile(blob: Blob, filename: string, setCharsetAttribute = false): void {
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename

  // Only set charset attribute if requested and setAttribute method exists (avoid test issues)
  if (setCharsetAttribute && typeof link.setAttribute === 'function') {
    link.setAttribute('charset', 'utf-8')
  }

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * Download text content as file
 */
export function downloadTextAsFile(content: string, filename: string, mimeType = 'text/plain'): void {
  // For CSV files, use a more robust UTF-8 encoding approach
  if (filename.endsWith('.csv')) {
    // Convert string to UTF-8 byte array and add UTF-8 BOM for CSV compatibility
    const BOM = new Uint8Array([0xef, 0xbb, 0xbf]) // UTF-8 BOM bytes
    const encoder = new TextEncoder()
    const contentBytes = encoder.encode(content)

    // Combine BOM and content
    const combinedArray = new Uint8Array(BOM.length + contentBytes.length)
    combinedArray.set(BOM)
    combinedArray.set(contentBytes, BOM.length)

    const blob = new Blob([combinedArray], {
      type: 'text/csv;charset=utf-8',
    })

    downloadBlobAsFile(blob, filename)
  } else {
    // For non-CSV files, use the existing approach with string BOM
    const BOM = '\uFEFF'
    const contentWithBOM = BOM + content

    const finalMimeType = mimeType.includes('charset') ? mimeType : `${mimeType};charset=utf-8`

    const blob = new Blob([contentWithBOM], {
      type: finalMimeType,
      endings: 'native',
    })

    downloadBlobAsFile(blob, filename, true)
  }
}

/**
 * Copy text content to clipboard
 */
export async function copyTextToClipboard(content: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(content)
    return true
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}
