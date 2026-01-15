/**
 * Sozialversicherungs-Optimierung für Grenzfälle
 * (Social Security Optimization for Border Cases)
 *
 * This module implements German social security calculations for:
 * - Midijob/Gleitzone (Transition zone): 538€ - 2,000€ monthly income
 * - Minijob (Mini-jobs): Up to 538€ monthly income
 * - Versicherungspflichtgrenze (Insurance threshold): 69,300€ annual income (2024)
 *
 * Legal basis:
 * - § 20 SGB IV (Gleitzone/Midijob)
 * - § 8 SGB IV (Geringfügige Beschäftigung/Minijob)
 * - § 6 SGB V (Versicherungspflichtgrenze)
 */

/**
 * Constants for 2024 German social security
 */
export const SV_CONSTANTS_2024 = {
  /** Geringfügigkeitsgrenze (Mini-job threshold) in EUR/month */
  minijobGrenze: 538,

  /** Lower bound of Gleitzone (Midijob) in EUR/month */
  gleitzoneUntergrenze: 538,

  /** Upper bound of Gleitzone (Midijob) in EUR/month */
  gleitzoneObergrenze: 2000,

  /** Versicherungspflichtgrenze (Annual income threshold for mandatory public insurance) in EUR/year */
  versicherungspflichtgrenze: 69300,

  /** Employee social security contribution rate (normal employment) */
  arbeitnehmerAnteilNormal: 0.2025, // ~20.25% (KV 7.3% + PV 1.525% + RV 9.3% + AV 1.2% + 0.9% KV Zusatzbeitrag)

  /** Employer social security contribution rate */
  arbeitgeberAnteil: 0.1965, // ~19.65% (KV 7.3% + PV 1.525% + RV 9.3% + AV 1.2%)

  /** Minijob employer flat-rate contribution */
  minijobPauschale: 0.3015, // 30.15% employer contribution (RV 15%, KV 13%, Steuer 2%, Umlage 0.15%)

  /** Krankenversicherung (Health insurance) employee rate */
  krankenversicherungArbeitnehmer: 0.073, // 7.3%

  /** Krankenversicherung average Zusatzbeitrag (Additional contribution) */
  krankenversicherungZusatzbeitrag: 0.009, // 0.9% (average across insurers)

  /** Pflegeversicherung (Care insurance) base rate */
  pflegeversicherungBasis: 0.01525, // 1.525%

  /** Pflegeversicherung Kinderlosenzuschlag (Childless surcharge) */
  pflegeversicherungKinderlos: 0.006, // 0.6% additional for childless people over 23

  /** Rentenversicherung (Pension insurance) rate */
  rentenversicherung: 0.093, // 9.3%

  /** Arbeitslosenversicherung (Unemployment insurance) rate */
  arbeitslosenversicherung: 0.012, // 1.2%

  /** Average value of one Rentenpunkt (Pension point) in EUR/month (2024) */
  rentenpunktWertMonatlich: 39.32, // West Germany 2024

  /** Cost of one Rentenpunkt for voluntary contributions in EUR (2024) */
  rentenpunktKosten: 8024, // Approximate cost for one full pension point
} as const

/**
 * Configuration for Midijob/Gleitzone calculation
 */
export interface MidijobConfig {
  /** Monthly gross income in EUR */
  bruttoEinkommen: number

  /** Whether the person is childless (affects Pflegeversicherung) */
  kinderlos: boolean

  /** Whether to opt out of Rentenversicherung (only possible for Minijobs) */
  rentenversicherungBefreiung: boolean
}

/**
 * Result of Midijob/Gleitzone calculation
 */
export interface MidijobErgebnis {
  /** Monthly gross income */
  brutto: number

  /** Calculated bemessungsentgelt (assessment basis) for social security */
  bemessungsentgelt: number

  /** Employee social security contributions */
  arbeitnehmerBeitrag: number

  /** Employer social security contributions */
  arbeitgeberBeitrag: number

  /** Monthly net income after social security */
  netto: number

  /** Total employer costs (Brutto + Arbeitgeberbeitrag) */
  arbeitgeberKosten: number

  /** Breakdown of contributions */
  beitraege: {
    krankenversicherung: number
    pflegeversicherung: number
    rentenversicherung: number
    arbeitslosenversicherung: number
  }

  /** Gleitzonenfaktor (reduction factor for employee contributions) */
  gleitzonenfaktor: number

  /** Whether this income is in Gleitzone */
  istGleitzone: boolean

  /** Whether this is a Minijob */
  istMinijob: boolean

