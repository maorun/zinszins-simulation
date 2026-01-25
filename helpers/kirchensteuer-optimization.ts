/**
 * Kirchensteuer-Optimierung (Church Tax Optimization)
 *
 * This module provides calculations and comparisons for church tax (Kirchensteuer)
 * on capital gains in Germany. It helps investors understand the long-term impact
 * of church tax on their investment returns and explore optimization strategies.
 *
 * Key German Tax Rules:
 * - Kirchensteuer is 8% (Bavaria, Baden-Württemberg) or 9% (other states) of income tax
 * - For capital gains, Kirchensteuer is calculated on the Abgeltungsteuer (25% flat tax)
 * - Sperrvermerk (blocking notice) can prevent automatic church tax deduction
 * - Teilfreistellung (partial exemption) for equity funds applies before church tax
 */

/**
 * Configuration for church tax calculation
 */
export interface KirchensteuerConfig {
  kirchensteuerAktiv: boolean
  kirchensteuersatz: number // 8 or 9 (as percentage)
  kapitalertragsteuer: number // e.g., 26.375 for Abgeltungsteuer + Soli
  teilfreistellungsquote: number // e.g., 30 for equity funds
}

/**
 * Result of a single year's church tax calculation
 */
export interface YearlyKirchensteuerResult {
  jahr: number
  kapitalertrag: number // Capital gains before taxes
  teilfreigestellterErtrag: number // After partial exemption
  steuerpflichtigerErtrag: number // Taxable gains
  kapitalertragsteuerBetrag: number // Abgeltungsteuer + Soli amount
  kirchensteuerBetrag: number // Church tax amount
  gesamtsteuer: number // Total tax (Abgeltungsteuer + Kirchensteuer)
  nettoertrag: number // Net gains after all taxes
}

/**
 * Comparison result showing impact of church tax over time
 */
export interface KirchensteuerComparison {
  mitKirchensteuer: {
    gesamtsteuer: number
    nettoertrag: number
    yearlyResults: YearlyKirchensteuerResult[]
  }
  ohneKirchensteuer: {
    gesamtsteuer: number
    nettoertrag: number
    yearlyResults: YearlyKirchensteuerResult[]
  }
  mehrbelastung: number // Additional burden due to church tax
  mehrbelastungProzent: number // As percentage of total gains
}

/**
 * Sperrvermerk simulation result
 */
export interface SperrvermarkSimulation {
  automatischeAbfuehrung: {
    gesamtsteuer: number
    nettoertrag: number
  }
  mitSperrvermerk: {
    gesamtsteuer: number // Same tax liability
    nettoertrag: number // Same net after taxes
    manuelleZahlung: number // Amount to be paid manually via tax return
  }
  hinweis: string
}

/**
 * Calculate church tax on capital gains for a single year
 */
export function calculateYearlyKirchensteuer(
  jahr: number,
  kapitalertrag: number,
  config: KirchensteuerConfig,
): YearlyKirchensteuerResult {
  // Apply partial exemption (Teilfreistellung)
  const teilfreistellungsFaktor = 1 - config.teilfreistellungsquote / 100
  const teilfreigestellterErtrag = kapitalertrag * teilfreistellungsFaktor

  // Calculate taxable gains
  const steuerpflichtigerErtrag = teilfreigestellterErtrag

  // Calculate Abgeltungsteuer + Soli (base capital gains tax)
  const kapitalertragsteuerBetrag = steuerpflichtigerErtrag * (config.kapitalertragsteuer / 100)

  // Calculate Kirchensteuer
  // Note: Kirchensteuer is calculated on the Abgeltungsteuer (25%), not including Soli
  // For simplicity, we use the base 25% rate
  const baseAbgeltungsteuer = steuerpflichtigerErtrag * 0.25
  const kirchensteuerBetrag = config.kirchensteuerAktiv ? baseAbgeltungsteuer * (config.kirchensteuersatz / 100) : 0

  // Total tax and net gains
  const gesamtsteuer = kapitalertragsteuerBetrag + kirchensteuerBetrag
  const nettoertrag = kapitalertrag - gesamtsteuer

  return {
    jahr,
    kapitalertrag,
    teilfreigestellterErtrag,
    steuerpflichtigerErtrag,
    kapitalertragsteuerBetrag,
    kirchensteuerBetrag,
    gesamtsteuer,
    nettoertrag,
  }
}

/**
 * Compare investment returns with and without church tax over multiple years
 */
