/**
 * Ausgaben-Tracker für Ruhestandsplanung
 *
 * Dieses Modul verwaltet detaillierte Ausgabenplanung für die Entnahmephase.
 * Es ermöglicht kategorisierte Ausgaben mit lebensabschnitts-basierten Anpassungen
 * und verschiedenen Inflationsraten pro Kategorie.
 */

/**
 * Ausgabenkategorie mit individueller Inflationsrate
 */
export type AusgabenKategorie =
  | 'fixkosten' // Miete/Kredit, Versicherungen, Abonnements
  | 'lebenshaltung' // Lebensmittel, Kleidung, Haushalt
  | 'gesundheit' // Medikamente, Zuzahlungen, Therapien
  | 'freizeit' // Hobbys, Sport, Kultur
  | 'reisen' // Urlaubsbudget
  | 'einmalig' // Auto, Renovierung, Geschenke

/**
 * Lebensabschnitt im Ruhestand mit typischen Anpassungen
 */
export type Lebensabschnitt = 'aktiv' | 'eingeschraenkt' | 'pflegebedarf'

/**
 * Konfiguration für eine Ausgabenkategorie
 */
export interface KategorieConfig {
  /** Monatlicher Betrag in Euro */
  betrag: number
  /** Jährliche Inflationsrate für diese Kategorie (z.B. 0.03 für 3%) */
  inflationsrate: number
  /** Ob diese Kategorie aktiv ist */
  aktiv: boolean
}

/**
 * Anpassungsfaktor für einen Lebensabschnitt
 */
export interface LebensabschnittAnpassung {
  /** Ab welchem Alter dieser Lebensabschnitt beginnt */
  alterVon: number
  /** Bis zu welchem Alter dieser Lebensabschnitt gilt (optional, Standard: Lebensende) */
  alterBis?: number
  /** Multiplikator für jede Kategorie (1.0 = keine Änderung) */
  faktoren: Record<AusgabenKategorie, number>
}

/**
 * Komplette Konfiguration des Ausgaben-Trackers
 */
export interface AusgabenTrackerConfig {
  /** Kategorisierte Ausgaben mit individuellen Inflationsraten */
  kategorien: Record<AusgabenKategorie, KategorieConfig>
  /** Lebensabschnitts-basierte Anpassungen */
  lebensabschnitte: LebensabschnittAnpassung[]
  /** Geburtsjahr des Nutzers für Altersberechnung */
  geburtsjahr: number
}

/**
 * Berechnete Ausgaben für ein Jahr
 */
export interface JahresAusgaben {
  /** Jahr */
  jahr: number
  /** Alter des Nutzers */
  alter: number
  /** Aktiver Lebensabschnitt */
  lebensabschnitt: Lebensabschnitt
  /** Ausgaben pro Kategorie (jährlich) */
  kategorien: Record<AusgabenKategorie, number>
  /** Gesamtausgaben (jährlich) */
  gesamt: number
}

/**
 * Standardkonfiguration für Ausgabenkategorien
 */
export const DEFAULT_KATEGORIE_CONFIG: Record<AusgabenKategorie, KategorieConfig> = {
  fixkosten: {
    betrag: 1200,
    inflationsrate: 0.02, // 2% p.a. für Miete
    aktiv: true,
  },
  lebenshaltung: {
    betrag: 800,
    inflationsrate: 0.025, // 2,5% p.a. für Lebensmittel
    aktiv: true,
  },
  gesundheit: {
    betrag: 200,
    inflationsrate: 0.04, // 4% p.a. für Gesundheitskosten
    aktiv: true,
  },
  freizeit: {
    betrag: 300,
    inflationsrate: 0.02, // 2% p.a.
    aktiv: true,
  },
  reisen: {
    betrag: 200,
    inflationsrate: 0.03, // 3% p.a.
    aktiv: true,
  },
  einmalig: {
    betrag: 100,
    inflationsrate: 0.02, // 2% p.a.
    aktiv: false, // Standardmäßig deaktiviert
  },
}

/**
 * Standardkonfiguration für Lebensabschnitte
 */
