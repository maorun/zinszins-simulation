import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TooltipProvider } from './ui/tooltip'
import { NestingProvider } from '../lib/nesting-context'
import { NavigationProvider } from '../contexts/NavigationContext'
import ScenarioSelector from './ScenarioSelector'
import { predefinedScenarios, type FinancialScenario } from '../data/scenarios'

// Helper to render with required providers
function renderScenarioSelector(onApplyScenario = vi.fn()) {
  return render(
    <TooltipProvider>
      <NestingProvider>
        <NavigationProvider>
          <ScenarioSelector onApplyScenario={onApplyScenario} />
        </NavigationProvider>
      </NestingProvider>
    </TooltipProvider>,
  )
}

describe('ScenarioSelector', () => {
  it('should render collapsible card', () => {
    renderScenarioSelector()
    const elements = screen.getAllByText(/Was-wäre-wenn/i)
    expect(elements.length).toBeGreaterThan(0)
  })

  it('should expand when clicked', async () => {
    renderScenarioSelector()

    // Card should be collapsed initially
    expect(screen.queryByPlaceholderText(/Szenarien durchsuchen/i)).not.toBeInTheDocument()

    // Click to expand
    const triggers = screen.getAllByText(/Was-wäre-wenn/i)
    fireEvent.click(triggers[0])

    // Wait for expansion
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Szenarien durchsuchen/i)).toBeInTheDocument()
    })
  })

  it('should display introduction alert when expanded', async () => {
    renderScenarioSelector()

    // Expand
    const triggers = screen.getAllByText(/Was-wäre-wenn/i)
    fireEvent.click(triggers[0])

    await waitFor(() => {
      expect(screen.getByText(/Lernszenarien entdecken/i)).toBeInTheDocument()
    })
  })

  it('should render search input when expanded', async () => {
    renderScenarioSelector()
    const triggers = screen.getAllByText(/Was-wäre-wenn/i)
    fireEvent.click(triggers[0])

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/Szenarien durchsuchen/i)
      expect(searchInput).toBeInTheDocument()
    })
  })

  it('should display all category headers when expanded', async () => {
    renderScenarioSelector()
    const triggers = screen.getAllByText(/Was-wäre-wenn/i)
    fireEvent.click(triggers[0])

    await waitFor(() => {
      // Check that categories are rendered (they may appear multiple times)
      const konservativ = screen.queryAllByText(/Konservativ/i)
      const ausgewogen = screen.queryAllByText(/Ausgewogen/i)
      expect(konservativ.length).toBeGreaterThan(0)
      expect(ausgewogen.length).toBeGreaterThan(0)
    })
  })

  it('should display scenario cards when expanded', async () => {
    renderScenarioSelector()
    const triggers = screen.getAllByText(/Was-wäre-wenn/i)
    fireEvent.click(triggers[0])

    await waitFor(() => {
      // Check for specific scenario names
      expect(screen.getByText(/Vorsichtiger Einsteiger/i)).toBeInTheDocument()
      expect(screen.getByText(/Ruhestand-Sicherheit/i)).toBeInTheDocument()
    })
  })

  it('should filter scenarios when searching', async () => {
    renderScenarioSelector()
    const triggers = screen.getAllByText(/Was-wäre-wenn/i)
    fireEvent.click(triggers[0])

    // Wait for scenarios to load first
    await waitFor(() => {
      expect(screen.getByText(/Vorsichtiger Einsteiger/i)).toBeInTheDocument()
    })

    // Then search for a unique term
    const searchInput = screen.getByPlaceholderText(/Szenarien durchsuchen/i)
    fireEvent.change(searchInput, { target: { value: 'Einsteiger' } })

    await waitFor(() => {
      expect(screen.getByText(/Vorsichtiger Einsteiger/i)).toBeInTheDocument()
      // Other scenarios should not be visible
      expect(screen.queryByText(/Altersvorsorge für Paare/i)).not.toBeInTheDocument()
    })
  })

  it('should show clear search button when search has text', async () => {
    renderScenarioSelector()
    const triggers = screen.getAllByText(/Was-wäre-wenn/i)
    fireEvent.click(triggers[0])

    await waitFor(async () => {
      const searchInput = screen.getByPlaceholderText(/Szenarien durchsuchen/i)
      fireEvent.change(searchInput, { target: { value: 'test' } })

      // Find clear button (X icon button)
      const buttons = screen.getAllByRole('button')
      const clearButton = buttons.find(btn => btn.querySelector('svg'))
      expect(clearButton).toBeDefined()
    })
  })

  it('should clear search when clear button is clicked', async () => {
    renderScenarioSelector()
    const triggers = screen.getAllByText(/Was-wäre-wenn/i)
    fireEvent.click(triggers[0])

    await waitFor(async () => {
      const searchInput = screen.getByPlaceholderText(/Szenarien durchsuchen/i) as HTMLInputElement
      fireEvent.change(searchInput, { target: { value: 'test' } })

      expect(searchInput.value).toBe('test')

      // Click clear button
      const buttons = screen.getAllByRole('button')
      const clearButton = buttons.find(btn => btn.querySelector('svg') && btn !== triggers[0].closest('button'))
      if (clearButton) {
        fireEvent.click(clearButton)
      }

      await waitFor(() => {
        expect(searchInput.value).toBe('')
      })
    })
  })

  it('should show no results message when search finds nothing', async () => {
    renderScenarioSelector()
    const triggers = screen.getAllByText(/Was-wäre-wenn/i)
    fireEvent.click(triggers[0])

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/Szenarien durchsuchen/i)
      fireEvent.change(searchInput, { target: { value: 'xyznonexistent123' } })
    })

    await waitFor(() => {
      expect(screen.getByText(/Keine Szenarien gefunden/i)).toBeInTheDocument()
    })
  })

  it('should open details modal when scenario is clicked', async () => {
    renderScenarioSelector()
    const triggers = screen.getAllByText(/Was-wäre-wenn/i)
    fireEvent.click(triggers[0])

    // Wait for scenarios to load
    const scenarioCard = await screen.findByText(/Vorsichtiger Einsteiger/i)
    expect(scenarioCard).toBeInTheDocument()

    // Click on the scenario card
    const scenarioButton = scenarioCard.closest('button')
    expect(scenarioButton).toBeTruthy()
    if (scenarioButton) {
      fireEvent.click(scenarioButton)

      // Wait for modal to appear
      await screen.findByText(/Szenario-Konfiguration/i)
      expect(screen.getAllByText(/Lernpunkte/i).length).toBeGreaterThan(0)
      expect(screen.getByText(/Risiken & Nachteile/i)).toBeInTheDocument()
      expect(screen.getByText(/Geeignet für/i)).toBeInTheDocument()
    }
  }, 10000) // Increase timeout

  it('should display scenario configuration in modal', async () => {
    renderScenarioSelector()
    const triggers = screen.getAllByText(/Was-wäre-wenn/i)
    fireEvent.click(triggers[0])

    // Wait for scenarios to load
    await waitFor(() => {
      expect(screen.getByText(/Vorsichtiger Einsteiger/i)).toBeInTheDocument()
    })

    // Click on a scenario
    const scenarioButton = screen.getByText(/Vorsichtiger Einsteiger/i).closest('button')
    if (scenarioButton) {
      fireEvent.click(scenarioButton)
    }

    await waitFor(() => {
      // Check for configuration details
      expect(screen.getByText(/Zeitraum:/i)).toBeInTheDocument()
      expect(screen.getByText(/Monatlich:/i)).toBeInTheDocument()
      expect(screen.getByText(/Erwartete Rendite:/i)).toBeInTheDocument()
    })
  })

  it('should call onApplyScenario when apply button is clicked', async () => {
    const mockApply = vi.fn()
    renderScenarioSelector(mockApply)

    const triggers = screen.getAllByText(/Was-wäre-wenn/i)
    fireEvent.click(triggers[0])

    // Wait for scenarios to load
    await waitFor(() => {
      expect(screen.getByText(/Vorsichtiger Einsteiger/i)).toBeInTheDocument()
    })

    // Click on a scenario
    const scenarioButton = screen.getByText(/Vorsichtiger Einsteiger/i).closest('button')
    if (scenarioButton) {
      fireEvent.click(scenarioButton)
    }

    // Wait for modal and click apply
    await waitFor(() => {
      expect(screen.getByText(/Szenario anwenden/i)).toBeInTheDocument()
    })

    const applyButton = screen.getByText(/Szenario anwenden/i)
    fireEvent.click(applyButton)

    await waitFor(() => {
      expect(mockApply).toHaveBeenCalledTimes(1)
      const appliedScenario = mockApply.mock.calls[0][0] as FinancialScenario
      expect(appliedScenario.name).toContain('Vorsichtiger Einsteiger')
    })
  })

  it('should close modal when cancel button is clicked', async () => {
    renderScenarioSelector()
    const triggers = screen.getAllByText(/Was-wäre-wenn/i)
    fireEvent.click(triggers[0])

    // Wait for scenarios to load
    await waitFor(() => {
      expect(screen.getByText(/Vorsichtiger Einsteiger/i)).toBeInTheDocument()
    })

    // Click on a scenario
    const scenarioButton = screen.getByText(/Vorsichtiger Einsteiger/i).closest('button')
    if (scenarioButton) {
      fireEvent.click(scenarioButton)
    }

    // Wait for modal and click cancel
    await waitFor(() => {
      expect(screen.getByText(/Abbrechen/i)).toBeInTheDocument()
    })

    const cancelButton = screen.getByText(/Abbrechen/i)
    fireEvent.click(cancelButton)

    await waitFor(() => {
      expect(screen.queryByText(/Szenario-Konfiguration/i)).not.toBeInTheDocument()
    })
  })

  it('should display scenario tags with key information', async () => {
    renderScenarioSelector()
    const triggers = screen.getAllByText(/Was-wäre-wenn/i)
    fireEvent.click(triggers[0])

    await waitFor(() => {
      // Each scenario should show monthly contribution, return rate, and duration
      const firstScenario = predefinedScenarios[0]
      if (firstScenario.config.monthlyContribution > 0) {
        expect(screen.getByText(new RegExp(`${firstScenario.config.monthlyContribution}€/Monat`, 'i'))).toBeInTheDocument()
      }
      expect(screen.getByText(new RegExp(`${firstScenario.config.expectedReturn}% Rendite`, 'i'))).toBeInTheDocument()
    })
  })
})
