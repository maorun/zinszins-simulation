import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { OtherIncomeConfigurationComponent } from './OtherIncomeConfiguration'
import { type OtherIncomeConfiguration } from '../../helpers/other-income'

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
  })
})
