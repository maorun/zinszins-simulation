import { describe, it, expect, vi } from 'vitest'
import {
  exportSavingsDataToPDF,
  exportWithdrawalDataToPDF,
  exportAllDataToPDF,
  downloadPDFBlob,
} from './pdf-export'
import type { ExportData } from './data-export'
import type { SimulationContextState } from '../contexts/SimulationContext'

// Mock jsPDF
vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    text: vi.fn(),
    setLineWidth: vi.fn(),
    line: vi.fn(),
    addPage: vi.fn(),
    getNumberOfPages: vi.fn().mockReturnValue(1),
    setPage: vi.fn(),
    output: vi.fn().mockReturnValue(new Blob(['mock pdf'], { type: 'application/pdf' })),
    internal: {
      pageSize: {
        width: 210,
        height: 297,
      },
    },
  })),
}))

describe('PDF Export', () => {
  const mockContext: Partial<SimulationContextState> = {
    startEnd: [2023, 2040],
    rendite: 5,
    steuerlast: 26.375,
    teilfreistellungsquote: 30,
    simulationAnnual: 'yearly',
    sparplan: [
      {
        id: 1,
        start: new Date('2023-01-01'),
        einzahlung: 2000,
      },
    ],
    endOfLife: 2060,
  }

  const mockSavingsData = {
    sparplanElements: [
      {
        start: new Date('2023-01-01'),
        type: 'sparplan' as const,
        einzahlung: 2000,
        simulation: {
          2023: {
            startkapital: 0,
            zinsen: 100,
            endkapital: 2100,
            bezahlteSteuer: 10,
            genutzterFreibetrag: 0,
            vorabpauschale: 0,
            vorabpauschaleAccumulated: 0,
          },
        },
      },
    ],
  }

  const mockWithdrawalData = {
    2041: {
      startkapital: 100000,
      entnahme: 4000,
      endkapital: 100800,
      bezahlteSteuer: 200,
      genutzterFreibetrag: 0,
      zinsen: 5000,
    },
  }

  describe('exportSavingsDataToPDF', () => {
    it('should generate a PDF blob for savings data', () => {
      const exportData: ExportData = {
        savingsData: mockSavingsData,
        context: mockContext as SimulationContextState,
      }

      const result = exportSavingsDataToPDF(exportData)

      expect(result).toBeInstanceOf(Blob)
      expect(result.type).toBe('application/pdf')
    })

    it('should handle savings data with multiple years', () => {
      const exportData: ExportData = {
        savingsData: {
          sparplanElements: [
            {
              start: new Date('2023-01-01'),
              type: 'sparplan' as const,
              einzahlung: 2000,
              simulation: {
                2023: {
                  startkapital: 0,
                  zinsen: 100,
                  endkapital: 2100,
                  bezahlteSteuer: 10,
                  genutzterFreibetrag: 0,
                  vorabpauschale: 0,
                  vorabpauschaleAccumulated: 0,
                },
                2024: {
                  startkapital: 2100,
                  zinsen: 205,
                  endkapital: 4305,
                  bezahlteSteuer: 15,
                  genutzterFreibetrag: 0,
                  vorabpauschale: 0,
                  vorabpauschaleAccumulated: 0,
                },
              },
            },
          ],
        },
        context: mockContext as SimulationContextState,
      }

      const result = exportSavingsDataToPDF(exportData)

      expect(result).toBeInstanceOf(Blob)
    })
  })

  describe('exportWithdrawalDataToPDF', () => {
    it('should generate a PDF blob for withdrawal data', () => {
      const exportData: ExportData = {
        withdrawalData: mockWithdrawalData,
        context: mockContext as SimulationContextState,
      }

      const result = exportWithdrawalDataToPDF(exportData)

      expect(result).toBeInstanceOf(Blob)
      expect(result.type).toBe('application/pdf')
    })

    it('should handle withdrawal data with multiple years', () => {
      const exportData: ExportData = {
        withdrawalData: {
          2041: {
            startkapital: 100000,
            entnahme: 4000,
            endkapital: 100800,
            bezahlteSteuer: 200,
            genutzterFreibetrag: 0,
            zinsen: 5000,
          },
          2042: {
            startkapital: 100800,
            entnahme: 4000,
            endkapital: 101640,
            bezahlteSteuer: 210,
            genutzterFreibetrag: 0,
            zinsen: 5040,
          },
        },
        context: mockContext as SimulationContextState,
      }

      const result = exportWithdrawalDataToPDF(exportData)

      expect(result).toBeInstanceOf(Blob)
    })
  })

  describe('exportAllDataToPDF', () => {
    it('should generate a PDF blob for both savings and withdrawal data', () => {
      const exportData: ExportData = {
        savingsData: mockSavingsData,
        withdrawalData: mockWithdrawalData,
        context: mockContext as SimulationContextState,
      }

      const result = exportAllDataToPDF(exportData)

      expect(result).toBeInstanceOf(Blob)
      expect(result.type).toBe('application/pdf')
    })
  })

  describe('downloadPDFBlob', () => {
    it('should trigger a download with the correct filename', () => {
      const mockBlob = new Blob(['test'], { type: 'application/pdf' })
      const filename = 'test.pdf'

      // Mock document.createElement and related methods
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      }
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLElement)
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as unknown as Node)
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as unknown as Node)

      // Mock URL methods - define them if they don't exist
      if (!global.URL) {
        global.URL = {} as typeof URL
      }
      if (!global.URL.createObjectURL) {
        global.URL.createObjectURL = vi.fn()
      }
      if (!global.URL.revokeObjectURL) {
        global.URL.revokeObjectURL = vi.fn()
      }

      const createObjectURLMock = vi.mocked(global.URL.createObjectURL).mockReturnValue('blob:mock-url')
      const revokeObjectURLMock = vi.mocked(global.URL.revokeObjectURL).mockImplementation(() => undefined)

      downloadPDFBlob(mockBlob, filename)

      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(mockLink.download).toBe(filename)
      expect(mockLink.click).toHaveBeenCalled()
      expect(appendChildSpy).toHaveBeenCalled()
      expect(removeChildSpy).toHaveBeenCalled()
      expect(createObjectURLMock).toHaveBeenCalledWith(mockBlob)
      expect(revokeObjectURLMock).toHaveBeenCalled()

      // Cleanup
      createElementSpy.mockRestore()
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
      createObjectURLMock.mockRestore()
      revokeObjectURLMock.mockRestore()
    })
  })
})
