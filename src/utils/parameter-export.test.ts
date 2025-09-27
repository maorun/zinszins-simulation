/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { formatParametersForExport, copyParametersToClipboard } from './parameter-export'
import type { SimulationContextState } from '../contexts/SimulationContext'

// Mock the navigator.clipboard API
const mockClipboard = {
  writeText: vi.fn(),
}

Object.assign(navigator, {
  clipboard: mockClipboard,
})

describe('Parameter Export', () => {
  let mockContext: SimulationContextState

  beforeEach(() => {
    mockClipboard.writeText.mockReset()

    // Create a minimal mock context with required properties
    mockContext = {
      rendite: 5.0,
      steuerlast: 26.375,
      teilfreistellungsquote: 30.0,
      freibetragPerYear: { 2023: 2000 },
      steuerReduzierenEndkapitalSparphase: true,
      steuerReduzierenEndkapitalEntspharphase: false,
      returnMode: 'fixed' as const,
      averageReturn: 7.0,
      standardDeviation: 15.0,
      variableReturns: {},
      // Inflation settings for savings phase
      inflationAktivSparphase: true,
      inflationsrateSparphase: 2.5,
      startEnd: [2023, 2040] as [number, number],
      sparplan: [],
      simulationAnnual: 'yearly' as const,
      // Global End of Life and life expectancy settings
      endOfLife: 2080,
      lifeExpectancyTable: 'german_2020_22' as const,
      customLifeExpectancy: undefined,
      withdrawalConfig: null,
      // Mock functions (not used in formatting)
      setRendite: vi.fn(),
      setSteuerlast: vi.fn(),
      setTeilfreistellungsquote: vi.fn(),
      setFreibetragPerYear: vi.fn(),
      setSteuerReduzierenEndkapitalSparphase: vi.fn(),
      setSteuerReduzierenEndkapitalEntspharphase: vi.fn(),
      setReturnMode: vi.fn(),
      setAverageReturn: vi.fn(),
      setStandardDeviation: vi.fn(),
      setRandomSeed: vi.fn(),
      setVariableReturns: vi.fn(),
      // Inflation setter functions
      setInflationAktivSparphase: vi.fn(),
      setInflationsrateSparphase: vi.fn(),
      setStartEnd: vi.fn(),
      setSparplan: vi.fn(),
      setSimulationAnnual: vi.fn(),
      setSparplanElemente: vi.fn(),
      setWithdrawalResults: vi.fn(),
      performSimulation: vi.fn(),
      saveCurrentConfiguration: vi.fn(),
      loadSavedConfiguration: vi.fn(),
      resetToDefaults: vi.fn(),
      setWithdrawalConfig: vi.fn(),
      sparplanElemente: [],
      simulationData: {},
      isLoading: false,
      withdrawalResults: null,
      // Global End of Life setters
      setEndOfLife: vi.fn(),
      setLifeExpectancyTable: vi.fn(),
      setCustomLifeExpectancy: vi.fn(),
    } as any
  })

  describe('formatParametersForExport', () => {
    it('should format basic financial parameters correctly', () => {
      const result = formatParametersForExport(mockContext)

      expect(result).toContain('Rendite: 5.00 %')
      expect(result).toContain('Kapitalertragsteuer: 26.38 %')
      expect(result).toContain('Teilfreistellungsquote: 30.00 %')
    })

    it('should format time range and simulation settings', () => {
      const result = formatParametersForExport(mockContext)

      expect(result).toContain('Zeitraum: 2023 - 2040')
      expect(result).toContain('Simulationsmodus: Jährlich')
      expect(result).toContain('Rendite-Modus: Fest')
    })

    it('should format tax allowances with Euro currency', () => {
      const result = formatParametersForExport(mockContext)

      expect(result).toContain('Freibeträge pro Jahr:')
      expect(result).toContain('  2023: 2.000,00\u00A0€') // Note: \u00A0 is non-breaking space from German locale formatting
    })

    it('should format inflation settings for savings phase when enabled', () => {
      const result = formatParametersForExport(mockContext)

      expect(result).toContain('Inflation Sparphase: Ja')
      expect(result).toContain('Inflationsrate Sparphase: 2.50 %')
    })

    it('should format inflation settings for savings phase when disabled', () => {
      mockContext.inflationAktivSparphase = false

      const result = formatParametersForExport(mockContext)

      expect(result).toContain('Inflation Sparphase: Nein')
      expect(result).not.toContain('Inflationsrate Sparphase:')
    })

    it('should handle context without optional configurations', () => {
      mockContext.freibetragPerYear = {}
      mockContext.sparplan = []
      mockContext.withdrawalConfig = null

      const result = formatParametersForExport(mockContext)

      expect(result).toContain('Rendite: 5.00 %')
      expect(result).not.toContain('Freibeträge pro Jahr:')
      expect(result).not.toContain('Sparpläne:')
      // Withdrawal configuration should always be included, even when null
      expect(result).toContain('Entnahme-Konfiguration:')
      expect(result).toContain('Lebensende: 2040 (Standard)')
      expect(result).toContain('Strategie: 4% Regel (Standard)')
    })

    it('should include withdrawal parameters even when no config exists', () => {
      mockContext.withdrawalConfig = null

      const result = formatParametersForExport(mockContext)

      expect(result).toContain('Entnahme-Konfiguration:')
      expect(result).toContain('Lebensende: 2040 (Standard)')
      expect(result).toContain('Strategie: 4% Regel (Standard)')
      expect(result).toContain('Entnahme-Rendite: 5.00 % (Standard)')
      expect(result).toContain('Entnahme-Häufigkeit: Jährlich (Standard)')
      expect(result).toContain('Inflation aktiv: Nein (Standard)')
      expect(result).toContain('Grundfreibetrag aktiv: Nein (Standard)')
      expect(result).toContain('Entnahme-Rendite-Modus: Fest (Standard)')
    })

    it('should include full withdrawal parameters when config exists', () => {
      mockContext.withdrawalConfig = {
        formValue: {
          strategie: 'monatlich_fest',
          rendite: 4.5,
          withdrawalFrequency: 'monthly',
          inflationAktiv: true,
          inflationsrate: 2.5,
          monatlicheBetrag: 3000,
          guardrailsAktiv: true,
          guardrailsSchwelle: 15,
          variabelProzent: 5,
          dynamischBasisrate: 4,
          dynamischObereSchwell: 8,
          dynamischObereAnpassung: 5,
          dynamischUntereSchwell: 2,
          dynamischUntereAnpassung: -5,
          rmdStartAge: 65,
          kapitalerhaltNominalReturn: 7,
          kapitalerhaltInflationRate: 2,
          grundfreibetragAktiv: true,
          grundfreibetragBetrag: 11000,
          einkommensteuersatz: 28,
        },
        withdrawalReturnMode: 'random',
        withdrawalVariableReturns: {},
        withdrawalAverageReturn: 6.5,
        withdrawalStandardDeviation: 18,
        withdrawalRandomSeed: 12345,
        useSegmentedWithdrawal: false,
        withdrawalSegments: [],
        useComparisonMode: false,
        comparisonStrategies: [],
        useSegmentedComparisonMode: false,
        segmentedComparisonStrategies: [],
      }

      const result = formatParametersForExport(mockContext)

      expect(result).toContain('Entnahme-Konfiguration:')
      expect(result).toContain('Lebensende: 2080')
      expect(result).toContain('Strategie: Monatliche Entnahme')
      expect(result).toContain('Entnahme-Rendite: 4.50 %')
      expect(result).toContain('Entnahme-Häufigkeit: Monatlich')
      expect(result).toContain('Inflation aktiv: Ja (2.50 %)')
      expect(result).toContain('Monatlicher Betrag: 3.000,00\u00A0€')
      expect(result).toContain('Guardrails aktiv: Ja (15.0 %)')
      expect(result).toContain('Grundfreibetrag aktiv: Ja')
      expect(result).toContain('Grundfreibetrag: 11.000,00\u00A0€')
      expect(result).toContain('Einkommensteuersatz: 28.00 %')
      expect(result).toContain('Entnahme-Rendite-Modus: Zufällig')
      expect(result).toContain('Entnahme-Durchschnittsrendite: 6.50 %')
      expect(result).toContain('Entnahme-Standardabweichung: 18.00 %')
    })

    it('should include detailed segmented withdrawal configuration', () => {
      mockContext.withdrawalConfig = {
        formValue: {
          strategie: '4prozent',
          rendite: 5.0,
          withdrawalFrequency: 'yearly',
          inflationAktiv: false,
          inflationsrate: 2.0,
          monatlicheBetrag: 3000,
          guardrailsAktiv: false,
          guardrailsSchwelle: 15,
          variabelProzent: 5,
          dynamischBasisrate: 4,
          dynamischObereSchwell: 8,
          dynamischObereAnpassung: 5,
          dynamischUntereSchwell: 2,
          dynamischUntereAnpassung: -5,
          rmdStartAge: 65,
          kapitalerhaltNominalReturn: 7,
          kapitalerhaltInflationRate: 2,
          grundfreibetragAktiv: false,
          grundfreibetragBetrag: 11000,
          einkommensteuersatz: 28,
        },
        withdrawalReturnMode: 'fixed',
        withdrawalVariableReturns: {},
        withdrawalAverageReturn: 6.5,
        withdrawalStandardDeviation: 18,
        withdrawalRandomSeed: undefined,
        useSegmentedWithdrawal: true,
        withdrawalSegments: [
          {
            id: 'phase1',
            name: 'Frühphase',
            startYear: 2040,
            endYear: 2060,
            strategy: 'variabel_prozent',
            withdrawalFrequency: 'yearly',
            returnConfig: {
              mode: 'fixed',
              fixedRate: 0.06,
            },
            customPercentage: 3.5,
            inflationConfig: {
              inflationRate: 0.02,
            },
            enableGrundfreibetrag: true,
            incomeTaxRate: 25,
            steuerReduzierenEndkapital: true,
          },
          {
            id: 'phase2',
            name: 'Spätphase',
            startYear: 2061,
            endYear: 2080,
            strategy: 'monatlich_fest',
            withdrawalFrequency: 'monthly',
            returnConfig: {
              mode: 'random',
              randomConfig: {
                averageReturn: 0.04,
                standardDeviation: 0.12,
              },
            },
            monthlyConfig: {
              monthlyAmount: 2500,
              enableGuardrails: true,
              guardrailsThreshold: 20.0,
            },
            inflationConfig: {
              inflationRate: 0.025,
            },
            enableGrundfreibetrag: false,
            steuerReduzierenEndkapital: false,
          },
        ],
        useComparisonMode: false,
        comparisonStrategies: [],
        useSegmentedComparisonMode: false,
        segmentedComparisonStrategies: [],
      }

      const result = formatParametersForExport(mockContext)

      expect(result).toContain('Segmentierte Entnahme: Ja')
      expect(result).toContain('Anzahl Segmente: 2')
      expect(result).toContain('Segment-Details:')

      // First segment details
      expect(result).toContain('Segment 1 (Frühphase):')
      expect(result).toContain('Zeitraum: 2040 - 2060')
      expect(result).toContain('Strategie: Variabler Prozentsatz')
      expect(result).toContain('Häufigkeit: Jährlich')
      expect(result).toContain('Rendite-Modus: Fest')
      expect(result).toContain('Rendite: 6.00 %')
      expect(result).toContain('Variabler Prozentsatz: 3.50 %')
      expect(result).toContain('Inflation: 2.00 %')
      expect(result).toContain('Grundfreibetrag aktiv: Ja')
      expect(result).toContain('Einkommensteuersatz: 25.00 %')
      expect(result).toContain('Steuerreduzierung: Ja')

      // Second segment details
      expect(result).toContain('Segment 2 (Spätphase):')
      expect(result).toContain('Zeitraum: 2061 - 2080')
      expect(result).toContain('Strategie: Monatliche Entnahme')
      expect(result).toContain('Häufigkeit: Monatlich')
      expect(result).toContain('Rendite-Modus: Zufällig')
      expect(result).toContain('Durchschnittsrendite: 4.00 %')
      expect(result).toContain('Standardabweichung: 12.00 %')
      expect(result).toContain('Monatlicher Betrag: 2.500,00\u00A0€')
      expect(result).toContain('Guardrails: 20.0 %')
      expect(result).toContain('Inflation: 2.50 %')
      expect(result).toContain('Steuerreduzierung: Nein')
    })

    it('should include bucket strategy configuration in segmented withdrawal', () => {
      mockContext.withdrawalConfig = {
        formValue: {
          strategie: '4prozent',
          rendite: 5.0,
          withdrawalFrequency: 'yearly',
          inflationAktiv: false,
          inflationsrate: 2.0,
          monatlicheBetrag: 3000,
          guardrailsAktiv: false,
          guardrailsSchwelle: 15,
          variabelProzent: 5,
          dynamischBasisrate: 4,
          dynamischObereSchwell: 8,
          dynamischObereAnpassung: 5,
          dynamischUntereSchwell: 2,
          dynamischUntereAnpassung: -5,
          rmdStartAge: 65,
          kapitalerhaltNominalReturn: 7,
          kapitalerhaltInflationRate: 2,
          grundfreibetragAktiv: false,
          grundfreibetragBetrag: 11000,
          einkommensteuersatz: 28,
        },
        withdrawalReturnMode: 'fixed',
        withdrawalVariableReturns: {},
        withdrawalAverageReturn: 5.0,
        withdrawalStandardDeviation: 15,
        withdrawalRandomSeed: undefined,
        useSegmentedWithdrawal: true,
        withdrawalSegments: [
          {
            id: 'bucket_phase',
            name: 'Hauptphase',
            startYear: 2036,
            endYear: 2045,
            strategy: 'bucket_strategie',
            withdrawalFrequency: 'monthly',
            returnConfig: {
              mode: 'fixed',
              fixedRate: 0.05,
            },
            bucketConfig: {
              initialCashCushion: 20000,
              refillThreshold: 5000,
              refillPercentage: 0.5,
              baseWithdrawalRate: 0.04,
              subStrategy: 'monatlich_fest',
              monatlicheBetrag: 2000,
            },
            inflationConfig: {
              inflationRate: 0.02,
            },
            enableGrundfreibetrag: true,
            incomeTaxRate: 18,
            steuerReduzierenEndkapital: true,
          },
        ],
        useComparisonMode: false,
        comparisonStrategies: [],
        useSegmentedComparisonMode: false,
        segmentedComparisonStrategies: [],
      }

      const result = formatParametersForExport(mockContext)

      expect(result).toContain('Segmentierte Entnahme: Ja')
      expect(result).toContain('Anzahl Segmente: 1')
      expect(result).toContain('Segment-Details:')

      // Bucket strategy segment details
      expect(result).toContain('Segment 1 (Hauptphase):')
      expect(result).toContain('Zeitraum: 2036 - 2045')
      expect(result).toContain('Strategie: Drei-Eimer-Strategie')
      expect(result).toContain('Häufigkeit: Monatlich')
      expect(result).toContain('Rendite-Modus: Fest')
      expect(result).toContain('Rendite: 5.00 %')

      // Bucket strategy specific configuration
      expect(result).toContain('Sub-Strategie: Monatlich fest')
      expect(result).toContain('Initiales Cash-Polster: 20.000,00\u00A0€')
      expect(result).toContain('Auffüll-Schwellenwert: 5.000,00\u00A0€')
      expect(result).toContain('Auffüll-Anteil: 50 %')
      expect(result).toContain('Monatlicher Betrag: 2.000,00\u00A0€')

      // Common segment details
      expect(result).toContain('Inflation: 2.00 %')
      expect(result).toContain('Grundfreibetrag aktiv: Ja')
      expect(result).toContain('Einkommensteuersatz: 18.00 %')
      expect(result).toContain('Steuerreduzierung: Ja')
    })

    it('should include bucket strategy with dynamic sub-strategy configuration', () => {
      mockContext.withdrawalConfig = {
        formValue: {
          strategie: '4prozent',
          rendite: 5.0,
          withdrawalFrequency: 'yearly',
          inflationAktiv: false,
          inflationsrate: 2.0,
          monatlicheBetrag: 3000,
          guardrailsAktiv: false,
          guardrailsSchwelle: 15,
          variabelProzent: 5,
          dynamischBasisrate: 4,
          dynamischObereSchwell: 8,
          dynamischObereAnpassung: 5,
          dynamischUntereSchwell: 2,
          dynamischUntereAnpassung: -5,
          rmdStartAge: 65,
          kapitalerhaltNominalReturn: 7,
          kapitalerhaltInflationRate: 2,
          grundfreibetragAktiv: false,
          grundfreibetragBetrag: 11000,
          einkommensteuersatz: 28,
        },
        withdrawalReturnMode: 'fixed',
        withdrawalVariableReturns: {},
        withdrawalAverageReturn: 5.0,
        withdrawalStandardDeviation: 15,
        withdrawalRandomSeed: undefined,
        useSegmentedWithdrawal: true,
        withdrawalSegments: [
          {
            id: 'bucket_dynamic_phase',
            name: 'Dynamische Phase',
            startYear: 2050,
            endYear: 2080,
            strategy: 'bucket_strategie',
            withdrawalFrequency: 'monthly',
            returnConfig: {
              mode: 'fixed',
              fixedRate: 0.05,
            },
            bucketConfig: {
              initialCashCushion: 30000,
              refillThreshold: 7500,
              refillPercentage: 0.3,
              baseWithdrawalRate: 0.04,
              subStrategy: 'dynamisch',
              dynamischBasisrate: 4.5,
              dynamischObereSchwell: 8.5,
              dynamischObereAnpassung: 10,
              dynamischUntereSchwell: 1.5,
              dynamischUntereAnpassung: -8,
            },
            inflationConfig: {
              inflationRate: 0.02,
            },
            enableGrundfreibetrag: false,
            steuerReduzierenEndkapital: true,
          },
        ],
        useComparisonMode: false,
        comparisonStrategies: [],
        useSegmentedComparisonMode: false,
        segmentedComparisonStrategies: [],
      }

      const result = formatParametersForExport(mockContext)

      expect(result).toContain('Strategie: Drei-Eimer-Strategie')
      expect(result).toContain('Sub-Strategie: Dynamische Strategie')
      expect(result).toContain('Initiales Cash-Polster: 30.000,00\u00A0€')
      expect(result).toContain('Auffüll-Schwellenwert: 7.500,00\u00A0€')
      expect(result).toContain('Auffüll-Anteil: 30 %')

      // Dynamic sub-strategy specific configuration
      expect(result).toContain('Dynamische Basisrate: 4.50 %')
      expect(result).toContain('Obere Schwelle: 8.50 %')
      expect(result).toContain('Obere Anpassung: 10.00 %')
      expect(result).toContain('Untere Schwelle: 1.50 %')
      expect(result).toContain('Untere Anpassung: -8.00 %')
    })
  })

  describe('copyParametersToClipboard', () => {
    it('should successfully copy parameters to clipboard', async () => {
      mockClipboard.writeText.mockResolvedValue(undefined)

      const result = await copyParametersToClipboard(mockContext)

      expect(result).toBe(true)
      expect(mockClipboard.writeText).toHaveBeenCalledOnce()
    })

    it('should handle clipboard errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockClipboard.writeText.mockRejectedValue(new Error('Clipboard access denied'))

      const result = await copyParametersToClipboard(mockContext)

      expect(result).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to copy parameters to clipboard:',
        expect.any(Error),
      )
    })
  })
})

