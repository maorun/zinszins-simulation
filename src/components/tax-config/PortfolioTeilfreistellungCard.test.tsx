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

// Helper to expand the collapsible card
async function expandCard() {
  const user = userEvent.setup()
  const trigger = screen.getByText(/Portfolio-Teilfreistellungsquoten-Rechner/i)
  await user.click(trigger)
  
  // Wait for content to be visible after expansion
  await waitFor(() => {
    expect(screen.getByText(/Portfolio-Positionen/i)).toBeInTheDocument()
  })
}

describe('PortfolioTeilfreistellungCard', () => {
  it('should render with default portfolio', async () => {
    renderWithProviders(<PortfolioTeilfreistellungCard />)

    // Check title
    expect(screen.getByText(/Portfolio-Teilfreistellungsquoten-Rechner/i)).toBeInTheDocument()

    // Check description
    expect(screen.getByText(/Berechnen Sie die gewichtete/i)).toBeInTheDocument()

    // Expand the card to see contents
    await expandCard()

    // Should have default two holdings
    const assetClassSelects = screen.getAllByLabelText(/Anlageklasse/i)
    expect(assetClassSelects).toHaveLength(2)
  })

  it('should display default portfolio allocation (60% equity, 40% bonds)', async () => {
    renderWithProviders(<PortfolioTeilfreistellungCard />)
    await expandCard()

    // Check for allocation labels
    const allocationLabels = screen.getAllByText(/Anteil:/i)
    expect(allocationLabels).toHaveLength(2)

    // Check that weighted TFS is displayed
    expect(screen.getByText(/Gewichtete TFS/i)).toBeInTheDocument()
  })

  it('should calculate correct weighted TFS for default portfolio', async () => {
    renderWithProviders(<PortfolioTeilfreistellungCard />)
    await expandCard()

    // Default portfolio: 60% equity (30% TFS) + 40% bonds (0% TFS)
    // Expected: 60% × 30% = 18.0%
    const weightedTFSElements = screen.getAllByText('18.0 %')
    expect(weightedTFSElements.length).toBeGreaterThan(0)
  })

  it('should display effective tax rate', async () => {
    renderWithProviders(<PortfolioTeilfreistellungCard />)
    await expandCard()

    // With 18% TFS and 26.375% capital gains tax
    // Effective rate = 26.375% × (1 - 18%) = 21.63%
    expect(screen.getByText(/21\.63%/)).toBeInTheDocument()
  })

  it('should display optimization potential', async () => {
    renderWithProviders(<PortfolioTeilfreistellungCard />)
    await expandCard()

    expect(screen.getByText(/Verbesserungspotenzial/i)).toBeInTheDocument()
  })

  it('should display breakdown table with contributions', async () => {
    renderWithProviders(<PortfolioTeilfreistellungCard />)
    await expandCard()

    // Should show table headers (use getByRole to specifically target table cells)
    expect(screen.getByRole('columnheader', { name: 'Anlageklasse' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Anteil' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'TFS' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Beitrag' })).toBeInTheDocument()

    // Should show fund types in the table
    expect(screen.getByText('Aktienfonds')).toBeInTheDocument()
    expect(screen.getByText('Rentenfonds')).toBeInTheDocument()
  })

  it('should display optimization suggestions', async () => {
    renderWithProviders(<PortfolioTeilfreistellungCard />)
    await expandCard()

    // With current allocation, should suggest increasing equity
    expect(screen.getByText(/Optimierungsempfehlungen/i)).toBeInTheDocument()
  })

  it('should add new portfolio holding when clicking add button', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PortfolioTeilfreistellungCard />)
    await expandCard()

    const initialHoldings = screen.getAllByLabelText(/Anlageklasse/i)
    expect(initialHoldings).toHaveLength(2)

    // Click add button
    const addButton = screen.getByRole('button', { name: /Position hinzufügen/i })
    await user.click(addButton)

    // Should now have 3 holdings
    const updatedHoldings = screen.getAllByLabelText(/Anlageklasse/i)
    expect(updatedHoldings).toHaveLength(3)
  })

  it('should remove portfolio holding when clicking remove button', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PortfolioTeilfreistellungCard />)
    await expandCard()

    // Start with 2 holdings
    const initialHoldings = screen.getAllByLabelText(/Anlageklasse/i)
    expect(initialHoldings).toHaveLength(2)

    // Add one more to make 3 (so we can safely remove one)
    const addButton = screen.getByRole('button', { name: /Position hinzufügen/i })
    await user.click(addButton)

    expect(screen.getAllByLabelText(/Anlageklasse/i)).toHaveLength(3)

    // Remove one
    const removeButtons = screen.getAllByRole('button', { name: '' }) // Remove buttons have no text
    const trashButtons = removeButtons.filter(btn => btn.querySelector('svg'))
    await user.click(trashButtons[0])

    // Should be back to 2 holdings
    expect(screen.getAllByLabelText(/Anlageklasse/i)).toHaveLength(2)
  })

  it('should not allow removing last holding', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PortfolioTeilfreistellungCard />)
    await expandCard()

    // Start with 2 holdings
    expect(screen.getAllByLabelText(/Anlageklasse/i)).toHaveLength(2)

    // Remove one to get to 1
    const removeButtons = screen.getAllByRole('button', { name: '' })
    const trashButtons = removeButtons.filter(btn => btn.querySelector('svg'))
    await user.click(trashButtons[0])

    // Should have 1 holding left
    expect(screen.getAllByLabelText(/Anlageklasse/i)).toHaveLength(1)

    // The remaining remove button should be disabled
    const remainingButtons = screen.getAllByRole('button', { name: '' })
    const remainingTrashButton = remainingButtons.find(btn => btn.querySelector('svg'))
    expect(remainingTrashButton).toBeDisabled()
  })

  it('should show validation error when allocation exceeds 100%', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PortfolioTeilfreistellungCard />)
    await expandCard()

    // Change first allocation to 70% (with second at 40% = 110% total)
    const sliders = screen.getAllByRole('slider')
    // Use click and keyboard for slider interaction instead of clear/type
    await user.click(sliders[0])
    // Type to change value
    for (let i = 0; i < 2; i++) {
      await user.keyboard('{Backspace}')
    }
    await user.keyboard('70')

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/Validierungsfehler/i)).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('should show normalize button when there are validation errors', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PortfolioTeilfreistellungCard />)
    await expandCard()

    // Create invalid allocation
    const sliders = screen.getAllByRole('slider')
    await user.clear(sliders[0])
    await user.type(sliders[0], '70')

    // Should show normalize button
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Auf 100% normalisieren/i })).toBeInTheDocument()
    })
  })

  it('should display info box with explanation', async () => {
    renderWithProviders(<PortfolioTeilfreistellungCard />)
    await expandCard()

    expect(
      screen.getByText(/Dieser Rechner hilft Ihnen, die steueroptimale Portfolio-Struktur zu finden/i),
    ).toBeInTheDocument()
  })

  it('should show TFS badge for each holding', async () => {
    renderWithProviders(<PortfolioTeilfreistellungCard />)
    await expandCard()

    // Should show TFS percentages for each holding (appears in badge AND breakdown table)
    const tfsBadges30 = screen.getAllByText('30%') // Equity fund TFS
    expect(tfsBadges30.length).toBeGreaterThanOrEqual(1) // At least in TFSBadge, possibly also in table
    
    const tfsBadges0 = screen.getAllByText('0%') // Bond fund TFS
    expect(tfsBadges0.length).toBeGreaterThanOrEqual(1) // At least in TFSBadge, possibly also in table
  })

  it('should display all three result cards', async () => {
    renderWithProviders(<PortfolioTeilfreistellungCard />)
    await expandCard()

    expect(screen.getByText(/Gewichtete TFS/i)).toBeInTheDocument()
    expect(screen.getByText(/Effektiver Steuersatz/i)).toBeInTheDocument()
    expect(screen.getByText(/Verbesserungspotenzial/i)).toBeInTheDocument()
  })

  it('should render allocation sliders for each holding', async () => {
    renderWithProviders(<PortfolioTeilfreistellungCard />)
    await expandCard()

    const sliders = screen.getAllByRole('slider')
    expect(sliders).toHaveLength(2) // One for each holding
  })

  it('should have accessible form elements with unique IDs', async () => {
    renderWithProviders(<PortfolioTeilfreistellungCard />)
    await expandCard()

    const selects = screen.getAllByLabelText(/Anlageklasse/i)
    const ids = selects.map(select => select.id)

    // All IDs should be unique
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('should allow changing asset class selection', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PortfolioTeilfreistellungCard />)
    await expandCard()

    const firstSelect = screen.getAllByLabelText(/Anlageklasse/i)[0]

    // Change to mixed fund
    await user.selectOptions(firstSelect, 'mixed-fund')

    // The TFS badge should update to 15% (mixed fund TFS)
    await waitFor(() => {
      expect(screen.getByText('15%')).toBeInTheDocument() // Mixed fund TFS badge (no space)
    })
    
    // The weighted TFS should also update: 60% * 15% + 40% * 0% = 9.0%
    await waitFor(() => {
      expect(screen.getByText(/9\.0 %/)).toBeInTheDocument() // Weighted TFS in summary (with space)
    })
  })
})
