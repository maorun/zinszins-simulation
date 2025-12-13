/**
 * Tests for Excel Export Utility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as XLSX from 'xlsx'
import {
  generateSavingsExcelWithFormulas,
  generateWithdrawalExcelWithFormulas,
  exportSavingsDataToExcel,
  exportWithdrawalDataToExcel,
  exportCompleteDataToExcel,
  downloadExcelFile,
} from './excel-export'
import type { SimulationContextState } from '../contexts/SimulationContext'
import type { SavingsData } from './data-export'
import type { SparplanElement } from './sparplan-utils'
import type { SimulationResult } from './simulate'

// Type for withdrawal data used in Excel export
interface WithdrawalDataForExcel {
  strategy?: string
  startingCapital?: number
  withdrawalFrequency?: 'yearly' | 'monthly'
  years?: Array<{
    year: number
    startingCapital?: number
    withdrawal?: number
    returns?: number
    tax?: number
    endingCapital?: number
  }>
}

// Mock XLSX.writeFile
vi.mock('xlsx', async () => {
  const actual = await vi.importActual('xlsx')
  return {
    ...actual,
    writeFile: vi.fn(),
  }
})

// Helper to create a minimal mock SimulationResult for testing
function createMockSimulationResult(): SimulationResult {
  return {}
}

describe('excel-export', () => {
  let mockContext: SimulationContextState
  let mockSavingsData: SavingsData

  beforeEach(() => {
    // Create a realistic mock context
    mockContext = {
      rendite: 5,
      steuerlast: 26.375,
      teilfreistellungsquote: 30,
      freibetragPerYear: { 2023: 2000, 2024: 2000 },
      startEnd: [2023, 2040] as [number, number],
      simulationAnnual: 'yearly',
      endOfLife: 2050,
    } as unknown as SimulationContextState

    // Create mock savings data with proper SparplanElement structure
    const sparplanElement1: SparplanElement = {
      type: 'sparplan' as const,
      start: new Date('2023-01-01'),
      einzahlung: 1000,
      simulation: createMockSimulationResult(),
    }

    const sparplanElement2: SparplanElement = {
      type: 'einmalzahlung' as const,
      start: new Date('2023-01-01'),
      einzahlung: 5000,
      gewinn: 0,
      simulation: createMockSimulationResult(),
    }

    // Add extended properties after creation (to simulate runtime behavior)
    type ExtendedSparplanElement = SparplanElement & { gesamtkapitalNachSteuern?: number }
    const extendedElement1 = sparplanElement1 as ExtendedSparplanElement
    extendedElement1.gesamtkapitalNachSteuern = 200000

    const extendedElement2 = sparplanElement2 as ExtendedSparplanElement
    extendedElement2.gesamtkapitalNachSteuern = 5000

    mockSavingsData = {
      sparplanElements: [extendedElement1, extendedElement2],
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('generateSavingsExcelWithFormulas', () => {
    it('should generate a workbook with multiple sheets', () => {
      const wb = generateSavingsExcelWithFormulas(mockSavingsData, mockContext)

      expect(wb).toBeDefined()
      expect(wb.SheetNames).toBeDefined()
      expect(wb.SheetNames.length).toBeGreaterThan(0)
    })

    it('should include Übersicht sheet with summary data', () => {
      const wb = generateSavingsExcelWithFormulas(mockSavingsData, mockContext)

      expect(wb.SheetNames).toContain('Übersicht')
      const sheet = wb.Sheets['Übersicht']
      expect(sheet).toBeDefined()

      // Check that summary data exists
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 })
      expect(data).toBeDefined()
      expect(data.length).toBeGreaterThan(0)
    })

    it('should include Sparpläne sheet when sparplan elements exist', () => {
      const wb = generateSavingsExcelWithFormulas(mockSavingsData, mockContext)

      expect(wb.SheetNames).toContain('Sparpläne')
      const sheet = wb.Sheets['Sparpläne']
      expect(sheet).toBeDefined()

      // Check that data exists
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 })
      expect(data.length).toBe(3) // Header + 2 sparplan rows
    })

    it('should handle empty simulation data gracefully', () => {
      const emptyData: SavingsData = {
        sparplanElements: [],
      }

      const wb = generateSavingsExcelWithFormulas(emptyData, mockContext)

      expect(wb).toBeDefined()
      expect(wb.SheetNames).toContain('Übersicht')
      // Should not crash, but may not include data sheets
    })

    it('should format currency columns with German format', () => {
      const wb = generateSavingsExcelWithFormulas(mockSavingsData, mockContext)
      const sheet = wb.Sheets['Sparpläne']

      // Check that currency formatting is applied
      const cellB2 = sheet['B2'] // First currency cell (Betrag)
      if (cellB2) {
        expect(cellB2.z).toBe('#,##0.00 "€"')
      }
    })
  })

  describe('generateWithdrawalExcelWithFormulas', () => {
    let mockWithdrawalData: {
      strategy: string
      startingCapital: number
      withdrawalFrequency: 'yearly' | 'monthly'
      years: Array<{
        year: number
        startingCapital: number
        withdrawal: number
        returns: number
        tax: number
        endingCapital: number
      }>
    }

    beforeEach(() => {
      mockWithdrawalData = {
        strategy: '4% Regel',
        startingCapital: 500000,
        withdrawalFrequency: 'yearly',
        years: [
          {
            year: 2040,
            startingCapital: 500000,
            withdrawal: 20000,
            returns: 24000,
            tax: 1000,
            endingCapital: 503000,
          },
          {
            year: 2041,
            startingCapital: 503000,
            withdrawal: 20000,
            returns: 24150,
            tax: 1005,
            endingCapital: 506145,
          },
        ],
      }
    })

    it('should generate a workbook with withdrawal data', () => {
      const wb = generateWithdrawalExcelWithFormulas(mockWithdrawalData, mockContext)

      expect(wb).toBeDefined()
      expect(wb.SheetNames).toBeDefined()
      expect(wb.SheetNames.length).toBeGreaterThan(0)
    })

    it('should include Übersicht sheet with withdrawal summary', () => {
      const wb = generateWithdrawalExcelWithFormulas(mockWithdrawalData, mockContext)

      expect(wb.SheetNames).toContain('Übersicht')
      const sheet = wb.Sheets['Übersicht']
      expect(sheet).toBeDefined()
    })

    it('should include Jahres-Aufschlüsselung sheet with yearly data', () => {
      const wb = generateWithdrawalExcelWithFormulas(mockWithdrawalData, mockContext)

      expect(wb.SheetNames).toContain('Jahres-Aufschlüsselung')
      const sheet = wb.Sheets['Jahres-Aufschlüsselung']
      expect(sheet).toBeDefined()

      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 })
      expect(data.length).toBe(3) // Header + 2 data rows
    })

    it('should handle empty withdrawal data gracefully', () => {
      const emptyData = {
        strategy: 'Unknown',
        years: [],
      }

      const wb = generateWithdrawalExcelWithFormulas(emptyData, mockContext)

      expect(wb).toBeDefined()
      expect(wb.SheetNames).toContain('Übersicht')
    })
  })

  describe('downloadExcelFile', () => {
    it('should call XLSX.writeFile with correct parameters', () => {
      const wb = XLSX.utils.book_new()
      const filename = 'test.xlsx'

      downloadExcelFile(wb, filename)

      expect(XLSX.writeFile).toHaveBeenCalledWith(wb, filename)
    })
  })

  describe('exportSavingsDataToExcel', () => {
    it('should export savings data successfully', () => {
      expect(() => {
        exportSavingsDataToExcel(mockSavingsData, mockContext)
      }).not.toThrow()

      expect(XLSX.writeFile).toHaveBeenCalled()
    })

    it('should generate correct filename', () => {
      exportSavingsDataToExcel(mockSavingsData, mockContext)

      const calls = vi.mocked(XLSX.writeFile).mock.calls
      expect(calls.length).toBe(1)
      expect(calls[0][1]).toBe('Sparphase_2023-2040.xlsx')
    })

    it('should throw error on Excel generation failure', () => {
      vi.mocked(XLSX.writeFile).mockImplementationOnce(() => {
        throw new Error('Write failed')
      })

      expect(() => {
        exportSavingsDataToExcel(mockSavingsData, mockContext)
      }).toThrow('Excel-Export fehlgeschlagen')
    })
  })

  describe('exportWithdrawalDataToExcel', () => {
    let mockWithdrawalData: WithdrawalDataForExcel

    beforeEach(() => {
      mockWithdrawalData = {
        strategy: '4% Regel',
        startingCapital: 500000,
        withdrawalFrequency: 'yearly' as const,
        years: [
          {
            year: 2040,
            startingCapital: 500000,
            withdrawal: 20000,
            returns: 24000,
            tax: 1000,
            endingCapital: 503000,
          },
        ],
      }
    })

    it('should export withdrawal data successfully', () => {
      expect(() => {
        exportWithdrawalDataToExcel(mockWithdrawalData, mockContext)
      }).not.toThrow()

      expect(XLSX.writeFile).toHaveBeenCalled()
    })

    it('should generate correct filename with year range', () => {
      exportWithdrawalDataToExcel(mockWithdrawalData, mockContext)

      const calls = vi.mocked(XLSX.writeFile).mock.calls
      expect(calls.length).toBe(1)
      expect(calls[0][1]).toMatch(/Entnahmephase_\d{4}-\d{4}\.xlsx/)
    })

    it('should throw error on Excel generation failure', () => {
      vi.mocked(XLSX.writeFile).mockImplementationOnce(() => {
        throw new Error('Write failed')
      })

      expect(() => {
        exportWithdrawalDataToExcel(mockWithdrawalData, mockContext)
      }).toThrow('Excel-Export fehlgeschlagen')
    })
  })

  describe('exportCompleteDataToExcel', () => {
    let mockWithdrawalData: WithdrawalDataForExcel

    beforeEach(() => {
      mockWithdrawalData = {
        strategy: '4% Regel',
        startingCapital: 500000,
        withdrawalFrequency: 'yearly' as const,
        years: [
          {
            year: 2040,
            startingCapital: 500000,
            withdrawal: 20000,
            returns: 24000,
            tax: 1000,
            endingCapital: 503000,
          },
        ],
      }
    })

    it('should export complete data successfully', () => {
      expect(() => {
        exportCompleteDataToExcel(mockSavingsData, mockWithdrawalData, mockContext)
      }).not.toThrow()

      expect(XLSX.writeFile).toHaveBeenCalled()
    })

    it('should generate filename with complete year range', () => {
      exportCompleteDataToExcel(mockSavingsData, mockWithdrawalData, mockContext)

      const calls = vi.mocked(XLSX.writeFile).mock.calls
      expect(calls.length).toBe(1)
      expect(calls[0][1]).toBe('Komplett_2023-2050.xlsx')
    })

    it('should include sheets from both savings and withdrawal phases', () => {
      exportCompleteDataToExcel(mockSavingsData, mockWithdrawalData, mockContext)

      const calls = vi.mocked(XLSX.writeFile).mock.calls
      expect(calls.length).toBe(1)

      const wb = calls[0][0] as XLSX.WorkBook
      expect(wb.SheetNames.length).toBeGreaterThan(2) // At least savings + withdrawal sheets
    })

    it('should throw error on Excel generation failure', () => {
      vi.mocked(XLSX.writeFile).mockImplementationOnce(() => {
        throw new Error('Write failed')
      })

      expect(() => {
        exportCompleteDataToExcel(mockSavingsData, mockWithdrawalData, mockContext)
      }).toThrow('Excel-Export fehlgeschlagen')
    })
  })

  describe('German formatting', () => {
    it('should format currency values with German locale', () => {
      const wb = generateSavingsExcelWithFormulas(mockSavingsData, mockContext)
      const sheet = wb.Sheets['Sparpläne']

      // Check that values are numbers (not formatted strings)
      const cellB2 = sheet['B2'] // Betrag for first sparplan
      expect(cellB2).toBeDefined()
      expect(typeof cellB2.v).toBe('number')
    })

    it('should use German date format for summary', () => {
      const wb = generateSavingsExcelWithFormulas(mockSavingsData, mockContext)
      const sheet = wb.Sheets['Übersicht']

      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][]
      const zeitraumRow = data.find(row => row[0] === 'Zeitraum')
      expect(zeitraumRow).toBeDefined()
      expect(zeitraumRow![1]).toBe('2023 - 2040')
    })
  })
})