  /** Acquired Rentenpunkte per year at this income level */
  rentenpunkteProJahr: number
}

/**
 * Calculate Gleitzonenfaktor (F) according to § 20 Abs. 2 SGB IV
 *
 * Formula: F = 1,4597 × (Geringfügigkeitsgrenze / Arbeitsentgelt)
 *
 * This factor reduces employee social security contributions in the transition zone
 * to make the jump from Minijob to regular employment more financially attractive.
 */
export function calculateGleitzonenfaktor(bruttoEinkommen: number): number {
  const { gleitzoneUntergrenze, minijobGrenze } = SV_CONSTANTS_2024

  if (bruttoEinkommen <= minijobGrenze) {
    return 0 // Minijob - different calculation
  }

  if (bruttoEinkommen <= gleitzoneUntergrenze) {
    return 1.4597 * (minijobGrenze / bruttoEinkommen)
  }

  // Formula for Gleitzone: F = 1.4597 × (minijobGrenze / bruttoEinkommen)
  const faktor = 1.4597 * (minijobGrenze / bruttoEinkommen)

  return faktor
}

/**
 * Calculate bemessungsentgelt (assessment basis) for Gleitzone
 *
 * Formula: Bemessungsentgelt = F × Arbeitsentgelt - (F - 1) × Geringfügigkeitsgrenze
 */
export function calculateBemessungsentgelt(bruttoEinkommen: number, gleitzonenfaktor: number): number {
  const { minijobGrenze, gleitzoneObergrenze } = SV_CONSTANTS_2024

  if (bruttoEinkommen > gleitzoneObergrenze) {
    // Above Gleitzone - full income is assessment basis
    return bruttoEinkommen
  }

  if (bruttoEinkommen <= minijobGrenze) {
    // Minijob - no employee contributions
    return 0
  }

  // Gleitzone formula
  const bemessungsentgelt = gleitzonenfaktor * bruttoEinkommen - (gleitzonenfaktor - 1) * minijobGrenze

  return Math.max(minijobGrenze, Math.min(bemessungsentgelt, bruttoEinkommen))
}

/**
 * Calculate Minijob contributions and result
 */
function calculateMinijobErgebnis(config: MidijobConfig): MidijobErgebnis {
  const { bruttoEinkommen, rentenversicherungBefreiung } = config

  const arbeitgeberBeitrag = bruttoEinkommen * SV_CONSTANTS_2024.minijobPauschale
  const arbeitnehmerBeitrag = rentenversicherungBefreiung ? 0 : bruttoEinkommen * 0.037 // 3.7% RV if not exempt
  const netto = bruttoEinkommen - arbeitnehmerBeitrag

  // Calculate Rentenpunkte for Minijob
  const rentenpunkteProJahr = rentenversicherungBefreiung ? 0 : (bruttoEinkommen * 12) / SV_CONSTANTS_2024.rentenpunktKosten

  return {
    brutto: bruttoEinkommen,
    bemessungsentgelt: 0,
    arbeitnehmerBeitrag,
    arbeitgeberBeitrag,
    netto,
    arbeitgeberKosten: bruttoEinkommen + arbeitgeberBeitrag,
    beitraege: {
      krankenversicherung: 0,
      pflegeversicherung: 0,
      rentenversicherung: arbeitnehmerBeitrag,
      arbeitslosenversicherung: 0,
    },
    gleitzonenfaktor: 0,
    istGleitzone: false,
    istMinijob: true,
    rentenpunkteProJahr,
  }
}

/**
 * Calculate employee contributions for Gleitzone/Regular employment
 */
function calculateArbeitnehmerBeitraege(bemessungsentgelt: number, kinderlos: boolean) {
  const krankenversicherung =
    bemessungsentgelt * (SV_CONSTANTS_2024.krankenversicherungArbeitnehmer + SV_CONSTANTS_2024.krankenversicherungZusatzbeitrag)

  const pflegeversicherungRate = kinderlos
    ? SV_CONSTANTS_2024.pflegeversicherungBasis + SV_CONSTANTS_2024.pflegeversicherungKinderlos
    : SV_CONSTANTS_2024.pflegeversicherungBasis

  const pflegeversicherung = bemessungsentgelt * pflegeversicherungRate
  const rentenversicherungBeitrag = bemessungsentgelt * SV_CONSTANTS_2024.rentenversicherung
  const arbeitslosenversicherungBeitrag = bemessungsentgelt * SV_CONSTANTS_2024.arbeitslosenversicherung

  return {
    krankenversicherung,
    pflegeversicherung,
    rentenversicherung: rentenversicherungBeitrag,
    arbeitslosenversicherung: arbeitslosenversicherungBeitrag,
    total: krankenversicherung + pflegeversicherung + rentenversicherungBeitrag + arbeitslosenversicherungBeitrag,
  }
}