export const DEFAULT_LEBENSABSCHNITTE: LebensabschnittAnpassung[] = [
  {
    // Aktiver Ruhestand (65-74)
    alterVon: 65,
    alterBis: 74,
    faktoren: {
      fixkosten: 1.0,
      lebenshaltung: 1.0,
      gesundheit: 1.0,
      freizeit: 1.2, // +20% für Hobbys
      reisen: 1.5, // +50% für Reisen
      einmalig: 1.0,
    },
  },
  {
    // Eingeschränkte Mobilität (75-84)
    alterVon: 75,
    alterBis: 84,
    faktoren: {
      fixkosten: 1.0,
      lebenshaltung: 1.0,
      gesundheit: 1.3, // +30% für Gesundheit
      freizeit: 0.8, // -20% für Freizeit
      reisen: 0.4, // -60% für Reisen
      einmalig: 0.8,
    },
  },
  {
    // Pflegebedarf (85+)
    alterVon: 85,
    faktoren: {
      fixkosten: 1.0,
      lebenshaltung: 0.9,
      gesundheit: 2.0, // +100% für Gesundheit und Pflege
      freizeit: 0.5, // -50% für Freizeit
      reisen: 0.1, // -90% für Reisen
      einmalig: 0.5,
    },
  },
]

/**
 * Erstellt eine Standardkonfiguration für den Ausgaben-Tracker
 */
export function createDefaultAusgabenTrackerConfig(geburtsjahr: number): AusgabenTrackerConfig {
  return {
    kategorien: DEFAULT_KATEGORIE_CONFIG,
    lebensabschnitte: DEFAULT_LEBENSABSCHNITTE,
    geburtsjahr,
  }
}

/**
 * Bestimmt den aktiven Lebensabschnitt für ein gegebenes Alter
 */
export function getLebensabschnittFuerAlter(
  alter: number,
  lebensabschnitte: LebensabschnittAnpassung[],
): Lebensabschnitt {
  // Finde den passenden Lebensabschnitt
  for (const abschnitt of lebensabschnitte) {
    if (alter >= abschnitt.alterVon && (!abschnitt.alterBis || alter <= abschnitt.alterBis)) {
      // Bestimme Lebensabschnitt basierend auf Alter
      if (alter < 75) return 'aktiv'
      if (alter < 85) return 'eingeschraenkt'
      return 'pflegebedarf'
    }
  }
  // Fallback: Aktiv
  return 'aktiv'
}

/**
 * Berechnet die Ausgaben für ein spezifisches Jahr unter Berücksichtigung
 * von Inflation und Lebensabschnitts-Anpassungen
 */
export function berechneJahresAusgaben(
  jahr: number,
  basisjahr: number,
  config: AusgabenTrackerConfig,
): JahresAusgaben {
  const alter = jahr - config.geburtsjahr
  const lebensabschnitt = getLebensabschnittFuerAlter(alter, config.lebensabschnitte)

  // Finde die Anpassungsfaktoren für diesen Lebensabschnitt
  const anpassung = config.lebensabschnitte.find(
    (a) => alter >= a.alterVon && (!a.alterBis || alter <= a.alterBis),
  )

  const kategorien: Record<AusgabenKategorie, number> = {
    fixkosten: 0,
    lebenshaltung: 0,
    gesundheit: 0,
    freizeit: 0,
    reisen: 0,
    einmalig: 0,
  }

  let gesamt = 0
  const jahreVergangen = jahr - basisjahr

  // Berechne Ausgaben für jede Kategorie
  for (const [kategorie, katConfig] of Object.entries(config.kategorien) as Array<
    [AusgabenKategorie, KategorieConfig]
  >) {
    if (!katConfig.aktiv) {
      kategorien[kategorie] = 0
      continue
    }

    // Basis-Ausgaben (monatlich -> jährlich)
    let jahresausgabe = katConfig.betrag * 12

    // Inflationsanpassung
    if (jahreVergangen > 0) {
      jahresausgabe *= Math.pow(1 + katConfig.inflationsrate, jahreVergangen)
    }

    // Lebensabschnitts-Anpassung
    if (anpassung) {
      jahresausgabe *= anpassung.faktoren[kategorie]
    }

    kategorien[kategorie] = Math.round(jahresausgabe * 100) / 100
    gesamt += kategorien[kategorie]
  }

  return {
    jahr,
    alter,
    lebensabschnitt,
    kategorien,
    gesamt: Math.round(gesamt * 100) / 100,
  }
}

/**
 * Berechnet Ausgaben für einen Zeitraum von Jahren
 */
export function berechneAusgabenZeitraum(
  startjahr: number,
  endjahr: number,
  config: AusgabenTrackerConfig,
): JahresAusgaben[] {
  const ergebnisse: JahresAusgaben[] = []

  for (let jahr = startjahr; jahr <= endjahr; jahr++) {
    ergebnisse.push(berechneJahresAusgaben(jahr, startjahr, config))
  }

  return ergebnisse
}

/**
 * Validiert Geburtsjahr
 */
