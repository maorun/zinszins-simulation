/**
 * Tests for Capital Growth Scenario Comparison Component
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { CapitalGrowthScenarioComparison } from './CapitalGrowthScenarioComparison'
import { SimulationProvider } from '../contexts/SimulationContext'

// Mock the useSimulation hook
vi.mock('../contexts/useSimulation', () => ({
  useSimulation: () => ({
    getConfiguration: () => ({
      rendite: 0.05,
      steuerlast: 0.26375,
      teilfreistellungsquote: 0.3,
      freibetragPerYear: { 2024: 2000 },
      returnMode: 'fixed' as const,
      averageReturn: 0.05,
      standardDeviation: 0.1,
      variableReturns: {},
      startEnd: [2024, 2030] as [number, number],
      sparplan: [
        {
          id: 1,
          start: new Date('2024-01-01'),
          einzahlung: 24000,
        },
      ],
      simulationAnnual: 'yearly' as const,
    }),
  }),
}))

describe('CapitalGrowthScenarioComparison', () => {
  const renderComponent = () => {
    return render(
      <SimulationProvider>
        <CapitalGrowthScenarioComparison />
      </SimulationProvider>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Render', () => {
    it('should render the component with title and description', () => {
      renderComponent()

      expect(screen.getByText(/Kapitalwertentwicklungs-Szenario-Vergleich/)).toBeInTheDocument()
      expect(
        screen.getByText(/Vergleichen Sie bis zu 5 verschiedene Anlagestrategien/)
      ).toBeInTheDocument()
    })

    it('should render info alert', () => {
      renderComponent()

      expect(
        screen.getByText(/Erstellen Sie mehrere Szenarien mit unterschiedlichen Parametern/)
      ).toBeInTheDocument()
    })

    it('should render add scenario button', () => {
      renderComponent()

      expect(screen.getByRole('button', { name: /Szenario hinzufügen/ })).toBeInTheDocument()
    })

    it('should render run comparison button (disabled initially)', () => {
      renderComponent()

      const button = screen.getByRole('button', { name: /Vergleich durchführen/ })
      expect(button).toBeInTheDocument()
      expect(button).toBeDisabled() // Disabled because no scenarios yet
    })
  })

  describe('Adding Scenarios', () => {
    it('should add a scenario when clicking add button', async () => {
      const user = userEvent.setup()
      renderComponent()

      const addButton = screen.getByRole('button', { name: /Szenario hinzufügen/ })
      await user.click(addButton)

      // Should show scenario card with default name
      expect(screen.getByDisplayValue(/Szenario 1/)).toBeInTheDocument()
    })

    it('should add multiple scenarios with incremented names', async () => {
      const user = userEvent.setup()
      renderComponent()

      const addButton = screen.getByRole('button', { name: /Szenario hinzufügen/ })

      await user.click(addButton)
      await user.click(addButton)
      await user.click(addButton)

      expect(screen.getByDisplayValue('Szenario 1')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Szenario 2')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Szenario 3')).toBeInTheDocument()
    })

    it('should disable add button after reaching max scenarios', async () => {
      const user = userEvent.setup()
      renderComponent()

      const addButton = screen.getByRole('button', { name: /Szenario hinzufügen/ })

      // Add 5 scenarios (max)
      for (let i = 0; i < 5; i++) {
        await user.click(addButton)
      }

      expect(addButton).toBeDisabled()
    })

    it('should enable run comparison button after adding 2 scenarios', async () => {
      const user = userEvent.setup()
      renderComponent()

      const addButton = screen.getByRole('button', { name: /Szenario hinzufügen/ })
      const runButton = screen.getByRole('button', { name: /Vergleich durchführen/ })

      expect(runButton).toBeDisabled()

      await user.click(addButton)
      expect(runButton).toBeDisabled() // Still disabled with 1 scenario

      await user.click(addButton)
      expect(runButton).not.toBeDisabled() // Enabled with 2 scenarios
    })
  })

  describe('Scenario Management', () => {
    it('should allow updating scenario name', async () => {
      const user = userEvent.setup()
      renderComponent()

      const addButton = screen.getByRole('button', { name: /Szenario hinzufügen/ })
      await user.click(addButton)

      const nameInput = screen.getByDisplayValue('Szenario 1')
      await user.clear(nameInput)
      await user.type(nameInput, 'Konservativ')

      expect(screen.getByDisplayValue('Konservativ')).toBeInTheDocument()
    })

    it('should allow updating scenario return rate', async () => {
      const user = userEvent.setup()
      renderComponent()

      const addButton = screen.getByRole('button', { name: /Szenario hinzufügen/ })
      await user.click(addButton)

      // Find return rate input (should default to 5.0 based on mock config)
      const returnInputs = screen.getAllByRole('spinbutton')
      const returnInput = returnInputs.find((input) =>
        (input as HTMLInputElement).value.includes('5.0')
      ) as HTMLInputElement

      expect(returnInput).toBeDefined()

      await user.clear(returnInput)
      await user.type(returnInput, '7.5')

      expect(returnInput.value).toBe('7.5')
    })

    it('should remove scenario when clicking remove button', async () => {
      const user = userEvent.setup()
      renderComponent()

      const addButton = screen.getByRole('button', { name: /Szenario hinzufügen/ })
      await user.click(addButton)

      expect(screen.getByDisplayValue('Szenario 1')).toBeInTheDocument()

      // Find and click remove button (trash icon)
      const removeButtons = screen.getAllByRole('button')
      const removeButton = removeButtons.find((btn) => btn.querySelector('svg')) // Find button with icon

      if (removeButton) {
        await user.click(removeButton)
      }

      await waitFor(() => {
        expect(screen.queryByDisplayValue('Szenario 1')).not.toBeInTheDocument()
      })
    })
  })

  describe('Running Comparison', () => {
    it('should show loading state when running comparison', async () => {
      const user = userEvent.setup()
      renderComponent()

      // Add 2 scenarios
      const addButton = screen.getByRole('button', { name: /Szenario hinzufügen/ })
      await user.click(addButton)
      await user.click(addButton)

      const runButton = screen.getByRole('button', { name: /Vergleich durchführen/ })
      await user.click(runButton)

      // Should show loading text
      expect(screen.getByRole('button', { name: /Berechne.../ })).toBeInTheDocument()
    })

    it('should display results after running comparison', async () => {
      const user = userEvent.setup()
      renderComponent()

      // Add 2 scenarios
      const addButton = screen.getByRole('button', { name: /Szenario hinzufügen/ })
      await user.click(addButton)
      await user.click(addButton)

      const runButton = screen.getByRole('button', { name: /Vergleich durchführen/ })
      await user.click(runButton)

      // Wait for results to appear
      await waitFor(
        () => {
          expect(screen.getByText('Vergleichsergebnisse')).toBeInTheDocument()
        },
        { timeout: 3000 }
      )

      // Should show statistics cards
      expect(screen.getByText('Bestes Szenario')).toBeInTheDocument()
      expect(screen.getByText('Durchschnitt')).toBeInTheDocument()
      expect(screen.getByText('Schlechtestes Szenario')).toBeInTheDocument()
    })

    it('should display detailed results table', async () => {
      const user = userEvent.setup()
      renderComponent()

      // Add 2 scenarios
      const addButton = screen.getByRole('button', { name: /Szenario hinzufügen/ })
      await user.click(addButton)
      await user.click(addButton)

      const runButton = screen.getByRole('button', { name: /Vergleich durchführen/ })
      await user.click(runButton)

      // Wait for results table
      await waitFor(
        () => {
          expect(screen.getByText('Endkapital')).toBeInTheDocument()
        },
        { timeout: 3000 }
      )

      expect(screen.getByText('Rendite p.a.')).toBeInTheDocument()
      expect(screen.getByText('Gesamtertrag')).toBeInTheDocument()
      expect(screen.getByText('Steuern')).toBeInTheDocument()
    })
  })

  describe('Scenario Cards', () => {
    it('should display scenario with colored border', async () => {
      const user = userEvent.setup()
      renderComponent()

      const addButton = screen.getByRole('button', { name: /Szenario hinzufügen/ })
      await user.click(addButton)

      // Find the scenario card
      const nameInput = screen.getByDisplayValue('Szenario 1')
      const card = nameInput.closest('div[style*="borderLeftColor"]')

      expect(card).toBeInTheDocument()
      expect(card).toHaveStyle({ borderLeftWidth: '4px' })
    })

    it('should show results preview in scenario card after comparison', async () => {
      const user = userEvent.setup()
      renderComponent()

      // Add 2 scenarios
      const addButton = screen.getByRole('button', { name: /Szenario hinzufügen/ })
      await user.click(addButton)
      await user.click(addButton)

      const runButton = screen.getByRole('button', { name: /Vergleich durchführen/ })
      await user.click(runButton)

      // Wait for results to appear in cards
      await waitFor(
        () => {
          const endkapitalLabels = screen.getAllByText('Endkapital:')
          expect(endkapitalLabels.length).toBeGreaterThan(0)
        },
        { timeout: 3000 }
      )
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for all inputs', async () => {
      const user = userEvent.setup()
      renderComponent()

      const addButton = screen.getByRole('button', { name: /Szenario hinzufügen/ })
      await user.click(addButton)

      expect(screen.getByLabelText('Szenario-Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Erwartete Rendite (% p.a.)')).toBeInTheDocument()
    })

    it('should have accessible buttons with descriptive names', () => {
      renderComponent()

      expect(screen.getByRole('button', { name: /Szenario hinzufügen/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Vergleich durchführen/ })).toBeInTheDocument()
    })
  })
})
