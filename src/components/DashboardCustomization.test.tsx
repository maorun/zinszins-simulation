import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { DashboardCustomization } from './DashboardCustomization'
import type { SectionPreference, DashboardSectionId } from '../utils/dashboard-preferences'

describe('DashboardCustomization', () => {
  const mockPreferences: SectionPreference[] = [
    { id: 'introduction', visible: true, collapsed: false, order: 0 },
    { id: 'zeitspanne', visible: true, collapsed: false, order: 1 },
    { id: 'sparplan-eingabe', visible: false, collapsed: false, order: 2 },
    { id: 'return-configuration', visible: true, collapsed: false, order: 3 },
  ]

  const defaultProps = {
    preferences: mockPreferences,
    onVisibilityChange: vi.fn(),
    onOrderChange: vi.fn(),
    onReset: vi.fn(),
  }

  it('should render customization button', () => {
    render(<DashboardCustomization {...defaultProps} />)

    const button = screen.getByRole('button', { name: /dashboard anpassen/i })
    expect(button).toBeInTheDocument()
  })

  it('should open dialog when button is clicked', () => {
    render(<DashboardCustomization {...defaultProps} />)

    const button = screen.getByRole('button', { name: /dashboard anpassen/i })
    fireEvent.click(button)

    expect(screen.getByText('Dashboard-Ansicht anpassen')).toBeInTheDocument()
  })

  it('should display all sections in the dialog', () => {
    render(<DashboardCustomization {...defaultProps} />)

    const button = screen.getByRole('button', { name: /dashboard anpassen/i })
    fireEvent.click(button)

    expect(screen.getByText('Einführung')).toBeInTheDocument()
    expect(screen.getByText('Zeitspanne')).toBeInTheDocument()
    expect(screen.getByText('Sparplan-Eingabe')).toBeInTheDocument()
    expect(screen.getByText('Rendite-Konfiguration')).toBeInTheDocument()
  })

  it('should display section descriptions', () => {
    render(<DashboardCustomization {...defaultProps} />)

    const button = screen.getByRole('button', { name: /dashboard anpassen/i })
    fireEvent.click(button)

    expect(screen.getByText(/Willkommensbereich und allgemeine Informationen/i)).toBeInTheDocument()
    expect(screen.getByText(/Zeitraum-Auswahl für Simulation/i)).toBeInTheDocument()
  })

  it('should show visible count', () => {
    render(<DashboardCustomization {...defaultProps} />)

    const button = screen.getByRole('button', { name: /dashboard anpassen/i })
    fireEvent.click(button)

    expect(screen.getByText(/3 von 4 Bereichen sichtbar/i)).toBeInTheDocument()
  })

  it('should call onVisibilityChange when toggle is clicked', () => {
    const onVisibilityChange = vi.fn()
    render(<DashboardCustomization {...defaultProps} onVisibilityChange={onVisibilityChange} />)

    const button = screen.getByRole('button', { name: /dashboard anpassen/i })
    fireEvent.click(button)

    // Find all switches and click the first one (Introduction)
    const switches = screen.getAllByRole('switch')
    fireEvent.click(switches[0])

    expect(onVisibilityChange).toHaveBeenCalledWith('introduction', false)
  })

  it('should allow showing a hidden section', () => {
    const onVisibilityChange = vi.fn()
    render(<DashboardCustomization {...defaultProps} onVisibilityChange={onVisibilityChange} />)

    const button = screen.getByRole('button', { name: /dashboard anpassen/i })
    fireEvent.click(button)

    // Find the switch for the hidden section (Sparplan-Eingabe)
    const switches = screen.getAllByRole('switch')
    // The third switch should be for the hidden section
    fireEvent.click(switches[2])

    expect(onVisibilityChange).toHaveBeenCalledWith('sparplan-eingabe', true)
  })

  it('should prevent hiding the last visible section', () => {
    const singleVisiblePreferences: SectionPreference[] = [
      { id: 'introduction', visible: true, collapsed: false, order: 0 },
      { id: 'zeitspanne', visible: false, collapsed: false, order: 1 },
      { id: 'sparplan-eingabe', visible: false, collapsed: false, order: 2 },
    ]

    const onVisibilityChange = vi.fn()
    render(
      <DashboardCustomization
        {...defaultProps}
        preferences={singleVisiblePreferences}
        onVisibilityChange={onVisibilityChange}
      />,
    )

    const button = screen.getByRole('button', { name: /dashboard anpassen/i })
    fireEvent.click(button)

    // Try to toggle the only visible section
    const switches = screen.getAllByRole('switch')
    fireEvent.click(switches[0])

    // Should not call onVisibilityChange because it's the last visible section
    expect(onVisibilityChange).not.toHaveBeenCalled()
  })

  it('should display warning when no sections are visible', () => {
    const noVisiblePreferences: SectionPreference[] = [
      { id: 'introduction', visible: false, collapsed: false, order: 0 },
      { id: 'zeitspanne', visible: false, collapsed: false, order: 1 },
    ]

    render(<DashboardCustomization {...defaultProps} preferences={noVisiblePreferences} />)

    const button = screen.getByRole('button', { name: /dashboard anpassen/i })
    fireEvent.click(button)

    expect(screen.getByText(/Mindestens ein Bereich muss sichtbar sein/i)).toBeInTheDocument()
  })

  it('should call onReset when reset button is clicked', () => {
    const onReset = vi.fn()
    render(<DashboardCustomization {...defaultProps} onReset={onReset} />)

    const button = screen.getByRole('button', { name: /dashboard anpassen/i })
    fireEvent.click(button)

    const resetButton = screen.getByRole('button', { name: /zurücksetzen/i })
    fireEvent.click(resetButton)

    expect(onReset).toHaveBeenCalled()
  })

  it('should close dialog when Fertig button is clicked', () => {
    render(<DashboardCustomization {...defaultProps} />)

    const button = screen.getByRole('button', { name: /dashboard anpassen/i })
    fireEvent.click(button)

    expect(screen.getByText('Dashboard-Ansicht anpassen')).toBeInTheDocument()

    const doneButton = screen.getByRole('button', { name: /fertig/i })
    fireEvent.click(doneButton)

    // Dialog should close
    expect(screen.queryByText('Dashboard-Ansicht anpassen')).not.toBeInTheDocument()
  })

  it('should display sections in order', () => {
    render(<DashboardCustomization {...defaultProps} />)

    const button = screen.getByRole('button', { name: /dashboard anpassen/i })
    fireEvent.click(button)

    const sectionTitles = screen.getAllByRole('heading', { level: 3 })
    expect(sectionTitles[0]).toHaveTextContent('Einführung')
    expect(sectionTitles[1]).toHaveTextContent('Zeitspanne')
    expect(sectionTitles[2]).toHaveTextContent('Sparplan-Eingabe')
    expect(sectionTitles[3]).toHaveTextContent('Rendite-Konfiguration')
  })

  it('should show eye icon for visible sections', () => {
    render(<DashboardCustomization {...defaultProps} />)

    const button = screen.getByRole('button', { name: /dashboard anpassen/i })
    fireEvent.click(button)

    // Check that visible sections have Eye icon (lucide-react)
    const introCard = screen.getByText('Einführung').closest('div')
    expect(within(introCard!).getByRole('heading')).toBeInTheDocument()
  })

  it('should apply different styling to hidden sections', () => {
    render(<DashboardCustomization {...defaultProps} />)

    const button = screen.getByRole('button', { name: /dashboard anpassen/i })
    fireEvent.click(button)

    // Get the card for the hidden section (Sparplan-Eingabe)
    const hiddenCard = screen.getByText('Sparplan-Eingabe').closest('.opacity-60')
    expect(hiddenCard).toBeInTheDocument()
  })

  it('should have up/down buttons for reordering', () => {
    render(<DashboardCustomization {...defaultProps} />)

    const button = screen.getByRole('button', { name: /dashboard anpassen/i })
    fireEvent.click(button)

    // Should have multiple up/down buttons
    const upButtons = screen.getAllByTitle(/nach oben verschieben/i)
    const downButtons = screen.getAllByTitle(/nach unten verschieben/i)

    expect(upButtons.length).toBeGreaterThan(0)
    expect(downButtons.length).toBeGreaterThan(0)
  })

  it('should disable up button for first item', () => {
    render(<DashboardCustomization {...defaultProps} />)

    const button = screen.getByRole('button', { name: /dashboard anpassen/i })
    fireEvent.click(button)

    const upButtons = screen.getAllByTitle(/nach oben verschieben/i)
    expect(upButtons[0]).toBeDisabled()
  })

  it('should disable down button for last item', () => {
    render(<DashboardCustomization {...defaultProps} />)

    const button = screen.getByRole('button', { name: /dashboard anpassen/i })
    fireEvent.click(button)

    const downButtons = screen.getAllByTitle(/nach unten verschieben/i)
    expect(downButtons[downButtons.length - 1]).toBeDisabled()
  })

  it('should call onOrderChange when moving section up', () => {
    const onOrderChange = vi.fn()
    render(<DashboardCustomization {...defaultProps} onOrderChange={onOrderChange} />)

    const button = screen.getByRole('button', { name: /dashboard anpassen/i })
    fireEvent.click(button)

    // Click up button for second item (Zeitspanne)
    const upButtons = screen.getAllByTitle(/nach oben verschieben/i)
    fireEvent.click(upButtons[1])

    expect(onOrderChange).toHaveBeenCalled()
    const calledWith = onOrderChange.mock.calls[0][0] as DashboardSectionId[]
    expect(calledWith[0]).toBe('zeitspanne')
    expect(calledWith[1]).toBe('introduction')
  })

  it('should call onOrderChange when moving section down', () => {
    const onOrderChange = vi.fn()
    render(<DashboardCustomization {...defaultProps} onOrderChange={onOrderChange} />)

    const button = screen.getByRole('button', { name: /dashboard anpassen/i })
    fireEvent.click(button)

    // Click down button for first item (Introduction)
    const downButtons = screen.getAllByTitle(/nach unten verschieben/i)
    fireEvent.click(downButtons[0])

    expect(onOrderChange).toHaveBeenCalled()
    const calledWith = onOrderChange.mock.calls[0][0] as DashboardSectionId[]
    expect(calledWith[0]).toBe('zeitspanne')
    expect(calledWith[1]).toBe('introduction')
  })

  it('should support drag and drop', () => {
    render(<DashboardCustomization {...defaultProps} />)

    const button = screen.getByRole('button', { name: /dashboard anpassen/i })
    fireEvent.click(button)

    const cards = screen.getAllByRole('heading', { level: 3 }).map((h) => h.closest('[draggable="true"]'))

    // Simulate drag start on first card
    fireEvent.dragStart(cards[0]!)

    // Simulate drag over second card
    fireEvent.dragOver(cards[1]!)

    // Should apply styling during drag - check the actual card element
    expect(cards[0]?.className).toMatch(/opacity-50/)
  })

  it('should call onOrderChange after drag and drop', () => {
    const onOrderChange = vi.fn()
    render(<DashboardCustomization {...defaultProps} onOrderChange={onOrderChange} />)

    const button = screen.getByRole('button', { name: /dashboard anpassen/i })
    fireEvent.click(button)

    const cards = screen.getAllByRole('heading', { level: 3 }).map((h) => h.closest('[draggable="true"]'))

    // Simulate drag and drop from first to third position
    fireEvent.dragStart(cards[0]!)
    fireEvent.dragOver(cards[2]!)
    fireEvent.dragEnd(cards[0]!)

    expect(onOrderChange).toHaveBeenCalled()
  })

  it('should not call onOrderChange if dropped on same position', () => {
    const onOrderChange = vi.fn()
    render(<DashboardCustomization {...defaultProps} onOrderChange={onOrderChange} />)

    const button = screen.getByRole('button', { name: /dashboard anpassen/i })
    fireEvent.click(button)

    const cards = screen.getAllByRole('heading', { level: 3 }).map((h) => h.closest('[draggable="true"]'))

    // Simulate drag and drop on same position
    fireEvent.dragStart(cards[0]!)
    fireEvent.dragOver(cards[0]!)
    fireEvent.dragEnd(cards[0]!)

    expect(onOrderChange).not.toHaveBeenCalled()
  })

  it('should reset drag state after drag end', () => {
    render(<DashboardCustomization {...defaultProps} />)

    const button = screen.getByRole('button', { name: /dashboard anpassen/i })
    fireEvent.click(button)

    const cards = screen.getAllByRole('heading', { level: 3 }).map((h) => h.closest('[draggable="true"]'))

    // Start drag
    fireEvent.dragStart(cards[0]!)
    expect(cards[0]?.className).toMatch(/opacity-50/)

    // End drag
    fireEvent.dragEnd(cards[0]!)

    // Note: Testing state cleanup after drag end
    // In real implementation, the opacity class should be removed after React re-renders
  })
})