describe('Parameter Export Special Events', () => {
  let mockContext: SimulationContextState

  beforeEach(() => {
    // Create a minimal mock context with required properties for special events
    mockContext = {
      rendite: 5.0,
      steuerlast: 26.375,
      teilfreistellungsquote: 30.0,
      freibetragPerYear: {},
      steuerReduzierenEndkapitalSparphase: true,
      steuerReduzierenEndkapitalEntspharphase: true,
      returnMode: 'fixed' as const,
      averageReturn: 7.0,
      standardDeviation: 15.0,
      variableReturns: {},
      inflationAktivSparphase: false,
      inflationsrateSparphase: 2.0,
      startEnd: [2025, 2040] as [number, number],
      sparplan: [],
      simulationAnnual: 'yearly' as const,
      endOfLife: 2080,
      lifeExpectancyTable: 'german_2020_22' as const,
      customLifeExpectancy: undefined,
      withdrawalConfig: null,
      // Mock functions (not used in formatting)
      setRendite: vi.fn(),
      setSteuerlast: vi.fn(),
      setTeilfreistellungsquote: vi.fn(),
      setFreibetragPerYear: vi.fn(),
      setSteuerReduzierenEndkapitalSparphase: vi.fn(),
      setSteuerReduzierenEndkapitalEntspharphase: vi.fn(),
      setReturnMode: vi.fn(),
      setAverageReturn: vi.fn(),
      setStandardDeviation: vi.fn(),
      setRandomSeed: vi.fn(),
      setVariableReturns: vi.fn(),
      setInflationAktivSparphase: vi.fn(),
      setInflationsrateSparphase: vi.fn(),
      setStartEnd: vi.fn(),
      setSparplan: vi.fn(),
      setSimulationAnnual: vi.fn(),
      setSparplanElemente: vi.fn(),
      setWithdrawalResults: vi.fn(),
      performSimulation: vi.fn(),
      saveCurrentConfiguration: vi.fn(),
      loadSavedConfiguration: vi.fn(),
      resetToDefaults: vi.fn(),
      setWithdrawalConfig: vi.fn(),
      sparplanElemente: [],
      simulationData: {},
      isLoading: false,
      withdrawalResults: null,
      setEndOfLife: vi.fn(),
      setLifeExpectancyTable: vi.fn(),
      setCustomLifeExpectancy: vi.fn(),
    } as any
  })

  it('should export inheritance event correctly', () => {
    mockContext.sparplan = [
      {
        id: 1,
        start: new Date('2025-06-01'),
        end: new Date('2025-06-01'),
        einzahlung: 75000,
        eventType: 'inheritance',
        specialEventData: {
          relationshipType: 'child',
          grossInheritanceAmount: 80000,
          description: 'Erbschaft Großeltern',
        },
      },
    ]

    const result = formatParametersForExport(mockContext)

    expect(result).toContain('Sparpläne und Sonderereignisse:')
    expect(result).toContain('Erbschaft 1:')
    expect(result).toContain('Betrag: 75.000,00\u00A0€')
    expect(result).toContain('Verwandtschaftsgrad: child')
    expect(result).toContain('Brutto-Erbschaft: 80.000,00\u00A0€')
    expect(result).toContain('Beschreibung: Erbschaft Großeltern')
  })

  it('should export expense event with credit correctly', () => {
    mockContext.sparplan = [
      {
        id: 1,
        start: new Date('2025-08-15'),
        end: new Date('2025-08-15'),
        einzahlung: -25000,
        eventType: 'expense',
        specialEventData: {
          expenseType: 'car',
          description: 'Neuwagenkauf Tesla',
          creditTerms: {
            interestRate: 0.045,
            termYears: 5,
            monthlyPayment: 466.08,
          },
        },
      },
    ]

    const result = formatParametersForExport(mockContext)

    expect(result).toContain('Sparpläne und Sonderereignisse:')
    expect(result).toContain('Ausgabe 1:')
    expect(result).toContain('Betrag: 25.000,00\u00A0€ (Ausgabe)')
    expect(result).toContain('Ausgabentyp: car')
    expect(result).toContain('Kredit: 4.5% für 5 Jahre')
    expect(result).toContain('Monatliche Rate: 466,08\u00A0€')
    expect(result).toContain('Beschreibung: Neuwagenkauf Tesla')
  })

  it('should export mixed savings plans and special events', () => {
    mockContext.sparplan = [
      {
        id: 1,
        start: new Date('2025-01-01'),
        end: null,
        einzahlung: 24000,
      },
      {
        id: 2,
        start: new Date('2025-06-01'),
        end: new Date('2025-06-01'),
        einzahlung: 50000,
        eventType: 'inheritance',
        specialEventData: {
          relationshipType: 'spouse',
          grossInheritanceAmount: 50000,
          description: 'Lebensversicherung',
        },
      },
      {
        id: 3,
        start: new Date('2025-12-01'),
        end: new Date('2025-12-01'),
        einzahlung: 5000,
      },
      {
        id: 4,
        start: new Date('2026-03-01'),
        end: new Date('2026-03-01'),
        einzahlung: -15000,
        eventType: 'expense',
        specialEventData: {
          expenseType: 'medical',
          description: 'Zahnbehandlung',
        },
      },
    ]

    const result = formatParametersForExport(mockContext)

    expect(result).toContain('Sparpläne und Sonderereignisse:')
    expect(result).toContain('Sparplan 1:')
    expect(result).toContain('Betrag: 24.000,00\u00A0€')
    expect(result).toContain('Ende: Unbegrenzt')

    expect(result).toContain('Erbschaft 2:')
    expect(result).toContain('Verwandtschaftsgrad: spouse')

    expect(result).toContain('Einmalzahlung 3:')
    expect(result).toContain('Betrag: 5.000,00\u00A0€')

    expect(result).toContain('Ausgabe 4:')
    expect(result).toContain('Betrag: 15.000,00\u00A0€ (Ausgabe)')
    expect(result).toContain('Ausgabentyp: medical')
    expect(result).toContain('Beschreibung: Zahnbehandlung')
  })

  it('should handle special events without optional fields', () => {
    mockContext.sparplan = [
      {
        id: 1,
        start: new Date('2025-01-01'),
        end: new Date('2025-01-01'),
        einzahlung: 30000,
        eventType: 'inheritance',
        specialEventData: {
          relationshipType: 'sibling',
        },
      },
      {
        id: 2,
        start: new Date('2025-06-01'),
        end: new Date('2025-06-01'),
        einzahlung: -10000,
        eventType: 'expense',
        specialEventData: {
          expenseType: 'other',
        },
      },
    ]

    const result = formatParametersForExport(mockContext)

    expect(result).toContain('Erbschaft 1:')
    expect(result).toContain('Verwandtschaftsgrad: sibling')
    expect(result).not.toContain('Brutto-Erbschaft:')
    expect(result).not.toContain('Beschreibung:')

    expect(result).toContain('Ausgabe 2:')
    expect(result).toContain('Ausgabentyp: other')
    expect(result).not.toContain('Kredit:')
    expect(result).not.toContain('Beschreibung:')
  })

  it('should export cost factors for special events', () => {
    mockContext.sparplan = [
      {
        id: 1,
        start: new Date('2025-01-01'),
        end: new Date('2025-01-01'),
        einzahlung: 40000,
        eventType: 'inheritance',
        specialEventData: {
          relationshipType: 'child',
          description: 'Erbschaft mit Kosten',
        },
        ter: 0.75,
        transactionCostPercent: 0.25,
        transactionCostAbsolute: 15.0,
      },
    ]

    const result = formatParametersForExport(mockContext)

    expect(result).toContain('Erbschaft 1:')
    expect(result).toContain('TER: 0.75 %')
    expect(result).toContain('Transaktionskosten: 0.25 %')
    expect(result).toContain('Absolute Transaktionskosten: 15,00\u00A0€')
  })
})