/**
 * Calculate employer contributions for Gleitzone/Regular employment
 */
function calculateArbeitgeberBeitraege(bruttoEinkommen: number, kinderlos: boolean): number {
  const pflegeversicherungRate = kinderlos
    ? SV_CONSTANTS_2024.pflegeversicherungBasis + SV_CONSTANTS_2024.pflegeversicherungKinderlos
    : SV_CONSTANTS_2024.pflegeversicherungBasis

  const krankenversicherung =
    bruttoEinkommen * (SV_CONSTANTS_2024.krankenversicherungArbeitnehmer + SV_CONSTANTS_2024.krankenversicherungZusatzbeitrag / 2)

  const pflegeversicherung = bruttoEinkommen * pflegeversicherungRate
  const rentenversicherung = bruttoEinkommen * SV_CONSTANTS_2024.rentenversicherung
  const arbeitslosenversicherung = bruttoEinkommen * SV_CONSTANTS_2024.arbeitslosenversicherung

  return krankenversicherung + pflegeversicherung + rentenversicherung + arbeitslosenversicherung
}

/**
 * Calculate social security contributions for Midijob/Gleitzone
 */
export function calculateMidijobBeitraege(config: MidijobConfig): MidijobErgebnis {
  const { bruttoEinkommen, kinderlos } = config
  const { minijobGrenze, gleitzoneObergrenze, gleitzoneUntergrenze } = SV_CONSTANTS_2024

  const istMinijob = bruttoEinkommen <= minijobGrenze
  const istGleitzone = bruttoEinkommen > gleitzoneUntergrenze && bruttoEinkommen <= gleitzoneObergrenze

  // Minijob calculation
  if (istMinijob) {
    return calculateMinijobErgebnis(config)
  }

  // Calculate Gleitzonenfaktor and Bemessungsentgelt
  const gleitzonenfaktor = istGleitzone ? calculateGleitzonenfaktor(bruttoEinkommen) : 1
  const bemessungsentgelt = istGleitzone ? calculateBemessungsentgelt(bruttoEinkommen, gleitzonenfaktor) : bruttoEinkommen

  // Calculate contributions
  const arbeitnehmerBeitraege = calculateArbeitnehmerBeitraege(bemessungsentgelt, kinderlos)
  const arbeitgeberBeitrag = calculateArbeitgeberBeitraege(bruttoEinkommen, kinderlos)

  const netto = bruttoEinkommen - arbeitnehmerBeitraege.total

  // Calculate Rentenpunkte (based on Bemessungsentgelt)
  const jahresBruttoForRente = bemessungsentgelt * 12
  const rentenpunkteProJahr = jahresBruttoForRente / SV_CONSTANTS_2024.rentenpunktKosten

  return {
    brutto: bruttoEinkommen,
    bemessungsentgelt,
    arbeitnehmerBeitrag: arbeitnehmerBeitraege.total,
    arbeitgeberBeitrag,
    netto,
    arbeitgeberKosten: bruttoEinkommen + arbeitgeberBeitrag,
    beitraege: {
      krankenversicherung: arbeitnehmerBeitraege.krankenversicherung,
      pflegeversicherung: arbeitnehmerBeitraege.pflegeversicherung,
      rentenversicherung: arbeitnehmerBeitraege.rentenversicherung,
      arbeitslosenversicherung: arbeitnehmerBeitraege.arbeitslosenversicherung,
    },
    gleitzonenfaktor,
    istGleitzone,
    istMinijob: false,
    rentenpunkteProJahr,
  }
}

/**
 * Calculate optimal income in Gleitzone to maximize net income
 *
 * Due to the Gleitzonenfaktor, there's a sweet spot where the net income
 * gain is maximized relative to additional work hours.
 */
