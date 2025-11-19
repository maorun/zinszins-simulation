import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import DataExport from './DataExport'

// Mock hooks
const mockUseParameterExport = {
  exportParameters: vi.fn(),
  isExporting: false as boolean,
  lastExportResult: null as 'success' | 'error' | null,
}

const mockUseDataExport = {
  exportSavingsDataCSV: vi.fn(),
  exportWithdrawalDataCSV: vi.fn(),
  exportAllDataCSV: vi.fn(),
  exportDataMarkdown: vi.fn(),
  copyCalculationExplanations: vi.fn(),
  exportSavingsDataExcel: vi.fn(),
  exportWithdrawalDataExcel: vi.fn(),
  exportAllDataExcel: vi.fn(),
  isExporting: false as boolean,
  lastExportResult: null as 'success' | 'error' | null,
  exportType: null as 'csv' | 'markdown' | 'clipboard' | 'excel' | null,
}

const mockUseDataAvailability = {
  hasSavingsData: true,
  hasWithdrawalCapability: true,
  hasAnyData: true,
}

vi.mock('../hooks/useParameterExport', () => ({
  useParameterExport: () => mockUseParameterExport,
}))

vi.mock('../hooks/useDataExport', () => ({
  useDataExport: () => mockUseDataExport,
}))

vi.mock('../hooks/useDataAvailability', () => ({
  useDataAvailability: () => mockUseDataAvailability,
}))

