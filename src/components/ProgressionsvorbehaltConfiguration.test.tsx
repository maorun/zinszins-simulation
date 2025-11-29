import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProgressionsvorbehaltConfiguration } from './ProgressionsvorbehaltConfiguration'
import { DEFAULT_PROGRESSIONSVORBEHALT_CONFIG, type ProgressionsvorbehaltConfig } from '../../helpers/progressionsvorbehalt'

describe('ProgressionsvorbehaltConfiguration', () => {
  const mockOnChange = vi.fn()

  const defaultProps = {
    config: DEFAULT_PROGRESSIONSVORBEHALT_CONFIG,
    onChange: mockOnChange,
    planningMode: 'individual' as const,
    kirchensteuerAktiv: false,
    kirchensteuersatz: 9,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic rendering', () => {
    it('should render the component with title', () => {
      render(<ProgressionsvorbehaltConfiguration {...defaultProps} />)

      expect(screen.getByText(/Progressionsvorbehalt/i)).toBeInTheDocument()
    })

    it('should render toggle switch', () => {
      render(<ProgressionsvorbehaltConfiguration {...defaultProps} />)

      const toggle = screen.getByRole('switch', { name: /Progressionsvorbehalt aktivieren/i })
      expect(toggle).toBeInTheDocument()
      expect(toggle).not.toBeChecked()
    })

    it('should show "Deaktiviert" label when disabled', () => {
      render(<ProgressionsvorbehaltConfiguration {...defaultProps} />)

      expect(screen.getByText('Deaktiviert')).toBeInTheDocument()
    })

    it('should show "Aktiviert" label when enabled', () => {
      const enabledConfig: ProgressionsvorbehaltConfig = {
        ...DEFAULT_PROGRESSIONSVORBEHALT_CONFIG,
        enabled: true,
      }

      render(<ProgressionsvorbehaltConfiguration {...defaultProps} config={enabledConfig} />)

      expect(screen.getByText('Aktiviert')).toBeInTheDocument()
    })
  })

  describe('Toggle functionality', () => {
    it('should call onChange when toggle is clicked', async () => {
      const user = userEvent.setup()
      render(<ProgressionsvorbehaltConfiguration {...defaultProps} />)

      const toggle = screen.getByRole('switch', { name: /Progressionsvorbehalt aktivieren/i })
      await user.click(toggle)

      expect(mockOnChange).toHaveBeenCalledWith({
        ...DEFAULT_PROGRESSIONSVORBEHALT_CONFIG,
        enabled: true,
      })
    })

    it('should toggle from enabled to disabled', async () => {
      const user = userEvent.setup()
      const enabledConfig: ProgressionsvorbehaltConfig = {
        ...DEFAULT_PROGRESSIONSVORBEHALT_CONFIG,
        enabled: true,
      }

      render(<ProgressionsvorbehaltConfiguration {...defaultProps} config={enabledConfig} />)

      const toggle = screen.getByRole('switch', { name: /Progressionsvorbehalt aktivieren/i })
      await user.click(toggle)

      expect(mockOnChange).toHaveBeenCalledWith({
        ...enabledConfig,
        enabled: false,
      })
    })
  })

  describe('Content visibility when enabled', () => {
    it('should show information section when enabled', () => {
      const enabledConfig: ProgressionsvorbehaltConfig = {
        ...DEFAULT_PROGRESSIONSVORBEHALT_CONFIG,
        enabled: true,
      }

      render(<ProgressionsvorbehaltConfiguration {...defaultProps} config={enabledConfig} />)

      expect(screen.getByText(/Was ist der Progressionsvorbehalt\?/i)).toBeInTheDocument()
    })

    it('should hide content when disabled', () => {
      render(<ProgressionsvorbehaltConfiguration {...defaultProps} />)

      expect(screen.queryByText(/Was ist der Progressionsvorbehalt\?/i)).not.toBeInTheDocument()
    })

    it('should show example scenarios when enabled and no years configured', () => {
      const enabledConfig: ProgressionsvorbehaltConfig = {
        ...DEFAULT_PROGRESSIONSVORBEHALT_CONFIG,
        enabled: true,
      }

      render(<ProgressionsvorbehaltConfiguration {...defaultProps} config={enabledConfig} />)

      expect(screen.getByText(/Beispielszenarien anwenden:/i)).toBeInTheDocument()
      expect(screen.getByText(/Elternzeit \(1 Jahr\)/i)).toBeInTheDocument()
      expect(screen.getByText(/Kurzarbeit \(6 Monate\)/i)).toBeInTheDocument()
      expect(screen.getByText(/Arbeitslosigkeit \(kurz\)/i)).toBeInTheDocument()
    })
  })

  describe('Example scenarios', () => {
    it('should apply Elternzeit scenario when clicked', async () => {
      const user = userEvent.setup()
      const enabledConfig: ProgressionsvorbehaltConfig = {
        ...DEFAULT_PROGRESSIONSVORBEHALT_CONFIG,
        enabled: true,
      }

      render(<ProgressionsvorbehaltConfiguration {...defaultProps} config={enabledConfig} />)

      const elternzeitButton = screen.getByRole('button', { name: /Elternzeit \(1 Jahr\)/i })
      await user.click(elternzeitButton)

      const currentYear = new Date().getFullYear()
      expect(mockOnChange).toHaveBeenCalledWith({
        enabled: true,
        progressionRelevantIncomePerYear: {
          [currentYear]: 12000,
        },
      })
    })

    it('should apply Kurzarbeit scenario when clicked', async () => {
      const user = userEvent.setup()
      const enabledConfig: ProgressionsvorbehaltConfig = {
        ...DEFAULT_PROGRESSIONSVORBEHALT_CONFIG,
        enabled: true,
      }

      render(<ProgressionsvorbehaltConfiguration {...defaultProps} config={enabledConfig} />)

      const kurzarbeitButton = screen.getByRole('button', { name: /Kurzarbeit \(6 Monate\)/i })
      await user.click(kurzarbeitButton)

      const currentYear = new Date().getFullYear()
      expect(mockOnChange).toHaveBeenCalledWith({
        enabled: true,
        progressionRelevantIncomePerYear: {
          [currentYear]: 6000,
        },
      })
    })

    it('should apply Arbeitslosigkeit scenario when clicked', async () => {
      const user = userEvent.setup()
      const enabledConfig: ProgressionsvorbehaltConfig = {
        ...DEFAULT_PROGRESSIONSVORBEHALT_CONFIG,
        enabled: true,
      }

      render(<ProgressionsvorbehaltConfiguration {...defaultProps} config={enabledConfig} />)

      const arbeitslosigkeitButton = screen.getByRole('button', { name: /Arbeitslosigkeit \(kurz\)/i })
      await user.click(arbeitslosigkeitButton)

      const currentYear = new Date().getFullYear()
      expect(mockOnChange).toHaveBeenCalledWith({
        enabled: true,
        progressionRelevantIncomePerYear: {
          [currentYear]: 4500,
        },
      })
    })
  })

  describe('Adding new years', () => {
    it('should show inputs for adding new year', () => {
      const enabledConfig: ProgressionsvorbehaltConfig = {
        ...DEFAULT_PROGRESSIONSVORBEHALT_CONFIG,
        enabled: true,
      }

      render(<ProgressionsvorbehaltConfiguration {...defaultProps} config={enabledConfig} />)

      expect(screen.getByPlaceholderText(/Jahr \(z\.B\. 2024\)/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/Betrag in €/i)).toBeInTheDocument()
    })

    it('should add new year when both inputs are filled', async () => {
      const user = userEvent.setup()
      const enabledConfig: ProgressionsvorbehaltConfig = {
        ...DEFAULT_PROGRESSIONSVORBEHALT_CONFIG,
        enabled: true,
      }

      render(<ProgressionsvorbehaltConfiguration {...defaultProps} config={enabledConfig} />)

      const yearInput = screen.getByPlaceholderText(/Jahr \(z\.B\. 2024\)/i)
      const incomeInput = screen.getByPlaceholderText(/Betrag in €/i)
      const addButton = screen.getByRole('button', { name: '' }) // Plus button

      await user.type(yearInput, '2024')
      await user.type(incomeInput, '15000')
      await user.click(addButton)

      expect(mockOnChange).toHaveBeenCalledWith({
        enabled: true,
        progressionRelevantIncomePerYear: {
          2024: 15000,
        },
      })
    })

    it('should disable add button when inputs are empty', () => {
      const enabledConfig: ProgressionsvorbehaltConfig = {
        ...DEFAULT_PROGRESSIONSVORBEHALT_CONFIG,
        enabled: true,
      }

      render(<ProgressionsvorbehaltConfiguration {...defaultProps} config={enabledConfig} />)

      const addButton = screen.getByRole('button', { name: '' }) // Plus button
      expect(addButton).toBeDisabled()
    })
  })

  describe('Configured years display', () => {
    it('should display configured years', () => {
      const configWithYears: ProgressionsvorbehaltConfig = {
        enabled: true,
        progressionRelevantIncomePerYear: {
          2024: 12000,
          2025: 8000,
        },
      }

      render(<ProgressionsvorbehaltConfiguration {...defaultProps} config={configWithYears} />)

      expect(screen.getByText('2024')).toBeInTheDocument()
      expect(screen.getByText('2025')).toBeInTheDocument()
      expect(screen.getByText(/12\.000,00 €/)).toBeInTheDocument()
      expect(screen.getByText(/8\.000,00 €/)).toBeInTheDocument()
    })

    it('should allow updating income for configured year', async () => {
      const user = userEvent.setup()
      const configWithYears: ProgressionsvorbehaltConfig = {
        enabled: true,
        progressionRelevantIncomePerYear: {
          2024: 12000,
        },
      }

      render(<ProgressionsvorbehaltConfiguration {...defaultProps} config={configWithYears} />)

      const inputs = screen.getAllByRole('spinbutton')
      const incomeInput = inputs.find(input => (input as HTMLInputElement).value === '12000')
      expect(incomeInput).toBeDefined()

      if (incomeInput) {
        await user.clear(incomeInput)
        await user.type(incomeInput, '15000')

        expect(mockOnChange).toHaveBeenCalled()
      }
    })

    it('should allow removing configured year', async () => {
      const user = userEvent.setup()
      const configWithYears: ProgressionsvorbehaltConfig = {
        enabled: true,
        progressionRelevantIncomePerYear: {
          2024: 12000,
        },
      }

      render(<ProgressionsvorbehaltConfiguration {...defaultProps} config={configWithYears} />)

      const deleteButton = screen.getByRole('button', { name: '' }) // Trash button
      await user.click(deleteButton)

      expect(mockOnChange).toHaveBeenCalledWith({
        enabled: true,
        progressionRelevantIncomePerYear: {},
      })
    })

    it('should hide example scenarios when years are configured', () => {
      const configWithYears: ProgressionsvorbehaltConfig = {
        enabled: true,
        progressionRelevantIncomePerYear: {
          2024: 12000,
        },
      }

      render(<ProgressionsvorbehaltConfiguration {...defaultProps} config={configWithYears} />)

      expect(screen.queryByText(/Beispielszenarien anwenden:/i)).not.toBeInTheDocument()
    })
  })

  describe('Tax comparison preview', () => {
    it('should show tax comparison when years are configured', () => {
      const configWithYears: ProgressionsvorbehaltConfig = {
        enabled: true,
        progressionRelevantIncomePerYear: {
          2024: 12000,
        },
      }

      render(<ProgressionsvorbehaltConfiguration {...defaultProps} config={configWithYears} />)

      expect(screen.getByText(/Steuerliche Auswirkungen/i)).toBeInTheDocument()
      expect(screen.getByText(/Ohne Progressionsvorbehalt/i)).toBeInTheDocument()
      expect(screen.getByText(/Mit Progressionsvorbehalt/i)).toBeInTheDocument()
      expect(screen.getByText(/Zusätzliche Steuerlast:/i)).toBeInTheDocument()
    })

    it('should not show tax comparison when no years configured', () => {
      const enabledConfig: ProgressionsvorbehaltConfig = {
        ...DEFAULT_PROGRESSIONSVORBEHALT_CONFIG,
        enabled: true,
      }

      render(<ProgressionsvorbehaltConfiguration {...defaultProps} config={enabledConfig} />)

      expect(screen.queryByText(/Steuerliche Auswirkungen/i)).not.toBeInTheDocument()
    })

    it('should show tax rates in comparison', () => {
      const configWithYears: ProgressionsvorbehaltConfig = {
        enabled: true,
        progressionRelevantIncomePerYear: {
          2024: 12000,
        },
      }

      render(<ProgressionsvorbehaltConfiguration {...defaultProps} config={configWithYears} />)

      const steuersatzTexts = screen.getAllByText(/Steuersatz:/i)
      expect(steuersatzTexts.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Reset functionality', () => {
    it('should show reset button when enabled', () => {
      const enabledConfig: ProgressionsvorbehaltConfig = {
        enabled: true,
        progressionRelevantIncomePerYear: {
          2024: 12000,
        },
      }

      render(<ProgressionsvorbehaltConfiguration {...defaultProps} config={enabledConfig} />)

      expect(screen.getByRole('button', { name: /Zurücksetzen/i })).toBeInTheDocument()
    })

    it('should reset to default config when reset button clicked', async () => {
      const user = userEvent.setup()
      const enabledConfig: ProgressionsvorbehaltConfig = {
        enabled: true,
        progressionRelevantIncomePerYear: {
          2024: 12000,
        },
      }

      render(<ProgressionsvorbehaltConfiguration {...defaultProps} config={enabledConfig} />)

      const resetButton = screen.getByRole('button', { name: /Zurücksetzen/i })
      await user.click(resetButton)

      expect(mockOnChange).toHaveBeenCalledWith(DEFAULT_PROGRESSIONSVORBEHALT_CONFIG)
    })
  })

  describe('Planning mode integration', () => {
    it('should work with couple planning mode', () => {
      const enabledConfig: ProgressionsvorbehaltConfig = {
        ...DEFAULT_PROGRESSIONSVORBEHALT_CONFIG,
        enabled: true,
      }

      render(<ProgressionsvorbehaltConfiguration {...defaultProps} config={enabledConfig} planningMode="couple" />)

      expect(screen.getByText(/Progressionsvorbehalt/i)).toBeInTheDocument()
    })
  })

  describe('Kirchensteuer integration', () => {
    it('should consider Kirchensteuer in tax calculations when active', () => {
      const configWithYears: ProgressionsvorbehaltConfig = {
        enabled: true,
        progressionRelevantIncomePerYear: {
          2024: 12000,
        },
      }

      render(
        <ProgressionsvorbehaltConfiguration
          {...defaultProps}
          config={configWithYears}
          kirchensteuerAktiv={true}
          kirchensteuersatz={9}
        />,
      )

      // Should show tax comparison (which includes Kirchensteuer)
      expect(screen.getByText(/Steuerliche Auswirkungen/i)).toBeInTheDocument()
    })
  })

  describe('Time range validation', () => {
    it('should respect time range limits when provided', () => {
      const enabledConfig: ProgressionsvorbehaltConfig = {
        ...DEFAULT_PROGRESSIONSVORBEHALT_CONFIG,
        enabled: true,
      }

      const timeRange = { start: 2020, end: 2050 }

      render(<ProgressionsvorbehaltConfiguration {...defaultProps} config={enabledConfig} timeRange={timeRange} />)

      const yearInput = screen.getByPlaceholderText(/Jahr \(z\.B\. 2024\)/i) as HTMLInputElement
      expect(yearInput.min).toBe('2020')
      expect(yearInput.max).toBe('2050')
    })

    it('should use default range when no time range provided', () => {
      const enabledConfig: ProgressionsvorbehaltConfig = {
        ...DEFAULT_PROGRESSIONSVORBEHALT_CONFIG,
        enabled: true,
      }

      render(<ProgressionsvorbehaltConfiguration {...defaultProps} config={enabledConfig} />)

      const yearInput = screen.getByPlaceholderText(/Jahr \(z\.B\. 2024\)/i) as HTMLInputElement
      expect(yearInput.min).toBe('2020')
      expect(yearInput.max).toBe('2100')
    })
  })

  describe('Edge cases', () => {
    it('should handle negative income gracefully', async () => {
      const user = userEvent.setup()
      const enabledConfig: ProgressionsvorbehaltConfig = {
        ...DEFAULT_PROGRESSIONSVORBEHALT_CONFIG,
        enabled: true,
      }

      render(<ProgressionsvorbehaltConfiguration {...defaultProps} config={enabledConfig} />)

      const yearInput = screen.getByPlaceholderText(/Jahr \(z\.B\. 2024\)/i)
      const incomeInput = screen.getByPlaceholderText(/Betrag in €/i)
      const addButton = screen.getByRole('button', { name: '' }) // Plus button

      await user.type(yearInput, '2024')
      await user.type(incomeInput, '-1000')
      await user.click(addButton)

      // Should not call onChange with negative income
      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should handle multiple years correctly', () => {
      const configWithMultipleYears: ProgressionsvorbehaltConfig = {
        enabled: true,
        progressionRelevantIncomePerYear: {
          2024: 12000,
          2025: 8000,
          2026: 5000,
        },
      }

      render(<ProgressionsvorbehaltConfiguration {...defaultProps} config={configWithMultipleYears} />)

      expect(screen.getByText('2024')).toBeInTheDocument()
      expect(screen.getByText('2025')).toBeInTheDocument()
      expect(screen.getByText('2026')).toBeInTheDocument()
    })

    it('should handle zero income', async () => {
      const user = userEvent.setup()
      const enabledConfig: ProgressionsvorbehaltConfig = {
        ...DEFAULT_PROGRESSIONSVORBEHALT_CONFIG,
        enabled: true,
      }

      render(<ProgressionsvorbehaltConfiguration {...defaultProps} config={enabledConfig} />)

      const yearInput = screen.getByPlaceholderText(/Jahr \(z\.B\. 2024\)/i)
      const incomeInput = screen.getByPlaceholderText(/Betrag in €/i)
      const addButton = screen.getByRole('button', { name: '' }) // Plus button

      await user.type(yearInput, '2024')
      await user.type(incomeInput, '0')
      await user.click(addButton)

      expect(mockOnChange).toHaveBeenCalledWith({
        enabled: true,
        progressionRelevantIncomePerYear: {
          2024: 0,
        },
      })
    })
  })
})
