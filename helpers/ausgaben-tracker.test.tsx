import { describe, it, expect } from 'vitest'
import {
  createDefaultAusgabenTrackerConfig,
  getLebensabschnittFuerAlter,
  berechneJahresAusgaben,
  berechneAusgabenZeitraum,
  validateAusgabenTrackerConfig,
  berechneGesamtausgaben,
  berechneDurchschnittlicheAusgaben,
  findeHoechsteAusgaben,
  findeNiedrigsteAusgaben,
  DEFAULT_KATEGORIE_CONFIG,
  DEFAULT_LEBENSABSCHNITTE,
  type AusgabenTrackerConfig,
  type LebensabschnittAnpassung,
} from './ausgaben-tracker'

describe('ausgaben-tracker', () => {
  describe('createDefaultAusgabenTrackerConfig', () => {
    it('should create default configuration with correct geburtsjahr', () => {
      const config = createDefaultAusgabenTrackerConfig(1960)

      expect(config.geburtsjahr).toBe(1960)
      expect(config.kategorien).toEqual(DEFAULT_KATEGORIE_CONFIG)
      expect(config.lebensabschnitte).toEqual(DEFAULT_LEBENSABSCHNITTE)
    })
  })

  describe('getLebensabschnittFuerAlter', () => {
    const lebensabschnitte: LebensabschnittAnpassung[] = [
      {
        alterVon: 65,
        alterBis: 75,
        faktoren: {
          fixkosten: 1.0,
          lebenshaltung: 1.0,
          gesundheit: 1.0,
          freizeit: 1.2,
          reisen: 1.5,
          einmalig: 1.0,
        },
      },
      {
        alterVon: 75,
        alterBis: 85,
        faktoren: {
          fixkosten: 1.0,
          lebenshaltung: 1.0,
          gesundheit: 1.3,
          freizeit: 0.8,
          reisen: 0.4,
          einmalig: 0.8,
        },
      },
      {
        alterVon: 85,
        faktoren: {
          fixkosten: 1.0,
          lebenshaltung: 0.9,
          gesundheit: 2.0,
          freizeit: 0.5,
          reisen: 0.1,
          einmalig: 0.5,
        },
      },
    ]

    it('should return "aktiv" for age 65-74', () => {
      expect(getLebensabschnittFuerAlter(65, lebensabschnitte)).toBe('aktiv')
      expect(getLebensabschnittFuerAlter(70, lebensabschnitte)).toBe('aktiv')
      expect(getLebensabschnittFuerAlter(74, lebensabschnitte)).toBe('aktiv')
    })

    it('should return "eingeschraenkt" for age 75-84', () => {
      expect(getLebensabschnittFuerAlter(75, lebensabschnitte)).toBe('eingeschraenkt')
      expect(getLebensabschnittFuerAlter(80, lebensabschnitte)).toBe('eingeschraenkt')
      expect(getLebensabschnittFuerAlter(84, lebensabschnitte)).toBe('eingeschraenkt')
    })

    it('should return "pflegebedarf" for age 85+', () => {
      expect(getLebensabschnittFuerAlter(85, lebensabschnitte)).toBe('pflegebedarf')
      expect(getLebensabschnittFuerAlter(90, lebensabschnitte)).toBe('pflegebedarf')
      expect(getLebensabschnittFuerAlter(100, lebensabschnitte)).toBe('pflegebedarf')
    })

    it('should return "aktiv" as fallback for ages outside defined ranges', () => {
      expect(getLebensabschnittFuerAlter(60, lebensabschnitte)).toBe('aktiv')
    })
  })

  describe('berechneJahresAusgaben', () => {
    it('should calculate basic yearly expenses without inflation', () => {
      const config = createDefaultAusgabenTrackerConfig(1958)
      const result = berechneJahresAusgaben(2023, 2023, config)

      expect(result.jahr).toBe(2023)
      expect(result.alter).toBe(65)
      expect(result.lebensabschnitt).toBe('aktiv')

      // Fixkosten: 1200 * 12 = 14,400
      expect(result.kategorien.fixkosten).toBe(14400)
      // Lebenshaltung: 800 * 12 = 9,600
      expect(result.kategorien.lebenshaltung).toBe(9600)
      // Gesundheit: 200 * 12 = 2,400
      expect(result.kategorien.gesundheit).toBe(2400)
      // Freizeit: 300 * 12 * 1.2 (aktiv) = 4,320
      expect(result.kategorien.freizeit).toBe(4320)
      // Reisen: 200 * 12 * 1.5 (aktiv) = 3,600
      expect(result.kategorien.reisen).toBe(3600)

      // Gesamtausgaben
      expect(result.gesamt).toBe(34320)
    })

    it('should apply inflation correctly', () => {
      const config = createDefaultAusgabenTrackerConfig(1958)
      // Deactivate lebensabschnitt factors for this test to isolate inflation
      config.lebensabschnitte = []
      const result = berechneJahresAusgaben(2025, 2023, config)

      // After 2 years with 2% inflation: 14400 * (1.02^2) = 14981.76
      expect(result.kategorien.fixkosten).toBeCloseTo(14981.76, 2)
    })

    it('should apply lebensabschnitt adjustments for eingeschraenkt phase', () => {
      const config = createDefaultAusgabenTrackerConfig(1948) // Age 77 in 2025
      const result = berechneJahresAusgaben(2025, 2025, config)

      expect(result.lebensabschnitt).toBe('eingeschraenkt')

      // Gesundheit: 200 * 12 * 1.3 = 3,120
      expect(result.kategorien.gesundheit).toBe(3120)
      // Freizeit: 300 * 12 * 0.8 = 2,880
      expect(result.kategorien.freizeit).toBe(2880)
      // Reisen: 200 * 12 * 0.4 = 960
      expect(result.kategorien.reisen).toBe(960)
    })

    it('should apply lebensabschnitt adjustments for pflegebedarf phase', () => {
      const config = createDefaultAusgabenTrackerConfig(1938) // Age 87 in 2025
      const result = berechneJahresAusgaben(2025, 2025, config)

      expect(result.lebensabschnitt).toBe('pflegebedarf')

      // Gesundheit: 200 * 12 * 2.0 = 4,800
      expect(result.kategorien.gesundheit).toBe(4800)
      // Freizeit: 300 * 12 * 0.5 = 1,800
      expect(result.kategorien.freizeit).toBe(1800)
      // Reisen: 200 * 12 * 0.1 = 240
      expect(result.kategorien.reisen).toBe(240)
    })

    it('should not include inactive categories', () => {
      const config = createDefaultAusgabenTrackerConfig(1958)
      config.kategorien.einmalig.aktiv = false

      const result = berechneJahresAusgaben(2023, 2023, config)

      expect(result.kategorien.einmalig).toBe(0)
    })

    it('should handle different inflation rates per category', () => {
      const config = createDefaultAusgabenTrackerConfig(1958)
      // Gesundheit has 4% inflation
      const result2024 = berechneJahresAusgaben(2024, 2023, config)
      const result2025 = berechneJahresAusgaben(2025, 2023, config)

      // After 1 year: 2400 * 1.04 = 2496
      expect(result2024.kategorien.gesundheit).toBeCloseTo(2496, 2)
      // After 2 years: 2400 * (1.04^2) = 2595.84
      expect(result2025.kategorien.gesundheit).toBeCloseTo(2595.84, 2)
    })
  })

  describe('berechneAusgabenZeitraum', () => {
    it('should calculate expenses for multiple years', () => {
      const config = createDefaultAusgabenTrackerConfig(1958)
      const results = berechneAusgabenZeitraum(2023, 2025, config)

      expect(results).toHaveLength(3)
      expect(results[0].jahr).toBe(2023)
      expect(results[1].jahr).toBe(2024)
      expect(results[2].jahr).toBe(2025)
    })

    it('should show increasing expenses due to inflation', () => {
      const config = createDefaultAusgabenTrackerConfig(1958)
      const results = berechneAusgabenZeitraum(2023, 2025, config)

      expect(results[0].gesamt).toBeLessThan(results[1].gesamt)
      expect(results[1].gesamt).toBeLessThan(results[2].gesamt)
    })

    it('should transition between lebensabschnitte correctly', () => {
      const config = createDefaultAusgabenTrackerConfig(1950) // Age 73-77 in 2023-2027
      const results = berechneAusgabenZeitraum(2023, 2027, config)

      expect(results[0].lebensabschnitt).toBe('aktiv') // Age 73
      expect(results[1].lebensabschnitt).toBe('aktiv') // Age 74
      expect(results[2].lebensabschnitt).toBe('eingeschraenkt') // Age 75
      expect(results[3].lebensabschnitt).toBe('eingeschraenkt') // Age 76
      expect(results[4].lebensabschnitt).toBe('eingeschraenkt') // Age 77
    })
  })

  describe('validateAusgabenTrackerConfig', () => {
    it('should pass validation for valid configuration', () => {
      const config = createDefaultAusgabenTrackerConfig(1960)
      const errors = validateAusgabenTrackerConfig(config)

      expect(errors).toHaveLength(0)
    })

    it('should detect invalid geburtsjahr (too old)', () => {
      const config = createDefaultAusgabenTrackerConfig(1900)
      const errors = validateAusgabenTrackerConfig(config)

      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain('Geburtsjahr')
    })

    it('should detect invalid geburtsjahr (too young)', () => {
      const currentYear = new Date().getFullYear()
      const config = createDefaultAusgabenTrackerConfig(currentYear - 10)
      const errors = validateAusgabenTrackerConfig(config)

      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain('Geburtsjahr')
    })

    it('should detect negative betrag', () => {
      const config = createDefaultAusgabenTrackerConfig(1960)
      config.kategorien.fixkosten.betrag = -100
      const errors = validateAusgabenTrackerConfig(config)

      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some((e) => e.includes('Betrag'))).toBe(true)
    })

    it('should detect invalid inflationsrate (too high)', () => {
      const config = createDefaultAusgabenTrackerConfig(1960)
      config.kategorien.gesundheit.inflationsrate = 0.5 // 50%
      const errors = validateAusgabenTrackerConfig(config)

      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some((e) => e.includes('Inflationsrate'))).toBe(true)
    })

    it('should detect invalid inflationsrate (negative)', () => {
      const config = createDefaultAusgabenTrackerConfig(1960)
      config.kategorien.lebenshaltung.inflationsrate = -0.05
      const errors = validateAusgabenTrackerConfig(config)

      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some((e) => e.includes('Inflationsrate'))).toBe(true)
    })

    it('should detect missing lebensabschnitte', () => {
      const config = createDefaultAusgabenTrackerConfig(1960)
      config.lebensabschnitte = []
      const errors = validateAusgabenTrackerConfig(config)

      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some((e) => e.includes('Lebensabschnitt'))).toBe(true)
    })

    it('should detect overlapping lebensabschnitte', () => {
      const config = createDefaultAusgabenTrackerConfig(1960)
      config.lebensabschnitte = [
        {
          alterVon: 65,
          alterBis: 75,
          faktoren: {
            fixkosten: 1.0,
            lebenshaltung: 1.0,
            gesundheit: 1.0,
            freizeit: 1.2,
            reisen: 1.5,
            einmalig: 1.0,
          },
        },
        {
          alterVon: 70, // Overlaps with previous
          alterBis: 80,
          faktoren: {
            fixkosten: 1.0,
            lebenshaltung: 1.0,
            gesundheit: 1.3,
            freizeit: 0.8,
            reisen: 0.4,
            einmalig: 0.8,
          },
        },
      ]
      const errors = validateAusgabenTrackerConfig(config)

      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some((e) => e.includes('Überlappung'))).toBe(true)
    })
  })

  describe('berechneGesamtausgaben', () => {
    it('should calculate total expenses over all years', () => {
      const config = createDefaultAusgabenTrackerConfig(1958)
      const ausgaben = berechneAusgabenZeitraum(2023, 2025, config)
      const gesamt = berechneGesamtausgaben(ausgaben)

      // Should match sum of all year totals
      expect(gesamt).toBe(
        ausgaben.reduce((sum, jahr) => sum + jahr.gesamt, 0),
      )
      // 3 years of expenses (einmalig is inactive by default)
      // Around 20k per year = 60k for 3 years
      expect(gesamt).toBeGreaterThan(50000)
      expect(gesamt).toBeLessThan(70000)
    })

    it('should show higher expenses when einmalig is active', () => {
      const config = createDefaultAusgabenTrackerConfig(1958)
      config.kategorien.einmalig.aktiv = true
      const ausgaben = berechneAusgabenZeitraum(2023, 2025, config)
      const gesamt = berechneGesamtausgaben(ausgaben)

      // With einmalig active, should be higher
      expect(gesamt).toBeGreaterThan(60000)
    })

    it('should return 0 for empty array', () => {
      expect(berechneGesamtausgaben([])).toBe(0)
    })
  })

  describe('berechneDurchschnittlicheAusgaben', () => {
    it('should calculate average yearly expenses', () => {
      const config = createDefaultAusgabenTrackerConfig(1958)
      const ausgaben = berechneAusgabenZeitraum(2023, 2025, config)
      const durchschnitt = berechneDurchschnittlicheAusgaben(ausgaben)

      const gesamt = berechneGesamtausgaben(ausgaben)
      expect(durchschnitt).toBeCloseTo(gesamt / ausgaben.length, 2)
    })

    it('should return 0 for empty array', () => {
      expect(berechneDurchschnittlicheAusgaben([])).toBe(0)
    })
  })

  describe('findeHoechsteAusgaben', () => {
    it('should find year with highest expenses', () => {
      const config = createDefaultAusgabenTrackerConfig(1950) // Will transition through phases
      const ausgaben = berechneAusgabenZeitraum(2023, 2030, config)
      const hoechste = findeHoechsteAusgaben(ausgaben)

      expect(hoechste).not.toBeNull()
      if (hoechste) {
        // Should be one of the later years due to inflation
        expect(hoechste.jahr).toBeGreaterThanOrEqual(2025)

        // Verify it's actually the highest
        const alleAusgaben = ausgaben.map((a) => a.gesamt)
        expect(hoechste.gesamt).toBe(Math.max(...alleAusgaben))
      }
    })

    it('should return null for empty array', () => {
      expect(findeHoechsteAusgaben([])).toBeNull()
    })
  })

  describe('findeNiedrigsteAusgaben', () => {
    it('should find year with lowest expenses', () => {
      const config = createDefaultAusgabenTrackerConfig(1950)
      const ausgaben = berechneAusgabenZeitraum(2023, 2030, config)
      const niedrigste = findeNiedrigsteAusgaben(ausgaben)

      expect(niedrigste).not.toBeNull()
      if (niedrigste) {
        // Verify it's actually the lowest
        const alleAusgaben = ausgaben.map((a) => a.gesamt)
        expect(niedrigste.gesamt).toBe(Math.min(...alleAusgaben))

        // Should be one of the earlier years (before major inflation) or a year with lower lebensabschnitt factors
        expect(niedrigste.jahr).toBeGreaterThanOrEqual(2023)
        expect(niedrigste.jahr).toBeLessThanOrEqual(2030)
      }
    })

    it('should return null for empty array', () => {
      expect(findeNiedrigsteAusgaben([])).toBeNull()
    })
  })

  describe('DEFAULT values', () => {
    it('DEFAULT_KATEGORIE_CONFIG should have all categories', () => {
      expect(Object.keys(DEFAULT_KATEGORIE_CONFIG)).toHaveLength(6)
      expect(DEFAULT_KATEGORIE_CONFIG.fixkosten).toBeDefined()
      expect(DEFAULT_KATEGORIE_CONFIG.lebenshaltung).toBeDefined()
      expect(DEFAULT_KATEGORIE_CONFIG.gesundheit).toBeDefined()
      expect(DEFAULT_KATEGORIE_CONFIG.freizeit).toBeDefined()
      expect(DEFAULT_KATEGORIE_CONFIG.reisen).toBeDefined()
      expect(DEFAULT_KATEGORIE_CONFIG.einmalig).toBeDefined()
    })

    it('DEFAULT_LEBENSABSCHNITTE should have 3 phases', () => {
      expect(DEFAULT_LEBENSABSCHNITTE).toHaveLength(3)
      expect(DEFAULT_LEBENSABSCHNITTE[0].alterVon).toBe(65)
      expect(DEFAULT_LEBENSABSCHNITTE[1].alterVon).toBe(75)
      expect(DEFAULT_LEBENSABSCHNITTE[2].alterVon).toBe(85)
    })
  })

  describe('Integration tests', () => {
    it('should handle complete retirement planning scenario', () => {
      // 65-year-old retiring in 2023, planning until age 90
      const config = createDefaultAusgabenTrackerConfig(1958)
      const ausgaben = berechneAusgabenZeitraum(2023, 2048, config)

      // Should have 26 years of data
      expect(ausgaben).toHaveLength(26)

      // First year should be aktiv phase
      expect(ausgaben[0].lebensabschnitt).toBe('aktiv')

      // Age 75 (2033) should transition to eingeschraenkt
      const age75 = ausgaben.find((a) => a.alter === 75)
      expect(age75?.lebensabschnitt).toBe('eingeschraenkt')

      // Age 85 (2043) should transition to pflegebedarf
      const age85 = ausgaben.find((a) => a.alter === 85)
      expect(age85?.lebensabschnitt).toBe('pflegebedarf')

      // Total expenses should be substantial
      const gesamt = berechneGesamtausgaben(ausgaben)
      expect(gesamt).toBeGreaterThan(1000000) // Over 1 million euros for 26 years

      // Expenses should generally increase over time (due to inflation)
      const first5Years = ausgaben.slice(0, 5)
      const last5Years = ausgaben.slice(-5)
      const avgFirst5 = berechneDurchschnittlicheAusgaben(first5Years)
      const avgLast5 = berechneDurchschnittlicheAusgaben(last5Years)
      expect(avgLast5).toBeGreaterThan(avgFirst5)
    })

    it('should handle custom configuration', () => {
      const config: AusgabenTrackerConfig = {
        geburtsjahr: 1965,
        kategorien: {
          fixkosten: { betrag: 1500, inflationsrate: 0.02, aktiv: true },
          lebenshaltung: { betrag: 1000, inflationsrate: 0.025, aktiv: true },
          gesundheit: { betrag: 300, inflationsrate: 0.04, aktiv: true },
          freizeit: { betrag: 400, inflationsrate: 0.02, aktiv: true },
          reisen: { betrag: 500, inflationsrate: 0.03, aktiv: true },
          einmalig: { betrag: 200, inflationsrate: 0.02, aktiv: true },
        },
        lebensabschnitte: [
          {
            alterVon: 60,
            alterBis: 70,
            faktoren: {
              fixkosten: 1.0,
              lebenshaltung: 1.1,
              gesundheit: 1.0,
              freizeit: 1.3,
              reisen: 1.6,
              einmalig: 1.2,
            },
          },
        ],
      }

      const errors = validateAusgabenTrackerConfig(config)
      expect(errors).toHaveLength(0)

      const result = berechneJahresAusgaben(2025, 2025, config)
      expect(result.gesamt).toBeGreaterThan(40000) // Higher due to custom configuration
    })
  })
})
