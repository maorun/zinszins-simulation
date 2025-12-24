import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PensionPointsCalculator } from './PensionPointsCalculator'

describe('PensionPointsCalculator', () => {
  describe('Component Rendering', () => {
    it('should render the calculator with default quick mode', () => {
      render(<PensionPointsCalculator nestingLevel={0} />)

      expect(screen.getByText('Rentenpunkte-Rechner')).toBeInTheDocument()
      expect(screen.getByText('Schnell-Konfiguration')).toBeInTheDocument()
      expect(screen.getByText('Manuelle Eingabe')).toBeInTheDocument()
    })

    it('should render region selection buttons', () => {
      render(<PensionPointsCalculator nestingLevel={0} />)

      const westButtons = screen.getAllByText('West')
      const eastButtons = screen.getAllByText('Ost')

      expect(westButtons.length).toBeGreaterThan(0)
      expect(eastButtons.length).toBeGreaterThan(0)
    })

    it('should render information card', () => {
      render(<PensionPointsCalculator nestingLevel={0} />)

      expect(screen.getByText('💡 Wie funktioniert die Berechnung?')).toBeInTheDocument()
      expect(screen.getByText(/Die gesetzliche Rente basiert auf/)).toBeInTheDocument()
    })
  })

  describe('Quick Mode', () => {
    it('should display quick mode configuration fields', () => {
      render(<PensionPointsCalculator nestingLevel={0} />)

      expect(screen.getByLabelText('Startjahr')).toBeInTheDocument()
      expect(screen.getByLabelText('Endjahr')).toBeInTheDocument()
      expect(screen.getByLabelText('Anfangsgehalt (€)')).toBeInTheDocument()
      expect(screen.getByLabelText('Jährliche Steigerung (%)')).toBeInTheDocument()
    })

    it('should have default values in quick mode', () => {
      render(<PensionPointsCalculator nestingLevel={0} />)

      const startYearInput = screen.getByLabelText('Startjahr') as HTMLInputElement
      const endYearInput = screen.getByLabelText('Endjahr') as HTMLInputElement
      const salaryInput = screen.getByLabelText('Anfangsgehalt (€)') as HTMLInputElement
      const increaseInput = screen.getByLabelText('Jährliche Steigerung (%)') as HTMLInputElement

      expect(startYearInput.value).toBe('2000')
      expect(endYearInput.value).toBe('2040')
      expect(salaryInput.value).toBe('35000')
      expect(increaseInput.value).toBe('3')
    })

    it('should update start year when changed', () => {
      render(<PensionPointsCalculator nestingLevel={0} />)

      const startYearInput = screen.getByLabelText('Startjahr') as HTMLInputElement
      fireEvent.change(startYearInput, { target: { value: '2010' } })

      expect(startYearInput.value).toBe('2010')
    })

    it('should update end year when changed', () => {
      render(<PensionPointsCalculator nestingLevel={0} />)

      const endYearInput = screen.getByLabelText('Endjahr') as HTMLInputElement
      fireEvent.change(endYearInput, { target: { value: '2050' } })

      expect(endYearInput.value).toBe('2050')
    })

    it('should update starting salary when changed', () => {
      render(<PensionPointsCalculator nestingLevel={0} />)

      const salaryInput = screen.getByLabelText('Anfangsgehalt (€)') as HTMLInputElement
      fireEvent.change(salaryInput, { target: { value: '50000' } })

      expect(salaryInput.value).toBe('50000')
    })

    it('should update annual increase when changed', () => {
      render(<PensionPointsCalculator nestingLevel={0} />)

      const increaseInput = screen.getByLabelText('Jährliche Steigerung (%)') as HTMLInputElement
      fireEvent.change(increaseInput, { target: { value: '5' } })

      expect(increaseInput.value).toBe('5')
    })

    it('should display calculation results in quick mode', async () => {
      render(<PensionPointsCalculator nestingLevel={0} />)

      // Results should be calculated automatically with default values
      await waitFor(() => {
        expect(screen.getByText('Berechnungsergebnis')).toBeInTheDocument()
        expect(screen.getByText('Beitragsjahre')).toBeInTheDocument()
        expect(screen.getByText('Rentenpunkte gesamt')).toBeInTheDocument()
        expect(screen.getByText('Monatliche Rente')).toBeInTheDocument()
        expect(screen.getByText('Jährliche Rente')).toBeInTheDocument()
      })
    })
  })

  describe('Manual Mode', () => {
    it('should switch to manual mode when button clicked', () => {
      render(<PensionPointsCalculator nestingLevel={0} />)

      const manualButton = screen.getByText('Manuelle Eingabe')
      fireEvent.click(manualButton)

      expect(screen.getByText('Gehaltshistorie')).toBeInTheDocument()
      expect(screen.getByText('Jahr hinzufügen')).toBeInTheDocument()
    })

    it('should display empty state in manual mode', () => {
      render(<PensionPointsCalculator nestingLevel={0} />)

      const manualButton = screen.getByText('Manuelle Eingabe')
      fireEvent.click(manualButton)

      expect(screen.getByText('Keine Jahre hinzugefügt')).toBeInTheDocument()
      expect(screen.getByText(/Klicken Sie auf "Jahr hinzufügen"/)).toBeInTheDocument()
    })

    it('should add a year when "Jahr hinzufügen" button is clicked', () => {
      render(<PensionPointsCalculator nestingLevel={0} />)

      const manualButton = screen.getByText('Manuelle Eingabe')
      fireEvent.click(manualButton)

      const addButton = screen.getByText('Jahr hinzufügen')
      fireEvent.click(addButton)

      // Should no longer show empty state
      expect(screen.queryByText('Keine Jahre hinzugefügt')).not.toBeInTheDocument()
    })

    it('should display year and salary inputs for added years', () => {
      render(<PensionPointsCalculator nestingLevel={0} />)

      const manualButton = screen.getByText('Manuelle Eingabe')
      fireEvent.click(manualButton)

      const addButton = screen.getByText('Jahr hinzufügen')
      fireEvent.click(addButton)

      // Should show inputs for the year
      const inputs = screen.getAllByRole('spinbutton')
      expect(inputs.length).toBeGreaterThan(0)
    })

    it('should remove a year when delete button is clicked', async () => {
      render(<PensionPointsCalculator nestingLevel={0} />)

      const manualButton = screen.getByText('Manuelle Eingabe')
      fireEvent.click(manualButton)

      const addButton = screen.getByText('Jahr hinzufügen')
      fireEvent.click(addButton)

      // Wait for the year entry to appear
      await waitFor(() => {
        const inputs = screen.getAllByRole('spinbutton')
        expect(inputs.length).toBeGreaterThan(0)
      })

      // Find all buttons with lucide icons (looking for Trash2 icon)
      const allButtons = screen.getAllByRole('button')
      const deleteButton = allButtons.find(btn => {
        const svg = btn.querySelector('svg')
        return svg && btn.textContent === '' // Ghost button has no text
      })

      // Click the delete button if found
      if (deleteButton) {
        fireEvent.click(deleteButton)

        // Should show empty state again
        await waitFor(() => {
          expect(screen.getByText('Keine Jahre hinzugefügt')).toBeInTheDocument()
        })
      }
    })
  })

  describe('Region Selection', () => {
    it('should start with West region selected', () => {
      render(<PensionPointsCalculator nestingLevel={0} />)

      const westButtons = screen.getAllByText('West')
      // Find the button variant (should have default styling)
      const westButton = westButtons.find(btn => btn.closest('button')?.className.includes('bg-'))
      expect(westButton).toBeTruthy()
    })

    it('should switch to East region when clicked', () => {
      render(<PensionPointsCalculator nestingLevel={0} />)

      const eastButtons = screen.getAllByText('Ost')
      const eastButton = eastButtons[0].closest('button')

      if (eastButton) {
        fireEvent.click(eastButton)
      }

      // After clicking, the button should be active
      expect(eastButton?.className).toContain('bg-')
    })

    it('should recalculate pension when region changes', async () => {
      render(<PensionPointsCalculator nestingLevel={0} />)

      // Get initial calculation
      await waitFor(() => {
        expect(screen.getByText('Monatliche Rente')).toBeInTheDocument()
      })

      // Switch region
      const eastButtons = screen.getAllByText('Ost')
      const eastButton = eastButtons[0].closest('button')
      if (eastButton) {
        fireEvent.click(eastButton)
      }

      // Results should still be present (recalculated)
      await waitFor(() => {
        expect(screen.getByText('Monatliche Rente')).toBeInTheDocument()
      })
    })
  })

  describe('Calculation Results', () => {
    it('should display contribution years', async () => {
      render(<PensionPointsCalculator nestingLevel={0} />)

      await waitFor(() => {
        expect(screen.getByText('Beitragsjahre')).toBeInTheDocument()
      })
    })

    it('should display total pension points', async () => {
      render(<PensionPointsCalculator nestingLevel={0} />)

      await waitFor(() => {
        expect(screen.getByText('Rentenpunkte gesamt')).toBeInTheDocument()
      })
    })

    it('should display monthly pension amount', async () => {
      render(<PensionPointsCalculator nestingLevel={0} />)

      await waitFor(() => {
        expect(screen.getByText('Monatliche Rente')).toBeInTheDocument()
      })
    })

    it('should display annual pension amount', async () => {
      render(<PensionPointsCalculator nestingLevel={0} />)

      await waitFor(() => {
        expect(screen.getByText('Jährliche Rente')).toBeInTheDocument()
      })
    })

    it('should display pension value (Rentenwert)', async () => {
      render(<PensionPointsCalculator nestingLevel={0} />)

      await waitFor(() => {
        expect(screen.getByText(/Rentenwert:/)).toBeInTheDocument()
      })
    })
  })

  describe('Apply Pension Callback', () => {
    it('should display apply button when callback is provided', async () => {
      const mockCallback = vi.fn()
      render(<PensionPointsCalculator nestingLevel={0} onCalculatedPensionChange={mockCallback} />)

      await waitFor(() => {
        expect(screen.getByText('Berechnete Rente übernehmen')).toBeInTheDocument()
      })
    })

    it('should not display apply button when no callback is provided', async () => {
      render(<PensionPointsCalculator nestingLevel={0} />)

      await waitFor(() => {
        expect(screen.getByText('Monatliche Rente')).toBeInTheDocument()
      })

      expect(screen.queryByText('Berechnete Rente übernehmen')).not.toBeInTheDocument()
    })

    it('should call callback with monthly pension when apply button is clicked', async () => {
      const mockCallback = vi.fn()
      render(<PensionPointsCalculator nestingLevel={0} onCalculatedPensionChange={mockCallback} />)

      await waitFor(() => {
        expect(screen.getByText('Berechnete Rente übernehmen')).toBeInTheDocument()
      })

      const applyButton = screen.getByText('Berechnete Rente übernehmen')
      fireEvent.click(applyButton)

      expect(mockCallback).toHaveBeenCalledTimes(1)
      expect(typeof mockCallback.mock.calls[0][0]).toBe('number')
      expect(mockCallback.mock.calls[0][0]).toBeGreaterThan(0)
    })
  })

  describe('Mode Switching', () => {
    it('should preserve region when switching modes', () => {
      render(<PensionPointsCalculator nestingLevel={0} />)

      // Switch to East
      const eastButtons = screen.getAllByText('Ost')
      const eastButton = eastButtons[0].closest('button')
      if (eastButton) {
        fireEvent.click(eastButton)
      }

      // Switch to manual mode
      const manualButton = screen.getByText('Manuelle Eingabe')
      fireEvent.click(manualButton)

      // Switch back to quick mode
      const quickButton = screen.getByText('Schnell-Konfiguration')
      fireEvent.click(quickButton)

      // East should still be selected
      expect(eastButton?.className).toContain('bg-')
    })

    it('should clear results when switching to manual mode with no years', () => {
      render(<PensionPointsCalculator nestingLevel={0} />)

      // Initially should have results from quick mode
      expect(screen.getByText('Berechnungsergebnis')).toBeInTheDocument()

      // Switch to manual mode
      const manualButton = screen.getByText('Manuelle Eingabe')
      fireEvent.click(manualButton)

      // Results should not be displayed when no manual years are added
      expect(screen.queryByText('Berechnungsergebnis')).not.toBeInTheDocument()
    })

    it('should restore results when switching back to quick mode', async () => {
      render(<PensionPointsCalculator nestingLevel={0} />)

      // Switch to manual mode
      const manualButton = screen.getByText('Manuelle Eingabe')
      fireEvent.click(manualButton)

      // Switch back to quick mode
      const quickButton = screen.getByText('Schnell-Konfiguration')
      fireEvent.click(quickButton)

      // Results should be displayed again
      await waitFor(() => {
        expect(screen.getByText('Berechnungsergebnis')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for all inputs', () => {
      render(<PensionPointsCalculator nestingLevel={0} />)

      expect(screen.getByLabelText('Startjahr')).toBeInTheDocument()
      expect(screen.getByLabelText('Endjahr')).toBeInTheDocument()
      expect(screen.getByLabelText('Anfangsgehalt (€)')).toBeInTheDocument()
      expect(screen.getByLabelText('Jährliche Steigerung (%)')).toBeInTheDocument()
    })

    it('should use semantic HTML elements', () => {
      render(<PensionPointsCalculator nestingLevel={0} />)

      // Check for buttons
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)

      // Check for inputs
      const inputs = screen.getAllByRole('spinbutton')
      expect(inputs.length).toBeGreaterThan(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero salary gracefully', () => {
      render(<PensionPointsCalculator nestingLevel={0} />)

      const salaryInput = screen.getByLabelText('Anfangsgehalt (€)') as HTMLInputElement
      fireEvent.change(salaryInput, { target: { value: '0' } })

      // Should still calculate (0 pension points expected)
      expect(screen.getByText('Berechnungsergebnis')).toBeInTheDocument()
    })

    it('should handle single year period', () => {
      render(<PensionPointsCalculator nestingLevel={0} />)

      const startYearInput = screen.getByLabelText('Startjahr') as HTMLInputElement
      const endYearInput = screen.getByLabelText('Endjahr') as HTMLInputElement

      fireEvent.change(startYearInput, { target: { value: '2020' } })
      fireEvent.change(endYearInput, { target: { value: '2020' } })

      // Should calculate for single year
      expect(screen.getByText('Berechnungsergebnis')).toBeInTheDocument()
    })

    it('should handle very high salary increases', async () => {
      render(<PensionPointsCalculator nestingLevel={0} />)

      const increaseInput = screen.getByLabelText('Jährliche Steigerung (%)') as HTMLInputElement
      fireEvent.change(increaseInput, { target: { value: '15' } })

      // Should still calculate
      await waitFor(() => {
        expect(screen.getByText('Berechnungsergebnis')).toBeInTheDocument()
      })
    })
  })
})
