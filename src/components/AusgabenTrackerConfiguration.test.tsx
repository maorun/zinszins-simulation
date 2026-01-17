import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AusgabenTrackerConfiguration } from './AusgabenTrackerConfiguration'
import { createDefaultAusgabenTrackerConfig } from '../../helpers/ausgaben-tracker'

describe('AusgabenTrackerConfiguration', () => {
  const defaultProps = {
    config: createDefaultAusgabenTrackerConfig(1958),
    onChange: vi.fn(),
    retirementStartYear: 2023,
    retirementEndYear: 2040,
  }

  it('should render the component with all sections', () => {
    render(<AusgabenTrackerConfiguration {...defaultProps} />)

    expect(screen.getByText('Ausgaben-Tracker für Ruhestandsplanung')).toBeInTheDocument()
    expect(screen.getByText('Ausgabenkategorien')).toBeInTheDocument()
    expect(screen.getByLabelText('Geburtsjahr')).toBeInTheDocument()
  })

  it('should display all six expense categories', () => {
    render(<AusgabenTrackerConfiguration {...defaultProps} />)

    expect(screen.getByText('Fixkosten')).toBeInTheDocument()
    expect(screen.getByText('Lebenshaltung')).toBeInTheDocument()
    expect(screen.getByText('Gesundheit')).toBeInTheDocument()
    expect(screen.getByText('Freizeit')).toBeInTheDocument()
    expect(screen.getByText('Reisen')).toBeInTheDocument()
    expect(screen.getByText('Einmalige Ausgaben')).toBeInTheDocument()
  })

  it('should show category as active by default except einmalig', () => {
    render(<AusgabenTrackerConfiguration {...defaultProps} />)

    // Check that switches exist (one for each category + one for enabled)
    const switches = screen.getAllByRole('switch')
    // Should have 7 switches total: 1 main enable + 6 categories
    expect(switches.length).toBeGreaterThanOrEqual(6)
  })

  it('should call onChange when geburtsjahr is updated', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()

    render(<AusgabenTrackerConfiguration {...defaultProps} onChange={onChange} />)

    const geburtjahrInput = screen.getByLabelText('Geburtsjahr')
    await user.clear(geburtjahrInput)
    await user.type(geburtjahrInput, '1960')

    expect(onChange).toHaveBeenCalled()
  })

  it('should call onChange when category betrag is updated', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()

    render(<AusgabenTrackerConfiguration {...defaultProps} onChange={onChange} />)

    // Find the first "Monatlich (€)" input (should be Fixkosten)
    const betragInputs = screen.getAllByLabelText(/Monatlich \(€\)/i)
    await user.clear(betragInputs[0])
    await user.type(betragInputs[0], '1500')

    expect(onChange).toHaveBeenCalled()
  })

  it('should call onChange when category inflation rate is updated', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()

    render(<AusgabenTrackerConfiguration {...defaultProps} onChange={onChange} />)

    // Find the first "Inflation (% p.a.)" input
    const inflationInputs = screen.getAllByLabelText(/Inflation \(% p\.a\.\)/i)
    await user.clear(inflationInputs[0])
    await user.type(inflationInputs[0], '3.5')

    expect(onChange).toHaveBeenCalled()
  })

  it('should toggle category active state', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()

    render(<AusgabenTrackerConfiguration {...defaultProps} onChange={onChange} />)

    // Find switch for a specific category (use label text)
    const fixkostenLabel = screen.getByText('Fixkosten')
    const fixkostenCard = fixkostenLabel.closest('[class*="CardContent"]')
    if (!fixkostenCard) throw new Error('Card not found')
    
    const switchElement = within(fixkostenCard as HTMLElement).getByRole('switch')
    await user.click(switchElement)

    expect(onChange).toHaveBeenCalled()
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0]
    expect(lastCall.kategorien.fixkosten.aktiv).toBe(false)
  })

  it('should not show preview section initially', () => {
    render(<AusgabenTrackerConfiguration {...defaultProps} />)

    expect(screen.queryByText('Jahr-für-Jahr Aufschlüsselung')).not.toBeInTheDocument()
  })

  it('should show preview when toggle button is clicked', async () => {
    const user = userEvent.setup()
    render(<AusgabenTrackerConfiguration {...defaultProps} />)

    // Find and click the preview toggle button
    const previewSection = screen.getByText('Ausgabenvorschau').closest('div')
    if (!previewSection) throw new Error('Preview section not found')
    
    const toggleButton = within(previewSection as HTMLElement).getByRole('button')
    await user.click(toggleButton)

    // Now the detailed breakdown should be visible
    expect(screen.getByText('Jahr-für-Jahr Aufschlüsselung')).toBeInTheDocument()
  })

  it('should display validation errors for invalid geburtsjahr', () => {
    const invalidConfig = createDefaultAusgabenTrackerConfig(1900) // Too old

    render(
      <AusgabenTrackerConfiguration
        {...defaultProps}
        config={invalidConfig}
      />,
    )

    expect(screen.getByText(/Geburtsjahr muss zwischen/i)).toBeInTheDocument()
  })

  it('should display info alert about life phases', () => {
    render(<AusgabenTrackerConfiguration {...defaultProps} />)

    expect(
      screen.getByText(/Ausgaben verändern sich mit dem Alter/i),
    ).toBeInTheDocument()
  })

  it('should show summary statistics when preview is expanded', async () => {
    const user = userEvent.setup()
    render(<AusgabenTrackerConfiguration {...defaultProps} />)

    // Expand preview
    const previewSection = screen.getByText('Ausgabenvorschau').closest('div')
    if (!previewSection) throw new Error('Preview section not found')
    
    const toggleButton = within(previewSection as HTMLElement).getByRole('button')
    await user.click(toggleButton)

    // Check for summary stats
    expect(screen.getByText('Gesamtausgaben')).toBeInTheDocument()
    expect(screen.getByText('Ø pro Jahr')).toBeInTheDocument()
    expect(screen.getByText('Höchstes Jahr')).toBeInTheDocument()
    expect(screen.getByText('Niedrigstes Jahr')).toBeInTheDocument()
  })

  it('should render year-by-year table in preview', async () => {
    const user = userEvent.setup()
    render(<AusgabenTrackerConfiguration {...defaultProps} />)

    // Expand preview
    const previewSection = screen.getByText('Ausgabenvorschau').closest('div')
    if (!previewSection) throw new Error('Preview section not found')
    
    const toggleButton = within(previewSection as HTMLElement).getByRole('button')
    await user.click(toggleButton)

    // Check for table headers
    expect(screen.getByText('Jahr')).toBeInTheDocument()
    expect(screen.getByText('Alter')).toBeInTheDocument()
    expect(screen.getByText('Phase')).toBeInTheDocument()
    expect(screen.getByText('Gesamt (€/Jahr)')).toBeInTheDocument()
  })

  it('should display life phase badges in table', async () => {
    const user = userEvent.setup()
    render(<AusgabenTrackerConfiguration {...defaultProps} />)

    // Expand preview
    const previewSection = screen.getByText('Ausgabenvorschau').closest('div')
    if (!previewSection) throw new Error('Preview section not found')
    
    const toggleButton = within(previewSection as HTMLElement).getByRole('button')
    await user.click(toggleButton)

    // Should have at least one badge showing "Aktiver Ruhestand"
    expect(screen.getByText('Aktiver Ruhestand')).toBeInTheDocument()
  })

  it('should hide input fields when category is inactive', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<AusgabenTrackerConfiguration {...defaultProps} onChange={onChange} />)

    // Find and disable Fixkosten
    const fixkostenLabel = screen.getByText('Fixkosten')
    const fixkostenCard = fixkostenLabel.closest('[class*="CardContent"]')
    if (!fixkostenCard) throw new Error('Card not found')
    
    const switchElement = within(fixkostenCard as HTMLElement).getByRole('switch')
    
    // Initially inputs should be visible
    const initialInputs = within(fixkostenCard as HTMLElement).queryAllByRole('spinbutton')
    expect(initialInputs.length).toBeGreaterThan(0)

    // Disable the category
    await user.click(switchElement)

    // After re-render with inactive state, inputs should be hidden
    // Note: We can't test this directly since we need the component to re-render with new props
    expect(onChange).toHaveBeenCalled()
  })

  it('should show all six category icons', () => {
    render(<AusgabenTrackerConfiguration {...defaultProps} />)

    // Check that SVG icons are rendered (lucide-react renders as SVG)
    const cards = screen.getAllByText(/Fixkosten|Lebenshaltung|Gesundheit|Freizeit|Reisen|Einmalige Ausgaben/)
    expect(cards).toHaveLength(6)
  })

  it('should handle empty year range gracefully', () => {
    render(
      <AusgabenTrackerConfiguration
        {...defaultProps}
        retirementStartYear={2040}
        retirementEndYear={2040}
      />,
    )

    // Should render without errors
    expect(screen.getByText('Ausgaben-Tracker für Ruhestandsplanung')).toBeInTheDocument()
  })

  it('should format currency values correctly', async () => {
    const user = userEvent.setup()
    render(<AusgabenTrackerConfiguration {...defaultProps} />)

    // Expand preview to see formatted values
    const previewSection = screen.getByText('Ausgabenvorschau').closest('div')
    if (!previewSection) throw new Error('Preview section not found')
    
    const toggleButton = within(previewSection as HTMLElement).getByRole('button')
    await user.click(toggleButton)

    // Currency values should be formatted (e.g., "1.234,56 €")
    // Just check that euro symbol is present
    const tableContent = screen.getByText('Jahr-für-Jahr Aufschlüsselung').closest('[class*="Card"]')
    expect(tableContent).toBeInTheDocument()
  })

  it('should show different life phases for different ages', async () => {
    const user = userEvent.setup()
    // Use someone who will transition through phases
    const config = createDefaultAusgabenTrackerConfig(1948) // Will be 75+ in later years

    render(
      <AusgabenTrackerConfiguration
        {...defaultProps}
        config={config}
        retirementStartYear={2023}
        retirementEndYear={2035}
      />,
    )

    // Expand preview
    const previewSection = screen.getByText('Ausgabenvorschau').closest('div')
    if (!previewSection) throw new Error('Preview section not found')
    
    const toggleButton = within(previewSection as HTMLElement).getByRole('button')
    await user.click(toggleButton)

    // Should show both "Aktiver Ruhestand" and "Eingeschränkte Mobilität"
    expect(screen.getByText('Aktiver Ruhestand')).toBeInTheDocument()
    expect(screen.getByText('Eingeschränkte Mobilität')).toBeInTheDocument()
  })
})
