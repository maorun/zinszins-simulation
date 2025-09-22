import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SimulationProvider } from '../contexts/SimulationContext'
import { EntnahmeSimulationsAusgabe } from './EntnahmeSimulationsAusgabe'
import type { SparplanElement } from '../utils/sparplan-utils'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
}))

// Mock window.matchMedia for responsive behavior
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Helper function to navigate to other income section
async function navigateToOtherIncomeSection() {
  // First find and click the "Variablen" heading to expand the section
  const variablenHeading = screen.getByText('Variablen')
  fireEvent.click(variablenHeading)

  await waitFor(() => {
    // Now find the "💰 Andere Einkünfte" heading and click it
    const otherIncomeHeading = screen.getByText('💰 Andere Einkünfte')
    fireEvent.click(otherIncomeHeading)
  })
}

// Helper function to enable other income and wait for add button
async function enableOtherIncomeAndWaitForAddButton() {
  await waitFor(() => {
    const enableSwitch = screen.getByLabelText('Andere Einkünfte aktivieren')
    fireEvent.click(enableSwitch)
  })

  // Wait for the add button to appear after enabling the switch
  await waitFor(() => {
    expect(screen.getByText('Neue Einkommensquelle hinzufügen')).toBeInTheDocument()
  })

  return screen.getByText('Neue Einkommensquelle hinzufügen')
}

