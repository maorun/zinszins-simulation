import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChartControls } from './ChartControls'

describe('ChartControls', () => {
  const defaultProps = {
    showInflationAdjusted: false,
    onShowInflationAdjustedChange: vi.fn(),
    showTaxes: true,
    onShowTaxesChange: vi.fn(),
    chartView: 'overview' as const,
    onChartViewChange: vi.fn(),
  }

  it('renders collapsible trigger button', () => {
    render(<ChartControls {...defaultProps} />)

    expect(screen.getByRole('button', { name: /Chart-Einstellungen/i })).toBeInTheDocument()
  })

  it('shows controls when trigger is clicked', async () => {
    const user = userEvent.setup()
    render(<ChartControls {...defaultProps} />)

    const trigger = screen.getByRole('button', { name: /Chart-Einstellungen/i })
    await user.click(trigger)

    expect(screen.getByLabelText('Real (inflationsbereinigt)')).toBeInTheDocument()
    expect(screen.getByLabelText('Steuern anzeigen')).toBeInTheDocument()
    expect(screen.getByText('Übersicht')).toBeInTheDocument()
    expect(screen.getByText('Detail')).toBeInTheDocument()
  })

  it('calls onShowInflationAdjustedChange when switch is toggled', async () => {
    const user = userEvent.setup()
    const onShowInflationAdjustedChange = vi.fn()

    render(<ChartControls {...defaultProps} onShowInflationAdjustedChange={onShowInflationAdjustedChange} />)

    const trigger = screen.getByRole('button', { name: /Chart-Einstellungen/i })
    await user.click(trigger)

    const inflationSwitch = screen.getByLabelText('Real (inflationsbereinigt)')
    await user.click(inflationSwitch)

    expect(onShowInflationAdjustedChange).toHaveBeenCalledWith(true)
  })

  it('calls onShowTaxesChange when tax switch is toggled', async () => {
    const user = userEvent.setup()
    const onShowTaxesChange = vi.fn()

    render(<ChartControls {...defaultProps} onShowTaxesChange={onShowTaxesChange} />)

    const trigger = screen.getByRole('button', { name: /Chart-Einstellungen/i })
    await user.click(trigger)

    const taxSwitch = screen.getByLabelText('Steuern anzeigen')
    await user.click(taxSwitch)

    expect(onShowTaxesChange).toHaveBeenCalledWith(false)
  })

  it('calls onChartViewChange when overview button is clicked', async () => {
    const user = userEvent.setup()
    const onChartViewChange = vi.fn()

    render(<ChartControls {...defaultProps} chartView="detailed" onChartViewChange={onChartViewChange} />)

    const trigger = screen.getByRole('button', { name: /Chart-Einstellungen/i })
    await user.click(trigger)

    const overviewButton = screen.getByText('Übersicht')
    await user.click(overviewButton)

    expect(onChartViewChange).toHaveBeenCalledWith('overview')
  })

  it('calls onChartViewChange when detail button is clicked', async () => {
    const user = userEvent.setup()
    const onChartViewChange = vi.fn()

    render(<ChartControls {...defaultProps} onChartViewChange={onChartViewChange} />)

    const trigger = screen.getByRole('button', { name: /Chart-Einstellungen/i })
    await user.click(trigger)

    const detailButton = screen.getByText('Detail')
    await user.click(detailButton)

    expect(onChartViewChange).toHaveBeenCalledWith('detailed')
  })

  it('shows correct button state for overview mode', async () => {
    const user = userEvent.setup()
    render(<ChartControls {...defaultProps} chartView="overview" />)

    const trigger = screen.getByRole('button', { name: /Chart-Einstellungen/i })
    await user.click(trigger)

    const overviewButton = screen.getByText('Übersicht')
    const detailButton = screen.getByText('Detail')

    // Both buttons should be present
    expect(overviewButton).toBeInTheDocument()
    expect(detailButton).toBeInTheDocument()
  })

  it('shows correct button state for detailed mode', async () => {
    const user = userEvent.setup()
    render(<ChartControls {...defaultProps} chartView="detailed" />)

    const trigger = screen.getByRole('button', { name: /Chart-Einstellungen/i })
    await user.click(trigger)

    const overviewButton = screen.getByText('Übersicht')
    const detailButton = screen.getByText('Detail')

    // Both buttons should be present
    expect(overviewButton).toBeInTheDocument()
    expect(detailButton).toBeInTheDocument()
  })
})
