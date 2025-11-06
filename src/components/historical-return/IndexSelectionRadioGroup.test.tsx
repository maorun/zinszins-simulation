import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { IndexSelectionRadioGroup } from './IndexSelectionRadioGroup'

describe('IndexSelectionRadioGroup', () => {
  it('should render all historical indices', () => {
    const mockOnIndexChange = vi.fn()
    render(<IndexSelectionRadioGroup selectedIndexId="dax" onIndexChange={mockOnIndexChange} />)

    // Check for all index names
    expect(screen.getByText('DAX')).toBeInTheDocument()
    expect(screen.getByText('S&P 500')).toBeInTheDocument()
    expect(screen.getByText('MSCI World')).toBeInTheDocument()
  })

  it('should display index descriptions', () => {
    const mockOnIndexChange = vi.fn()
    render(<IndexSelectionRadioGroup selectedIndexId="dax" onIndexChange={mockOnIndexChange} />)

    // Check for index descriptions
    expect(screen.getByText(/Deutscher Aktienindex/)).toBeInTheDocument()
    expect(screen.getByText(/Die 500 größten US-amerikanischen Unternehmen/)).toBeInTheDocument()
    expect(screen.getByText(/Globaler Aktienindex/)).toBeInTheDocument()
  })

  it('should display index metadata (years, currency, average return)', () => {
    const mockOnIndexChange = vi.fn()
    render(<IndexSelectionRadioGroup selectedIndexId="dax" onIndexChange={mockOnIndexChange} />)

    // Check for year ranges
    expect(screen.getAllByText(/2000-2023/).length).toBeGreaterThan(0)

    // Check for currencies
    expect(screen.getAllByText(/EUR/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/USD/).length).toBeGreaterThan(0)

    // Check for percentage values
    expect(screen.getAllByText(/% p.a./).length).toBeGreaterThan(0)
  })

  it('should call onIndexChange when a different index is selected', async () => {
    const user = userEvent.setup()
    const mockOnIndexChange = vi.fn()
    render(<IndexSelectionRadioGroup selectedIndexId="dax" onIndexChange={mockOnIndexChange} />)

    // Click on S&P 500
    const sp500Radio = screen.getByRole('radio', { name: /S&P 500/ })
    await user.click(sp500Radio)

    // Verify callback was called with correct index
    expect(mockOnIndexChange).toHaveBeenCalledWith('sp500')
  })

  it('should have the correct index selected by default', () => {
    const mockOnIndexChange = vi.fn()
    render(<IndexSelectionRadioGroup selectedIndexId="sp500" onIndexChange={mockOnIndexChange} />)

    // S&P 500 should be checked
    const sp500Radio = screen.getByRole('radio', { name: /S&P 500/ })
    expect(sp500Radio).toBeChecked()

    // DAX should not be checked
    const daxRadio = screen.getByRole('radio', { name: /DAX/ })
    expect(daxRadio).not.toBeChecked()
  })

  it('should render the label for the radio group', () => {
    const mockOnIndexChange = vi.fn()
    render(<IndexSelectionRadioGroup selectedIndexId="dax" onIndexChange={mockOnIndexChange} />)

    expect(screen.getByText('Historischer Index für Backtesting')).toBeInTheDocument()
  })
})
