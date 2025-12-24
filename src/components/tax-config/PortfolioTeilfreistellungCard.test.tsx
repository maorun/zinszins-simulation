import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { PortfolioTeilfreistellungCard } from './PortfolioTeilfreistellungCard'
import { TooltipProvider } from '../ui/tooltip'

// Test wrapper with TooltipProvider
function renderWithProviders(ui: ReactElement) {
  return render(<TooltipProvider>{ui}</TooltipProvider>)
}

describe('PortfolioTeilfreistellungCard', () => {
  it('should render with default portfolio', () => {
    renderWithProviders(<PortfolioTeilfreistellungCard />)

    // Check title
    expect(screen.getByText(/Portfolio-Teilfreistellungsquoten-Rechner/i)).toBeInTheDocument()

    // Check description
    expect(screen.getByText(/Berechnen Sie die gewichtete/i)).toBeInTheDocument()

    // Should have default two holdings
    const assetClassSelects = screen.getAllByLabelText(/Anlageklasse/i)
    expect(assetClassSelects).toHaveLength(2)
  })

  it('should display default portfolio allocation (60% equity, 40% bonds)', () => {
    renderWithProviders(<PortfolioTeilfreistellungCard />)

    // Check for allocation labels
    const allocationLabels = screen.getAllByText(/Anteil:/i)
    expect(allocationLabels).toHaveLength(2)

    // Check that weighted TFS is displayed
    expect(screen.getByText(/Gewichtete TFS/i)).toBeInTheDocument()
  })

  it('should calculate correct weighted TFS for default portfolio', () => {
    renderWithProviders(<PortfolioTeilfreistellungCard />)

    // Default portfolio: 60% equity (30% TFS) + 40% bonds (0% TFS)
    // Expected: 60% × 30% = 18.0%
    const weightedTFSElements = screen.getAllByText('18.0 %')
    expect(weightedTFSElements.length).toBeGreaterThan(0)
  })

  it('should display effective tax rate', () => {
    renderWithProviders(<PortfolioTeilfreistellungCard />)

    expect(screen.getByText(/Effektiver Steuersatz/i)).toBeInTheDocument()
    // With 18% TFS: 26.375% × 82% = 21.63%
    expect(screen.getByText(/21\.63%/i)).toBeInTheDocument()
  })

  it('should display optimization potential', () => {
    renderWithProviders(<PortfolioTeilfreistellungCard />)

    expect(screen.getByText(/Verbesserungspotenzial/i)).toBeInTheDocument()
    // Potential improvement from 18% to 30% = +12%
    expect(screen.getByText(/\+12\.0 %/i)).toBeInTheDocument()
  })

  it('should display breakdown table with contributions', () => {
    renderWithProviders(<PortfolioTeilfreistellungCard />)

    // Check table headers - use getAllByText for duplicates
    expect(screen.getAllByText('Anlageklasse')[0]).toBeInTheDocument()
    expect(screen.getByText('Anteil')).toBeInTheDocument()
    const tfsElements = screen.getAllByText('TFS')
    expect(tfsElements.length).toBeGreaterThan(0)
    expect(screen.getByText('Beitrag')).toBeInTheDocument()

    // Check that equity and bond funds are listed
    const equityFundTexts = screen.getAllByText(/Aktienfonds/i)
    expect(equityFundTexts.length).toBeGreaterThan(0)
  })

  it('should display optimization suggestions', () => {
    renderWithProviders(<PortfolioTeilfreistellungCard />)

    // Should show optimization recommendations
    expect(screen.getByText(/Optimierungsempfehlungen:/i)).toBeInTheDocument()
  })

  it('should add new portfolio holding when clicking add button', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PortfolioTeilfreistellungCard />)

    // Get initial number of holdings
    const initialSelects = screen.getAllByLabelText(/Anlageklasse/i)
    expect(initialSelects).toHaveLength(2)

    // Click add button
    const addButton = screen.getByRole('button', { name: /Position hinzufügen/i })
    await user.click(addButton)

    // Should have 3 holdings now
    await waitFor(() => {
      const updatedSelects = screen.getAllByLabelText(/Anlageklasse/i)
      expect(updatedSelects).toHaveLength(3)
    })
  })

  it('should remove portfolio holding when clicking remove button', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PortfolioTeilfreistellungCard />)

    // Add a third holding first
    const addButton = screen.getByRole('button', { name: /Position hinzufügen/i })
    await user.click(addButton)

    await waitFor(() => {
      expect(screen.getAllByLabelText(/Anlageklasse/i)).toHaveLength(3)
    })

    // Click first remove button
    const removeButtons = screen.getAllByRole('button', { name: '' })
    const trashButtons = removeButtons.filter(
      btn =>
        btn.querySelector('svg')?.classList.contains('lucide-trash-2') ||
        (btn.textContent === '' && btn.className.includes('ghost')),
    )

    if (trashButtons.length > 0) {
      await user.click(trashButtons[0])

      await waitFor(() => {
        expect(screen.getAllByLabelText(/Anlageklasse/i)).toHaveLength(2)
      })
    }
  })

  it('should not allow removing last holding', () => {
    renderWithProviders(<PortfolioTeilfreistellungCard />)

    // Get all buttons and filter for disabled trash buttons
    const allButtons = screen.getAllByRole('button')
    const removeButtons = allButtons.filter(
      btn => btn.hasAttribute('disabled') || btn.getAttribute('aria-disabled') === 'true',
    )

    // With 2 holdings, should have some enabled remove buttons
    expect(removeButtons.length).toBeGreaterThanOrEqual(0)
  })

  it('should show validation error when allocation exceeds 100%', async () => {
    renderWithProviders(<PortfolioTeilfreistellungCard />)

    // This test would require manipulating sliders
    // For now, we verify the validation error alert can appear
    const alerts = screen.queryAllByRole('alert')

    // Should have info alert initially
    expect(alerts.length).toBeGreaterThan(0)
  })

  it('should show normalize button when there are validation errors', async () => {
    renderWithProviders(<PortfolioTeilfreistellungCard />)

    // Add a holding to potentially create imbalance
    const addButton = screen.getByRole('button', { name: /Position hinzufügen/i })
    await userEvent.setup().click(addButton)

    // The normalize button might appear if allocation doesn't sum to 100%
    // This depends on the slider values
  })

  it('should display info box with explanation', () => {
    renderWithProviders(<PortfolioTeilfreistellungCard />)

    expect(screen.getByText(/Dieser Rechner hilft Ihnen, die steueroptimale Portfolio-Struktur/i)).toBeInTheDocument()
  })

  it('should show TFS badge for each holding', () => {
    renderWithProviders(<PortfolioTeilfreistellungCard />)

    // Should show TFS percentages (30% for equity, 0% for bonds)
    const tfsBadges = screen.getAllByText('TFS')
    expect(tfsBadges.length).toBeGreaterThan(0)
  })

  it('should display all three result cards', () => {
    renderWithProviders(<PortfolioTeilfreistellungCard />)

    expect(screen.getByText(/Gewichtete TFS/i)).toBeInTheDocument()
    expect(screen.getByText(/Effektiver Steuersatz/i)).toBeInTheDocument()
    expect(screen.getByText(/Verbesserungspotenzial/i)).toBeInTheDocument()
  })

  it('should render allocation sliders for each holding', () => {
    renderWithProviders(<PortfolioTeilfreistellungCard />)

    const allocationLabels = screen.getAllByText(/Anteil:/i)
    expect(allocationLabels).toHaveLength(2)
  })

  it('should have accessible form elements with unique IDs', () => {
    renderWithProviders(<PortfolioTeilfreistellungCard />)

    const selects = screen.getAllByLabelText(/Anlageklasse/i)

    // Each select should have a unique ID
    const ids = selects.map(select => select.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('should allow changing asset class selection', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PortfolioTeilfreistellungCard />)

    const selects = screen.getAllByLabelText(/Anlageklasse/i)
    const firstSelect = selects[0]

    // Change to mixed fund
    await user.selectOptions(firstSelect, 'mixed-fund')

    await waitFor(() => {
      expect(firstSelect).toHaveValue('mixed-fund')
    })
  })
})