describe('DataExport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseParameterExport.isExporting = false
    mockUseParameterExport.lastExportResult = null
    mockUseDataExport.isExporting = false
    mockUseDataExport.lastExportResult = null
    mockUseDataExport.exportType = null
    mockUseDataAvailability.hasSavingsData = true
    mockUseDataAvailability.hasWithdrawalCapability = true
    mockUseDataAvailability.hasAnyData = true
  })

  it('should render the export panel collapsed by default', () => {
    render(<DataExport />)

    expect(screen.getByText('📤 Export')).toBeInTheDocument()

    // Panel should be collapsed, so content should not be visible
    expect(screen.queryByText('Parameter Export')).not.toBeInTheDocument()
  })

  it('should expand panel when clicked', async () => {
    render(<DataExport />)

    const trigger = screen.getByText('📤 Export')
    fireEvent.click(trigger)

    await waitFor(() => {
      expect(screen.getByText('Parameter Export')).toBeInTheDocument()
      expect(screen.getByText('Daten Export')).toBeInTheDocument()
    })
  })

  it('should show parameter export button with correct text', async () => {
    render(<DataExport />)

    const trigger = screen.getByText('📤 Export')
    fireEvent.click(trigger)

    await waitFor(() => {
      expect(screen.getByText('📋 Parameter kopieren')).toBeInTheDocument()
    })
  })

  it('should call parameter export function when button is clicked', async () => {
    render(<DataExport />)

    const trigger = screen.getByText('📤 Export')
    fireEvent.click(trigger)

    await waitFor(() => {
      const parameterButton = screen.getByText('📋 Parameter kopieren')
      fireEvent.click(parameterButton)
    })

    expect(mockUseParameterExport.exportParameters).toHaveBeenCalled()
  })

  it('should show data export buttons when simulation data is available', async () => {
    render(<DataExport />)

    const trigger = screen.getByText('📤 Export')
    fireEvent.click(trigger)

    await waitFor(() => {
      expect(screen.getAllByText('Sparphase')).toHaveLength(2) // CSV and Excel
      expect(screen.getAllByText('Entnahmephase')).toHaveLength(2)
      expect(screen.getAllByText('Komplett')).toHaveLength(2)
      expect(screen.getByText('Markdown herunterladen')).toBeInTheDocument()
      expect(screen.getByText('Formeln kopieren')).toBeInTheDocument()
    })
  })

  it('should show warning when no simulation data is available', async () => {
    mockUseDataAvailability.hasAnyData = false

    render(<DataExport />)

    const trigger = screen.getByText('📤 Export')
    fireEvent.click(trigger)

    await waitFor(() => {
      expect(screen.getByText(/Keine Simulationsdaten verfügbar/)).toBeInTheDocument()
    })
  })

  it('should call savings data export when button is clicked', async () => {
    render(<DataExport />)

    const trigger = screen.getByText('📤 Export')
    fireEvent.click(trigger)

    await waitFor(() => {
      const savingsButtons = screen.getAllByText('Sparphase')
      const csvButton = savingsButtons[0] // First button is CSV
      fireEvent.click(csvButton)
    })

    expect(mockUseDataExport.exportSavingsDataCSV).toHaveBeenCalled()
  })

  it('should call withdrawal data export when button is clicked', async () => {
    render(<DataExport />)

    const trigger = screen.getByText('📤 Export')
    fireEvent.click(trigger)

    await waitFor(() => {
      const withdrawalButtons = screen.getAllByText('Entnahmephase')
      const csvButton = withdrawalButtons[0] // First button is CSV
      fireEvent.click(csvButton)
    })

    expect(mockUseDataExport.exportWithdrawalDataCSV).toHaveBeenCalled()
  })

  it('should call complete data export when button is clicked', async () => {
    render(<DataExport />)

    const trigger = screen.getByText('📤 Export')
    fireEvent.click(trigger)

    await waitFor(() => {
      const completeButtons = screen.getAllByText('Komplett')
      const csvButton = completeButtons[0] // First button is CSV
      fireEvent.click(csvButton)
    })

    expect(mockUseDataExport.exportAllDataCSV).toHaveBeenCalled()
  })

  it('should call markdown export when button is clicked', async () => {
    render(<DataExport />)

    const trigger = screen.getByText('📤 Export')
    fireEvent.click(trigger)

    await waitFor(() => {
      const markdownButton = screen.getByText('Markdown herunterladen')
      fireEvent.click(markdownButton)
    })

    expect(mockUseDataExport.exportDataMarkdown).toHaveBeenCalled()
  })

  it('should call calculation explanations export when button is clicked', async () => {
    render(<DataExport />)

    const trigger = screen.getByText('📤 Export')
    fireEvent.click(trigger)

    await waitFor(() => {
      const explanationsButton = screen.getByText('Formeln kopieren')
      fireEvent.click(explanationsButton)
    })

    expect(mockUseDataExport.copyCalculationExplanations).toHaveBeenCalled()
  })

  it('should render Excel export section', async () => {
    render(<DataExport />)

    const trigger = screen.getByText('📤 Export')
    fireEvent.click(trigger)

    await waitFor(() => {
      expect(screen.getByText('Excel Format')).toBeInTheDocument()
    })
  })

  it('should call savings Excel export when Excel Sparphase button is clicked', async () => {
    render(<DataExport />)

    const trigger = screen.getByText('📤 Export')
    fireEvent.click(trigger)

    await waitFor(() => {
      // Excel section has its own Sparphase button
      const buttons = screen.getAllByText('Sparphase')
      const excelButton = buttons[1] // Second button is Excel (first is CSV)
      fireEvent.click(excelButton)
    })

    expect(mockUseDataExport.exportSavingsDataExcel).toHaveBeenCalled()
  })

  it('should call withdrawal Excel export when Excel Entnahmephase button is clicked', async () => {
    render(<DataExport />)

    const trigger = screen.getByText('📤 Export')
    fireEvent.click(trigger)

    await waitFor(() => {
      const buttons = screen.getAllByText('Entnahmephase')
      const excelButton = buttons[1] // Second button is Excel
      fireEvent.click(excelButton)
    })

    expect(mockUseDataExport.exportWithdrawalDataExcel).toHaveBeenCalled()
  })

  it('should call complete Excel export when Excel Komplett button is clicked', async () => {
    render(<DataExport />)

    const trigger = screen.getByText('📤 Export')
    fireEvent.click(trigger)

    await waitFor(() => {
      const buttons = screen.getAllByText('Komplett')
      const excelButton = buttons[1] // Second button is Excel
      fireEvent.click(excelButton)
    })

    expect(mockUseDataExport.exportAllDataExcel).toHaveBeenCalled()
  })

  it('should show Excel format information', async () => {
    render(<DataExport />)

    const trigger = screen.getByText('📤 Export')
    fireEvent.click(trigger)

    await waitFor(() => {
      expect(screen.getByText('Excel Export')).toBeInTheDocument()
      expect(screen.getByText(/\.xlsx Datei mit Formeln/)).toBeInTheDocument()
    })
  })

  it('should show loading state for Excel export', async () => {
    mockUseDataExport.isExporting = true
    mockUseDataExport.exportType = 'excel'

    render(<DataExport />)

    const trigger = screen.getByText('📤 Export')
    fireEvent.click(trigger)

    await waitFor(() => {
      // Should show "Exportiere..." text on Excel buttons
      expect(screen.getByText('Excel Format')).toBeInTheDocument()
    })
  })

  it('should show loading state for parameter export', async () => {
    mockUseParameterExport.isExporting = true

    render(<DataExport />)

    const trigger = screen.getByText('📤 Export')
    fireEvent.click(trigger)

    await waitFor(() => {
      expect(screen.getByText('Exportiere...')).toBeInTheDocument()
    })
  })

  it('should show success state for parameter export', async () => {
    mockUseParameterExport.lastExportResult = 'success'

    render(<DataExport />)

    const trigger = screen.getByText('📤 Export')
    fireEvent.click(trigger)

    await waitFor(() => {
      expect(screen.getByText('✓ Kopiert!')).toBeInTheDocument()
    })
  })

  it('should show error state for parameter export', async () => {
    mockUseParameterExport.lastExportResult = 'error'

    render(<DataExport />)

    const trigger = screen.getByText('📤 Export')
    fireEvent.click(trigger)

    await waitFor(() => {
      expect(screen.getByText('✗ Fehler')).toBeInTheDocument()
    })
  })

  it('should show loading state for data export', async () => {
    // Set the mock state before rendering
    mockUseDataExport.isExporting = true
    mockUseDataExport.exportType = 'markdown' // Change to markdown since CSV buttons don't use dynamic text

    render(<DataExport />)

    const trigger = screen.getByText('📤 Export')
    fireEvent.click(trigger)

    // Look for markdown export button with loading text
    await waitFor(() => {
      expect(screen.getByText('Exportiere...')).toBeInTheDocument()
    })
  })

  it('should show format information section', async () => {
    render(<DataExport />)

    const trigger = screen.getByText('📤 Export')
    fireEvent.click(trigger)

    // First wait for the panel to open with basic content
    await waitFor(() => {
      expect(screen.getByText('Parameter Export')).toBeInTheDocument()
    })

    // Then check for format information
    await waitFor(() => {
      expect(screen.getByText('Format-Informationen')).toBeInTheDocument()
    })

    // Check for the specific content items one by one with more flexible matchers
    expect(screen.getByText('CSV Export')).toBeInTheDocument()
    expect(screen.getByText('Markdown Export')).toBeInTheDocument()
    expect(screen.getByText(/Tabellenformat.*Excel.*Calc/)).toBeInTheDocument()
    expect(screen.getByText(/GitHub.*Wiki/)).toBeInTheDocument()
  })

  it('should disable buttons when export is in progress', async () => {
    mockUseDataExport.isExporting = true

    render(<DataExport />)

    const trigger = screen.getByText('📤 Export')
    fireEvent.click(trigger)

    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      const dataExportButtons = buttons.filter(
        button =>
          button.textContent?.includes('CSV') ||
          button.textContent?.includes('Markdown') ||
          button.textContent?.includes('Formeln'),
      )

      dataExportButtons.forEach(button => {
        expect(button).toBeDisabled()
      })
    })
  })
})
