// Helper functions to create calculation explanations for different simulation data

import { formatCurrency } from '../utils/currency'
import { STEP_COLORS } from '../utils/calculation-colors'

export interface CalculationStep {
  readonly title: string
  readonly description: string
  readonly calculation: string
  readonly result: string
  readonly backgroundColor: string
  readonly borderColor: string
}

export interface CalculationExplanation {
  readonly title: string
  readonly introduction: string
  readonly steps: readonly CalculationStep[]
  readonly finalResult: {
    readonly title: string
    readonly values: ReadonlyArray<{ readonly label: string; readonly value: string }>
  }
}

/**
 * Creates a step-by-step explanation of how interest/returns are calculated.
 * Used in the savings phase to show how capital grows through investment returns.
 *
 * @param startkapital - The starting capital at the beginning of the period
 * @param zinsen - The calculated interest/return amount for the period
 * @param rendite - The annual return rate as a percentage (e.g., 5 for 5%)
 * @param _year - The year being calculated (currently unused but kept for API consistency)
 * @returns A complete calculation explanation with steps and final results
 */
export function createInterestExplanation(
  startkapital: number,
  zinsen: number,
  rendite: number,
  _year: number,
): CalculationExplanation {
  return {
    title: '📈 Zinsen-Berechnung Schritt für Schritt',
    introduction:
      'Die Zinsen werden basierend auf dem Startkapital und der erwarteten Rendite berechnet. Diese Berechnung zeigt, wie sich Ihr Kapital durch Zinsen und Zinseszinsen vermehrt.',
    steps: [
      {
        title: 'Schritt 1: Startkapital ermitteln',
        description: 'Das verfügbare Kapital zu Beginn des Jahres.',
        calculation: `Startkapital = ${formatCurrency(startkapital)}`,
        result: formatCurrency(startkapital),
        ...STEP_COLORS.ORANGE,
      },
      {
        title: 'Schritt 2: Rendite anwenden',
        description: `Die erwartete jährliche Rendite von ${rendite}% wird auf das Startkapital angewendet.`,
        calculation: `Zinsen = Startkapital × Rendite<br/>${formatCurrency(startkapital)} × ${rendite}%`,
        result: formatCurrency(zinsen),
        ...STEP_COLORS.GREEN,
      },
    ],
    finalResult: {
      title: 'Endergebnis',
      values: [
        { label: 'Startkapital', value: formatCurrency(startkapital) },
        { label: 'Zinsen/Wertzuwachs', value: formatCurrency(zinsen) },
        { label: 'Rendite', value: `${rendite}%` },
      ],
    },
  }
}

/**
 * Creates a detailed explanation of German tax calculations on investment returns.
 * Includes Vorabpauschale (advance lump-sum taxation), partial exemption
 * (Teilfreistellungsquote), and tax allowance (Sparerpauschbetrag).
 *
 * @param bezahlteSteuer - The actual tax amount paid after allowances
 * @param vorabpauschaleAmount - The advance lump-sum taxable amount
 * @param steuersatz - The tax rate as a decimal (e.g., 0.26375 for 26.375%)
 * @param teilfreistellungsquote - The partial exemption rate as a decimal (e.g., 0.3 for 30%)
 * @param freibetrag - The annual tax allowance amount (Sparerpauschbetrag)
 * @param _year - The year being calculated (currently unused but kept for API consistency)
 * @returns A complete calculation explanation showing tax computation steps
 */
export function createTaxExplanation(
  bezahlteSteuer: number,
  vorabpauschaleAmount: number,
  steuersatz: number,
  teilfreistellungsquote: number,
  freibetrag: number,
  _year: number,
): CalculationExplanation {
  const steuerVorFreibetrag = vorabpauschaleAmount * steuersatz * (1 - teilfreistellungsquote)

  return {
    title: '💸 Steuer-Berechnung Schritt für Schritt',
    introduction:
      'Die Steuerberechnung erfolgt basierend auf der Vorabpauschale, dem Steuersatz und dem verfügbaren Freibetrag. Für thesaurierende Fonds wird jährlich die Vorabpauschale besteuert.',
    steps: [
      {
        title: 'Schritt 1: Vorabpauschale ermitteln',
        description: 'Die Vorabpauschale ist der Betrag, der für die Besteuerung relevant ist.',
        calculation: `Vorabpauschale = ${formatCurrency(vorabpauschaleAmount)}`,
        result: formatCurrency(vorabpauschaleAmount),
        ...STEP_COLORS.ORANGE,
      },
      {
        title: 'Schritt 2: Steuer vor Sparerpauschbetrag berechnen',
        description: `Steuer wird mit ${(steuersatz * 100).toFixed(1)}% Steuersatz berechnet, reduziert um ${teilfreistellungsquote * 100}% Teilfreistellung.`,
        calculation: `Steuer = Vorabpauschale × ${(steuersatz * 100).toFixed(1)}% × (1 - ${teilfreistellungsquote * 100}%)<br/>${formatCurrency(vorabpauschaleAmount)} × ${(steuersatz * 100).toFixed(1)}% × ${(1 - teilfreistellungsquote) * 100}%`,
        result: formatCurrency(steuerVorFreibetrag),
        ...STEP_COLORS.GREEN,
      },
      {
        title: 'Schritt 3: Sparerpauschbetrag anwenden',
        description: `Der verfügbare Sparerpauschbetrag von ${formatCurrency(freibetrag)} reduziert die zu zahlende Steuer.`,
        calculation: `Bezahlte Steuer = max(0, Steuer vor Sparerpauschbetrag - Sparerpauschbetrag)<br/>max(0, ${formatCurrency(steuerVorFreibetrag)} - ${formatCurrency(freibetrag)})`,
        result: formatCurrency(bezahlteSteuer),
        ...STEP_COLORS.BLUE,
      },
    ],
    finalResult: {
      title: 'Endergebnis',
      values: [
        { label: 'Vorabpauschale', value: formatCurrency(vorabpauschaleAmount) },
        { label: 'Steuer vor Sparerpauschbetrag', value: formatCurrency(steuerVorFreibetrag) },
        { label: 'Genutzter Sparerpauschbetrag', value: formatCurrency(Math.min(freibetrag, steuerVorFreibetrag)) },
        { label: 'Bezahlte Steuer', value: formatCurrency(bezahlteSteuer) },
      ],
    },
  }
}

