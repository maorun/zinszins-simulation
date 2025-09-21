import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { OtherIncomeConfigurationComponent } from './OtherIncomeConfiguration'
import { type OtherIncomeConfiguration, createDefaultOtherIncomeSource } from '../../helpers/other-income'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
}))

describe('OtherIncomeConfiguration', () => {
  let mockOnChange: ReturnType<typeof vi.fn>
  let defaultConfig: OtherIncomeConfiguration

  beforeEach(() => {
    mockOnChange = vi.fn()
    defaultConfig = {
      enabled: false,
      sources: [],
    }
  })

  it('renders collapsed by default', () => {
    render(<OtherIncomeConfigurationComponent config={defaultConfig} onChange={mockOnChange} />)

    expect(screen.getByText('💰 Andere Einkünfte')).toBeInTheDocument()
    expect(screen.queryByText('Andere Einkünfte aktivieren')).not.toBeInTheDocument()
  })

  it('expands when clicked and shows enable toggle', async () => {
    render(<OtherIncomeConfigurationComponent config={defaultConfig} onChange={mockOnChange} />)

    fireEvent.click(screen.getByText('💰 Andere Einkünfte'))

    await waitFor(() => {
      expect(screen.getByText('Andere Einkünfte aktivieren')).toBeInTheDocument()
    })

    expect(screen.getByRole('switch')).not.toBeChecked()
  })

  it('enables other income sources when toggle is activated', async () => {
    render(<OtherIncomeConfigurationComponent config={defaultConfig} onChange={mockOnChange} />)

    fireEvent.click(screen.getByText('💰 Andere Einkünfte'))

    await waitFor(() => {
      expect(screen.getByText('Andere Einkünfte aktivieren')).toBeInTheDocument()
    })

    const toggleSwitch = screen.getByRole('switch')
    fireEvent.click(toggleSwitch)

    expect(mockOnChange).toHaveBeenCalledWith({
      enabled: true,
      sources: [],
    })
  })

  it('shows add button and empty state when enabled', async () => {
    const enabledConfig = { ...defaultConfig, enabled: true }
    render(<OtherIncomeConfigurationComponent config={enabledConfig} onChange={mockOnChange} />)

    fireEvent.click(screen.getByText('💰 Andere Einkünfte'))

    await waitFor(() => {
      expect(screen.getByText('Neue Einkommensquelle hinzufügen')).toBeInTheDocument()
    })

    expect(screen.getByText('Noch keine Einkommensquellen konfiguriert.')).toBeInTheDocument()
  })

  it('opens add form when add button is clicked', async () => {
    const enabledConfig = { ...defaultConfig, enabled: true }
    render(<OtherIncomeConfigurationComponent config={enabledConfig} onChange={mockOnChange} />)

    fireEvent.click(screen.getByText('💰 Andere Einkünfte'))

    await waitFor(() => {
      expect(screen.getByText('Neue Einkommensquelle hinzufügen')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Neue Einkommensquelle hinzufügen'))

    await waitFor(() => {
      expect(screen.getByText('Neue Einkommensquelle')).toBeInTheDocument()
    })

    expect(screen.getByLabelText('Bezeichnung')).toBeInTheDocument()
    expect(screen.getByLabelText('Art der Einkünfte')).toBeInTheDocument()
    expect(screen.getByLabelText('Monatlicher Betrag (€) - Brutto')).toBeInTheDocument()
  })

  it('fills form with default values', async () => {
    const enabledConfig = { ...defaultConfig, enabled: true }
    render(<OtherIncomeConfigurationComponent config={enabledConfig} onChange={mockOnChange} />)

    fireEvent.click(screen.getByText('💰 Andere Einkünfte'))

    await waitFor(() => {
      expect(screen.getByText('Neue Einkommensquelle hinzufügen')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Neue Einkommensquelle hinzufügen'))

    await waitFor(() => {
      expect(screen.getByDisplayValue('Mieteinnahmen')).toBeInTheDocument()
    })

    expect(screen.getByDisplayValue('1000')).toBeInTheDocument()
    expect(screen.getByDisplayValue('rental')).toBeInTheDocument()
  })

  it('allows editing form fields', async () => {
    const enabledConfig = { ...defaultConfig, enabled: true }
    render(<OtherIncomeConfigurationComponent config={enabledConfig} onChange={mockOnChange} />)

    fireEvent.click(screen.getByText('💰 Andere Einkünfte'))

    await waitFor(() => {
      fireEvent.click(screen.getByText('Neue Einkommensquelle hinzufügen'))
    })

    await waitFor(() => {
      expect(screen.getByLabelText('Bezeichnung')).toBeInTheDocument()
    })

    const nameInput = screen.getByLabelText('Bezeichnung')
    fireEvent.change(nameInput, { target: { value: 'Test Einnahmen' } })

    expect(nameInput).toHaveValue('Test Einnahmen')
  })

  it('saves new income source when form is submitted', async () => {
    const enabledConfig = { ...defaultConfig, enabled: true }
    render(<OtherIncomeConfigurationComponent config={enabledConfig} onChange={mockOnChange} />)

    fireEvent.click(screen.getByText('💰 Andere Einkünfte'))

    await waitFor(() => {
      fireEvent.click(screen.getByText('Neue Einkommensquelle hinzufügen'))
    })

    await waitFor(() => {
      expect(screen.getByText('Hinzufügen')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Hinzufügen'))

    expect(mockOnChange).toHaveBeenCalledWith({
      enabled: true,
      sources: expect.arrayContaining([
        expect.objectContaining({
          name: 'Mieteinnahmen',
          type: 'rental',
          monthlyAmount: 1000,
          enabled: true,
        }),
      ]),
    })
  })

  it('displays existing income sources', () => {
    const existingSource = createDefaultOtherIncomeSource()
    existingSource.name = 'Existing Rental'
    existingSource.monthlyAmount = 1500

    const configWithSources: OtherIncomeConfiguration = {
      enabled: true,
      sources: [existingSource],
    }

    render(<OtherIncomeConfigurationComponent config={configWithSources} onChange={mockOnChange} />)

    fireEvent.click(screen.getByText('💰 Andere Einkünfte'))

    expect(screen.getByText('Existing Rental')).toBeInTheDocument()
    expect(screen.getByText('1.500 €/Monat')).toBeInTheDocument()
  })

  it('allows deleting an existing source', async () => {
    const existingSource = createDefaultOtherIncomeSource()
    existingSource.name = 'To Delete'

    const configWithSources: OtherIncomeConfiguration = {
      enabled: true,
      sources: [existingSource],
    }

    render(<OtherIncomeConfigurationComponent config={configWithSources} onChange={mockOnChange} />)

    fireEvent.click(screen.getByText('💰 Andere Einkünfte'))

    const deleteButton = screen.getByRole('button', { name: /trash2/i })
    fireEvent.click(deleteButton)

    expect(mockOnChange).toHaveBeenCalledWith({
      enabled: true,
      sources: [],
    })
  })

  it('allows editing an existing source', async () => {
    const existingSource = createDefaultOtherIncomeSource()
    existingSource.name = 'To Edit'

    const configWithSources: OtherIncomeConfiguration = {
      enabled: true,
      sources: [existingSource],
    }

    render(<OtherIncomeConfigurationComponent config={configWithSources} onChange={mockOnChange} />)

    fireEvent.click(screen.getByText('💰 Andere Einkünfte'))

    const editButton = screen.getByText('Bearbeiten')
    fireEvent.click(editButton)

    await waitFor(() => {
      expect(screen.getByText('Einkommensquelle bearbeiten')).toBeInTheDocument()
    })

    expect(screen.getByDisplayValue('To Edit')).toBeInTheDocument()
  })

  it('toggles between gross and net income types', async () => {
    const enabledConfig = { ...defaultConfig, enabled: true }
    render(<OtherIncomeConfigurationComponent config={enabledConfig} onChange={mockOnChange} />)

    fireEvent.click(screen.getByText('💰 Andere Einkünfte'))

    await waitFor(() => {
      fireEvent.click(screen.getByText('Neue Einkommensquelle hinzufügen'))
    })

    await waitFor(() => {
      expect(screen.getByText('Brutto')).toBeInTheDocument()
    })

    // Initially gross (Brutto should be bold)
    expect(screen.getByText('Monatlicher Betrag (€) - Brutto')).toBeInTheDocument()

    // Find and click the amount type switch
    const amountTypeSwitch = screen.getAllByRole('switch').find(
      switchEl => switchEl.closest('.bg-gray-50'),
    )
    expect(amountTypeSwitch).toBeDefined()
    fireEvent.click(amountTypeSwitch!)

    // Should switch to net
    await waitFor(() => {
      expect(screen.getByText('Monatlicher Betrag (€) - Netto')).toBeInTheDocument()
    })
  })
})
