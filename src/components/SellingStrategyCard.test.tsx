import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SellingStrategyCard } from './SellingStrategyCard'

describe('SellingStrategyCard', () => {
  it('should render the component with default state', () => {
    render(<SellingStrategyCard />)

    expect(screen.getByText(/Verkaufsstrategie-Optimierung/i)).toBeInTheDocument()
  })

  it('should display information banner', async () => {
    render(<SellingStrategyCard />)

    const user = userEvent.setup()
    const header = screen.getByText(/Verkaufsstrategie-Optimierung/i)
    await user.click(header)

    await waitFor(() => {
      expect(screen.getByText(/Intelligente Verkaufsstrategie/i)).toBeInTheDocument()
    })
  })

  it('should allow selecting different selling methods', async () => {
    render(<SellingStrategyCard />)

    const user = userEvent.setup()
    const header = screen.getByText(/Verkaufsstrategie-Optimierung/i)
    await user.click(header)

    await waitFor(() => {
      expect(screen.getByText(/FIFO \(First In, First Out\)/i)).toBeInTheDocument()
      expect(screen.getByText(/LIFO \(Last In, First Out\)/i)).toBeInTheDocument()
      expect(screen.getByText(/Steueroptimiert/i)).toBeInTheDocument()
    })

    // Check that tax-optimized is selected by default
    const taxOptimizedRadio = screen.getByRole('radio', { name: /Steueroptimiert/i })
    expect(taxOptimizedRadio).toBeChecked()
  })

  it('should update target amount when input changes', async () => {
    render(<SellingStrategyCard />)

    const user = userEvent.setup()
    const header = screen.getByText(/Verkaufsstrategie-Optimierung/i)
    await user.click(header)

    await waitFor(async () => {
      const input = screen.getByLabelText(/Zu verkaufender Betrag/i)
      await user.clear(input)
      await user.type(input, '20000')

      expect(input).toHaveValue(20000)
    })
  })

  it('should display results section with default calculation', async () => {
    render(<SellingStrategyCard />)

    const user = userEvent.setup()
    const header = screen.getByText(/Verkaufsstrategie-Optimierung/i)
    await user.click(header)

    await waitFor(() => {
      expect(screen.getByText(/Ergebnis/i)).toBeInTheDocument()
      expect(screen.getByText(/Verkaufter Betrag:/i)).toBeInTheDocument()
      expect(screen.getByText(/Steuerlast:/i)).toBeInTheDocument()
      expect(screen.getByText(/Nettoerlös:/i)).toBeInTheDocument()
    })
  })

  it('should toggle spread over years option', async () => {
    render(<SellingStrategyCard />)

    const user = userEvent.setup()
    const header = screen.getByText(/Verkaufsstrategie-Optimierung/i)
    await user.click(header)

    await waitFor(async () => {
      const spreadSwitch = screen.getByRole('switch', {
        name: /Verkauf über mehrere Jahre verteilen/i,
      })
      expect(spreadSwitch).not.toBeChecked()

      await user.click(spreadSwitch)

      expect(spreadSwitch).toBeChecked()
      expect(screen.getByLabelText(/Anzahl Jahre/i)).toBeInTheDocument()
    })
  })

  it('should show comparison when button is clicked', async () => {
    render(<SellingStrategyCard />)

    const user = userEvent.setup()
    const header = screen.getByText(/Verkaufsstrategie-Optimierung/i)
    await user.click(header)

    await waitFor(async () => {
      const compareButton = screen.getByRole('button', { name: /Methoden vergleichen/i })
      await user.click(compareButton)

      expect(screen.getByText(/Methodenvergleich/i)).toBeInTheDocument()
      expect(screen.getByText(/FIFO/i)).toBeInTheDocument()
      expect(screen.getByText(/LIFO/i)).toBeInTheDocument()
      expect(screen.getByText(/Beste Methode:/i)).toBeInTheDocument()
    })
  })

  it('should display year summary when spreading over multiple years', async () => {
    render(<SellingStrategyCard />)

    const user = userEvent.setup()
    const header = screen.getByText(/Verkaufsstrategie-Optimierung/i)
    await user.click(header)

    await waitFor(async () => {
      // Enable spreading
      const spreadSwitch = screen.getByRole('switch', {
        name: /Verkauf über mehrere Jahre verteilen/i,
      })
      await user.click(spreadSwitch)

      // Set years to spread
      const yearsInput = screen.getByLabelText(/Anzahl Jahre/i)
      await user.clear(yearsInput)
      await user.type(yearsInput, '3')

      // Should show year breakdown
      expect(screen.getByText(/Aufschlüsselung nach Jahr:/i)).toBeInTheDocument()
    })
  })

  it('should update start year', async () => {
    render(<SellingStrategyCard />)

    const user = userEvent.setup()
    const header = screen.getByText(/Verkaufsstrategie-Optimierung/i)
    await user.click(header)

    await waitFor(async () => {
      const startYearInput = screen.getByLabelText(/Startjahr/i)
      await user.clear(startYearInput)
      await user.type(startYearInput, '2025')

      expect(startYearInput).toHaveValue(2025)
    })
  })

  it('should switch between selling methods', async () => {
    render(<SellingStrategyCard />)

    const user = userEvent.setup()
    const header = screen.getByText(/Verkaufsstrategie-Optimierung/i)
    await user.click(header)

    await waitFor(async () => {
      // Switch to FIFO
      const fifoRadio = screen.getByRole('radio', { name: /FIFO/i })
      await user.click(fifoRadio)

      expect(fifoRadio).toBeChecked()

      // Results should update
      expect(screen.getByText(/FIFO/)).toBeInTheDocument()
    })
  })

  it('should hide comparison when toggled off', async () => {
    render(<SellingStrategyCard />)

    const user = userEvent.setup()
    const header = screen.getByText(/Verkaufsstrategie-Optimierung/i)
    await user.click(header)

    await waitFor(async () => {
      const compareButton = screen.getByRole('button', { name: /Methoden vergleichen/i })

      // Show comparison
      await user.click(compareButton)
      expect(screen.getByText(/Methodenvergleich/i)).toBeInTheDocument()

      // Hide comparison
      await user.click(compareButton)
      await waitFor(() => {
        expect(screen.queryByText(/Methodenvergleich/i)).not.toBeInTheDocument()
      })
    })
  })

  it('should display tax efficiency percentage', async () => {
    render(<SellingStrategyCard />)

    const user = userEvent.setup()
    const header = screen.getByText(/Verkaufsstrategie-Optimierung/i)
    await user.click(header)

    await waitFor(() => {
      expect(screen.getByText(/Steuereffizienz:/i)).toBeInTheDocument()
      // Should display a percentage
      expect(screen.getByText(/\d+\.\d+%/)).toBeInTheDocument()
    })
  })
})