// Final capital calculation explanation (for savings phase)
function createEndkapitalSteps(
  startkapital: number,
  einzahlung: number,
  zinsen: number,
  bezahlteSteuer: number,
  endkapital: number,
) {
  return [
    {
      title: 'Schritt 1: Startkapital zu Jahresbeginn',
      description: 'Das verfügbare Kapital zu Beginn des Jahres (Endkapital des Vorjahres).',
      calculation: `Startkapital = ${formatCurrency(startkapital)}`,
      result: formatCurrency(startkapital),
      ...STEP_COLORS.ORANGE,
    },
    {
      title: 'Schritt 2: Neue Einzahlungen addieren',
      description: 'Ihre Einzahlungen/Sparraten für das Jahr werden zum Startkapital hinzugefügt.',
      calculation: `Kapital nach Einzahlungen = Startkapital + Einzahlungen<br/>${formatCurrency(startkapital)} + ${formatCurrency(einzahlung)}`,
      result: formatCurrency(startkapital + einzahlung),
      ...STEP_COLORS.GREEN,
    },
    {
      title: 'Schritt 3: Zinserträge/Wertzuwachs berücksichtigen',
      description:
        'Die erwirtschafteten Zinsen und Wertsteigerungen werden hinzugefügt (können auch negativ sein bei Verlusten).',
      calculation: `Kapital nach Zinsen = Kapital nach Einzahlungen + Zinsen<br/>${formatCurrency(startkapital + einzahlung)} + ${formatCurrency(zinsen)}`,
      result: formatCurrency(startkapital + einzahlung + zinsen),
      ...STEP_COLORS.BLUE,
    },
    {
      title: 'Schritt 4: Steuern abziehen',
      description: 'Die für das Jahr anfallenden Steuern (z.B. Vorabpauschale) werden vom Kapital abgezogen.',
      calculation: `Endkapital = Kapital nach Zinsen - Bezahlte Steuern<br/>${formatCurrency(startkapital + einzahlung + zinsen)} - ${formatCurrency(bezahlteSteuer)}`,
      result: formatCurrency(endkapital),
      ...STEP_COLORS.PURPLE,
    },
  ]
}

/**
 * Creates a comprehensive explanation of how the ending capital is calculated.
 * Shows the complete flow from starting capital through contributions, returns,
 * and taxes to arrive at the final capital amount.
 *
 * @param endkapital - The final capital amount at year end
 * @param startkapital - The starting capital at year beginning
 * @param einzahlung - Total contributions/deposits made during the year
 * @param zinsen - Interest/returns earned during the year
 * @param bezahlteSteuer - Taxes paid during the year
 * @param year - The year being calculated
 * @returns A complete calculation explanation showing the capital development
 */
export function createEndkapitalExplanation(
  endkapital: number,
  startkapital: number,
  einzahlung: number,
  zinsen: number,
  bezahlteSteuer: number,
  year: number,
): CalculationExplanation {
  return {
    title: '🎯 Endkapital-Berechnung Schritt für Schritt',
    introduction: `Die Endkapital-Berechnung für das Jahr ${year} zeigt, wie sich Ihr Portfolio durch Einzahlungen, Zinserträge und Steuern entwickelt. Das Endkapital ist das verfügbare Kapital am Ende des Jahres.`,
    steps: createEndkapitalSteps(startkapital, einzahlung, zinsen, bezahlteSteuer, endkapital),
    finalResult: {
      title: 'Endergebnis',
      values: [
        { label: 'Startkapital', value: formatCurrency(startkapital) },
        { label: 'Einzahlungen', value: formatCurrency(einzahlung) },
        { label: 'Zinsen/Wertzuwachs', value: formatCurrency(zinsen) },
        { label: 'Bezahlte Steuern', value: formatCurrency(bezahlteSteuer) },
        { label: 'Endkapital', value: formatCurrency(endkapital) },
      ],
    },
  }
}

/**
 * Creates an explanation of inflation adjustment calculations for withdrawal amounts.
 * Shows how withdrawal amounts are adjusted over time to maintain purchasing power.
 *
 * @param baseAmount - The original withdrawal amount at the start of retirement
 * @param inflationRate - The annual inflation rate as a decimal (e.g., 0.02 for 2%)
 * @param yearsPassed - Number of years since retirement started
 * @param inflationAnpassung - The total inflation adjustment amount
 * @returns A complete calculation explanation showing inflation impact
 */
