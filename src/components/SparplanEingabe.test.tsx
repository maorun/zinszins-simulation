import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { SparplanEingabe } from './SparplanEingabe'
import { SimulationAnnual } from '../utils/simulate'
import type { Sparplan } from '../utils/sparplan-utils'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}))

describe('SparplanEingabe localStorage sync', () => {
  const mockDispatch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default sparplan when no currentSparplans provided', () => {
    render(
      <SparplanEingabe
        dispatch={mockDispatch}
        simulationAnnual={SimulationAnnual.yearly}
      />,
    )

    // Should show the initial default sparplan
    expect(screen.getByText(/19\.800,00 €/)).toBeInTheDocument()
  })

  it('should initialize with provided currentSparplans', () => {
    const customSparplans: Sparplan[] = [
      {
        id: 100,
        start: new Date('2024-01-01'),
        end: new Date('2030-12-31'),
        einzahlung: 24000,
      },
      {
        id: 200,
        start: new Date('2025-01-01'),
        end: null,
        einzahlung: 12000,
      },
    ]

    render(
      <SparplanEingabe
        dispatch={mockDispatch}
        simulationAnnual={SimulationAnnual.yearly}
        currentSparplans={customSparplans}
      />,
    )

    // Should show the custom sparplans, not the default one
    expect(screen.getByText(/24\.000,00 €/)).toBeInTheDocument()
    expect(screen.getByText(/12\.000,00 €/)).toBeInTheDocument()
    expect(screen.queryByText(/19\.800,00 €/)).not.toBeInTheDocument()
  })

  it('should show empty state when empty sparplans array provided', () => {
    render(
      <SparplanEingabe
        dispatch={mockDispatch}
        simulationAnnual={SimulationAnnual.yearly}
        currentSparplans={[]}
      />,
    )

    // Should show empty state message
    expect(screen.getByText(/Noch keine Sparpläne oder Einmalzahlungen erstellt/)).toBeInTheDocument()
  })

  it('should properly display monthly values when simulation is monthly', () => {
    const yearlySparplan: Sparplan[] = [
      {
        id: 300,
        start: new Date('2024-01-01'),
        end: null,
        einzahlung: 24000, // 24,000€ yearly = 2,000€ monthly
      },
    ]

    render(
      <SparplanEingabe
        dispatch={mockDispatch}
        simulationAnnual={SimulationAnnual.monthly}
        currentSparplans={yearlySparplan}
      />,
    )

    // Should show monthly equivalent (24000 / 12 = 2000)
    expect(screen.getByText(/2\.000,00 €/)).toBeInTheDocument()
    expect(screen.getByText(/💰 Monatlich:/)).toBeInTheDocument()
  })
})