export function compareKirchensteuerImpact(
  yearlyGains: Array<{ jahr: number; kapitalertrag: number }>,
  config: KirchensteuerConfig,
): KirchensteuerComparison {
  // Calculate with church tax
  const mitKirchensteuer = yearlyGains.map(({ jahr, kapitalertrag }) =>
    calculateYearlyKirchensteuer(jahr, kapitalertrag, { ...config, kirchensteuerAktiv: true }),
  )

  // Calculate without church tax
  const ohneKirchensteuer = yearlyGains.map(({ jahr, kapitalertrag }) =>
    calculateYearlyKirchensteuer(jahr, kapitalertrag, { ...config, kirchensteuerAktiv: false }),
  )

  // Sum totals
  const mitKirchensteuerTotal = mitKirchensteuer.reduce(
    (acc, year) => ({
      gesamtsteuer: acc.gesamtsteuer + year.gesamtsteuer,
      nettoertrag: acc.nettoertrag + year.nettoertrag,
    }),
    { gesamtsteuer: 0, nettoertrag: 0 },
  )

  const ohneKirchensteuerTotal = ohneKirchensteuer.reduce(
    (acc, year) => ({
      gesamtsteuer: acc.gesamtsteuer + year.gesamtsteuer,
      nettoertrag: acc.nettoertrag + year.nettoertrag,
    }),
    { gesamtsteuer: 0, nettoertrag: 0 },
  )

  // Calculate additional burden
  const mehrbelastung = mitKirchensteuerTotal.gesamtsteuer - ohneKirchensteuerTotal.gesamtsteuer
  const totalGains = yearlyGains.reduce((sum, { kapitalertrag }) => sum + kapitalertrag, 0)
  const mehrbelastungProzent = totalGains > 0 ? (mehrbelastung / totalGains) * 100 : 0

  return {
    mitKirchensteuer: {
      gesamtsteuer: mitKirchensteuerTotal.gesamtsteuer,
      nettoertrag: mitKirchensteuerTotal.nettoertrag,
      yearlyResults: mitKirchensteuer,
    },
    ohneKirchensteuer: {
      gesamtsteuer: ohneKirchensteuerTotal.gesamtsteuer,
      nettoertrag: ohneKirchensteuerTotal.nettoertrag,
      yearlyResults: ohneKirchensteuer,
    },
    mehrbelastung,
    mehrbelastungProzent,
  }
}

/**
 * Simulate the effect of using Sperrvermerk (blocking automatic church tax deduction)
 */
export function simulateSperrvermerk(
  totalKapitalertrag: number,
  config: KirchensteuerConfig,
): SperrvermarkSimulation {
  const result = calculateYearlyKirchensteuer(new Date().getFullYear(), totalKapitalertrag, config)

  return {
    automatischeAbfuehrung: {
      gesamtsteuer: result.gesamtsteuer,
      nettoertrag: result.nettoertrag,
    },
    mitSperrvermerk: {
      gesamtsteuer: result.gesamtsteuer, // Tax liability remains the same
      nettoertrag: result.nettoertrag, // Net after taxes is the same
      manuelleZahlung: result.kirchensteuerBetrag, // Amount to be paid via tax return
    },
    hinweis:
      'Ein Sperrvermerk verhindert die automatische Abführung der Kirchensteuer durch die Bank. ' +
      'Die Steuerschuld bleibt bestehen und muss über die Steuererklärung abgeführt werden. ' +
      'Dies bietet mehr Liquidität während des Jahres, ändert aber nicht die Gesamtsteuerbelastung.',
  }
}

/**
 * Calculate the effective tax rate including church tax
 */
export function calculateEffectiveTaxRate(config: KirchensteuerConfig): number {
  // Base Abgeltungsteuer is 25%
  const baseAbgeltungsteuer = 25

  // Kirchensteuer on Abgeltungsteuer
  const kirchensteuerOnAbgeltung = config.kirchensteuerAktiv ? baseAbgeltungsteuer * (config.kirchensteuersatz / 100) : 0

  // Solidaritätszuschlag (included in kapitalertragsteuer, but separate from kirchensteuer calculation)
  // Assuming config.kapitalertragsteuer already includes Soli (e.g., 26.375%)
  const soliRate = config.kapitalertragsteuer - baseAbgeltungsteuer

  // Total effective rate
  return baseAbgeltungsteuer + soliRate + kirchensteuerOnAbgeltung
}

/**
 * Validate church tax configuration
 */
export function validateKirchensteuerConfig(config: KirchensteuerConfig): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (config.kirchensteuersatz < 8 || config.kirchensteuersatz > 9) {
    errors.push('Kirchensteuersatz muss 8% (Bayern, Baden-Württemberg) oder 9% (andere Bundesländer) sein')
  }

  if (config.kapitalertragsteuer < 25 || config.kapitalertragsteuer > 30) {
    errors.push('Kapitalertragsteuer muss zwischen 25% und 30% liegen (inkl. Solidaritätszuschlag)')
  }

  if (config.teilfreistellungsquote < 0 || config.teilfreistellungsquote > 100) {
    errors.push('Teilfreistellungsquote muss zwischen 0% und 100% liegen')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
