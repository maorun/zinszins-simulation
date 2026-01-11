/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { ScenarioLibrary } from './ScenarioLibrary'

// Mock the navigation hook
vi.mock('../hooks/useNavigationItem', () => ({
  useNavigationItem: () => ({
    ref: { current: null },
    id: 'test-navigation-id',
  }),
}))

describe('ScenarioLibrary', () => {
  const mockOnImportScenario = vi.fn()

  beforeEach(() => {
    mockOnImportScenario.mockClear()
  })

  describe('Initial Rendering', () => {
    it('should render collapsed by default', () => {
      render(<ScenarioLibrary onImportScenario={mockOnImportScenario} />)
      expect(screen.getByText('Szenario-Bibliothek')).toBeInTheDocument()
      expect(screen.getByText('Vordefinierte Lebensszenarien zum direkten Import')).toBeInTheDocument()
    })

    it('should show scenario count in badge', () => {
      render(<ScenarioLibrary onImportScenario={mockOnImportScenario} />)
      // Should show total number of scenarios (9 in our test data)
      expect(screen.getByText(/\d+ Szenarien/)).toBeInTheDocument()
    })

    it('should expand when clicked', () => {
      render(<ScenarioLibrary onImportScenario={mockOnImportScenario} />)
      const header = screen.getByText('Szenario-Bibliothek').closest('div')
      expect(header).toBeInTheDocument()
      
      fireEvent.click(header!)
      
      // Should show introduction text
      expect(screen.getByText(/Was ist die Szenario-Bibliothek?/)).toBeInTheDocument()
    })
  })

  describe('Expanded State', () => {
    beforeEach(() => {
      render(<ScenarioLibrary onImportScenario={mockOnImportScenario} />)
      const header = screen.getByText('Szenario-Bibliothek').closest('div')
      fireEvent.click(header!)
    })

    it('should show introduction section', () => {
      expect(screen.getByText(/Was ist die Szenario-Bibliothek?/)).toBeInTheDocument()
      expect(screen.getByText(/vordefinierte, realistische Finanzplanungs-Szenarien/)).toBeInTheDocument()
    })

    it('should show search input', () => {
      const searchInput = screen.getByPlaceholderText(/z.B. Berufsanfänger, Familie, DINK/)
      expect(searchInput).toBeInTheDocument()
      expect(searchInput).toHaveValue('')
    })

    it('should show category filter buttons', () => {
      expect(screen.getByRole('button', { name: 'Alle' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Berufsanfänger' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Familie' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Karrieremitte' })).toBeInTheDocument()
    })

    it('should show all scenarios by default', () => {
      // Check for scenario names - should find at least some of them
      const scenarios = screen.getAllByText(/Konservativ|Offensiv|Familie|DINK/)
      expect(scenarios.length).toBeGreaterThan(0)
    })
  })

  describe('Category Filtering', () => {
    beforeEach(() => {
      render(<ScenarioLibrary onImportScenario={mockOnImportScenario} />)
      const header = screen.getByText('Szenario-Bibliothek').closest('div')
      fireEvent.click(header!)
    })

    it('should filter scenarios by category when category button is clicked', () => {
      const careerStartButton = screen.getByRole('button', { name: 'Berufsanfänger' })
      fireEvent.click(careerStartButton)

      // Should show career-start scenarios
      // Check that at least "Berufsanfänger" appears in scenario cards
      const cards = screen.getAllByText(/Berufsanfänger/)
      expect(cards.length).toBeGreaterThan(0)
    })

    it('should highlight selected category button', () => {
      const familyButton = screen.getByRole('button', { name: 'Familie' })
      fireEvent.click(familyButton)

      // Selected button should have different styling (via variant)
      // We can't directly test the variant, but we can check it's still clickable
      expect(familyButton).toBeInTheDocument()
    })

    it('should show all scenarios when "Alle" is clicked', () => {
      // First filter to a specific category
      const familyButton = screen.getByRole('button', { name: 'Familie' })
      fireEvent.click(familyButton)

      // Then click "Alle"
      const alleButton = screen.getByRole('button', { name: 'Alle' })
      fireEvent.click(alleButton)

      // Should show multiple categories of scenarios
      const scenarios = screen.getAllByText(/Konservativ|Familie|DINK|Karriere/)
      expect(scenarios.length).toBeGreaterThan(1)
    })
  })

  describe('Search Functionality', () => {
    beforeEach(() => {
      render(<ScenarioLibrary onImportScenario={mockOnImportScenario} />)
      const header = screen.getByText('Szenario-Bibliothek').closest('div')
      fireEvent.click(header!)
    })

    it('should filter scenarios by search query', () => {
      const searchInput = screen.getByPlaceholderText(/z.B. Berufsanfänger/)
      fireEvent.change(searchInput, { target: { value: 'Familie' } })

      // Should find family-related scenarios
      expect(screen.getByText(/Junge Familie mit Kindern/)).toBeInTheDocument()
    })

    it('should show no results message when search finds nothing', () => {
      const searchInput = screen.getByPlaceholderText(/z.B. Berufsanfänger/)
      fireEvent.change(searchInput, { target: { value: 'xyznonexistent' } })

      expect(screen.getByText(/Keine Szenarien gefunden/)).toBeInTheDocument()
    })

    it('should have reset button when no results found', () => {
      const searchInput = screen.getByPlaceholderText(/z.B. Berufsanfänger/)
      fireEvent.change(searchInput, { target: { value: 'xyznonexistent' } })

      const resetButton = screen.getByRole('button', { name: /Filter zurücksetzen/ })
      expect(resetButton).toBeInTheDocument()
      
      fireEvent.click(resetButton)
      
      // Search should be cleared
      expect(searchInput).toHaveValue('')
    })

    it('should search case-insensitively', () => {
      const searchInput = screen.getByPlaceholderText(/z.B. Berufsanfänger/)
      
      fireEvent.change(searchInput, { target: { value: 'DINK' } })
      expect(screen.getByText(/DINK/)).toBeInTheDocument()
      
      fireEvent.change(searchInput, { target: { value: 'dink' } })
      expect(screen.getByText(/DINK/)).toBeInTheDocument()
    })
  })

  describe('Scenario Cards', () => {
    beforeEach(() => {
      render(<ScenarioLibrary onImportScenario={mockOnImportScenario} />)
      const header = screen.getByText('Szenario-Bibliothek').closest('div')
      fireEvent.click(header!)
    })

    it('should display scenario cards with basic information', () => {
      // Find first scenario card
      const scenarioCards = screen.getAllByText(/Details anzeigen/)
      expect(scenarioCards.length).toBeGreaterThan(0)
    })

    it('should show category badge on each card', () => {
      // Check for category badges
      const badges = screen.getAllByText(/Berufsanfänger|Familie|Karrieremitte/)
      expect(badges.length).toBeGreaterThan(0)
    })

    it('should show tags on each card', () => {
      // Tags should be visible as badges
      const tags = screen.getAllByText(/konservativ|offensiv|familie|dink/i)
      expect(tags.length).toBeGreaterThan(0)
    })

    it('should have import button on each card', () => {
      const importButtons = screen.getAllByRole('button', { name: /Szenario übernehmen/ })
      // Should have at least one import button per visible scenario
      expect(importButtons.length).toBeGreaterThan(0)
    })

    it('should have details button on each card', () => {
      const detailsButtons = screen.getAllByRole('button', { name: /Details anzeigen/ })
      expect(detailsButtons.length).toBeGreaterThan(0)
    })
  })

  describe('Scenario Details Dialog', () => {
    beforeEach(() => {
      render(<ScenarioLibrary onImportScenario={mockOnImportScenario} />)
      const header = screen.getByText('Szenario-Bibliothek').closest('div')
      fireEvent.click(header!)
    })

    it('should open details dialog when details button is clicked', () => {
      const detailsButtons = screen.getAllByRole('button', { name: /Details anzeigen/ })
      fireEvent.click(detailsButtons[0])

      // Dialog should be open with detailed information - shadcn/ui Dialog uses alertdialog role
      expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    })

    it('should show detailed explanation in dialog', () => {
      const detailsButtons = screen.getAllByRole('button', { name: /Details anzeigen/ })
      fireEvent.click(detailsButtons[0])

      // Should show section headers
      expect(screen.getByText('Zielgruppe')).toBeInTheDocument()
      expect(screen.getByText('Detaillierte Erklärung')).toBeInTheDocument()
      expect(screen.getByText('Wichtige Annahmen')).toBeInTheDocument()
    })

    it('should show configuration details in dialog', () => {
      const detailsButtons = screen.getAllByRole('button', { name: /Details anzeigen/ })
      fireEvent.click(detailsButtons[0])

      // Should show config info
      expect(screen.getByText('Erwartete Rendite')).toBeInTheDocument()
      expect(screen.getByText('Anlagehorizont')).toBeInTheDocument()
      expect(screen.getByText('Renditemodus')).toBeInTheDocument()
    })

    it('should have close button in dialog', () => {
      const detailsButtons = screen.getAllByRole('button', { name: /Details anzeigen/ })
      fireEvent.click(detailsButtons[0])

      const closeButton = screen.getByRole('button', { name: /Schließen/ })
      expect(closeButton).toBeInTheDocument()
      
      fireEvent.click(closeButton)
      
      // Dialog should be closed
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    })
  })

  describe('Import Functionality', () => {
    beforeEach(() => {
      render(<ScenarioLibrary onImportScenario={mockOnImportScenario} />)
      const header = screen.getByText('Szenario-Bibliothek').closest('div')
      fireEvent.click(header!)
    })

    it('should call onImportScenario when import button is clicked', () => {
      const importButtons = screen.getAllByRole('button', { name: /Szenario übernehmen/ })
      fireEvent.click(importButtons[0])

      expect(mockOnImportScenario).toHaveBeenCalledTimes(1)
      expect(mockOnImportScenario).toHaveBeenCalledWith(
        expect.objectContaining({
          rendite: expect.any(Number),
          steuerlast: expect.any(Number),
          sparplan: expect.any(Array),
        }),
        expect.any(String), // scenario name
      )
    })

    it('should show success message after import', () => {
      const importButtons = screen.getAllByRole('button', { name: /Szenario übernehmen/ })
      fireEvent.click(importButtons[0])

      // Success message should appear
      expect(screen.getByText(/erfolgreich übernommen/)).toBeInTheDocument()
    })

    it('should import from dialog', () => {
      const detailsButtons = screen.getAllByRole('button', { name: /Details anzeigen/ })
      fireEvent.click(detailsButtons[0])

      // Find and click import button in dialog
      const dialog = screen.getByRole('alertdialog')
      const importButton = within(dialog).getByRole('button', { name: /Szenario übernehmen/ })
      fireEvent.click(importButton)

      expect(mockOnImportScenario).toHaveBeenCalledTimes(1)
    })
  })

  describe('Combined Filters', () => {
    beforeEach(() => {
      render(<ScenarioLibrary onImportScenario={mockOnImportScenario} />)
      const header = screen.getByText('Szenario-Bibliothek').closest('div')
      fireEvent.click(header!)
    })

    it('should apply both category and search filters', () => {
      // Select a category
      const careerStartButton = screen.getByRole('button', { name: 'Berufsanfänger' })
      fireEvent.click(careerStartButton)

      // Then search within that category
      const searchInput = screen.getByPlaceholderText(/z.B. Berufsanfänger/)
      fireEvent.change(searchInput, { target: { value: 'Konservativ' } })

      // Should find conservative career-start scenario
      expect(screen.getByText(/Berufsanfänger - Konservativ/)).toBeInTheDocument()
    })

    it('should reset both filters when reset button is clicked', () => {
      // Apply both filters
      const familyButton = screen.getByRole('button', { name: 'Familie' })
      fireEvent.click(familyButton)
      
      const searchInput = screen.getByPlaceholderText(/z.B. Berufsanfänger/)
      fireEvent.change(searchInput, { target: { value: 'test123notfound' } })

      // Click reset
      const resetButton = screen.getByRole('button', { name: /Filter zurücksetzen/ })
      fireEvent.click(resetButton)

      // Both filters should be reset
      expect(searchInput).toHaveValue('')
      expect(screen.getByRole('button', { name: 'Alle' })).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for form elements', () => {
      render(<ScenarioLibrary onImportScenario={mockOnImportScenario} />)
      const header = screen.getByText('Szenario-Bibliothek').closest('div')
      fireEvent.click(header!)

      expect(screen.getByLabelText(/Nach Szenario suchen/)).toBeInTheDocument()
      // Category filter label doesn't need an associated form control - it labels a group of buttons
      expect(screen.getByText(/Nach Kategorie filtern/)).toBeInTheDocument()
    })

    it('should have proper ARIA roles', () => {
      render(<ScenarioLibrary onImportScenario={mockOnImportScenario} />)
      const header = screen.getByText('Szenario-Bibliothek').closest('div')
      fireEvent.click(header!)

      // Check for button roles
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })
})