function validateGeburtsjahr(geburtsjahr: number): string[] {
  const errors: string[] = []
  const currentYear = new Date().getFullYear()
  if (geburtsjahr < 1920 || geburtsjahr > currentYear - 18) {
    errors.push(
      `Geburtsjahr muss zwischen 1920 und ${currentYear - 18} liegen (mindestens 18 Jahre alt)`,
    )
  }
  return errors
}

/**
 * Validiert Kategorien
 */
function validateKategorien(kategorien: Record<AusgabenKategorie, KategorieConfig>): string[] {
  const errors: string[] = []
  for (const [kategorie, katConfig] of Object.entries(kategorien) as Array<
    [AusgabenKategorie, KategorieConfig]
  >) {
    if (katConfig.betrag < 0) {
      errors.push(`Betrag für ${kategorie} darf nicht negativ sein`)
    }
    if (katConfig.inflationsrate < 0 || katConfig.inflationsrate > 0.2) {
      errors.push(`Inflationsrate für ${kategorie} muss zwischen 0% und 20% liegen`)
    }
  }
  return errors
}

/**
 * Validiert Lebensabschnitte
 */
function validateLebensabschnitte(lebensabschnitte: LebensabschnittAnpassung[]): string[] {
  const errors: string[] = []

  if (lebensabschnitte.length === 0) {
    errors.push('Mindestens ein Lebensabschnitt muss konfiguriert sein')
    return errors
  }

  // Prüfe auf Überlappungen
  const sorted = [...lebensabschnitte].sort((a, b) => a.alterVon - b.alterVon)
  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i]
    const next = sorted[i + 1]
    if (current.alterBis && next.alterVon <= current.alterBis) {
      errors.push(
        `Überlappung zwischen Lebensabschnitten: ${current.alterVon}-${current.alterBis} und ${next.alterVon}`,
      )
    }
  }

  return errors
}

/**
 * Validiert eine Ausgaben-Tracker-Konfiguration
 */
export function validateAusgabenTrackerConfig(config: AusgabenTrackerConfig): string[] {
  return [
    ...validateGeburtsjahr(config.geburtsjahr),
    ...validateKategorien(config.kategorien),
    ...validateLebensabschnitte(config.lebensabschnitte),
  ]
}

/**
 * Berechnet die Gesamtausgaben über einen Zeitraum
 */
export function berechneGesamtausgaben(ausgaben: JahresAusgaben[]): number {
  return ausgaben.reduce((sum, jahr) => sum + jahr.gesamt, 0)
}

/**
 * Berechnet durchschnittliche jährliche Ausgaben
 */
export function berechneDurchschnittlicheAusgaben(ausgaben: JahresAusgaben[]): number {
  if (ausgaben.length === 0) return 0
  return berechneGesamtausgaben(ausgaben) / ausgaben.length
}

/**
 * Findet das Jahr mit den höchsten Ausgaben
 */
export function findeHoechsteAusgaben(ausgaben: JahresAusgaben[]): JahresAusgaben | null {
  if (ausgaben.length === 0) return null
  return ausgaben.reduce((max, current) => (current.gesamt > max.gesamt ? current : max))
}

/**
 * Findet das Jahr mit den niedrigsten Ausgaben
 */
export function findeNiedrigsteAusgaben(ausgaben: JahresAusgaben[]): JahresAusgaben | null {
  if (ausgaben.length === 0) return null
  return ausgaben.reduce((min, current) => (current.gesamt < min.gesamt ? current : min))
}

/**
 * Kategorienamen auf Deutsch
 */
export const KATEGORIE_NAMEN: Record<AusgabenKategorie, string> = {
  fixkosten: 'Fixkosten',
  lebenshaltung: 'Lebenshaltung',
  gesundheit: 'Gesundheit',
  freizeit: 'Freizeit',
  reisen: 'Reisen',
  einmalig: 'Einmalige Ausgaben',
}

/**
 * Lebensabschnitt-Namen auf Deutsch
 */
export const LEBENSABSCHNITT_NAMEN: Record<Lebensabschnitt, string> = {
  aktiv: 'Aktiver Ruhestand',
  eingeschraenkt: 'Eingeschränkte Mobilität',
  pflegebedarf: 'Pflegebedarf',
}

/**
 * Beschreibungen für Lebensabschnitte
 */
export const LEBENSABSCHNITT_BESCHREIBUNGEN: Record<Lebensabschnitt, string> = {
  aktiv: 'Gesund und mobil - höhere Reise- und Freizeitausgaben',
  eingeschraenkt: 'Reduzierte Mobilität - erhöhte Gesundheitskosten',
  pflegebedarf: 'Pflegebedürftig - deutlich erhöhte Gesundheits- und Pflegekosten',
}
