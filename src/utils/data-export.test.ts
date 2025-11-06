import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  exportSavingsDataToCSV,
  exportWithdrawalDataToCSV,
  exportDataToMarkdown,
  generateCalculationExplanations,
  downloadTextAsFile,
  copyTextToClipboard,
  type ExportData,
} from './data-export'
import type { SimulationContextState } from '../contexts/SimulationContext'
import type { WithdrawalResult } from '../../helpers/withdrawal'
import type { MockSavingsData } from '../test-utils/types'
import type { WithdrawalFormValue } from './config-storage'

// Mock the clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
})

// Mock DOM methods
global.URL.createObjectURL = vi.fn()
global.URL.revokeObjectURL = vi.fn()

describe('data-export', () => {
  let mockContext: SimulationContextState
  let mockSavingsData: MockSavingsData
  let mockWithdrawalData: WithdrawalResult

  beforeEach(() => {
    mockContext = {
      rendite: 5.0,
      steuerlast: 26.375,
      teilfreistellungsquote: 30.0,
      freibetragPerYear: { 2023: 2000, 2024: 2000 },
      startEnd: [2023, 2040] as [number, number],
      simulationAnnual: 'yearly' as const,
      grundfreibetragAktiv: false,
      grundfreibetragBetrag: 11604,
      sparplan: [
        {
          id: 1,
          start: new Date('2023-01-01'),
          end: new Date('2040-12-31'),
          einzahlung: 2000,
        },
      ],
      sparplanElemente: [
        {
          name: 'Hauptsparplan',
          start: new Date('2023-01-01'),
          end: new Date('2040-12-31'),
          amount: 2000,
          monthlyAmount: 2000,
        },
      ],
      withdrawalConfig: {
        formValue: {
          strategie: '4prozent' as const,
          endOfLife: 2080,
          rendite: 5.0,
          withdrawalFrequency: 'yearly' as const,
        },
      } as unknown as Partial<SimulationContextState['withdrawalConfig']>,
    } as unknown as Partial<SimulationContextState> as SimulationContextState

    mockSavingsData = {
      sparplanElements: [
        {
          start: new Date('2023-01-01'),
          startkapital: 0,
          zinsen: 100,
          endkapital: 2100,
          bezahlteSteuer: 25,
          genutzterFreibetrag: 1000,
          vorabpauschale: 50,
          amount: 2000,
        },
        {
          start: new Date('2024-01-01'),
          startkapital: 2100,
          zinsen: 205,
          endkapital: 4305,
          bezahlteSteuer: 30,
          genutzterFreibetrag: 1200,
          vorabpauschale: 60,
          amount: 2000,
        },
      ],
    }

    mockWithdrawalData = {
      2041: {
        startkapital: 500000,
        entnahme: 20000,
        zinsen: 24000,
        endkapital: 504000,
        bezahlteSteuer: 1000,
        genutzterFreibetrag: 800,
        vorabpauschale: 200,
      },
      2042: {
        startkapital: 504000,
        entnahme: 20160,
        zinsen: 24192,
        endkapital: 508032,
        bezahlteSteuer: 1100,
        genutzterFreibetrag: 900,
        vorabpauschale: 220,
      },
    }

    vi.clearAllMocks()
  })

  describe('exportSavingsDataToCSV', () => {
    it('should export savings phase data to CSV format', () => {
      const exportData: ExportData = {
        savingsData: mockSavingsData as unknown as ExportData['savingsData'],
        context: mockContext,
      }

      const result = exportSavingsDataToCSV(exportData)

      expect(result).toContain('# Sparphase - Simulationsdaten')
      expect(result).toContain('# Zeitraum: 2023 - 2040')
      expect(result).toContain('# Rendite: 5.00%')
      expect(result).toContain('# Kapitalertragsteuer: 26.38%')
      expect(result).toContain('Jahr;Monat;Startkapital (EUR);Zinsen (EUR)')
      expect(result).toContain('2023;12;0,00;100,00')
      expect(result).toContain('2024;12;2.100,00;205,00')
    })

    it('should handle monthly calculation mode', () => {
      mockContext.simulationAnnual = 'monthly'
      const exportData: ExportData = {
        savingsData: mockSavingsData as unknown as ExportData['savingsData'],
        context: mockContext,
      }

      const result = exportSavingsDataToCSV(exportData)

      expect(result).toContain('2023;1;')
      expect(result).toContain('2023;12;')
    })

    it('should throw error when no savings data available', () => {
      const exportData: ExportData = {
        context: mockContext,
      }

      expect(() => exportSavingsDataToCSV(exportData)).toThrow('Keine Sparplan-Daten verfügbar')
    })
  })

  describe('exportWithdrawalDataToCSV', () => {
    it('should export withdrawal phase data to CSV format', () => {
      const exportData: ExportData = {
        withdrawalData: mockWithdrawalData,
        context: mockContext,
      }

      const result = exportWithdrawalDataToCSV(exportData)

      expect(result).toContain('# Entnahmephase - Simulationsdaten')
      expect(result).toContain('# Strategie: 4% Regel')
      expect(result).toContain('Jahr;Monat;Startkapital (EUR);Entnahme (EUR)')
      expect(result).toContain('2041;12;500.000,00;20.000,00')
      expect(result).toContain('2042;12;504.000,00;20.160,00')
    })

    it('should handle monthly withdrawal frequency', () => {
      mockContext.withdrawalConfig!.formValue.withdrawalFrequency = 'monthly'
      const exportData: ExportData = {
        withdrawalData: mockWithdrawalData,
        context: mockContext,
      }

      const result = exportWithdrawalDataToCSV(exportData)

      expect(result).toContain('2041;1;')
      expect(result).toContain('2041;12;')
    })

    it('should throw error when no withdrawal data available', () => {
      const exportData: ExportData = {
        context: mockContext,
      }

      expect(() => exportWithdrawalDataToCSV(exportData)).toThrow('Keine Entnahme-Daten verfügbar')
    })
  })

  describe('exportDataToMarkdown', () => {
    it('should export data to Markdown format', () => {
      const exportData: ExportData = {
        savingsData: mockSavingsData as unknown as ExportData['savingsData'],
        withdrawalData: mockWithdrawalData,
        context: mockContext,
      }

      const result = exportDataToMarkdown(exportData)

      expect(result).toContain('# Simulationsdaten Export')
      expect(result).toContain('## Parameter')
      expect(result).toContain('## Berechnungsgrundlagen')
      expect(result).toContain('## Sparphase')
      expect(result).toContain('## Entnahmephase')
      expect(result).toContain('| Jahr | Startkapital | Zinsen |')
      expect(result).toContain('| 2023 |') // More flexible test for first year data
      expect(result).toContain('| 2041 |') // More flexible test for withdrawal data
    })

    it('should handle only savings data', () => {
      const exportData: ExportData = {
        savingsData: mockSavingsData as unknown as ExportData['savingsData'],
        context: mockContext,
      }

      const result = exportDataToMarkdown(exportData)

      expect(result).toContain('## Sparphase')
      expect(result).toContain('## Entnahmephase') // Always show both sections now
      expect(result).toContain('Keine Entnahme-Daten verfügbar') // Show helpful message when no data
    })
  })

  describe('generateCalculationExplanations', () => {
    it('should generate calculation explanations', () => {
      const result = generateCalculationExplanations(mockContext)

      expect(result).toContain('Berechnungsdetails und Formeln')
      expect(result).toContain('1. ZINSESZINSRECHNUNG')
      expect(result).toContain('2. VORABPAUSCHALE-BERECHNUNG')
      expect(result).toContain('3. STEUERBERECHNUNG')
      expect(result).toContain('4. FREIBETRÄGE')
      expect(result).toContain('Verwendete Rendite: 5.00%')
      expect(result).toContain('2023: ') // More flexible test for freibetrag amounts
      expect(result).toContain('Sparerpauschbetrag')
    })

    it('should include withdrawal strategy explanations', () => {
      const result = generateCalculationExplanations(mockContext)

      expect(result).toContain('6. ENTNAHMESTRATEGIE')
      expect(result).toContain('Strategie: 4% Regel')
      expect(result).toContain('Jährliche Entnahme = 4% vom Startkapital')
    })

    it('should include Grundfreibetrag when active', () => {
      mockContext.grundfreibetragAktiv = true
      const result = generateCalculationExplanations(mockContext)

      expect(result).toContain('5. GRUNDFREIBETRAG (ENTNAHMEPHASE)')
      expect(result).toContain('Grundfreibetrag:') // More flexible test for amount
    })

    it('should handle segmented withdrawal strategies', () => {
      mockContext.withdrawalConfig = {
        formValue: {
          strategie: '4prozent',
          endOfLife: 2080,
          rendite: 5.0,
          withdrawalFrequency: 'yearly',
        },
        useSegmentedWithdrawal: true,
        withdrawalSegments: [
          {
            id: '1',
            name: 'Aktive Phase',
            startYear: 2041,
            endYear: 2060,
            strategy: '4prozent',
            withdrawalFrequency: 'yearly',
            returnConfig: { mode: 'fixed', fixedRate: 0.05 },
          },
          {
            id: '2',
            name: 'Ruhephase',
            startYear: 2061,
            endYear: 2080,
            strategy: '3prozent',
            withdrawalFrequency: 'yearly',
            returnConfig: { mode: 'fixed', fixedRate: 0.03 },
          },
        ],
      } as unknown as SimulationContextState['withdrawalConfig']

      const result = generateCalculationExplanations(mockContext)

      expect(result).toContain('6. ENTNAHMESTRATEGIE')
      expect(result).toContain('Strategie: Segmentierte Entnahme')
      expect(result).toContain('Segment 1 (Aktive Phase): 4% Regel (2041-2060)')
      expect(result).toContain('Segment 2 (Ruhephase): 3% Regel (2061-2080)')
    })

    it('should handle different withdrawal strategies', () => {
      // Test 3% rule
      mockContext.withdrawalConfig!.formValue.strategie = '3prozent'
      let result = generateCalculationExplanations(mockContext)
      expect(result).toContain('Strategie: 3% Regel')
      expect(result).toContain('Jährliche Entnahme = 3% vom Startkapital')

      // Test variable percentage
      mockContext.withdrawalConfig!.formValue = {
        strategie: 'variabel_prozent',
        endOfLife: 2080,
        rendite: 5.0,
        withdrawalFrequency: 'yearly',
        variabelProzent: 4.5,
      } as Partial<WithdrawalFormValue> as WithdrawalFormValue
      result = generateCalculationExplanations(mockContext)
      expect(result).toContain('Strategie: Variabler Prozentsatz')
      expect(result).toContain('Jährliche Entnahme = 4.50% vom aktuellen Kapital')

      // Test monthly fixed
      mockContext.withdrawalConfig!.formValue = {
        strategie: 'monatlich_fest',
        endOfLife: 2080,
        rendite: 5.0,
        withdrawalFrequency: 'yearly',
        monatlicheBetrag: 3000,
        inflationAktiv: true,
        inflationsrate: 2.5,
      } as Partial<WithdrawalFormValue> as WithdrawalFormValue
      result = generateCalculationExplanations(mockContext)
      expect(result).toContain('Strategie: Monatliche Entnahme')
      expect(result).toContain('Monatliche Entnahme:') // Amount will follow
      expect(result).toContain('Inflationsanpassung: 2.50% jährlich')

      // Test dynamic strategy
      mockContext.withdrawalConfig!.formValue = {
        strategie: 'dynamisch',
        endOfLife: 2080,
        rendite: 5.0,
        withdrawalFrequency: 'yearly',
        dynamischBasisrate: 4.2,
      } as Partial<WithdrawalFormValue> as WithdrawalFormValue
      result = generateCalculationExplanations(mockContext)
      expect(result).toContain('Strategie: Dynamische Strategie')
      expect(result).toContain('Basisrate: 4.20%')
      expect(result).toContain('Anpassung basierend auf Vorjahres-Performance')
    })

    it('should handle bucket strategy label', () => {
      mockContext.withdrawalConfig!.formValue.strategie = 'bucket_strategie'
      const result = generateCalculationExplanations(mockContext)
      expect(result).toContain('Strategie: Bucket Strategie')
    })

    it('should handle RMD strategy label', () => {
      mockContext.withdrawalConfig!.formValue.strategie = 'rmd'
      const result = generateCalculationExplanations(mockContext)
      expect(result).toContain('Strategie: RMD Strategie')
    })

    it('should handle Kapitalerhalt strategy label', () => {
      mockContext.withdrawalConfig!.formValue.strategie = 'kapitalerhalt'
      const result = generateCalculationExplanations(mockContext)
      expect(result).toContain('Strategie: Kapitalerhalt')
    })

    it('should handle Steueroptimiert strategy label', () => {
      mockContext.withdrawalConfig!.formValue.strategie = 'steueroptimiert'
      const result = generateCalculationExplanations(mockContext)
      expect(result).toContain('Strategie: Steueroptimierte Entnahme')
    })

    it('should not include withdrawal section when no withdrawal config', () => {
      mockContext.withdrawalConfig = null
      const result = generateCalculationExplanations(mockContext)
      expect(result).not.toContain('6. ENTNAHMESTRATEGIE')
    })
  })

  describe('downloadTextAsFile', () => {
    beforeEach(() => {
      global.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url')
      global.URL.revokeObjectURL = vi.fn()
    })

    it('should create and trigger download with UTF-8 BOM and charset', () => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      }
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as unknown as Node)
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as unknown as Node)
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLElement)

      // Mock Blob constructor to capture the content and options
      const originalBlob = global.Blob
      let blobContent: Array<string | ArrayBuffer | ArrayBufferView | Blob> | undefined
      let blobOptions: { type?: string, endings?: 'transparent' | 'native' } | undefined
      global.Blob = vi.fn().mockImplementation((content, options) => {
        blobContent = content
        blobOptions = options
        return new originalBlob(content, options)
      }) as unknown as typeof Blob

      downloadTextAsFile('test content with äöü and €', 'test.txt')

      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(mockLink.download).toBe('test.txt')
      expect(mockLink.click).toHaveBeenCalled()
      expect(appendChildSpy).toHaveBeenCalledWith(mockLink)
      expect(removeChildSpy).toHaveBeenCalledWith(mockLink)

      // Verify BOM is added
      expect(blobContent?.[0]).toBe('\uFEFFtest content with äöü and €')
      // Verify charset is added to MIME type
      expect(blobOptions?.type).toBe('text/plain;charset=utf-8')

      global.Blob = originalBlob
    })

    it('should preserve existing charset in MIME type', () => {
      const mockLink = { href: '', download: '', click: vi.fn() }
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as unknown as Node)
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as unknown as Node)
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLElement)

      const originalBlob = global.Blob
      let blobOptions: { type?: string, endings?: 'transparent' | 'native' } | undefined
      global.Blob = vi.fn().mockImplementation((content, options) => {
        blobOptions = options
        return new originalBlob(content, options)
      }) as unknown as typeof Blob

      downloadTextAsFile('test', 'test.md', 'text/markdown;charset=utf-8')

      expect(blobOptions?.type).toBe('text/markdown;charset=utf-8')

      global.Blob = originalBlob
    })
  })

  describe('copyTextToClipboard', () => {
    it('should copy text to clipboard successfully', async () => {
      vi.mocked(navigator.clipboard.writeText).mockResolvedValue(undefined)

      const result = await copyTextToClipboard('test content')

      expect(result).toBe(true)
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test content')
    })

    it('should handle clipboard errors', async () => {
      vi.mocked(navigator.clipboard.writeText).mockRejectedValue(new Error('Clipboard error'))

      const result = await copyTextToClipboard('test content')

      expect(result).toBe(false)
    })
  })
})
