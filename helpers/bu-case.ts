/**
 * BU-Fall (Berufsunfähigkeitsfall) calculation helper
 *
 * Modelliert den finanziellen Einfluss eines Berufsunfähigkeitsfalls:
 * - Zeitlich begrenzt: BU beginnt in einem bestimmten Jahr und endet nach einer definierten Dauer
 * - Unbegrenzt (dauerhaft): BU bleibt dauerhaft bestehen
 *
 * Der Netto-Effekt pro Jahr ergibt sich aus:
 *   BU-Rente (monatlich × 12) − Einkommensverlust (monatlich × 12)
 */

export interface BUCaseConfig {
  /** Beginn der Berufsunfähigkeit (Jahr) */
  startYear: number
  /** Ende der Berufsunfähigkeit (Jahr). null = dauerhaft */
  endYear: number | null
  /** Monatliche BU-Rente aus der Versicherung (€) */
  monthlyBUPension: number
  /** Monatlicher Einkommensverlust durch die BU (€) */
  monthlyIncomeReduction: number
  /** Geburtsjahr für Altersberechnung */
  birthYear: number
  /** Leibrenten-Besteuerung nach § 22 EStG anwenden */
  applyLeibrentenBesteuerung: boolean
}

export interface BUCaseResult {
  /** Netto-Jahresbetrag (BU-Rente − Einkommensverlust, nach Steuer) */
  annualNetEffect: number
  /** Jährliche BU-Rente brutto */
  annualBUPension: number
  /** Jährlicher Einkommensverlust */
  annualIncomeReduction: number
  /** Alter beim Beginn der BU */
  ageAtBUStart: number
  /** Ertragsanteil (%) nach § 22 EStG (wenn Leibrenten-Besteuerung aktiv) */
  ertragsanteil: number | null
  /** Ob der Fall zeitlich begrenzt ist */
  isTemporary: boolean
  /** Dauer in Jahren (0 = dauerhaft) */
  durationYears: number
}

/**
 * Ertragsanteil-Tabelle nach § 22 Nr. 1 Satz 3 Buchstabe a EStG
 * Gibt den steuerpflichtigen Prozentsatz der Leibrente/BU-Rente an.
 */
const ERTRAGSANTEIL_TABLE: Array<{ maxAge: number; percentage: number }> = [
  { maxAge: 1, percentage: 59 },
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
  { maxAge: Infinity, percentage: 21 },
]

/**
 * Berechnet den Ertragsanteil nach § 22 EStG für ein gegebenes Alter.
 * Für Alter 2–17: 59 − Alter (Sonderregel).
 */
export function getErtragsanteil(ageAtBUStart: number): number {
  if (ageAtBUStart >= 2 && ageAtBUStart <= 17) {
    return 59 - ageAtBUStart
  }
  const entry = ERTRAGSANTEIL_TABLE.find(item => ageAtBUStart <= item.maxAge)
  return entry?.percentage ?? 21
}

/**
 * Berechnet das Alter beim Beginn der BU.
 */
export function calculateAgeAtBUStart(birthYear: number, buStartYear: number): number {
  return buStartYear - birthYear
}

/**
 * Berechnet den Netto-Jahresbetrag für ein gegebenes Jahr im BU-Zeitraum.
 *
 * Hinweis: Diese Funktion gibt den finanziellen Nettoeffekt aus der BU zurück.
 * Ein positiver Wert bedeutet, dass die BU-Rente den Einkommensverlust übersteigt.
 * Ein negativer Wert bedeutet, dass der Einkommensverlust die BU-Rente übersteigt.
 */
export function calculateBUCaseForYear(config: BUCaseConfig, year: number): BUCaseResult {
  const { startYear, endYear, monthlyBUPension, monthlyIncomeReduction, birthYear, applyLeibrentenBesteuerung } =
    config

  const ageAtBUStart = calculateAgeAtBUStart(birthYear, startYear)
  const isTemporary = endYear !== null
  const durationYears = isTemporary ? Math.max(0, endYear! - startYear) : 0

  // Prüfen ob das Jahr im BU-Zeitraum liegt
  const isInBUPeriod = year >= startYear && (endYear === null || year < endYear)

  if (!isInBUPeriod) {
    return {
      annualNetEffect: 0,
      annualBUPension: 0,
      annualIncomeReduction: 0,
      ageAtBUStart,
      ertragsanteil: applyLeibrentenBesteuerung ? getErtragsanteil(ageAtBUStart) : null,
      isTemporary,
      durationYears,
    }
  }

  const annualBUPension = monthlyBUPension * 12
  const annualIncomeReduction = monthlyIncomeReduction * 12
  const annualNetEffect = annualBUPension - annualIncomeReduction

  return {
    annualNetEffect,
    annualBUPension,
    annualIncomeReduction,
    ageAtBUStart,
    ertragsanteil: applyLeibrentenBesteuerung ? getErtragsanteil(ageAtBUStart) : null,
    isTemporary,
    durationYears,
  }
}
