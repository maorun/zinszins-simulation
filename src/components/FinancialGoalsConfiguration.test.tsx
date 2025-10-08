import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import FinancialGoalsConfiguration from './FinancialGoalsConfiguration'
import { SimulationProvider } from '../contexts/SimulationContext'

// Mock the simulation context with default values
vi.mock('../contexts/useSimulation', () => ({
  useSimulation: () => ({
    financialGoals: [],
    setFinancialGoals: vi.fn(),
    simulationData: {
      data: [
        {
          jahr: 2040,
          gesamtkapitalNachSteuern: 500000,
        },
      ],
      sparplanElements: [],
    },
  }),
}))

describe('FinancialGoalsConfiguration', () => {
  beforeEach(async () => {
    render(
      <SimulationProvider>
        <FinancialGoalsConfiguration />
      </SimulationProvider>,
    )

    // Expand the collapsible card
    const header = screen.getByText(/Finanzziele/)
    fireEvent.click(header.closest('div[data-state]')!)
    await waitFor(() => {
      expect(screen.queryByText(/Neues Ziel hinzufügen/i)).toBeInTheDocument()
    })
  })

  it('should render the component', () => {
    expect(screen.getAllByText(/Finanzziele/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Setzen Sie SMART-Ziele/i)).toBeInTheDocument()
  })

  it('should show current capital', () => {
    // The component should show the current capital from simulation data
    expect(screen.getByText(/Aktuelles Endkapital/i)).toBeInTheDocument()
  })

  it('should render goal input form', () => {
    expect(screen.getByLabelText(/Zieltyp/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Zielname/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Zielbetrag/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Ziel hinzufügen/i })).toBeInTheDocument()
  })

  it('should show message when no goals are defined', () => {
    expect(screen.getByText(/Noch keine Finanzziele definiert/i)).toBeInTheDocument()
  })

  it('should disable add button when name is empty', () => {
    const addButton = screen.getByRole('button', { name: /Ziel hinzufügen/i })
    expect(addButton).toBeDisabled()
  })

  it('should enable add button when both name and amount are provided', () => {
    const nameInput = screen.getByLabelText(/Zielname/i)
    const amountInput = screen.getByLabelText(/Zielbetrag/i)

    fireEvent.change(nameInput, { target: { value: 'Test Goal' } })
    fireEvent.change(amountInput, { target: { value: '100000' } })

    const addButton = screen.getByRole('button', { name: /Ziel hinzufügen/i })
    expect(addButton).not.toBeDisabled()
  })
})
