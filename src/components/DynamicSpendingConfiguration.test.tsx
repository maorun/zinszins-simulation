import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DynamicSpendingConfiguration } from './DynamicSpendingConfiguration'
import { getDefaultDynamicSpendingConfig } from '../../helpers/dynamic-spending'

describe('DynamicSpendingConfiguration', () => {
  const defaultProps = {
    config: { ...getDefaultDynamicSpendingConfig(1957, 48000), enabled: false },
    onChange: vi.fn(),
    retirementStartYear: 2024,
    retirementEndYear: 2054,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render the component with default values', () => {
      render(<DynamicSpendingConfiguration {...defaultProps} />)

      expect(screen.getByText('Dynamische Ausgabenanpassung im Ruhestand')).toBeInTheDocument()
      expect(screen.getByLabelText('Dynamische Ausgabenanpassung aktivieren')).toBeInTheDocument()
    })

    it('should show description text', () => {
      render(<DynamicSpendingConfiguration {...defaultProps} />)

      expect(
        screen.getByText(
          'Realistische Modellierung sich ändernder Ausgabenmuster mit zunehmendem Alter (Go-Go, Slow-Go, No-Go Phasen)',
        ),
      ).toBeInTheDocument()
    })

    it('should not show configuration when disabled', () => {
      const disabledConfig = { ...defaultProps.config, enabled: false }
      render(<DynamicSpendingConfiguration {...defaultProps} config={disabledConfig} />)

      expect(screen.queryByLabelText('Basis-Jahresausgaben')).not.toBeInTheDocument()
      expect(screen.queryByText('Ruhestandsphasen')).not.toBeInTheDocument()
    })

    it('should show configuration when enabled', () => {
      const enabledConfig = { ...defaultProps.config, enabled: true }
      render(<DynamicSpendingConfiguration {...defaultProps} config={enabledConfig} />)

      expect(screen.getByLabelText(/Basis-Jahresausgaben/)).toBeInTheDocument()
      expect(screen.getByText('Ruhestandsphasen')).toBeInTheDocument()
      expect(screen.getByText('Medizinische Kosten-Progression')).toBeInTheDocument()
      expect(screen.getByText('Großausgaben')).toBeInTheDocument()
    })
  })

  describe('Enable/Disable Functionality', () => {
    it('should call onChange when toggling enabled state', async () => {
      const user = userEvent.setup()
      render(<DynamicSpendingConfiguration {...defaultProps} />)

      const enableSwitch = screen.getByLabelText('Dynamische Ausgabenanpassung aktivieren')
      await user.click(enableSwitch)

      expect(defaultProps.onChange).toHaveBeenCalledWith({
        ...defaultProps.config,
        enabled: true,
      })
    })

    it('should enable with fireEvent', () => {
      render(<DynamicSpendingConfiguration {...defaultProps} />)

      const enableSwitch = screen.getByLabelText('Dynamische Ausgabenanpassung aktivieren')
      fireEvent.click(enableSwitch)

      expect(defaultProps.onChange).toHaveBeenCalledWith({
        ...defaultProps.config,
        enabled: true,
      })
    })
  })

  describe('Basic Configuration Fields', () => {
    it('should update base annual spending', () => {
      const enabledConfig = { ...defaultProps.config, enabled: true }
      render(<DynamicSpendingConfiguration {...defaultProps} config={enabledConfig} />)

      const input = screen.getByLabelText(/Basis-Jahresausgaben/)
      fireEvent.change(input, { target: { value: '60000' } })

      expect(defaultProps.onChange).toHaveBeenCalled()
      const lastCall = defaultProps.onChange.mock.calls[defaultProps.onChange.mock.calls.length - 1][0]
      expect(lastCall.baseAnnualSpending).toBe(60000)
    })

    it('should update birth year', () => {
      const enabledConfig = { ...defaultProps.config, enabled: true }
      render(<DynamicSpendingConfiguration {...defaultProps} config={enabledConfig} />)

      const input = screen.getByLabelText('Geburtsjahr')
      fireEvent.change(input, { target: { value: '1960' } })

      expect(defaultProps.onChange).toHaveBeenCalled()
      const lastCall = defaultProps.onChange.mock.calls[defaultProps.onChange.mock.calls.length - 1][0]
      expect(lastCall.birthYear).toBe(1960)
    })

    it('should update annual gifts', () => {
      const enabledConfig = { ...defaultProps.config, enabled: true }
      render(<DynamicSpendingConfiguration {...defaultProps} config={enabledConfig} />)

      const input = screen.getByLabelText(/Jährliche Geschenke\/Spenden/)
      fireEvent.change(input, { target: { value: '5000' } })

      expect(defaultProps.onChange).toHaveBeenCalled()
      const lastCall = defaultProps.onChange.mock.calls[defaultProps.onChange.mock.calls.length - 1][0]
      expect(lastCall.annualGifts).toBe(5000)
    })

    it('should display tooltips for configuration fields', () => {
      const enabledConfig = { ...defaultProps.config, enabled: true }
      render(<DynamicSpendingConfiguration {...defaultProps} config={enabledConfig} />)

      // Check for HelpCircle icons presence by class name
      const helpIcons = document.querySelectorAll('[class*="lucide-circle-question-mark"]')
      expect(helpIcons.length).toBeGreaterThan(0)
    })
  })

  describe('Retirement Phases', () => {
    it('should display all three retirement phases', () => {
      const enabledConfig = { ...defaultProps.config, enabled: true }
      render(<DynamicSpendingConfiguration {...defaultProps} config={enabledConfig} />)

      expect(screen.getByText('Go-Go-Phase')).toBeInTheDocument()
      expect(screen.getByText('Slow-Go-Phase')).toBeInTheDocument()
      expect(screen.getByText('No-Go-Phase')).toBeInTheDocument()
    })

    it('should display phase descriptions', () => {
      const enabledConfig = { ...defaultProps.config, enabled: true }
      render(<DynamicSpendingConfiguration {...defaultProps} config={enabledConfig} />)

      expect(screen.getByText('Aktiver Ruhestand mit Reisen, Hobbys und hoher Mobilität')).toBeInTheDocument()
      expect(screen.getByText('Reduzierte Aktivitäten, weniger Reisen, mehr Zeit zu Hause')).toBeInTheDocument()
      expect(screen.getByText('Überwiegend häuslicher Lebensstil mit höheren Pflegekosten')).toBeInTheDocument()
    })

    it('should display phase badges', () => {
      const enabledConfig = { ...defaultProps.config, enabled: true }
      render(<DynamicSpendingConfiguration {...defaultProps} config={enabledConfig} />)

      expect(screen.getByText('Aktiv')).toBeInTheDocument()
      expect(screen.getByText('Reduziert')).toBeInTheDocument()
      expect(screen.getByText('Häuslich')).toBeInTheDocument()
    })

    it('should update Go-Go start age', () => {
      const enabledConfig = { ...defaultProps.config, enabled: true }
      render(<DynamicSpendingConfiguration {...defaultProps} config={enabledConfig} />)

      const inputs = screen.getAllByLabelText('Startalter')
      fireEvent.change(inputs[0], { target: { value: '65' } })

      expect(defaultProps.onChange).toHaveBeenCalled()
      const lastCall = defaultProps.onChange.mock.calls[defaultProps.onChange.mock.calls.length - 1][0]
      expect(lastCall.phaseConfig.goGoStartAge).toBe(65)
    })

    it('should update Go-Go multiplier', () => {
      const enabledConfig = { ...defaultProps.config, enabled: true }
      render(<DynamicSpendingConfiguration {...defaultProps} config={enabledConfig} />)

      const inputs = screen.getAllByLabelText('Ausgaben-Multiplikator (%)')
      fireEvent.change(inputs[0], { target: { value: '110' } })

      expect(defaultProps.onChange).toHaveBeenCalled()
      const lastCall = defaultProps.onChange.mock.calls[defaultProps.onChange.mock.calls.length - 1][0]
      expect(lastCall.phaseConfig.goGoMultiplier).toBe(1.1)
    })

    it('should update Slow-Go start age', () => {
      const enabledConfig = { ...defaultProps.config, enabled: true }
      render(<DynamicSpendingConfiguration {...defaultProps} config={enabledConfig} />)

      const inputs = screen.getAllByLabelText('Startalter')
      fireEvent.change(inputs[1], { target: { value: '75' } })

      expect(defaultProps.onChange).toHaveBeenCalled()
      const lastCall = defaultProps.onChange.mock.calls[defaultProps.onChange.mock.calls.length - 1][0]
      expect(lastCall.phaseConfig.slowGoStartAge).toBe(75)
    })

    it('should update Slow-Go multiplier', () => {
      const enabledConfig = { ...defaultProps.config, enabled: true }
      render(<DynamicSpendingConfiguration {...defaultProps} config={enabledConfig} />)

      const inputs = screen.getAllByLabelText('Ausgaben-Multiplikator (%)')
      fireEvent.change(inputs[1], { target: { value: '80' } })

      expect(defaultProps.onChange).toHaveBeenCalled()
      const lastCall = defaultProps.onChange.mock.calls[defaultProps.onChange.mock.calls.length - 1][0]
      expect(lastCall.phaseConfig.slowGoMultiplier).toBe(0.8)
    })

    it('should update No-Go start age', () => {
      const enabledConfig = { ...defaultProps.config, enabled: true }
      render(<DynamicSpendingConfiguration {...defaultProps} config={enabledConfig} />)

      const inputs = screen.getAllByLabelText('Startalter')
      fireEvent.change(inputs[2], { target: { value: '85' } })

      expect(defaultProps.onChange).toHaveBeenCalled()
      const lastCall = defaultProps.onChange.mock.calls[defaultProps.onChange.mock.calls.length - 1][0]
      expect(lastCall.phaseConfig.noGoStartAge).toBe(85)
    })

    it('should update No-Go multiplier', () => {
      const enabledConfig = { ...defaultProps.config, enabled: true }
      render(<DynamicSpendingConfiguration {...defaultProps} config={enabledConfig} />)

      const inputs = screen.getAllByLabelText('Ausgaben-Multiplikator (%)')
      fireEvent.change(inputs[2], { target: { value: '65' } })

      expect(defaultProps.onChange).toHaveBeenCalled()
      const lastCall = defaultProps.onChange.mock.calls[defaultProps.onChange.mock.calls.length - 1][0]
      expect(lastCall.phaseConfig.noGoMultiplier).toBe(0.65)
    })

    it('should display information alert about retirement phases', () => {
      const enabledConfig = { ...defaultProps.config, enabled: true }
      render(<DynamicSpendingConfiguration {...defaultProps} config={enabledConfig} />)

      expect(
        screen.getByText(
          /Forschung zeigt: Ausgaben sinken typischerweise mit dem Alter/,
        ),
      ).toBeInTheDocument()
    })
  })

  describe('Medical Cost Configuration', () => {
    it('should toggle medical cost progression', async () => {
      const user = userEvent.setup()
      const enabledConfig = { ...defaultProps.config, enabled: true }
      render(<DynamicSpendingConfiguration {...defaultProps} config={enabledConfig} />)

      const medicalSwitch = screen.getAllByRole('switch')[1] // Second switch is medical costs
      await user.click(medicalSwitch)

      expect(defaultProps.onChange).toHaveBeenCalled()
      const lastCall = defaultProps.onChange.mock.calls[defaultProps.onChange.mock.calls.length - 1][0]
      expect(lastCall.medicalCostConfig.enabled).toBe(false)
    })

    it('should show medical cost fields when enabled', () => {
      const enabledConfig = {
        ...defaultProps.config,
        enabled: true,
        medicalCostConfig: { ...defaultProps.config.medicalCostConfig, enabled: true },
      }
      render(<DynamicSpendingConfiguration {...defaultProps} config={enabledConfig} />)

      expect(screen.getByLabelText('Basis-Gesundheitskosten (€/Jahr)')).toBeInTheDocument()
      expect(screen.getByLabelText('Medizinische Inflationsrate (%)')).toBeInTheDocument()
      expect(screen.getByLabelText('Beschleunigungsalter')).toBeInTheDocument()
      expect(screen.getByLabelText('Beschleunigte Rate (%)')).toBeInTheDocument()
    })

    it('should not show medical cost fields when disabled', () => {
      const enabledConfig = {
        ...defaultProps.config,
        enabled: true,
        medicalCostConfig: { ...defaultProps.config.medicalCostConfig, enabled: false },
      }
      render(<DynamicSpendingConfiguration {...defaultProps} config={enabledConfig} />)

      expect(screen.queryByLabelText('Basis-Gesundheitskosten (€/Jahr)')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Medizinische Inflationsrate (%)')).not.toBeInTheDocument()
    })

    it('should update base medical costs', () => {
      const enabledConfig = {
        ...defaultProps.config,
        enabled: true,
        medicalCostConfig: { ...defaultProps.config.medicalCostConfig, enabled: true },
      }
      render(<DynamicSpendingConfiguration {...defaultProps} config={enabledConfig} />)

      const input = screen.getByLabelText('Basis-Gesundheitskosten (€/Jahr)')
      fireEvent.change(input, { target: { value: '3000' } })

      expect(defaultProps.onChange).toHaveBeenCalled()
      const lastCall = defaultProps.onChange.mock.calls[defaultProps.onChange.mock.calls.length - 1][0]
      expect(lastCall.medicalCostConfig.baseMedicalCosts).toBe(3000)
    })

    it('should update medical inflation rate', () => {
      const enabledConfig = {
        ...defaultProps.config,
        enabled: true,
        medicalCostConfig: { ...defaultProps.config.medicalCostConfig, enabled: true },
      }
      render(<DynamicSpendingConfiguration {...defaultProps} config={enabledConfig} />)

      const input = screen.getByLabelText('Medizinische Inflationsrate (%)')
      fireEvent.change(input, { target: { value: '5' } })

      expect(defaultProps.onChange).toHaveBeenCalled()
      const lastCall = defaultProps.onChange.mock.calls[defaultProps.onChange.mock.calls.length - 1][0]
      expect(lastCall.medicalCostConfig.medicalInflationRate).toBe(0.05)
    })

    it('should update acceleration age', () => {
      const enabledConfig = {
        ...defaultProps.config,
        enabled: true,
        medicalCostConfig: { ...defaultProps.config.medicalCostConfig, enabled: true },
      }
      render(<DynamicSpendingConfiguration {...defaultProps} config={enabledConfig} />)

      const input = screen.getByLabelText('Beschleunigungsalter')
      fireEvent.change(input, { target: { value: '80' } })

      expect(defaultProps.onChange).toHaveBeenCalled()
      const lastCall = defaultProps.onChange.mock.calls[defaultProps.onChange.mock.calls.length - 1][0]
      expect(lastCall.medicalCostConfig.accelerationAge).toBe(80)
    })

    it('should update accelerated rate', () => {
      const enabledConfig = {
        ...defaultProps.config,
        enabled: true,
        medicalCostConfig: { ...defaultProps.config.medicalCostConfig, enabled: true },
      }
      render(<DynamicSpendingConfiguration {...defaultProps} config={enabledConfig} />)

      const input = screen.getByLabelText('Beschleunigte Rate (%)')
      fireEvent.change(input, { target: { value: '7' } })

      expect(defaultProps.onChange).toHaveBeenCalled()
      const lastCall = defaultProps.onChange.mock.calls[defaultProps.onChange.mock.calls.length - 1][0]
      expect(lastCall.medicalCostConfig.acceleratedRate).toBe(0.07)
    })
  })

  describe('Large Expenses', () => {
    it('should show empty state when no expenses', () => {
      const enabledConfig = { ...defaultProps.config, enabled: true }
      render(<DynamicSpendingConfiguration {...defaultProps} config={enabledConfig} />)

      expect(screen.getByText('Keine Großausgaben definiert. Klicken Sie "Hinzufügen" oben.')).toBeInTheDocument()
    })

    it('should add new expense when clicking add button', async () => {
      const user = userEvent.setup()
      const enabledConfig = { ...defaultProps.config, enabled: true }
      render(<DynamicSpendingConfiguration {...defaultProps} config={enabledConfig} />)

      const addButton = screen.getByRole('button', { name: /Hinzufügen/ })
      await user.click(addButton)

      expect(defaultProps.onChange).toHaveBeenCalled()
      const lastCall = defaultProps.onChange.mock.calls[defaultProps.onChange.mock.calls.length - 1][0]
      expect(lastCall.largeExpenses).toHaveLength(1)
      expect(lastCall.largeExpenses[0]).toEqual({
        year: 2029, // retirementStartYear + 5
        amount: 10000,
        description: 'Neue Ausgabe',
        category: 'sonstiges',
      })
    })

    it('should display expense when present', () => {
      const enabledConfig = {
        ...defaultProps.config,
        enabled: true,
        largeExpenses: [
          {
            year: 2030,
            amount: 25000,
            description: 'Weltreise',
            category: 'reise' as const,
          },
        ],
      }
      render(<DynamicSpendingConfiguration {...defaultProps} config={enabledConfig} />)

      expect(screen.getAllByText('Reise').length).toBeGreaterThan(0)
      expect(screen.getByDisplayValue('25000')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Weltreise')).toBeInTheDocument()
    })

    it('should remove expense when clicking delete button', async () => {
      const user = userEvent.setup()
      const enabledConfig = {
        ...defaultProps.config,
        enabled: true,
        largeExpenses: [
          {
            year: 2030,
            amount: 25000,
            description: 'Weltreise',
            category: 'reise' as const,
          },
        ],
      }
      render(<DynamicSpendingConfiguration {...defaultProps} config={enabledConfig} />)

      const deleteButton = screen.getByRole('button', { name: '' }) // Trash icon button
      await user.click(deleteButton)

      expect(defaultProps.onChange).toHaveBeenCalled()
      const lastCall = defaultProps.onChange.mock.calls[defaultProps.onChange.mock.calls.length - 1][0]
      expect(lastCall.largeExpenses).toHaveLength(0)
    })

    it('should update expense year', () => {
      const enabledConfig = {
        ...defaultProps.config,
        enabled: true,
        largeExpenses: [
          {
            year: 2030,
            amount: 25000,
            description: 'Weltreise',
            category: 'reise' as const,
          },
        ],
      }
      render(<DynamicSpendingConfiguration {...defaultProps} config={enabledConfig} />)

      const yearInput = screen.getByDisplayValue('2030')
      fireEvent.change(yearInput, { target: { value: '2035' } })

      expect(defaultProps.onChange).toHaveBeenCalled()
      const lastCall = defaultProps.onChange.mock.calls[defaultProps.onChange.mock.calls.length - 1][0]
      expect(lastCall.largeExpenses[0].year).toBe(2035)
    })

    it('should update expense amount', () => {
      const enabledConfig = {
        ...defaultProps.config,
        enabled: true,
        largeExpenses: [
          {
            year: 2030,
            amount: 25000,
            description: 'Weltreise',
            category: 'reise' as const,
          },
        ],
      }
      render(<DynamicSpendingConfiguration {...defaultProps} config={enabledConfig} />)

      const amountInput = screen.getByDisplayValue('25000')
      fireEvent.change(amountInput, { target: { value: '30000' } })

      expect(defaultProps.onChange).toHaveBeenCalled()
      const lastCall = defaultProps.onChange.mock.calls[defaultProps.onChange.mock.calls.length - 1][0]
      expect(lastCall.largeExpenses[0].amount).toBe(30000)
    })

    it('should update expense description', () => {
      const enabledConfig = {
        ...defaultProps.config,
        enabled: true,
        largeExpenses: [
          {
            year: 2030,
            amount: 25000,
            description: 'Weltreise',
            category: 'reise' as const,
          },
        ],
      }
      render(<DynamicSpendingConfiguration {...defaultProps} config={enabledConfig} />)

      const descriptionInput = screen.getByDisplayValue('Weltreise')
      fireEvent.change(descriptionInput, { target: { value: 'Kreuzfahrt' } })

      expect(defaultProps.onChange).toHaveBeenCalled()
      const lastCall = defaultProps.onChange.mock.calls[defaultProps.onChange.mock.calls.length - 1][0]
      expect(lastCall.largeExpenses[0].description).toBe('Kreuzfahrt')
    })

    it('should update expense category', () => {
      const enabledConfig = {
        ...defaultProps.config,
        enabled: true,
        largeExpenses: [
          {
            year: 2030,
            amount: 25000,
            description: 'Weltreise',
            category: 'reise' as const,
          },
        ],
      }
      render(<DynamicSpendingConfiguration {...defaultProps} config={enabledConfig} />)

      const categorySelect = screen.getByDisplayValue('Reise')
      fireEvent.change(categorySelect, { target: { value: 'auto' } })

      expect(defaultProps.onChange).toHaveBeenCalled()
      const lastCall = defaultProps.onChange.mock.calls[defaultProps.onChange.mock.calls.length - 1][0]
      expect(lastCall.largeExpenses[0].category).toBe('auto')
    })

    it('should display all expense categories', () => {
      const enabledConfig = {
        ...defaultProps.config,
        enabled: true,
        largeExpenses: [
          {
            year: 2030,
            amount: 25000,
            description: 'Test',
            category: 'reise' as const,
          },
        ],
      }
      render(<DynamicSpendingConfiguration {...defaultProps} config={enabledConfig} />)

      const categorySelect = screen.getByDisplayValue('Reise')
      const options = categorySelect.querySelectorAll('option')

      expect(options).toHaveLength(6)
      expect(Array.from(options).map((o) => o.textContent)).toEqual([
        'Reise',
        'Renovierung',
        'Auto',
        'Gesundheit',
        'Familie',
        'Sonstiges',
      ])
    })

    it('should handle multiple expenses', () => {
      const enabledConfig = {
        ...defaultProps.config,
        enabled: true,
        largeExpenses: [
          {
            year: 2030,
            amount: 25000,
            description: 'Weltreise',
            category: 'reise' as const,
          },
          {
            year: 2035,
            amount: 15000,
            description: 'Neues Auto',
            category: 'auto' as const,
          },
        ],
      }
      render(<DynamicSpendingConfiguration {...defaultProps} config={enabledConfig} />)

      expect(screen.getAllByText('Reise').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Auto').length).toBeGreaterThan(0)
      expect(screen.getByDisplayValue('Weltreise')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Neues Auto')).toBeInTheDocument()
    })
  })

  describe('Validation', () => {
    it('should display validation errors', () => {
      const invalidConfig = {
        ...defaultProps.config,
        enabled: true,
        baseAnnualSpending: -1000, // Invalid: negative
        birthYear: 1800, // Invalid: too old
      }
      render(<DynamicSpendingConfiguration {...defaultProps} config={invalidConfig} />)

      expect(screen.getByText('Basis-Jahresausgaben müssen größer als 0 sein')).toBeInTheDocument()
      expect(screen.getByText('Geburtsjahr muss zwischen 1900 und 2100 liegen')).toBeInTheDocument()
    })

    it('should display phase configuration errors', () => {
      const invalidConfig = {
        ...defaultProps.config,
        enabled: true,
        phaseConfig: {
          goGoStartAge: 75,
          slowGoStartAge: 70, // Invalid: before go-go
          noGoStartAge: 65, // Invalid: before slow-go
          goGoMultiplier: 1.0,
          slowGoMultiplier: 0.75,
          noGoMultiplier: 0.6,
        },
      }
      render(<DynamicSpendingConfiguration {...defaultProps} config={invalidConfig} />)

      expect(screen.getByText('Slow-Go-Phase muss nach Go-Go-Phase beginnen')).toBeInTheDocument()
      expect(screen.getByText('No-Go-Phase muss nach Slow-Go-Phase beginnen')).toBeInTheDocument()
    })

    it('should display medical cost validation errors', () => {
      const invalidConfig = {
        ...defaultProps.config,
        enabled: true,
        medicalCostConfig: {
          enabled: true,
          baseMedicalCosts: -100, // Invalid: negative
          medicalInflationRate: 0.6, // Invalid: too high
          accelerationAge: 55, // Invalid: too young
          acceleratedRate: 0.8, // Invalid: too high
        },
      }
      render(<DynamicSpendingConfiguration {...defaultProps} config={invalidConfig} />)

      expect(screen.getByText('Basis-Gesundheitskosten können nicht negativ sein')).toBeInTheDocument()
      expect(screen.getByText('Medizinische Inflationsrate muss zwischen -10% und 50% liegen')).toBeInTheDocument()
      expect(screen.getByText('Beschleunigungsalter muss zwischen 60 und 100 liegen')).toBeInTheDocument()
    })

    it('should display large expense validation errors', () => {
      const invalidConfig = {
        ...defaultProps.config,
        enabled: true,
        largeExpenses: [
          {
            year: 1999, // Invalid: too old
            amount: -5000, // Invalid: negative
            description: '', // Invalid: empty
            category: 'reise' as const,
          },
        ],
      }
      render(<DynamicSpendingConfiguration {...defaultProps} config={invalidConfig} />)

      expect(screen.getByText('Großausgabe 1: Jahr muss zwischen 2000 und 2150 liegen')).toBeInTheDocument()
      expect(screen.getByText('Großausgabe 1: Betrag muss größer als 0 sein')).toBeInTheDocument()
      expect(screen.getByText('Großausgabe 1: Beschreibung erforderlich')).toBeInTheDocument()
    })

    it('should not show preview button when there are validation errors', () => {
      const invalidConfig = {
        ...defaultProps.config,
        enabled: true,
        baseAnnualSpending: -1000,
      }
      render(<DynamicSpendingConfiguration {...defaultProps} config={invalidConfig} />)

      expect(screen.queryByText('Vorschau anzeigen')).not.toBeInTheDocument()
    })
  })

  describe('Preview Functionality', () => {
    it('should show preview button when no validation errors', () => {
      const validConfig = { ...defaultProps.config, enabled: true }
      render(<DynamicSpendingConfiguration {...defaultProps} config={validConfig} />)

      expect(screen.getByText('Vorschau anzeigen')).toBeInTheDocument()
    })

    it('should toggle preview visibility', async () => {
      const user = userEvent.setup()
      const validConfig = { ...defaultProps.config, enabled: true }
      render(<DynamicSpendingConfiguration {...defaultProps} config={validConfig} />)

      const previewButton = screen.getByText('Vorschau anzeigen')
      await user.click(previewButton)

      expect(screen.getByText('Vorschau ausblenden')).toBeInTheDocument()
      expect(screen.getByText('Durchschnittliche Jahresausgaben')).toBeInTheDocument()
    })

    it('should display summary metrics in preview', async () => {
      const user = userEvent.setup()
      const validConfig = { ...defaultProps.config, enabled: true }
      render(<DynamicSpendingConfiguration {...defaultProps} config={validConfig} />)

      const previewButton = screen.getByText('Vorschau anzeigen')
      await user.click(previewButton)

      expect(screen.getByText('Durchschnittliche Jahresausgaben')).toBeInTheDocument()
      expect(screen.getByText('Go-Go / Slow-Go / No-Go Jahre')).toBeInTheDocument()
      expect(screen.getByText('Gesamt-Ausgaben')).toBeInTheDocument()
    })

    it('should display large expenses total in preview', async () => {
      const user = userEvent.setup()
      const validConfig = {
        ...defaultProps.config,
        enabled: true,
        largeExpenses: [
          {
            year: 2030,
            amount: 25000,
            description: 'Weltreise',
            category: 'reise' as const,
          },
        ],
      }
      render(<DynamicSpendingConfiguration {...defaultProps} config={validConfig} />)

      const previewButton = screen.getByText('Vorschau anzeigen')
      await user.click(previewButton)

      expect(screen.getByText(/Großausgaben:/)).toBeInTheDocument()
      expect(screen.getByText((content, element) => {
        return element !== null && content.includes('25.000') && content.includes('€')
      })).toBeInTheDocument()
    })

    it('should display medical costs total in preview', async () => {
      const user = userEvent.setup()
      const validConfig = {
        ...defaultProps.config,
        enabled: true,
        medicalCostConfig: {
          ...defaultProps.config.medicalCostConfig,
          enabled: true,
        },
      }
      render(<DynamicSpendingConfiguration {...defaultProps} config={validConfig} />)

      const previewButton = screen.getByText('Vorschau anzeigen')
      await user.click(previewButton)

      expect(screen.getByText(/Gesamt-Gesundheitskosten:/)).toBeInTheDocument()
    })

    it('should hide preview when clicking hide button', async () => {
      const user = userEvent.setup()
      const validConfig = { ...defaultProps.config, enabled: true }
      render(<DynamicSpendingConfiguration {...defaultProps} config={validConfig} />)

      // Show preview
      const showButton = screen.getByText('Vorschau anzeigen')
      await user.click(showButton)

      // Hide preview
      const hideButton = screen.getByText('Vorschau ausblenden')
      await user.click(hideButton)

      expect(screen.queryByText('Durchschnittliche Jahresausgaben')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for all inputs', () => {
      const enabledConfig = { ...defaultProps.config, enabled: true }
      render(<DynamicSpendingConfiguration {...defaultProps} config={enabledConfig} />)

      // Basic config
      expect(screen.getByLabelText(/Basis-Jahresausgaben/)).toBeInTheDocument()
      expect(screen.getByLabelText('Geburtsjahr')).toBeInTheDocument()
      expect(screen.getByLabelText(/Jährliche Geschenke/)).toBeInTheDocument()

      // Phase config
      expect(screen.getAllByLabelText('Startalter')).toHaveLength(3)
      expect(screen.getAllByLabelText('Ausgaben-Multiplikator (%)')).toHaveLength(3)
    })

    it('should have proper switch roles', () => {
      render(<DynamicSpendingConfiguration {...defaultProps} />)

      const switches = screen.getAllByRole('switch')
      expect(switches.length).toBeGreaterThanOrEqual(1)
    })

    it('should have proper button roles', () => {
      const enabledConfig = { ...defaultProps.config, enabled: true }
      render(<DynamicSpendingConfiguration {...defaultProps} config={enabledConfig} />)

      // Add expense button
      expect(screen.getByRole('button', { name: /Hinzufügen/ })).toBeInTheDocument()

      // Preview button
      expect(screen.getByRole('button', { name: /Vorschau anzeigen/ })).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero annual spending', () => {
      const config = {
        ...defaultProps.config,
        enabled: true,
        baseAnnualSpending: 0,
      }
      render(<DynamicSpendingConfiguration {...defaultProps} config={config} />)

      expect(screen.getByText('Basis-Jahresausgaben müssen größer als 0 sein')).toBeInTheDocument()
    })

    it('should handle extreme birth years', () => {
      const config = {
        ...defaultProps.config,
        enabled: true,
        birthYear: 2200,
      }
      render(<DynamicSpendingConfiguration {...defaultProps} config={config} />)

      expect(screen.getByText('Geburtsjahr muss zwischen 1900 und 2100 liegen')).toBeInTheDocument()
    })

    it('should handle multiple validation errors simultaneously', () => {
      const config = {
        ...defaultProps.config,
        enabled: true,
        baseAnnualSpending: -1000,
        birthYear: 1800,
        annualGifts: -500,
      }
      render(<DynamicSpendingConfiguration {...defaultProps} config={config} />)

      expect(screen.getByText('Basis-Jahresausgaben müssen größer als 0 sein')).toBeInTheDocument()
      expect(screen.getByText('Geburtsjahr muss zwischen 1900 und 2100 liegen')).toBeInTheDocument()
      expect(screen.getByText('Jährliche Geschenke/Spenden können nicht negativ sein')).toBeInTheDocument()
    })

    it('should handle empty large expenses array', () => {
      const config = {
        ...defaultProps.config,
        enabled: true,
        largeExpenses: [],
      }
      render(<DynamicSpendingConfiguration {...defaultProps} config={config} />)

      expect(screen.getByText('Keine Großausgaben definiert. Klicken Sie "Hinzufügen" oben.')).toBeInTheDocument()
    })
  })
})