export function createInflationExplanation(
  baseAmount: number,
  inflationRate: number,
  yearsPassed: number,
  inflationAnpassung: number,
): CalculationExplanation {
  const totalInflationMultiplier = Math.pow(1 + inflationRate, yearsPassed)
  const adjustedAmount = baseAmount * totalInflationMultiplier

  return {
    title: '📈 Inflation-Anpassung Schritt für Schritt',
    introduction:
      'Die Inflation-Anpassung sorgt dafür, dass die Kaufkraft der Entnahme über die Jahre erhalten bleibt. Der Entnahmebetrag wird jährlich um die Inflationsrate erhöht.',
    steps: [
      {
        title: 'Schritt 1: Basis-Entnahmebetrag',
        description: 'Der ursprüngliche Entnahmebetrag zu Beginn der Entnahme-Phase.',
        calculation: `Basis-Betrag = ${formatCurrency(baseAmount)}`,
        result: formatCurrency(baseAmount),
        ...STEP_COLORS.ORANGE,
      },
      {
        title: 'Schritt 2: Inflationsrate anwenden',
        description: `Nach ${yearsPassed} Jahr${yearsPassed === 1 ? '' : 'en'} mit ${(inflationRate * 100).toFixed(1)}% jährlicher Inflation.`,
        calculation: `Angepasster Betrag = Basis-Betrag × (1 + Inflation)^Jahre<br/>${formatCurrency(baseAmount)} × (1 + ${(inflationRate * 100).toFixed(1)}%)^${yearsPassed}<br/>${formatCurrency(baseAmount)} × ${totalInflationMultiplier.toFixed(4)}`,
        result: formatCurrency(adjustedAmount),
        ...STEP_COLORS.GREEN,
      },
      {
        title: 'Schritt 3: Inflations-Anpassung berechnen',
        description: 'Die zusätzliche Summe durch die Inflations-Anpassung.',
        calculation: `Inflations-Anpassung = Angepasster Betrag - Basis-Betrag<br/>${formatCurrency(adjustedAmount)} - ${formatCurrency(baseAmount)}`,
        result: formatCurrency(inflationAnpassung),
        ...STEP_COLORS.BLUE,
      },
    ],
    finalResult: {
      title: 'Endergebnis',
      values: [
        { label: 'Basis-Entnahmebetrag', value: formatCurrency(baseAmount) },
        { label: 'Inflationsrate', value: `${(inflationRate * 100).toFixed(1)}% p.a.` },
        { label: 'Jahre vergangen', value: yearsPassed.toString() },
        { label: 'Inflations-Anpassung', value: formatCurrency(inflationAnpassung) },
        { label: 'Angepasster Gesamtbetrag', value: formatCurrency(adjustedAmount) },
      ],
    },
  }
}

// Income tax calculation explanation (for withdrawal phase)
export function createIncomeTaxExplanation(
  entnahme: number,
  grundfreibetrag: number,
  steuersatz: number,
  einkommensteuer: number,
  genutzterGrundfreibetrag: number,
): CalculationExplanation {
  const steuerpflichtigesEinkommen = Math.max(0, entnahme - grundfreibetrag)

  return {
    title: '🏛️ Einkommensteuer-Berechnung Schritt für Schritt',
    introduction:
      'Die Einkommensteuer wird auf die Entnahme angewendet, wobei der Grundfreibetrag steuerfrei bleibt. Dies ist relevant für Rentner ohne weiteres Einkommen.',
    steps: [
      {
        title: 'Schritt 1: Entnahmebetrag ermitteln',
        description: 'Die jährliche Entnahme aus dem Portfolio.',
        calculation: `Jährliche Entnahme = ${formatCurrency(entnahme)}`,
        result: formatCurrency(entnahme),
        ...STEP_COLORS.ORANGE,
      },
      {
        title: 'Schritt 2: Grundfreibetrag anwenden',
        description: `Der Grundfreibetrag von ${formatCurrency(grundfreibetrag)} ist steuerfrei.`,
        calculation: `Steuerpflichtiges Einkommen = max(0, Entnahme - Grundfreibetrag)<br/>max(0, ${formatCurrency(entnahme)} - ${formatCurrency(grundfreibetrag)})`,
        result: formatCurrency(steuerpflichtigesEinkommen),
        ...STEP_COLORS.GREEN,
      },
      {
        title: 'Schritt 3: Einkommensteuer berechnen',
        description: `Steuersatz von ${steuersatz}% auf das steuerpflichtige Einkommen.`,
        calculation: `Einkommensteuer = Steuerpflichtiges Einkommen × ${steuersatz}%<br/>${formatCurrency(steuerpflichtigesEinkommen)} × ${steuersatz}%`,
        result: formatCurrency(einkommensteuer),
        ...STEP_COLORS.BLUE,
      },
    ],
    finalResult: {
      title: 'Endergebnis',
      values: [
        { label: 'Jährliche Entnahme', value: formatCurrency(entnahme) },
        { label: 'Grundfreibetrag verfügbar', value: formatCurrency(grundfreibetrag) },
        { label: 'Genutzter Grundfreibetrag', value: formatCurrency(genutzterGrundfreibetrag) },
        { label: 'Steuerpflichtiges Einkommen', value: formatCurrency(steuerpflichtigesEinkommen) },
        { label: 'Einkommensteuer', value: formatCurrency(einkommensteuer) },
      ],
    },
  }
}