describe('SparplanEingabe edit functionality', () => {
  const mockDispatch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show edit buttons for existing savings plans and one-time payments', () => {
    const testSparplans: Sparplan[] = [
      {
        id: 1,
        start: new Date('2024-01-01'),
        end: null,
        einzahlung: 24000,
      },
      {
        id: 2,
        start: new Date('2025-06-15'),
        end: new Date('2025-06-15'), // Same date = one-time payment
        einzahlung: 5000,
      },
    ]

    render(
      <SparplanEingabe
        dispatch={mockDispatch}
        simulationAnnual={SimulationAnnual.yearly}
        currentSparplans={testSparplans}
      />,
    )

    // Should show edit buttons for both items
    expect(screen.getByRole('button', { name: 'Sparplan bearbeiten' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Einmalzahlung bearbeiten' })).toBeInTheDocument()
  })

  it('should disable edit/delete buttons when in edit mode', async () => {
    const user = userEvent.setup()
    const testSparplans: Sparplan[] = [
      {
        id: 1,
        start: new Date('2024-01-01'),
        end: null,
        einzahlung: 24000,
      },
    ]

    render(
      <SparplanEingabe
        dispatch={mockDispatch}
        simulationAnnual={SimulationAnnual.yearly}
        currentSparplans={testSparplans}
      />,
    )

    const editButton = screen.getByRole('button', { name: 'Sparplan bearbeiten' })
    const deleteButton = screen.getByRole('button', { name: 'Sparplan löschen' })

    // Click edit button
    await user.click(editButton)

    // Buttons should now be disabled
    expect(editButton).toBeDisabled()
    expect(deleteButton).toBeDisabled()
  })

  it('should disable buttons in edit mode indicating edit functionality works', async () => {
    const user = userEvent.setup()
    const testSparplans: Sparplan[] = [
      {
        id: 1,
        start: new Date('2024-01-01'),
        end: null,
        einzahlung: 24000,
      },
    ]

    render(
      <SparplanEingabe
        dispatch={mockDispatch}
        simulationAnnual={SimulationAnnual.yearly}
        currentSparplans={testSparplans}
      />,
    )

    const editButton = screen.getByRole('button', { name: 'Sparplan bearbeiten' })
    const deleteButton = screen.getByRole('button', { name: 'Sparplan löschen' })

    // Initially buttons should be enabled
    expect(editButton).not.toBeDisabled()
    expect(deleteButton).not.toBeDisabled()

    // Click edit button to enter edit mode
    await user.click(editButton)

    // Buttons should be disabled in edit mode (proving edit mode is active)
    expect(editButton).toBeDisabled()
    expect(deleteButton).toBeDisabled()
  })
})

describe('SparplanEingabe Special Events', () => {
  const mockDispatch = vi.fn()
  const defaultProps = {
    dispatch: mockDispatch,
    simulationAnnual: SimulationAnnual.yearly,
    currentSparplans: [],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Special Events Section', () => {
    it('should render special events section', () => {
      render(<SparplanEingabe {...defaultProps} />)

      expect(screen.getByText('🎯 Sonderereignisse erstellen')).toBeInTheDocument()
    })

    it('should expand special events form when clicked', async () => {
      const user = userEvent.setup()
      render(<SparplanEingabe {...defaultProps} />)

      // Click on the special events section
      await user.click(screen.getByText('🎯 Sonderereignisse erstellen'))

      // Should show form fields
      expect(screen.getByText('Erstellen Sie besondere Ereignisse wie Erbschaften oder größere Ausgaben')).toBeInTheDocument()
      expect(screen.getByText('Ereignistyp')).toBeInTheDocument()
    })
  })

  describe('Inheritance Events', () => {
    it('should show inheritance tax calculation for child relationship', async () => {
      const user = userEvent.setup()
      render(<SparplanEingabe {...defaultProps} />)

      // Expand the special events section
      await user.click(screen.getByText('🎯 Sonderereignisse erstellen'))

      // Fill in inheritance amount
      const amountInput = screen.getByPlaceholderText('z.B. 100000')
      await user.type(amountInput, '100000')

      // Should show tax calculation
      expect(screen.getByText(/Steuerberechnung:/)).toBeInTheDocument()
      expect(screen.getByText('Brutto-Erbschaft: 100.000 €')).toBeInTheDocument()
      expect(screen.getByText('Freibetrag: 400.000 €')).toBeInTheDocument()
      expect(screen.getByText('Erbschaftsteuer: 0 €')).toBeInTheDocument()
      expect(screen.getByText('Netto-Erbschaft: 100.000 €')).toBeInTheDocument()
    })

    it('should add inheritance event successfully', async () => {
      const user = userEvent.setup()
      render(<SparplanEingabe {...defaultProps} />)

      // Expand and fill form
      await user.click(screen.getByText('🎯 Sonderereignisse erstellen'))

      const amountInput = screen.getByPlaceholderText('z.B. 100000')
      await user.type(amountInput, '50000')

      const descriptionInput = screen.getByPlaceholderText('z.B. Erbschaft Großeltern, Neuwagenkauf')
      await user.type(descriptionInput, 'Erbschaft Großeltern')

      // Submit the form
      const submitButton = screen.getByText('💰 Erbschaft hinzufügen')
      expect(submitButton).not.toBeDisabled()
      await user.click(submitButton)

      // Should call dispatch with correct data
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            einzahlung: 50000,
            eventType: 'inheritance',
            specialEventData: expect.objectContaining({
              relationshipType: 'child',
              grossInheritanceAmount: 50000,
              description: 'Erbschaft Großeltern',
            }),
          }),
        ]),
      )
    })
  })

  describe('Expense Events', () => {
    it('should show expense form when expense is selected', async () => {
      const user = userEvent.setup()
      render(<SparplanEingabe {...defaultProps} />)

      // Expand and switch to expense
      await user.click(screen.getByText('🎯 Sonderereignisse erstellen'))
      const eventTypeSelect = screen.getByDisplayValue('💰 Erbschaft')
      await user.selectOptions(eventTypeSelect, 'expense')

      // Should show expense-specific fields
      expect(screen.getByText('Ausgabentyp')).toBeInTheDocument()
      expect(screen.getByText('Ausgabenbetrag (€)')).toBeInTheDocument()
      expect(screen.getByText('💳 Mit Kredit finanzieren')).toBeInTheDocument()
    })

    it('should show credit fields when credit option is enabled', async () => {
      const user = userEvent.setup()
      render(<SparplanEingabe {...defaultProps} />)

      // Setup expense form with credit
      await user.click(screen.getByText('🎯 Sonderereignisse erstellen'))
      const eventTypeSelect = screen.getByDisplayValue('💰 Erbschaft')
      await user.selectOptions(eventTypeSelect, 'expense')

      // Enable credit financing
      const creditCheckbox = screen.getByLabelText(/Mit Kredit finanzieren/)
      await user.click(creditCheckbox)

      // Should show credit fields with defaults
      expect(screen.getByText('Zinssatz (% p.a.)')).toBeInTheDocument()
      expect(screen.getByText('Laufzeit (Jahre)')).toBeInTheDocument()
      expect(screen.getByDisplayValue('4.5')).toBeInTheDocument()
      expect(screen.getByDisplayValue('5')).toBeInTheDocument()
    })

    it('should add expense event with credit', async () => {
      const user = userEvent.setup()
      render(<SparplanEingabe {...defaultProps} />)

      // Setup expense with credit
      await user.click(screen.getByText('🎯 Sonderereignisse erstellen'))
      const eventTypeSelect = screen.getByDisplayValue('💰 Erbschaft')
      await user.selectOptions(eventTypeSelect, 'expense')

      const amountInput = screen.getByPlaceholderText('z.B. 25000')
      await user.type(amountInput, '30000')

      const creditCheckbox = screen.getByLabelText(/Mit Kredit finanzieren/)
      await user.click(creditCheckbox)

      const descriptionInput = screen.getByPlaceholderText('z.B. Erbschaft Großeltern, Neuwagenkauf')
      await user.type(descriptionInput, 'Neuwagenkauf')

      // Submit
      const submitButton = screen.getByText('💸 Ausgabe hinzufügen')
      await user.click(submitButton)

      // Should call dispatch with expense data (negative amount)
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            einzahlung: -30000,
            eventType: 'expense',
            specialEventData: expect.objectContaining({
              expenseType: 'car',
              description: 'Neuwagenkauf',
              creditTerms: expect.objectContaining({
                interestRate: 0.045,
                termYears: 5,
                monthlyPayment: expect.any(Number),
              }),
            }),
          }),
        ]),
      )
    })
  })

  describe('Special Events Display', () => {
    const sampleSparplans: Sparplan[] = [
      {
        id: 1,
        start: new Date('2025-01-01'),
        end: new Date('2025-01-01'),
        einzahlung: 75000,
        eventType: 'inheritance',
        specialEventData: {
          relationshipType: 'child',
          grossInheritanceAmount: 75000,
          description: 'Erbschaft Großeltern',
        },
      },
      {
        id: 2,
        start: new Date('2025-06-01'),
        end: new Date('2025-06-01'),
        einzahlung: -20000,
        eventType: 'expense',
        specialEventData: {
          expenseType: 'car',
          description: 'Gebrauchtwagen',
          creditTerms: {
            interestRate: 0.045,
            termYears: 4,
            monthlyPayment: 454.71,
          },
        },
      },
    ]

    it('should display inheritance events with correct details', () => {
      render(<SparplanEingabe {...defaultProps} currentSparplans={sampleSparplans} />)

      // Should show inheritance event details
      expect(screen.getByText('🎯 Erbschaft')).toBeInTheDocument()
      expect(screen.getByText('75.000,00 €')).toBeInTheDocument()
      expect(screen.getByText('Kind/Stiefkind')).toBeInTheDocument()
      expect(screen.getByText('Erbschaft Großeltern')).toBeInTheDocument()
    })

    it('should display expense events with correct details', () => {
      render(<SparplanEingabe {...defaultProps} currentSparplans={sampleSparplans} />)

      // Should show expense event details
      expect(screen.getAllByText('🎯 Ausgabe')).toHaveLength(1)
      expect(screen.getByText('20.000,00 €')).toBeInTheDocument()
      expect(screen.getByText('Autokauf')).toBeInTheDocument()
      expect(screen.getByText('Gebrauchtwagen')).toBeInTheDocument()
      expect(screen.getByText('4.5% / 4J')).toBeInTheDocument()
    })

    it('should show updated section title including special events', () => {
      render(<SparplanEingabe {...defaultProps} />)

      expect(screen.getByText('📋 Gespeicherte Sparpläne, Einmalzahlungen & Sonderereignisse')).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should disable submit button when no amount is entered', async () => {
      const user = userEvent.setup()
      render(<SparplanEingabe {...defaultProps} />)

      await user.click(screen.getByText('🎯 Sonderereignisse erstellen'))

      const submitButton = screen.getByText('💰 Erbschaft hinzufügen')
      expect(submitButton).toBeDisabled()
    })

    it('should enable submit button when amount is entered', async () => {
      const user = userEvent.setup()
      render(<SparplanEingabe {...defaultProps} />)

      await user.click(screen.getByText('🎯 Sonderereignisse erstellen'))

      const amountInput = screen.getByPlaceholderText('z.B. 100000')
      await user.type(amountInput, '50000')

      const submitButton = screen.getByText('💰 Erbschaft hinzufügen')
      expect(submitButton).not.toBeDisabled()
    })
  })
})