export function calculateOptimalGleitzoneIncome(kinderlos: boolean): {
  optimalBrutto: number
  ergebnis: MidijobErgebnis
  nettoProEuro: number
} {
  const { gleitzoneUntergrenze, gleitzoneObergrenze } = SV_CONSTANTS_2024

  let bestBrutto = gleitzoneUntergrenze
  let bestNettoProEuro = 0

  // Test incomes in 10€ increments
  for (let brutto = gleitzoneUntergrenze; brutto <= gleitzoneObergrenze; brutto += 10) {
    const ergebnis = calculateMidijobBeitraege({
      bruttoEinkommen: brutto,
      kinderlos,
      rentenversicherungBefreiung: false,
    })

    const nettoProEuro = ergebnis.netto / brutto

    if (nettoProEuro > bestNettoProEuro) {
      bestNettoProEuro = nettoProEuro
      bestBrutto = brutto
    }
  }

  const optimalErgebnis = calculateMidijobBeitraege({
    bruttoEinkommen: bestBrutto,
    kinderlos,
    rentenversicherungBefreiung: false,
  })

  return {
    optimalBrutto: bestBrutto,
    ergebnis: optimalErgebnis,
    nettoProEuro: bestNettoProEuro,
  }
}

/**
 * Compare Minijob scenarios with and without Rentenversicherung opt-out
 */
export function compareMinijobRentenversicherung(bruttoEinkommen: number): {
  mitRentenversicherung: MidijobErgebnis
  ohneRentenversicherung: MidijobErgebnis
  mehrNetto: number
  verloreneRentenpunkte: number
  entgangeneRente: number
} {
  const mitRV = calculateMidijobBeitraege({
    bruttoEinkommen,
    kinderlos: false,
    rentenversicherungBefreiung: false,
  })

  const ohneRV = calculateMidijobBeitraege({
    bruttoEinkommen,
    kinderlos: false,
    rentenversicherungBefreiung: true,
  })

  const mehrNetto = ohneRV.netto - mitRV.netto
  const verloreneRentenpunkte = mitRV.rentenpunkteProJahr
  const entgangeneRente = verloreneRentenpunkte * SV_CONSTANTS_2024.rentenpunktWertMonatlich

  return {
    mitRentenversicherung: mitRV,
    ohneRentenversicherung: ohneRV,
    mehrNetto,
    verloreneRentenpunkte,
    entgangeneRente,
  }
}

/**
 * Calculate Versicherungspflichtgrenze scenarios for high earners
 */
export function calculateVersicherungspflichtgrenzeOptimization(jahresBrutto: number): {
  ueberschreitungsbetrag: number
  mehrverdienstFuerPKV: number
  pkvVorteilhaft: boolean
  empfehlung: string
} {
  const { versicherungspflichtgrenze } = SV_CONSTANTS_2024

  const ueberschreitungsbetrag = jahresBrutto - versicherungspflichtgrenze

  if (ueberschreitungsbetrag >= 0) {
    return {
      ueberschreitungsbetrag,
      mehrverdienstFuerPKV: 0,
      pkvVorteilhaft: true,
      empfehlung:
        'Sie überschreiten die Versicherungspflichtgrenze und können in die private Krankenversicherung (PKV) wechseln. Prüfen Sie individuelle PKV-Tarife.',
    }
  }

  const mehrverdienstFuerPKV = Math.abs(ueberschreitungsbetrag)

  if (mehrverdienstFuerPKV < 5000) {
    return {
      ueberschreitungsbetrag,
      mehrverdienstFuerPKV,
      pkvVorteilhaft: true,
      empfehlung: `Sie benötigen nur ${mehrverdienstFuerPKV.toLocaleString('de-DE')} € mehr Jahreseinkommen für PKV-Berechtigung. Erwägen Sie Gehaltsverhandlungen oder Zusatzeinkünfte.`,
    }
  }

  return {
    ueberschreitungsbetrag,
    mehrverdienstFuerPKV,
    pkvVorteilhaft: false,
    empfehlung:
      'Sie sind deutlich unter der Versicherungspflichtgrenze. Verbleiben Sie in der gesetzlichen Krankenversicherung (GKV) mit ihren Vorteilen.',
  }
}

/**
 * Validate Sozialversicherung configuration
 */
export function validateSozialversicherungConfig(config: MidijobConfig): string[] {
  const errors: string[] = []

  if (config.bruttoEinkommen < 0) {
    errors.push('Bruttoeinkommen kann nicht negativ sein')
  }

  if (config.bruttoEinkommen > 10000) {
    errors.push('Bruttoeinkommen über 10.000 € monatlich ist für Gleitzone-Optimierung nicht relevant')
  }

  return errors
}

/**
 * Get default Midijob configuration
 */
export function getDefaultMidijobConfig(): MidijobConfig {
  return {
    bruttoEinkommen: 1000,
    kinderlos: false,
    rentenversicherungBefreiung: false,
  }
}