// Withdrawal interest calculation explanation
export function createWithdrawalInterestExplanation(
  startkapital: number,
  zinsen: number,
  rendite: number,
  _year: number,
): CalculationExplanation {
  return {
    title: '📈 Zinsen-Berechnung (Entnahme-Phase) Schritt für Schritt',
    introduction:
      'Auch während der Entnahme-Phase erwirtschaftet das verbleibende Kapital weiterhin Zinsen. Diese Zinsen helfen dabei, das Portfolio länger aufrechtzuerhalten.',
    steps: [
      {
        title: 'Schritt 1: Verfügbares Kapital',
        description: 'Das Kapital, das zu Beginn des Jahres zur Verfügung steht.',
        calculation: `Startkapital = ${formatCurrency(startkapital)}`,
        result: formatCurrency(startkapital),
        ...STEP_COLORS.ORANGE,
      },
      {
        title: 'Schritt 2: Rendite erwirtschaften',
        description: `Das Kapital erwirtschaftet eine Rendite von ${rendite}% über das Jahr.`,
        calculation: `Zinsen = Startkapital × Rendite<br/>${formatCurrency(startkapital)} × ${rendite}%`,
        result: formatCurrency(zinsen),
        ...STEP_COLORS.GREEN,
      },
    ],
    finalResult: {
      title: 'Endergebnis',
      values: [
        { label: 'Startkapital', value: formatCurrency(startkapital) },
        { label: 'Erwirtschaftete Zinsen', value: formatCurrency(zinsen) },
        { label: 'Rendite', value: `${rendite}%` },
      ],
    },
  }
}

// Helper types for taxable income calculation
interface TaxableIncomeParams {
  entnahme: number
  grundfreibetrag: number
  statutoryPensionTaxableAmount?: number
  otherIncomeGrossAmount?: number
  healthCareInsuranceAnnual?: number
}

// Calculate total taxable income from all sources
function calculateTotalTaxableIncome(params: TaxableIncomeParams): number {
  let total = params.entnahme

  if (params.statutoryPensionTaxableAmount) {
    total += params.statutoryPensionTaxableAmount
  }

  if (params.otherIncomeGrossAmount) {
    total += params.otherIncomeGrossAmount
  }

  if (params.healthCareInsuranceAnnual && params.healthCareInsuranceAnnual > 0) {
    total -= params.healthCareInsuranceAnnual
  }

  return total
}

// Add statutory pension step to calculation
function addStatutoryPensionStep(steps: CalculationStep[], amount: number): void {
  steps.push({
    title: 'Schritt 2: Gesetzliche Rente (steuerpflichtiger Anteil)',
    description: 'Der steuerpflichtige Anteil der gesetzlichen Rente wird zu den Einkünften hinzugefügt.',
    calculation: `Steuerpflichtiger Rentenanteil = ${formatCurrency(amount)}`,
    result: formatCurrency(amount),
    ...STEP_COLORS.BLUE_VARIANT,
  })
}

// Add other income step to calculation
function addOtherIncomeStep(steps: CalculationStep[], amount: number): void {
  steps.push({
    title: `Schritt ${steps.length + 1}: Andere Einkünfte`,
    description: 'Weitere Einkünfte (Mieteinnahmen, Nebeneinkünfte, etc.) werden zu den Einkünften hinzugefügt.',
    calculation: `Andere Einkünfte = ${formatCurrency(amount)}`,
    result: formatCurrency(amount),
    ...STEP_COLORS.PURPLE_VARIANT,
  })
}

// Add health care insurance deduction step
function addHealthCareInsuranceStep(steps: CalculationStep[], amount: number): void {
  steps.push({
    title: `Schritt ${steps.length + 1}: Krankenversicherung abziehen`,
    description:
      'Kranken- und Pflegeversicherungsbeiträge sind in Deutschland steuerlich absetzbar und werden von den ' +
      'Brutto-Einkünften abgezogen.',
    calculation: `Krankenversicherungsbeiträge = ${formatCurrency(amount)} ` + '(steuerlich absetzbar)',
    result: `-${formatCurrency(amount)}`,
    ...STEP_COLORS.LIGHT_BLUE,
  })
}

// Build calculation text for total income
interface IncomeComponent {
  condition: boolean
  labelText: string
  amount: number
  operator: '+' | '-'
}

function getIncomeComponents(params: TaxableIncomeParams): IncomeComponent[] {
  return [
    {
      condition: !!(params.statutoryPensionTaxableAmount && params.statutoryPensionTaxableAmount > 0),
      labelText: 'Gesetzliche Rente',
      amount: params.statutoryPensionTaxableAmount || 0,
      operator: '+' as const,
    },
    {
      condition: !!(params.otherIncomeGrossAmount && params.otherIncomeGrossAmount > 0),
      labelText: 'Andere Einkünfte',
      amount: params.otherIncomeGrossAmount || 0,
      operator: '+' as const,
    },
    {
      condition: !!(params.healthCareInsuranceAnnual && params.healthCareInsuranceAnnual > 0),
      labelText: 'Krankenversicherung',
      amount: params.healthCareInsuranceAnnual || 0,
      operator: '-' as const,
    },
  ].filter(component => component.condition)
}

function buildTotalIncomeCalculationText(params: TaxableIncomeParams, totalIncome: number): string {
  const components = getIncomeComponents(params)

  let text = `Gesamte Einkünfte = Portfolio-Entnahme`
  components.forEach(comp => {
    text += ` ${comp.operator} ${comp.labelText}`
  })

  text += `<br/>${formatCurrency(params.entnahme)}`
  components.forEach(comp => {
    text += ` ${comp.operator} ${formatCurrency(comp.amount)}`
  })

  text += ` = ${formatCurrency(totalIncome)}`
  return text
}

