import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FinancialGoalsKPIDashboard } from './FinancialGoalsKPIDashboard'
import type { FinancialGoal } from '../../helpers/financial-goals'

const mockUseSimulation = vi.hoisted(() => vi.fn())
vi.mock('../contexts/useSimulation', () => ({
  useSimulation: mockUseSimulation,
}))

describe('FinancialGoalsKPIDashboard', () => {
  const createMockSimulationData = (capital: number) => ({
    data: [
      {
        jahr: 2024,
        gesamtkapitalNachSteuern: capital,
        gesamtkapital: capital,
        einzahlungen: 0,
        zinsen: 0,
        steuern: 0,
      },
    ],
  })

  const createMockGoal = (overrides?: Partial<FinancialGoal>): FinancialGoal => ({
    id: 'goal-1',
    type: 'retirement',
    name: 'Altersvorsorge',
    targetAmount: 500000,
    active: true,
    milestones: [
      { targetAmount: 125000, label: '25% erreicht', achieved: false },
      { targetAmount: 250000, label: '50% erreicht', achieved: false },
      { targetAmount: 375000, label: '75% erreicht', achieved: false },
    ],
    ...overrides,
  })

  it('should not render when there are no active goals', () => {
    mockUseSimulation.mockReturnValue({
      financialGoals: [],
      simulationData: createMockSimulationData(100000),
    })

    const { container } = render(<FinancialGoalsKPIDashboard />)
    expect(container.firstChild).toBeNull()
  })

  it('should not render when all goals are inactive', () => {
    const inactiveGoal = createMockGoal({ active: false })
    mockUseSimulation.mockReturnValue({
      financialGoals: [inactiveGoal],
      simulationData: createMockSimulationData(100000),
    })

    const { container } = render(<FinancialGoalsKPIDashboard />)
    expect(container.firstChild).toBeNull()
  })

  it('should render active goals with progress information', () => {
    const goal = createMockGoal()
    mockUseSimulation.mockReturnValue({
      financialGoals: [goal],
      simulationData: createMockSimulationData(250000), // 50% progress
    })

    render(<FinancialGoalsKPIDashboard />)

    expect(screen.getByText('Finanzziele - Fortschritt')).toBeInTheDocument()
    expect(screen.getByText('Altersvorsorge')).toBeInTheDocument()
    expect(screen.getByText('50.0%')).toBeInTheDocument()
  })

  it('should display current capital amount', () => {
    const goal = createMockGoal()
    mockUseSimulation.mockReturnValue({
      financialGoals: [goal],
      simulationData: createMockSimulationData(250000),
    })

    render(<FinancialGoalsKPIDashboard />)

    expect(screen.getByText(/Aktueller Stand:/)).toBeInTheDocument()
    // Use getAllByText because amount appears in multiple places
    expect(screen.getAllByText(/250\.000,00/)[0]).toBeInTheDocument()
  })

  it('should show "Erreicht" badge when goal is achieved', () => {
    const goal = createMockGoal({ targetAmount: 100000 })
    mockUseSimulation.mockReturnValue({
      financialGoals: [goal],
      simulationData: createMockSimulationData(150000), // 150% - goal achieved
    })

    render(<FinancialGoalsKPIDashboard />)

    expect(screen.getByText('Erreicht')).toBeInTheDocument()
  })

  it('should not show "Erreicht" badge when goal is not achieved', () => {
    const goal = createMockGoal()
    mockUseSimulation.mockReturnValue({
      financialGoals: [goal],
      simulationData: createMockSimulationData(100000), // 20% - not achieved
    })

    render(<FinancialGoalsKPIDashboard />)

    expect(screen.queryByText('Erreicht')).not.toBeInTheDocument()
  })

  it('should display target and current amounts', () => {
    const goal = createMockGoal({ targetAmount: 500000 })
    mockUseSimulation.mockReturnValue({
      financialGoals: [goal],
      simulationData: createMockSimulationData(200000),
    })

    render(<FinancialGoalsKPIDashboard />)

    // Check for "Aktuell" label and value
    expect(screen.getByText('Aktuell')).toBeInTheDocument()
    expect(screen.getAllByText(/200\.000,00/)).toHaveLength(2) // Once in header, once in card

    // Check for "Ziel" label and value
    expect(screen.getByText('Ziel')).toBeInTheDocument()
    expect(screen.getByText(/500\.000,00/)).toBeInTheDocument()
  })

  it('should show amount remaining when goal is not achieved', () => {
    const goal = createMockGoal({ targetAmount: 500000 })
    mockUseSimulation.mockReturnValue({
      financialGoals: [goal],
      simulationData: createMockSimulationData(200000),
    })

    render(<FinancialGoalsKPIDashboard />)

    expect(screen.getByText('Noch benötigt')).toBeInTheDocument()
    expect(screen.getByText(/300\.000,00/)).toBeInTheDocument() // 500k - 200k = 300k
  })

  it('should not show amount remaining when goal is achieved', () => {
    const goal = createMockGoal({ targetAmount: 100000 })
    mockUseSimulation.mockReturnValue({
      financialGoals: [goal],
      simulationData: createMockSimulationData(150000),
    })

    render(<FinancialGoalsKPIDashboard />)

    expect(screen.queryByText('Noch benötigt')).not.toBeInTheDocument()
  })

  it('should display next milestone when not all milestones are achieved', () => {
    const goal = createMockGoal()
    mockUseSimulation.mockReturnValue({
      financialGoals: [goal],
      simulationData: createMockSimulationData(200000), // Between 25% and 50%
    })

    render(<FinancialGoalsKPIDashboard />)

    expect(screen.getByText('Nächster Meilenstein')).toBeInTheDocument()
    expect(screen.getByText('50% erreicht')).toBeInTheDocument()
  })

  it('should not display next milestone when goal is achieved', () => {
    const goal = createMockGoal({ targetAmount: 100000 })
    mockUseSimulation.mockReturnValue({
      financialGoals: [goal],
      simulationData: createMockSimulationData(150000),
    })

    render(<FinancialGoalsKPIDashboard />)

    expect(screen.queryByText('Nächster Meilenstein')).not.toBeInTheDocument()
  })

  it('should render multiple active goals', () => {
    const goal1 = createMockGoal({ id: 'goal-1', name: 'Altersvorsorge', targetAmount: 500000 })
    const goal2 = createMockGoal({ id: 'goal-2', name: 'Finanzielle Freiheit', targetAmount: 1000000 })

    mockUseSimulation.mockReturnValue({
      financialGoals: [goal1, goal2],
      simulationData: createMockSimulationData(300000),
    })

    render(<FinancialGoalsKPIDashboard />)

    expect(screen.getByText('Altersvorsorge')).toBeInTheDocument()
    expect(screen.getByText('Finanzielle Freiheit')).toBeInTheDocument()
  })

  it('should handle goals without milestones', () => {
    const goal = createMockGoal({ milestones: undefined })
    mockUseSimulation.mockReturnValue({
      financialGoals: [goal],
      simulationData: createMockSimulationData(200000),
    })

    render(<FinancialGoalsKPIDashboard />)

    expect(screen.getByText('Altersvorsorge')).toBeInTheDocument()
    expect(screen.queryByText('Nächster Meilenstein')).not.toBeInTheDocument()
  })

  it('should handle zero current capital', () => {
    const goal = createMockGoal()
    mockUseSimulation.mockReturnValue({
      financialGoals: [goal],
      simulationData: createMockSimulationData(0),
    })

    render(<FinancialGoalsKPIDashboard />)

    expect(screen.getByText('Altersvorsorge')).toBeInTheDocument()
    expect(screen.getByText('0.0%')).toBeInTheDocument()
  })

  it('should handle missing simulation data gracefully', () => {
    const goal = createMockGoal()
    mockUseSimulation.mockReturnValue({
      financialGoals: [goal],
      simulationData: null,
    })

    render(<FinancialGoalsKPIDashboard />)

    // Should render with 0 as current capital
    expect(screen.getByText('Altersvorsorge')).toBeInTheDocument()
    // "0,00 €" appears in header ("Aktueller Stand") and "Aktuell" field
    const zeroAmounts = screen.getAllByText(/0,00 €/)
    expect(zeroAmounts.length).toBeGreaterThan(0)
  })

  it('should handle empty simulation data array', () => {
    const goal = createMockGoal()
    mockUseSimulation.mockReturnValue({
      financialGoals: [goal],
      simulationData: { data: [] },
    })

    render(<FinancialGoalsKPIDashboard />)

    // Should render with 0 as current capital
    expect(screen.getByText('Altersvorsorge')).toBeInTheDocument()
    expect(screen.getByText('0.0%')).toBeInTheDocument()
  })
})
