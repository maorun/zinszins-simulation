import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { AusgabenTrackerCard } from './AusgabenTrackerCard'

describe('AusgabenTrackerCard', () => {
  const defaultProps = {
    startjahr: 2023,
    endjahr: 2040,
    geburtsjahr: 1958, // Age 65 in 2023
    onAusgabenChange: vi.fn(),
  }

  it('should render with title and description', () => {
    render(<AusgabenTrackerCard {...defaultProps} />)

    expect(screen.getByText('Ausgaben-Tracker für Ruhestandsplanung')).toBeInTheDocument()
    expect(
      screen.getByText(/Detaillierte Planung Ihrer Ausgaben im Ruhestand/),
    ).toBeInTheDocument()
  })

  it('should display summary statistics', () => {
    render(<AusgabenTrackerCard {...defaultProps} />)

    expect(screen.getByText('Gesamtausgaben')).toBeInTheDocument()
    expect(screen.getByText('Durchschnitt/Jahr')).toBeInTheDocument()
    expect(screen.getByText('Höchste Ausgaben')).toBeInTheDocument()
    expect(screen.getByText('Niedrigste Ausgaben')).toBeInTheDocument()
  })

  it('should render all expense categories', () => {
    render(<AusgabenTrackerCard {...defaultProps} />)

    expect(screen.getByText('Fixkosten')).toBeInTheDocument()
    expect(screen.getByText('Lebenshaltung')).toBeInTheDocument()
    expect(screen.getByText('Gesundheit')).toBeInTheDocument()
    expect(screen.getByText('Freizeit')).toBeInTheDocument()
    expect(screen.getByText('Reisen')).toBeInTheDocument()
    expect(screen.getByText('Einmalige Ausgaben')).toBeInTheDocument()
  })

  it('should display life phase information', () => {
    render(<AusgabenTrackerCard {...defaultProps} />)

    expect(screen.getByText('Lebensabschnitte im Ruhestand')).toBeInTheDocument()
    expect(screen.getByText('Aktiver Ruhestand')).toBeInTheDocument()
    expect(screen.getByText('Eingeschränkte Mobilität')).toBeInTheDocument()
    expect(screen.getByText('Pflegebedarf')).toBeInTheDocument()
  })

  it('should allow toggling category active state', () => {
    render(<AusgabenTrackerCard {...defaultProps} />)

    // Find the switch for "Einmalige Ausgaben" (which is inactive by default)
    const rows = screen.getAllByRole('row')
    const einmaligRow = rows.find((row) => row.textContent?.includes('Einmalige Ausgaben'))
    expect(einmaligRow).toBeDefined()

    if (einmaligRow) {
      const switchElement = within(einmaligRow).getByRole('switch')
      expect(switchElement).toHaveAttribute('aria-checked', 'false')

      // Toggle it on
      fireEvent.click(switchElement)
      expect(switchElement).toHaveAttribute('aria-checked', 'true')
    }
  })

  it('should allow updating monthly amount', () => {
    render(<AusgabenTrackerCard {...defaultProps} />)

    // Find the Fixkosten input
    const inputs = screen.getAllByRole('spinbutton')
    const fixkostenInput = inputs.find(
      (input) => input.getAttribute('value') === '1200',
    ) as HTMLInputElement
    expect(fixkostenInput).toBeDefined()

    if (fixkostenInput) {
      // Update the value
      fireEvent.change(fixkostenInput, { target: { value: '1500' } })
      expect(fixkostenInput.value).toBe('1500')
    }
  })

  it('should allow updating inflation rate', () => {
    render(<AusgabenTrackerCard {...defaultProps} />)

    // Find an inflation rate input (2.0% for Fixkosten)
    const inputs = screen.getAllByRole('spinbutton')
    const inflationInput = inputs.find(
      (input) => input.getAttribute('value') === '2.0',
    ) as HTMLInputElement
    expect(inflationInput).toBeDefined()

    if (inflationInput) {
      // Update the value
      fireEvent.change(inflationInput, { target: { value: '3.0' } })
      expect(inflationInput.value).toBe('3.0')
    }
  })

  it('should show/hide detailed year-by-year view', () => {
    render(<AusgabenTrackerCard {...defaultProps} />)

    // Initially, the detailed table should be hidden
    // Check for "Alter" column header that only exists in details table
    expect(screen.queryByRole('columnheader', { name: 'Alter' })).not.toBeInTheDocument()

    // Click "Details anzeigen" button
    const detailsButton = screen.getByRole('button', { name: /Details anzeigen/ })
    fireEvent.click(detailsButton)

    // Now details table should be visible
    expect(screen.getByRole('columnheader', { name: 'Alter' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Phase' })).toBeInTheDocument()
    expect(screen.getByText('65')).toBeInTheDocument() // Age in table

    // Click "Weniger anzeigen" button
    const hideButton = screen.getByRole('button', { name: /Weniger anzeigen/ })
    fireEvent.click(hideButton)

    // Details table headers should be hidden again
    expect(screen.queryByRole('columnheader', { name: 'Alter' })).not.toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'Phase' })).not.toBeInTheDocument()
  })

  it('should display information alert about life-phase adjustments', () => {
    render(<AusgabenTrackerCard {...defaultProps} />)

    expect(
      screen.getByText(/Die Ausgaben werden automatisch an Ihre Lebensphase angepasst/),
    ).toBeInTheDocument()
  })

  it('should call onAusgabenChange callback when configuration changes', () => {
    const onAusgabenChange = vi.fn()
    render(<AusgabenTrackerCard {...defaultProps} onAusgabenChange={onAusgabenChange} />)

    // Should be called initially with calculated expenses
    expect(onAusgabenChange).toHaveBeenCalled()
    const initialCall = onAusgabenChange.mock.calls[0][0]
    expect(initialCall).toBeInstanceOf(Array)
    expect(initialCall.length).toBe(18) // 2023-2040 = 18 years
  })

  it('should display validation errors when configuration is invalid', () => {
    render(<AusgabenTrackerCard {...defaultProps} geburtsjahr={1900} />)

    // Should show validation error for invalid birth year
    expect(screen.getByText(/Geburtsjahr muss zwischen/)).toBeInTheDocument()
  })

  it('should disable inputs when category is inactive', () => {
    render(<AusgabenTrackerCard {...defaultProps} />)

    // Find the "Einmalige Ausgaben" row (inactive by default)
    const rows = screen.getAllByRole('row')
    const einmaligRow = rows.find((row) => row.textContent?.includes('Einmalige Ausgaben'))
    expect(einmaligRow).toBeDefined()

    if (einmaligRow) {
      const inputs = within(einmaligRow).getAllByRole('spinbutton')
      inputs.forEach((input) => {
        expect(input).toBeDisabled()
      })
    }
  })

  it('should display correct number of years in summary', () => {
    const { rerender } = render(<AusgabenTrackerCard {...defaultProps} />)

    // Click to show details
    const detailsButton = screen.getByRole('button', { name: /Details anzeigen/ })
    fireEvent.click(detailsButton)

    // Should show 18 years (2023-2040)
    const rows = screen.getAllByRole('row')
    // Header row + 18 data rows in the details table, plus rows in config table
    expect(rows.length).toBeGreaterThan(18)

    // Change year range
    rerender(<AusgabenTrackerCard {...defaultProps} startjahr={2023} endjahr={2025} />)

    // Should now show only 3 years
    const updatedRows = screen.getAllByRole('row')
    // Less rows now
    expect(updatedRows.length).toBeLessThan(rows.length)
  })

  it('should display life phase badges with correct variants', () => {
    render(<AusgabenTrackerCard {...defaultProps} />)

    const badges = screen.getAllByText(/65-74|75-84|85-∞/)
    expect(badges.length).toBe(3)
  })

  it('should format currency values correctly', () => {
    render(<AusgabenTrackerCard {...defaultProps} />)

    // Currency should be formatted with € symbol
    const gesamtElement = screen.getByText('Gesamtausgaben')
      .nextElementSibling as HTMLElement | null
    expect(gesamtElement).toBeDefined()
    if (gesamtElement) {
      expect(gesamtElement.textContent).toContain('€')
    }
  })

  it('should handle edge case with single year range', () => {
    render(<AusgabenTrackerCard {...defaultProps} startjahr={2023} endjahr={2023} />)

    // Should still render without errors
    expect(screen.getByText('Ausgaben-Tracker für Ruhestandsplanung')).toBeInTheDocument()

    // Show details
    const detailsButton = screen.getByRole('button', { name: /Details anzeigen/ })
    fireEvent.click(detailsButton)

    // Should show exactly 1 year
    expect(screen.getByText('2023')).toBeInTheDocument()
  })

  it('should update summary when category configuration changes', () => {
    const onAusgabenChange = vi.fn()
    render(<AusgabenTrackerCard {...defaultProps} onAusgabenChange={onAusgabenChange} />)

    const initialCallCount = onAusgabenChange.mock.calls.length

    // Change a value
    const inputs = screen.getAllByRole('spinbutton')
    const fixkostenInput = inputs.find(
      (input) => input.getAttribute('value') === '1200',
    ) as HTMLInputElement

    if (fixkostenInput) {
      fireEvent.change(fixkostenInput, { target: { value: '1500' } })

      // Should trigger recalculation and callback
      expect(onAusgabenChange.mock.calls.length).toBeGreaterThan(initialCallCount)
    }
  })
})