// Add total income step if needed
function addTotalIncomeStepIfNeeded(steps: CalculationStep[], params: TaxableIncomeParams, totalIncome: number): void {
  const hasMultipleSources =
    params.statutoryPensionTaxableAmount ||
    params.otherIncomeGrossAmount ||
    (params.healthCareInsuranceAnnual && params.healthCareInsuranceAnnual > 0)

  if (!hasMultipleSources) {
    return
  }

  const calculationText = buildTotalIncomeCalculationText(params, totalIncome)

  steps.push({
    title: `Schritt ${steps.length + 1}: Gesamte Einkünfte`,
    description: 'Alle Einkunftsarten werden zusammengefasst und steuerlich absetzbare Beiträge abgezogen.',
    calculation: calculationText,
    result: formatCurrency(totalIncome),
    ...STEP_COLORS.YELLOW,
  })
}

// Build final result values array
function buildTaxableIncomeFinalValues(
  params: TaxableIncomeParams,
  totalIncome: number,
  steuerpflichtig: number,
): Array<{ label: string; value: string }> {
  const values = [{ label: 'Portfolio-Entnahme', value: formatCurrency(params.entnahme) }]

  if (params.statutoryPensionTaxableAmount && params.statutoryPensionTaxableAmount > 0) {
    values.push({
      label: 'Gesetzliche Rente (steuerpflichtig)',
      value: formatCurrency(params.statutoryPensionTaxableAmount),
    })
  }

  if (params.otherIncomeGrossAmount && params.otherIncomeGrossAmount > 0) {
    values.push({ label: 'Andere Einkünfte', value: formatCurrency(params.otherIncomeGrossAmount) })
  }

  if (params.healthCareInsuranceAnnual && params.healthCareInsuranceAnnual > 0) {
    values.push({
      label: 'Krankenversicherung (absetzbar)',
      value: `-${formatCurrency(params.healthCareInsuranceAnnual)}`,
    })
  }

  values.push(
    { label: 'Gesamte Einkünfte', value: formatCurrency(totalIncome) },
    { label: 'Grundfreibetrag', value: formatCurrency(params.grundfreibetrag) },
    { label: 'Zu versteuerndes Einkommen', value: formatCurrency(steuerpflichtig) },
  )

  return values
}

function buildTaxableIncomeSteps(
  params: TaxableIncomeParams,
  totalTaxableIncome: number,
  steuerpflichtigesEinkommen: number,
): CalculationStep[] {
  const steps: CalculationStep[] = [
    {
      title: 'Schritt 1: Portfolio-Entnahme',
      description: 'Die Entnahme aus dem Portfolio vor Steuern.',
      calculation: `Portfolio-Entnahme = ${formatCurrency(params.entnahme)}`,
      result: formatCurrency(params.entnahme),
      ...STEP_COLORS.ORANGE,
    },
  ]

  if (params.statutoryPensionTaxableAmount && params.statutoryPensionTaxableAmount > 0) {
    addStatutoryPensionStep(steps, params.statutoryPensionTaxableAmount)
  }

  if (params.otherIncomeGrossAmount && params.otherIncomeGrossAmount > 0) {
    addOtherIncomeStep(steps, params.otherIncomeGrossAmount)
  }

  if (params.healthCareInsuranceAnnual && params.healthCareInsuranceAnnual > 0) {
    addHealthCareInsuranceStep(steps, params.healthCareInsuranceAnnual)
  }

  addTotalIncomeStepIfNeeded(steps, params, totalTaxableIncome)

  steps.push({
    title: `Schritt ${steps.length + 1}: Grundfreibetrag abziehen`,
    description: `Der steuerfreie Grundfreibetrag von ${formatCurrency(params.grundfreibetrag)} wird von den gesamten Einkünften abgezogen.`,
    calculation: `Zu versteuerndes Einkommen = max(0, Gesamte Einkünfte - Grundfreibetrag)<br/>max(0, ${formatCurrency(totalTaxableIncome)} - ${formatCurrency(params.grundfreibetrag)})`,
    result: formatCurrency(steuerpflichtigesEinkommen),
    ...STEP_COLORS.GREEN,
  })

  return steps
}

// Taxable income calculation explanation
export function createTaxableIncomeExplanation(
  entnahme: number,
  grundfreibetrag: number,
  statutoryPensionTaxableAmount?: number,
  otherIncomeGrossAmount?: number,
  healthCareInsuranceAnnual?: number,
): CalculationExplanation {
  const params: TaxableIncomeParams = {
    entnahme,
    grundfreibetrag,
    statutoryPensionTaxableAmount,
    otherIncomeGrossAmount,
    healthCareInsuranceAnnual,
  }

  const totalTaxableIncome = calculateTotalTaxableIncome(params)
  const steuerpflichtigesEinkommen = Math.max(0, totalTaxableIncome - grundfreibetrag)
  const steps = buildTaxableIncomeSteps(params, totalTaxableIncome, steuerpflichtigesEinkommen)
  const finalResultValues = buildTaxableIncomeFinalValues(params, totalTaxableIncome, steuerpflichtigesEinkommen)

  return {
    title: '💰 Zu versteuerndes Einkommen Schritt für Schritt',
    introduction:
      'Das zu versteuernde Einkommen ergibt sich aus allen Einkunftsarten (Portfolio-Entnahme, gesetzliche Rente, andere Einkünfte) nach Abzug steuerlich absetzbarer Beiträge (z.B. Krankenversicherung) und dem Grundfreibetrag. Dies ist die Grundlage für die Berechnung der Einkommensteuer.',
    steps,
    finalResult: {
      title: 'Endergebnis',
      values: finalResultValues,
    },
  }
}

