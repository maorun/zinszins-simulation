import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { KirchensteuerOptimizationCard } from './KirchensteuerOptimizationCard'

describe('KirchensteuerOptimizationCard', () => {
  const defaultProps = {
    kirchensteuerAktiv: true,
    kirchensteuersatz: 9,
    kapitalertragsteuer: 26.375,
    teilfreistellungsquote: 30,
  }

  describe('when church tax is disabled', () => {
    it('should show message that church tax is disabled', () => {
      render(<KirchensteuerOptimizationCard {...defaultProps} kirchensteuerAktiv={false} />)

      expect(screen.getByText(/Kirchensteuer ist derzeit deaktiviert/i)).toBeInTheDocument()
    })

    it('should not show input fields when church tax is disabled', () => {
      render(<KirchensteuerOptimizationCard {...defaultProps} kirchensteuerAktiv={false} />)

      expect(screen.queryByLabelText(/Durchschnittliche jährliche Kapitalerträge/i)).not.toBeInTheDocument()
    })
  })

  describe('when church tax is enabled', () => {
    it('should render card with title and description', () => {
      render(<KirchensteuerOptimizationCard {...defaultProps} />)

      expect(screen.getByText('Kirchensteuer-Optimierung')).toBeInTheDocument()
      expect(screen.getByText(/Vergleichen Sie die langfristige Auswirkung/i)).toBeInTheDocument()
    })

    it('should render input fields with default values', () => {
      render(<KirchensteuerOptimizationCard {...defaultProps} />)

      const gainsInput = screen.getByLabelText(/Durchschnittliche jährliche Kapitalerträge/i)
      const yearsInput = screen.getByLabelText(/Planungszeitraum/i)

      expect(gainsInput).toHaveValue(5000)
      expect(yearsInput).toHaveValue(20)
    })

    it('should allow changing average yearly gains', () => {
      render(<KirchensteuerOptimizationCard {...defaultProps} />)

      const gainsInput = screen.getByLabelText(/Durchschnittliche jährliche Kapitalerträge/i)
      fireEvent.change(gainsInput, { target: { value: '10000' } })

      expect(gainsInput).toHaveValue(10000)
    })

    it('should allow changing planning period', () => {
      render(<KirchensteuerOptimizationCard {...defaultProps} />)

      const yearsInput = screen.getByLabelText(/Planungszeitraum/i)
      fireEvent.change(yearsInput, { target: { value: '30' } })

      expect(yearsInput).toHaveValue(30)
    })

    it('should show calculate button', () => {
      render(<KirchensteuerOptimizationCard {...defaultProps} />)

      expect(screen.getByRole('button', { name: /Kirchensteuer-Auswirkung berechnen/i })).toBeInTheDocument()
    })

    it('should not show results before calculation', () => {
      render(<KirchensteuerOptimizationCard {...defaultProps} />)

      expect(screen.queryByText(/Mit Kirchensteuer/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/Ohne Kirchensteuer/i)).not.toBeInTheDocument()
    })
  })

  describe('calculation and results', () => {
    it('should show comparison results after clicking calculate', async () => {
      render(<KirchensteuerOptimizationCard {...defaultProps} />)

      const calculateButton = screen.getByRole('button', { name: /Kirchensteuer-Auswirkung berechnen/i })
      fireEvent.click(calculateButton)

      await waitFor(() => {
        expect(screen.getByText('⛪ Mit Kirchensteuer')).toBeInTheDocument()
        expect(screen.getByText('💰 Ohne Kirchensteuer')).toBeInTheDocument()
      })
    })

    it('should display correct comparison sections', async () => {
      render(<KirchensteuerOptimizationCard {...defaultProps} />)

      const calculateButton = screen.getByRole('button', { name: /Kirchensteuer-Auswirkung berechnen/i })
      fireEvent.click(calculateButton)

      await waitFor(() => {
        // Check for "Gesamtsteuer" labels (appears twice: with and without)
        const gesamtsteuerLabels = screen.getAllByText(/Gesamtsteuer:/i)
        expect(gesamtsteuerLabels).toHaveLength(2)

        // Check for "Nettoertrag" labels (appears twice)
        const nettoertragLabels = screen.getAllByText(/Nettoertrag:/i)
        expect(nettoertragLabels).toHaveLength(2)

        // Check for "Effektiver Steuersatz" labels (appears twice)
        const effektiverSteuersatzLabels = screen.getAllByText(/Effektiver Steuersatz:/i)
        expect(effektiverSteuersatzLabels).toHaveLength(2)
      })
    })

    it('should display additional burden message', async () => {
      render(<KirchensteuerOptimizationCard {...defaultProps} />)

      const calculateButton = screen.getByRole('button', { name: /Kirchensteuer-Auswirkung berechnen/i })
      fireEvent.click(calculateButton)

      await waitFor(() => {
        expect(screen.getByText(/Mehrbelastung durch Kirchensteuer:/i)).toBeInTheDocument()
      })
    })

    it('should show Sperrvermerk simulation', async () => {
      render(<KirchensteuerOptimizationCard {...defaultProps} />)

      const calculateButton = screen.getByRole('button', { name: /Kirchensteuer-Auswirkung berechnen/i })
      fireEvent.click(calculateButton)

      await waitFor(() => {
        expect(screen.getByText(/Sperrvermerk-Simulation/i)).toBeInTheDocument()
        const automatischeAbfuehrungElements = screen.getAllByText(/Automatische Abführung/i)
        expect(automatischeAbfuehrungElements.length).toBeGreaterThan(0)
        expect(screen.getByText(/Mit Sperrvermerk/i)).toBeInTheDocument()
      })
    })

    it('should display Sperrvermerk hint', async () => {
      render(<KirchensteuerOptimizationCard {...defaultProps} />)

      const calculateButton = screen.getByRole('button', { name: /Kirchensteuer-Auswirkung berechnen/i })
      fireEvent.click(calculateButton)

      await waitFor(() => {
        expect(screen.getByText(/Ein Sperrvermerk verhindert die automatische Abführung/i)).toBeInTheDocument()
      })
    })

    it('should recalculate when inputs change and calculate is clicked again', async () => {
      render(<KirchensteuerOptimizationCard {...defaultProps} />)

      // First calculation
      const calculateButton = screen.getByRole('button', { name: /Kirchensteuer-Auswirkung berechnen/i })
      fireEvent.click(calculateButton)

      await waitFor(() => {
        expect(screen.getByText('⛪ Mit Kirchensteuer')).toBeInTheDocument()
      })

      // Change input
      const gainsInput = screen.getByLabelText(/Durchschnittliche jährliche Kapitalerträge/i)
      fireEvent.change(gainsInput, { target: { value: '15000' } })

      // Recalculate
      fireEvent.click(calculateButton)

      await waitFor(() => {
        expect(screen.getByText('⛪ Mit Kirchensteuer')).toBeInTheDocument()
      })
    })
  })

  describe('information section', () => {
    it('should display important information about church tax', () => {
      render(<KirchensteuerOptimizationCard {...defaultProps} />)

      expect(screen.getByText(/Wichtige Hinweise zur Kirchensteuer/i)).toBeInTheDocument()
      expect(screen.getByText(/Bundeslandabhängig/i)).toBeInTheDocument()
      expect(screen.getByText(/Berechnungsbasis/i)).toBeInTheDocument()
      // Teilfreistellung appears in multiple places (results + info section), so use getAllByText
      const teilfreistellungElements = screen.getAllByText(/Teilfreistellung/i)
      expect(teilfreistellungElements.length).toBeGreaterThan(0)
      // Sperrvermerk appears in multiple places, so use getAllByText
      const sperrvermarkElements = screen.getAllByText(/Sperrvermerk/i)
      expect(sperrvermarkElements.length).toBeGreaterThan(0)
      // Austritt appears in multiple places, so use getAllByText
      const austrittElements = screen.getAllByText(/Austritt/i)
      expect(austrittElements.length).toBeGreaterThan(0)
    })

    it('should display current Teilfreistellung percentage', () => {
      render(<KirchensteuerOptimizationCard {...defaultProps} teilfreistellungsquote={30} />)

      expect(screen.getByText(/derzeit 30%/i)).toBeInTheDocument()
    })

    it('should update Teilfreistellung display when prop changes', () => {
      const { rerender } = render(<KirchensteuerOptimizationCard {...defaultProps} teilfreistellungsquote={30} />)

      expect(screen.getByText(/derzeit 30%/i)).toBeInTheDocument()

      rerender(<KirchensteuerOptimizationCard {...defaultProps} teilfreistellungsquote={20} />)

      expect(screen.getByText(/derzeit 20%/i)).toBeInTheDocument()
    })
  })

  describe('input validation', () => {
    it('should accept valid yearly gains input', () => {
      render(<KirchensteuerOptimizationCard {...defaultProps} />)

      const gainsInput = screen.getByLabelText(/Durchschnittliche jährliche Kapitalerträge/i)
      fireEvent.change(gainsInput, { target: { value: '25000' } })

      expect(gainsInput).toHaveValue(25000)
    })

    it('should accept valid years input within range', () => {
      render(<KirchensteuerOptimizationCard {...defaultProps} />)

      const yearsInput = screen.getByLabelText(/Planungszeitraum/i)
      fireEvent.change(yearsInput, { target: { value: '35' } })

      expect(yearsInput).toHaveValue(35)
    })

    it('should have correct min/max attributes on years input', () => {
      render(<KirchensteuerOptimizationCard {...defaultProps} />)

      const yearsInput = screen.getByLabelText(/Planungszeitraum/i) as HTMLInputElement

      expect(yearsInput.min).toBe('1')
      expect(yearsInput.max).toBe('50')
    })

    it('should have correct min attribute on gains input', () => {
      render(<KirchensteuerOptimizationCard {...defaultProps} />)

      const gainsInput = screen.getByLabelText(/Durchschnittliche jährliche Kapitalerträge/i) as HTMLInputElement

      expect(gainsInput.min).toBe('0')
    })
  })

  describe('different church tax rates', () => {
    it('should work with 8% church tax rate (Bavaria, Baden-Württemberg)', async () => {
      render(<KirchensteuerOptimizationCard {...defaultProps} kirchensteuersatz={8} />)

      const calculateButton = screen.getByRole('button', { name: /Kirchensteuer-Auswirkung berechnen/i })
      fireEvent.click(calculateButton)

      await waitFor(() => {
        expect(screen.getByText('⛪ Mit Kirchensteuer')).toBeInTheDocument()
      })
    })

    it('should work with 9% church tax rate (other states)', async () => {
      render(<KirchensteuerOptimizationCard {...defaultProps} kirchensteuersatz={9} />)

      const calculateButton = screen.getByRole('button', { name: /Kirchensteuer-Auswirkung berechnen/i })
      fireEvent.click(calculateButton)

      await waitFor(() => {
        expect(screen.getByText('⛪ Mit Kirchensteuer')).toBeInTheDocument()
      })
    })
  })

  describe('accessibility', () => {
    it('should have proper labels for all inputs', () => {
      render(<KirchensteuerOptimizationCard {...defaultProps} />)

      expect(screen.getByLabelText(/Durchschnittliche jährliche Kapitalerträge/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Planungszeitraum/i)).toBeInTheDocument()
    })

    it('should have helpful descriptions for inputs', () => {
      render(<KirchensteuerOptimizationCard {...defaultProps} />)

      expect(screen.getByText(/Ihre erwarteten durchschnittlichen Kapitalerträge pro Jahr/i)).toBeInTheDocument()
      expect(screen.getByText(/Zeitraum für die Langfristplanung \(1-50 Jahre\)/i)).toBeInTheDocument()
    })
  })
})