describe('EntnahmeSimulationsAusgabe - Other Income Integration', () => {
  const mockElemente: SparplanElement[] = [
    {
      start: new Date('2023-01-01'),
      type: 'einmalzahlung',
      gewinn: 176719.80,
      einzahlung: 2000,
      ter: 0.5,
      transactionCostPercent: 0,
      transactionCostAbsolute: 0,
      simulation: {
        2040: {
          startkapital: 532577.65,
          endkapital: 532577.65,
          zinsen: 176719.80,
          bezahlteSteuer: 0,
          genutzterFreibetrag: 0,
          vorabpauschale: 0,
          vorabpauschaleAccumulated: 0,
        },
      },
    },
  ]

  const defaultProps = {
    startEnd: [2023, 2040] as [number, number],
    elemente: mockElemente,
    dispatchEnd: vi.fn(),
    steuerlast: 0.26375,
    teilfreistellungsquote: 0.3,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render other income configuration when enabled', async () => {
    render(
      <SimulationProvider>
        <EntnahmeSimulationsAusgabe {...defaultProps} />
      </SimulationProvider>,
    )

    await navigateToOtherIncomeSection()

    await waitFor(() => {
      expect(screen.getByText('Andere Einkünfte aktivieren')).toBeInTheDocument()
      expect(screen.getByText(/Hier können Sie zusätzliche Einkünfte/)).toBeInTheDocument()
    })
  })

  it('should show add income source form when activated', async () => {
    render(
      <SimulationProvider>
        <EntnahmeSimulationsAusgabe {...defaultProps} />
      </SimulationProvider>,
    )

    await navigateToOtherIncomeSection()

    await waitFor(() => {
      // Enable other income
      const enableSwitch = screen.getByLabelText('Andere Einkünfte aktivieren')
      fireEvent.click(enableSwitch)
    })

    await waitFor(() => {
      expect(screen.getByText('Neue Einkommensquelle hinzufügen')).toBeInTheDocument()
    })
  })

  it('should add and display other income source', async () => {
    render(
      <SimulationProvider>
        <EntnahmeSimulationsAusgabe {...defaultProps} />
      </SimulationProvider>,
    )

    await navigateToOtherIncomeSection()

    // Enable other income
    await waitFor(() => {
      const enableSwitch = screen.getByLabelText('Andere Einkünfte aktivieren')
      fireEvent.click(enableSwitch)
    })

    // Wait for the add button to appear after enabling the switch
    await waitFor(() => {
      expect(screen.getByText('Neue Einkommensquelle hinzufügen')).toBeInTheDocument()
    })

    // Click add new income source
    const addButton = screen.getByText('Neue Einkommensquelle hinzufügen')
    fireEvent.click(addButton)

    // Fill in the form
    await waitFor(() => {
      const nameInput = screen.getByLabelText('Bezeichnung')
      fireEvent.change(nameInput, { target: { value: 'Test Mieteinnahmen' } })

      const amountInput = screen.getByLabelText('Monatlicher Betrag (€) - Brutto')
      fireEvent.change(amountInput, { target: { value: '1200' } })

      const submitButton = screen.getByRole('button', { name: 'Hinzufügen' })
      fireEvent.click(submitButton)
    })

    // Check if the income source is displayed
    await waitFor(() => {
      expect(screen.getByText('Test Mieteinnahmen')).toBeInTheDocument()
      expect(screen.getByText(/1\.200.*€\/Monat.*14\.400.*€\/Jahr/)).toBeInTheDocument()
    })
  })

  it('should toggle between gross and net income types', async () => {
    render(
      <SimulationProvider>
        <EntnahmeSimulationsAusgabe {...defaultProps} />
      </SimulationProvider>,
    )

    await navigateToOtherIncomeSection()

    const addButton = await enableOtherIncomeAndWaitForAddButton()
    fireEvent.click(addButton)

    await waitFor(() => {
      // Initially should be gross (showing tax rate slider)
      expect(screen.getByLabelText('Monatlicher Betrag (€) - Brutto')).toBeInTheDocument()
      expect(screen.getByText('Steuersatz (%)')).toBeInTheDocument()

      // Toggle to net
      const grossNetToggle = screen.getByRole('switch', { name: /Brutto.*Netto/i })
      fireEvent.click(grossNetToggle)

      // Should now show net and hide tax rate
      expect(screen.getByLabelText('Monatlicher Betrag (€) - Netto')).toBeInTheDocument()
      expect(screen.queryByText('Steuersatz (%)')).not.toBeInTheDocument()
    })
  })

  it('should handle different income types correctly', async () => {
    render(
      <SimulationProvider>
        <EntnahmeSimulationsAusgabe {...defaultProps} />
      </SimulationProvider>,
    )

    await navigateToOtherIncomeSection()

    await waitFor(() => {
      const enableSwitch = screen.getByLabelText('Andere Einkünfte aktivieren')
      fireEvent.click(enableSwitch)
    })

    // Wait for the add button to appear after enabling the switch
    await waitFor(() => {
      expect(screen.getByText('Neue Einkommensquelle hinzufügen')).toBeInTheDocument()
    })

    const addButton = screen.getByText('Neue Einkommensquelle hinzufügen')
    fireEvent.click(addButton)

    await waitFor(() => {
      const typeSelect = screen.getByLabelText('Art der Einkünfte')

      // Should have default value "Mieteinnahmen"
      expect(typeSelect).toHaveValue('rental')

      // Change to pension
      fireEvent.change(typeSelect, { target: { value: 'pension' } })
      expect(typeSelect).toHaveValue('pension')
    })
  })

  it('should allow editing existing income sources', async () => {
    render(
      <SimulationProvider>
        <EntnahmeSimulationsAusgabe {...defaultProps} />
      </SimulationProvider>,
    )

    await navigateToOtherIncomeSection()

    const addButton = await enableOtherIncomeAndWaitForAddButton()
    fireEvent.click(addButton)

    await waitFor(() => {
      const nameInput = screen.getByLabelText('Bezeichnung')
      fireEvent.change(nameInput, { target: { value: 'Original Name' } })

      const amountInput = screen.getByLabelText('Monatlicher Betrag (€) - Brutto')
      fireEvent.change(amountInput, { target: { value: '1000' } })

      const submitButton = screen.getByRole('button', { name: 'Hinzufügen' })
      fireEvent.click(submitButton)
    })

    // Now edit it
    await waitFor(() => {
      const editButton = screen.getByRole('button', { name: 'Bearbeiten' })
      fireEvent.click(editButton)
    })

    await waitFor(() => {
      const nameInput = screen.getByDisplayValue('Original Name')
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } })

      const saveButton = screen.getByRole('button', { name: 'Speichern' })
      fireEvent.click(saveButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Updated Name')).toBeInTheDocument()
    })
  })

  it('should allow deleting income sources', async () => {
    render(
      <SimulationProvider>
        <EntnahmeSimulationsAusgabe {...defaultProps} />
      </SimulationProvider>,
    )

    await navigateToOtherIncomeSection()

    const addButton = await enableOtherIncomeAndWaitForAddButton()
    fireEvent.click(addButton)

    await waitFor(() => {
      const nameInput = screen.getByLabelText('Bezeichnung')
      fireEvent.change(nameInput, { target: { value: 'To Delete' } })

      const amountInput = screen.getByLabelText('Monatlicher Betrag (€) - Brutto')
      fireEvent.change(amountInput, { target: { value: '1000' } })

      const submitButton = screen.getByRole('button', { name: 'Hinzufügen' })
      fireEvent.click(submitButton)
    })

    // Wait for the income source to be added and then delete it
    await waitFor(() => {
      expect(screen.getByText('To Delete')).toBeInTheDocument()

      // Find delete button (should be the trash icon button)
      const buttons = screen.getAllByRole('button')
      const deleteButton = buttons.find((button) => {
        const svg = button.querySelector('svg')
        return svg && !button.textContent?.trim()
      })

      if (deleteButton) {
        fireEvent.click(deleteButton)
      }
    })

    await waitFor(() => {
      expect(screen.queryByText('To Delete')).not.toBeInTheDocument()
      expect(screen.getByText('Noch keine Einkommensquellen konfiguriert.')).toBeInTheDocument()
    })
  })

  it('should validate form fields correctly', async () => {
    render(
      <SimulationProvider>
        <EntnahmeSimulationsAusgabe {...defaultProps} />
      </SimulationProvider>,
    )

    await navigateToOtherIncomeSection()

    const addButton = await enableOtherIncomeAndWaitForAddButton()
    fireEvent.click(addButton)

    await waitFor(() => {
      // Try to submit with empty name
      const nameInput = screen.getByLabelText('Bezeichnung')
      fireEvent.change(nameInput, { target: { value: '' } })

      const submitButton = screen.getByRole('button', { name: 'Hinzufügen' })
      fireEvent.click(submitButton)

      // Form should still be visible (not submitted)
      expect(screen.getByText('Neue Einkommensquelle')).toBeInTheDocument()
    })
  })

  it('should handle inflation rate adjustments', async () => {
    render(
      <SimulationProvider>
        <EntnahmeSimulationsAusgabe {...defaultProps} />
      </SimulationProvider>,
    )

    await navigateToOtherIncomeSection()

    const addButton = await enableOtherIncomeAndWaitForAddButton()
    fireEvent.click(addButton)

    await waitFor(() => {
      // Check default inflation rate is 2%
      expect(screen.getByText('2.0%')).toBeInTheDocument()

      // The inflation slider should be adjustable
      const inflationSlider = screen.getByDisplayValue('2')
      expect(inflationSlider).toBeInTheDocument()
    })
  })
})