// Other income calculation explanation
export function createOtherIncomeExplanation(
  totalNetAmount: number,
  totalTaxAmount: number,
  sourceCount: number,
  _otherIncomeData: unknown,
): CalculationExplanation {
  const totalGrossAmount = totalNetAmount + totalTaxAmount

  return {
    title: '💰 Andere Einkünfte Schritt für Schritt',
    introduction: `Die anderen Einkünfte umfassen ${sourceCount} Einkommensquelle${sourceCount === 1 ? '' : 'n'} wie Mieteinnahmen, private Renten oder Gewerbeeinkünfte. Diese reduzieren die notwendigen Entnahmen aus dem Portfolio.`,
    steps: [
      {
        title: 'Schritt 1: Brutto-Einkünfte',
        description: `Gesamte Brutto-Einkünfte aus ${sourceCount} Quelle${sourceCount === 1 ? '' : 'n'}.`,
        calculation: `Brutto-Einkünfte = ${formatCurrency(totalGrossAmount)}`,
        result: formatCurrency(totalGrossAmount),
        ...STEP_COLORS.ORANGE_VARIANT,
      },
      {
        title: 'Schritt 2: Steuern berechnen',
        description: 'Steuern werden basierend auf den konfigurierten Steuersätzen der Brutto-Einkünfte berechnet.',
        calculation: `Steuern = ${formatCurrency(totalTaxAmount)}`,
        result: formatCurrency(totalTaxAmount),
        ...STEP_COLORS.RED_VARIANT,
      },
      {
        title: 'Schritt 3: Netto-Einkünfte',
        description: 'Die verfügbaren Netto-Einkünfte nach Abzug der Steuern.',
        calculation: `Netto-Einkünfte = ${formatCurrency(totalGrossAmount)} - ${formatCurrency(totalTaxAmount)}`,
        result: formatCurrency(totalNetAmount),
        ...STEP_COLORS.GREEN_DARK,
      },
    ],
    finalResult: {
      title: 'Zusammenfassung der anderen Einkünfte',
      values: [
        { label: 'Anzahl Einkommensquellen', value: sourceCount.toString() },
        { label: 'Brutto-Einkünfte gesamt', value: formatCurrency(totalGrossAmount) },
        { label: 'Steuern gesamt', value: formatCurrency(totalTaxAmount) },
        { label: 'Netto-Einkünfte verfügbar', value: formatCurrency(totalNetAmount) },
        { label: 'Entlastung des Portfolios', value: formatCurrency(totalNetAmount) },
      ],
    },
  }
}

function buildStatutoryPensionSteps(
  grossAnnualAmount: number,
  taxableAmount: number,
  incomeTax: number,
  netAnnualAmount: number,
  taxablePercentage: number,
): CalculationStep[] {
  return [
    {
      title: 'Schritt 1: Brutto-Renteneinkommen',
      description: 'Die jährliche Brutto-Rente, die Sie von der Deutschen Rentenversicherung erhalten.',
      calculation: `Brutto-Rente (jährlich) = ${formatCurrency(grossAnnualAmount)}`,
      result: formatCurrency(grossAnnualAmount),
      ...STEP_COLORS.GREEN_DARK,
    },
    {
      title: 'Schritt 2: Steuerpflichtiger Anteil',
      description: `Der steuerpflichtige Anteil der Rente beträgt ${taxablePercentage.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}% der Brutto-Rente.`,
      calculation: `Steuerpflichtiger Anteil = ${formatCurrency(grossAnnualAmount)} × ${taxablePercentage.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`,
      result: formatCurrency(taxableAmount),
      ...STEP_COLORS.ORANGE,
    },
    {
      title: 'Schritt 3: Einkommensteuer auf Rente',
      description: 'Auf den steuerpflichtigen Anteil wird die Einkommensteuer erhoben.',
      calculation: `Einkommensteuer = ${formatCurrency(taxableAmount)} - Grundfreibetrag, dann Steuersatz anwenden`,
      result: formatCurrency(incomeTax),
      ...STEP_COLORS.RED,
    },
    {
      title: 'Schritt 4: Netto-Renteneinkommen',
      description: 'Das verfügbare Netto-Einkommen aus der gesetzlichen Rente nach Abzug der Steuern.',
      calculation: `Netto-Rente = ${formatCurrency(grossAnnualAmount)} - ${formatCurrency(incomeTax)}`,
      result: formatCurrency(netAnnualAmount),
      ...STEP_COLORS.GREEN_DARK,
    },
  ]
}

/**
 * Creates a detailed explanation of German statutory pension (gesetzliche Rente) calculations.
 * Shows how the pension is taxed based on the taxable percentage and how net income is derived.
 *
 * @param grossAnnualAmount - The gross annual pension amount before taxes
 * @param netAnnualAmount - The net annual pension amount after taxes
 * @param incomeTax - The income tax paid on the taxable portion
 * @param taxableAmount - The portion of pension that is subject to taxation
 * @param year - The year being calculated
 * @returns A complete calculation explanation showing pension taxation
 */
export function createStatutoryPensionExplanation(
  grossAnnualAmount: number,
  netAnnualAmount: number,
  incomeTax: number,
  taxableAmount: number,
  year: number,
): CalculationExplanation {
  const taxablePercentage = grossAnnualAmount > 0 ? (taxableAmount / grossAnnualAmount) * 100 : 0
  const monthlyNetAmount = netAnnualAmount / 12

  return {
    title: '🏛️ Gesetzliche Rente - Berechnung Schritt für Schritt',
    introduction: `Die gesetzliche Rente wird mit dem steuerpflichtigen Anteil versteuert. Hier sehen Sie die Berechnung für das Jahr ${year}.`,
    steps: buildStatutoryPensionSteps(grossAnnualAmount, taxableAmount, incomeTax, netAnnualAmount, taxablePercentage),
    finalResult: {
      title: 'Zusammenfassung der gesetzlichen Rente',
      values: [
        { label: 'Brutto-Rente (jährlich)', value: formatCurrency(grossAnnualAmount) },
        {
          label: 'Steuerpflichtiger Anteil',
          value: `${taxablePercentage.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`,
        },
        { label: 'Zu versteuernder Betrag', value: formatCurrency(taxableAmount) },
        { label: 'Einkommensteuer', value: formatCurrency(incomeTax) },
        { label: 'Netto-Rente (jährlich)', value: formatCurrency(netAnnualAmount) },
        { label: 'Netto-Rente (monatlich)', value: formatCurrency(monthlyNetAmount) },
        { label: 'Entlastung des Portfolios', value: formatCurrency(netAnnualAmount) },
      ],
    },
  }
}

