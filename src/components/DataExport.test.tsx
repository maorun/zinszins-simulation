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
  isExporting: false as boolean,
  lastExportResult: null as 'success' | 'error' | null,
  exportType: null as 'csv' | 'markdown' | 'clipboard' | null,
}

const mockUseSimulation = {
  simulationData: {
    sparplanElements: [
      {
        start: new Date('2023-01-01'),
        startkapital: 0,
        zinsen: 100,
        endkapital: 2100,
        amount: 2000,
      },
    ],
  } as any,
  withdrawalResults: {
    2041: {
      startkapital: 500000,
      entnahme: 20000,
      zinsen: 24000,
      endkapital: 504000,
      bezahlteSteuer: 1000,
      genutzterFreibetrag: 800,
    },
  } as any,
  withdrawalConfig: {
    formValue: { strategy: '4_percent' },
  } as any,
}

vi.mock('../hooks/useParameterExport', () => ({
  useParameterExport: () => mockUseParameterExport,
}))

vi.mock('../hooks/useDataExport', () => ({
  useDataExport: () => mockUseDataExport,
}))

vi.mock('../contexts/useSimulation', () => ({
  useSimulation: () => mockUseSimulation,
}))

describe('DataExport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseParameterExport.isExporting = false
    mockUseParameterExport.lastExportResult = null
    mockUseDataExport.isExporting = false
    mockUseDataExport.lastExportResult = null
    mockUseDataExport.exportType = null

    // Reset simulation data to default values
    mockUseSimulation.simulationData = {
      sparplanElements: [
        {
          start: new Date('2023-01-01'),
          startkapital: 0,
          zinsen: 100,
          endkapital: 2100,
          amount: 2000,
        },
      ],
    } as any
    mockUseSimulation.withdrawalResults = {
      2041: {
        startkapital: 500000,
        entnahme: 20000,
        zinsen: 24000,
        endkapital: 504000,
        bezahlteSteuer: 1000,
        genutzterFreibetrag: 800,
      },
    } as any
    mockUseSimulation.withdrawalConfig = {
      formValue: { strategy: '4_percent' },
    } as any
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
      expect(screen.getByText('Sparphase')).toBeInTheDocument()
      expect(screen.getByText('Entnahmephase')).toBeInTheDocument()
      expect(screen.getByText('Komplett')).toBeInTheDocument()
      expect(screen.getByText('Markdown herunterladen')).toBeInTheDocument()
      expect(screen.getByText('Formeln kopieren')).toBeInTheDocument()
    })
  })

  it('should show warning when no simulation data is available', async () => {
    mockUseSimulation.simulationData = null as any
    mockUseSimulation.withdrawalResults = null as any
    mockUseSimulation.withdrawalConfig = null as any

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
      const savingsButton = screen.getByText('Sparphase')
      fireEvent.click(savingsButton)
    })

    expect(mockUseDataExport.exportSavingsDataCSV).toHaveBeenCalled()
  })

  it('should call withdrawal data export when button is clicked', async () => {
    render(<DataExport />)

    const trigger = screen.getByText('📤 Export')
    fireEvent.click(trigger)

    await waitFor(() => {
      const withdrawalButton = screen.getByText('Entnahmephase')
      fireEvent.click(withdrawalButton)
    })

    expect(mockUseDataExport.exportWithdrawalDataCSV).toHaveBeenCalled()
  })

  it('should call complete data export when button is clicked', async () => {
    render(<DataExport />)

    const trigger = screen.getByText('📤 Export')
    fireEvent.click(trigger)

    await waitFor(() => {
      const completeButton = screen.getByText('Komplett')
      fireEvent.click(completeButton)
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
      const dataExportButtons = buttons.filter(button =>
        button.textContent?.includes('CSV')
        || button.textContent?.includes('Markdown')
        || button.textContent?.includes('Formeln'),
      )

      dataExportButtons.forEach((button) => {
        expect(button).toBeDisabled()
      })
    })
  })
})