// Health care insurance calculation explanation
function buildStatutoryInsuranceSteps(
  healthInsuranceAnnual: number,
  careInsuranceAnnual: number,
  totalAnnual: number,
  effectiveHealthInsuranceRate: number,
  effectiveCareInsuranceRate: number,
  baseIncomeForCalculation: number,
  employerText: string,
): CalculationStep[] {
  return [
    {
      title: 'Schritt 1: Beitragsbemessungsgrundlage',
      description: 'Das Einkommen, auf das die Kranken- und Pflegeversicherungsbeiträge berechnet werden.',
      calculation: `Bemessungsgrundlage = ${formatCurrency(baseIncomeForCalculation)}`,
      result: formatCurrency(baseIncomeForCalculation),
      ...STEP_COLORS.ORANGE_VARIANT,
    },
    {
      title: 'Schritt 2: Krankenversicherungsbeitrag',
      description: `Krankenversicherung: ${effectiveHealthInsuranceRate}% ${employerText}`,
      calculation: `Krankenversicherung = ${formatCurrency(baseIncomeForCalculation)} × ${effectiveHealthInsuranceRate}%`,
      result: formatCurrency(healthInsuranceAnnual),
      ...STEP_COLORS.LIGHT_BLUE_VARIANT,
    },
    {
      title: 'Schritt 3: Pflegeversicherungsbeitrag',
      description: `Pflegeversicherung: ${effectiveCareInsuranceRate}% ${employerText}`,
      calculation: `Pflegeversicherung = ${formatCurrency(baseIncomeForCalculation)} × ${effectiveCareInsuranceRate}%`,
      result: formatCurrency(careInsuranceAnnual),
      ...STEP_COLORS.GREEN_DARK,
    },
    {
      title: 'Schritt 4: Gesamtbeitrag',
      description: 'Die Summe aus Kranken- und Pflegeversicherungsbeiträgen.',
      calculation: `Gesamt = ${formatCurrency(healthInsuranceAnnual)} + ${formatCurrency(careInsuranceAnnual)}`,
      result: formatCurrency(totalAnnual),
      ...STEP_COLORS.PINK,
    },
  ]
}

function buildPrivateInsuranceSteps(
  healthInsuranceAnnual: number,
  careInsuranceAnnual: number,
  totalAnnual: number,
  monthlyHealthInsurance: number,
  monthlyCareInsurance: number,
  inflationAdjustmentFactor: number | undefined,
): CalculationStep[] {
  const steps: CalculationStep[] = []

  if (inflationAdjustmentFactor && inflationAdjustmentFactor > 1) {
    const inflationRate = (inflationAdjustmentFactor - 1) * 100
    steps.push({
      title: 'Schritt 1: Inflationsanpassung',
      description: `Die Beiträge werden jährlich um ${inflationRate.toFixed(1)}% angepasst.`,
      calculation: `Anpassungsfaktor = ${(inflationAdjustmentFactor * 100).toFixed(1)}%`,
      result: `+${inflationRate.toFixed(1)}%`,
      ...STEP_COLORS.ORANGE_VARIANT,
    })
  }

  steps.push(
    {
      title: `Schritt ${steps.length + 1}: Krankenversicherung (privat)`,
      description: 'Der monatliche Beitrag zur privaten Krankenversicherung.',
      calculation: `Krankenversicherung = ${formatCurrency(monthlyHealthInsurance)} × 12 Monate`,
      result: formatCurrency(healthInsuranceAnnual),
      ...STEP_COLORS.LIGHT_BLUE_VARIANT,
    },
    {
      title: `Schritt ${steps.length + 2}: Pflegeversicherung (privat)`,
      description: 'Der monatliche Beitrag zur privaten Pflegeversicherung.',
      calculation: `Pflegeversicherung = ${formatCurrency(monthlyCareInsurance)} × 12 Monate`,
      result: formatCurrency(careInsuranceAnnual),
      ...STEP_COLORS.GREEN_DARK,
    },
    {
      title: `Schritt ${steps.length + 3}: Gesamtbeitrag`,
      description: 'Die Summe aus Kranken- und Pflegeversicherungsbeiträgen.',
      calculation: `Gesamt = ${formatCurrency(healthInsuranceAnnual)} + ${formatCurrency(careInsuranceAnnual)}`,
      result: formatCurrency(totalAnnual),
      ...STEP_COLORS.PINK,
    },
  )

  return steps
}

/**
 * Build title for insurance explanation based on type
 */
function buildInsuranceTitle(insuranceType: 'statutory' | 'private'): string {
  return insuranceType === 'statutory'
    ? '🏥 Gesetzliche Kranken- & Pflegeversicherung - Berechnung'
    : '🏥 Private Kranken- & Pflegeversicherung - Berechnung'
}

/**
 * Build introduction text for statutory insurance
 */
function buildStatutoryIntroduction(isRetirementPhase: boolean | undefined): string {
  const phaseText = isRetirementPhase ? 'Rente' : 'vor der Rente'
  return `Die gesetzliche Kranken- und Pflegeversicherung wird basierend auf dem Einkommen berechnet. In der Phase ${phaseText} gelten besondere Beitragssätze.`
}

/**
 * Build introduction text for private insurance
 */
function buildPrivateIntroduction(inflationAdjustmentFactor: number | undefined): string {
  const inflationText = inflationAdjustmentFactor ? ' mit jährlicher Anpassung' : ''
  return `Die private Kranken- und Pflegeversicherung basiert auf festen monatlichen Beiträgen${inflationText}.`
}

/**
 * Get steps for statutory insurance
 */
function getStatutorySteps(
  healthInsuranceAnnual: number,
  careInsuranceAnnual: number,
  totalAnnual: number,
  effectiveHealthInsuranceRate: number | undefined,
  effectiveCareInsuranceRate: number | undefined,
  baseIncomeForCalculation: number | undefined,
  includesEmployerContribution: boolean | undefined,
): CalculationStep[] {
  if (!baseIncomeForCalculation || !effectiveHealthInsuranceRate || !effectiveCareInsuranceRate) {
    return []
  }

  const employerText = includesEmployerContribution ? 'inklusive Arbeitgeberanteil' : 'nur Arbeitnehmeranteil'

  return buildStatutoryInsuranceSteps(
    healthInsuranceAnnual,
    careInsuranceAnnual,
    totalAnnual,
    effectiveHealthInsuranceRate,
    effectiveCareInsuranceRate,
    baseIncomeForCalculation,
    employerText,
  )
}

/**
 * Build summary values for insurance explanation
 */
function buildSummaryValues(
  insuranceType: 'statutory' | 'private',
  healthInsuranceAnnual: number,
  careInsuranceAnnual: number,
  totalAnnual: number,
  monthlyTotal: number,
  year: number | undefined,
): Array<{ label: string; value: string }> {
  const baseValues = [
    { label: 'Versicherungsart', value: insuranceType === 'statutory' ? 'Gesetzlich' : 'Privat' },
    { label: 'Krankenversicherung (jährlich)', value: formatCurrency(healthInsuranceAnnual) },
    { label: 'Pflegeversicherung (jährlich)', value: formatCurrency(careInsuranceAnnual) },
    { label: 'Gesamtbeitrag (jährlich)', value: formatCurrency(totalAnnual) },
    { label: 'Gesamtbeitrag (monatlich)', value: formatCurrency(monthlyTotal) },
    { label: 'Steuerliche Behandlung', value: 'Vollständig absetzbar' },
  ]

  if (year) {
    baseValues.push({ label: 'Jahr', value: year.toString() })
  }

  return baseValues
}

function buildHealthCareInsuranceSteps(
  insuranceType: 'statutory' | 'private',
  healthInsuranceAnnual: number,
  careInsuranceAnnual: number,
  totalAnnual: number,
  effectiveHealthInsuranceRate?: number,
  effectiveCareInsuranceRate?: number,
  baseIncomeForCalculation?: number,
  includesEmployerContribution?: boolean,
  monthlyHealthInsurance?: number,
  monthlyCareInsurance?: number,
  inflationAdjustmentFactor?: number,
): CalculationStep[] {
  return insuranceType === 'statutory'
    ? getStatutorySteps(
        healthInsuranceAnnual,
        careInsuranceAnnual,
        totalAnnual,
        effectiveHealthInsuranceRate,
        effectiveCareInsuranceRate,
        baseIncomeForCalculation,
        includesEmployerContribution,
      )
    : buildPrivateInsuranceSteps(
        healthInsuranceAnnual,
        careInsuranceAnnual,
        totalAnnual,
        monthlyHealthInsurance!,
        monthlyCareInsurance!,
        inflationAdjustmentFactor,
      )
}

export function createHealthCareInsuranceExplanation(
  healthInsuranceAnnual: number,
  careInsuranceAnnual: number,
  totalAnnual: number,
  insuranceType: 'statutory' | 'private',
  effectiveHealthInsuranceRate?: number,
  effectiveCareInsuranceRate?: number,
  baseIncomeForCalculation?: number,
  isRetirementPhase?: boolean,
  includesEmployerContribution?: boolean,
  inflationAdjustmentFactor?: number,
  year?: number,
): CalculationExplanation {
  const monthlyHealthInsurance = healthInsuranceAnnual / 12
  const monthlyCareInsurance = careInsuranceAnnual / 12
  const monthlyTotal = totalAnnual / 12
  const title = buildInsuranceTitle(insuranceType)
  const introduction =
    insuranceType === 'statutory'
      ? buildStatutoryIntroduction(isRetirementPhase)
      : buildPrivateIntroduction(inflationAdjustmentFactor)

  return {
    title,
    introduction,
    steps: buildHealthCareInsuranceSteps(
      insuranceType,
      healthInsuranceAnnual,
      careInsuranceAnnual,
      totalAnnual,
      effectiveHealthInsuranceRate,
      effectiveCareInsuranceRate,
      baseIncomeForCalculation,
      includesEmployerContribution,
      monthlyHealthInsurance,
      monthlyCareInsurance,
      inflationAdjustmentFactor,
    ),
    finalResult: {
      title: 'Zusammenfassung der Kranken- & Pflegeversicherung',
      values: buildSummaryValues(
        insuranceType,
        healthInsuranceAnnual,
        careInsuranceAnnual,
        totalAnnual,
        monthlyTotal,
        year,
      ),
    },
  }
}
