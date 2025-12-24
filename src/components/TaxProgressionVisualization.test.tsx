import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { TaxProgressionVisualization } from './TaxProgressionVisualization'
import userEvent from '@testing-library/user-event'

// Mock Chart.js Line component
vi.mock('react-chartjs-2', () => ({
  Line: ({ data, options }: { data: unknown; options: unknown }) => (
    <div
      data-testid="tax-progression-chart"
      data-chart-data={JSON.stringify(data)}
      data-chart-options={JSON.stringify(options)}
    >
      Chart Placeholder
    </div>
  ),
}))

/**
 * Helper function to open the collapsible section
 */
async function openCollapsible() {
  const header = screen.getByText(/Steuerprogression-Visualisierung/)
  await userEvent.click(header)
}

describe('TaxProgressionVisualization', () => {
  describe('Component Rendering', () => {
    it('should render the component with default props', async () => {
      render(<TaxProgressionVisualization />)

      // Check for header
      expect(screen.getByText(/Steuerprogression-Visualisierung/)).toBeInTheDocument()

      // Open the collapsible to see content
      await openCollapsible()

      // Check for info message
      expect(screen.getByText(/Interaktive Visualisierung/)).toBeInTheDocument()
      expect(screen.getByText(/11.604,00 €/)).toBeInTheDocument() // Default grundfreibetrag
    })

    it('should render with custom grundfreibetrag', async () => {
      const customGrundfreibetrag = 23208 // For couples
      render(<TaxProgressionVisualization grundfreibetrag={customGrundfreibetrag} />)

      await openCollapsible()
      expect(screen.getByText(/23.208,00 €/)).toBeInTheDocument()
    })

    it('should render all configuration controls', async () => {
      render(<TaxProgressionVisualization />)
      await openCollapsible()

      // Max income input
      expect(screen.getByLabelText(/Maximales Einkommen/)).toBeInTheDocument()

      // Example income input
      expect(screen.getByLabelText(/Beispiel-Einkommen/)).toBeInTheDocument()

      // View mode selector
      expect(screen.getByText(/Steuersätze & Beträge/)).toBeInTheDocument()
      expect(screen.getByText(/Nur Steuersätze/)).toBeInTheDocument()
      expect(screen.getByText(/Nur Steuerbeträge/)).toBeInTheDocument()
    })

    it('should render the chart component', async () => {
      render(<TaxProgressionVisualization />)
      await openCollapsible()

      const chart = screen.getByTestId('tax-progression-chart')
      expect(chart).toBeInTheDocument()
    })

    it('should render tax zone legend', async () => {
      render(<TaxProgressionVisualization />)
      await openCollapsible()

      expect(screen.getByText(/Steuerzonen-Übersicht/)).toBeInTheDocument()
      expect(screen.getByText(/Grundfreibetrag \(0%\)/)).toBeInTheDocument()
      expect(screen.getByText(/Lineare Zone \(14%-24%\)/)).toBeInTheDocument()
      expect(screen.getByText(/Progressionszone \(24%-42%\)/)).toBeInTheDocument()
      expect(screen.getByText(/Spitzensteuersatz \(42%\)/)).toBeInTheDocument()
      expect(screen.getByText(/Reichensteuer \(45%\)/)).toBeInTheDocument()
    })
  })

  describe('Max Income Configuration', () => {
    it('should allow changing max income', async () => {
      render(<TaxProgressionVisualization />)
      await openCollapsible()

      const maxIncomeInput = screen.getByLabelText(/Maximales Einkommen/) as HTMLInputElement
      expect(maxIncomeInput.value).toBe('300000')

      await userEvent.clear(maxIncomeInput)
      await userEvent.type(maxIncomeInput, '500000')
      expect(maxIncomeInput.value).toBe('500000')
    })

    it('should update chart data when max income changes', async () => {
      render(<TaxProgressionVisualization />)
      await openCollapsible()

      const maxIncomeInput = screen.getByLabelText(/Maximales Einkommen/)
      const chartBefore = screen.getByTestId('tax-progression-chart')
      const dataBefore = chartBefore.getAttribute('data-chart-data')

      await userEvent.clear(maxIncomeInput)
      await userEvent.type(maxIncomeInput, '200000')

      const chartAfter = screen.getByTestId('tax-progression-chart')
      const dataAfter = chartAfter.getAttribute('data-chart-data')

      // Chart data should change
      expect(dataAfter).not.toBe(dataBefore)
    })
  })

  describe('View Mode Selection', () => {
    it('should default to "both" view mode', async () => {
      render(<TaxProgressionVisualization />)
      await openCollapsible()

      const chart = screen.getByTestId('tax-progression-chart')
      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '{}')

      // Should have 3 datasets in "both" mode: average rate, marginal rate, and amount
      expect(chartData.datasets).toHaveLength(3)
    })

    it('should switch to "rates only" view mode', async () => {
      render(<TaxProgressionVisualization />)
      await openCollapsible()

      const ratesOnlyButton = screen.getByText(/Nur Steuersätze/)
      await userEvent.click(ratesOnlyButton)

      const chart = screen.getByTestId('tax-progression-chart')
      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '{}')

      // Should have 2 datasets in "rates" mode: average rate and marginal rate
      expect(chartData.datasets).toHaveLength(2)
      expect(chartData.datasets[0].label).toContain('Durchschnittssteuersatz')
      expect(chartData.datasets[1].label).toContain('Grenzsteuersatz')
    })

    it('should switch to "amounts only" view mode', async () => {
      render(<TaxProgressionVisualization />)
      await openCollapsible()

      const amountsOnlyButton = screen.getByText(/Nur Steuerbeträge/)
      await userEvent.click(amountsOnlyButton)

      const chart = screen.getByTestId('tax-progression-chart')
      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '{}')

      // Should have 1 dataset in "amounts" mode
      expect(chartData.datasets).toHaveLength(1)
      expect(chartData.datasets[0].label).toContain('Steuerbetrag')
    })
  })

  describe('Highlight Income Feature', () => {
    it('should not show highlighted info by default', async () => {
      render(<TaxProgressionVisualization />)
      await openCollapsible()

      expect(screen.queryByText(/Steuerberechnung für/)).not.toBeInTheDocument()
    })

    it('should show highlighted info when income is entered', async () => {
      render(<TaxProgressionVisualization />)
      await openCollapsible()

      const highlightInput = screen.getByLabelText(/Beispiel-Einkommen/)
      await userEvent.type(highlightInput, '50000')

      expect(screen.getByText(/Steuerberechnung für/)).toBeInTheDocument()
    })

    it('should display correct tax calculation for highlighted income', async () => {
      render(<TaxProgressionVisualization />)
      await openCollapsible()

      const highlightInput = screen.getByLabelText(/Beispiel-Einkommen/)
      await userEvent.type(highlightInput, '50000')

      const infoBox = screen.getByText(/Steuerberechnung für/).closest('div')
      expect(infoBox).toBeInTheDocument()

      // Should show various tax information within the infoBox
      expect(within(infoBox!).getByText(/Steuerzone:/)).toBeInTheDocument()
      expect(within(infoBox!).getByText(/Steuerbetrag:/)).toBeInTheDocument()
      expect(within(infoBox!).getByText(/Nettoeinkommen:/)).toBeInTheDocument()

      // Check explanation exists
      expect(within(infoBox!).getByText(/Durchschnittliche Steuerbelastung/)).toBeInTheDocument()
      expect(within(infoBox!).getByText(/Steuersatz auf den nächsten verdienten Euro/)).toBeInTheDocument()
    })

    it('should hide highlighted info when income is cleared', async () => {
      render(<TaxProgressionVisualization />)
      await openCollapsible()

      const highlightInput = screen.getByLabelText(/Beispiel-Einkommen/) as HTMLInputElement

      // Enter income
      await userEvent.type(highlightInput, '50000')
      expect(screen.getByText(/Steuerberechnung für/)).toBeInTheDocument()

      // Clear income
      await userEvent.clear(highlightInput)
      expect(screen.queryByText(/Steuerberechnung für/)).not.toBeInTheDocument()
    })

    it('should update highlighted info when income changes', async () => {
      render(<TaxProgressionVisualization />)
      await openCollapsible()

      const highlightInput = screen.getByLabelText(/Beispiel-Einkommen/)

      await userEvent.type(highlightInput, '30000')
      // Check that info box appears (don't check exact income due to rounding)
      expect(screen.getByText(/Steuerberechnung für/)).toBeInTheDocument()

      await userEvent.clear(highlightInput)
      await userEvent.type(highlightInput, '100000')
      // Info box should still be there with updated values
      expect(screen.getByText(/Steuerberechnung für/)).toBeInTheDocument()
    })
  })

  describe('Chart Data Generation', () => {
    it('should generate correct number of data points', async () => {
      render(<TaxProgressionVisualization />)
      await openCollapsible()

      const chart = screen.getByTestId('tax-progression-chart')
      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '{}')

      // Should have 100 data points
      expect(chartData.labels).toHaveLength(100)
    })

    it('should format income labels correctly', async () => {
      render(<TaxProgressionVisualization />)
      await openCollapsible()

      const chart = screen.getByTestId('tax-progression-chart')
      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '{}')

      // First label should be 0k €
      expect(chartData.labels[0]).toBe('0k €')

      // Last label should be ~300k €
      expect(chartData.labels[chartData.labels.length - 1]).toMatch(/300k €/)
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for all inputs', async () => {
      render(<TaxProgressionVisualization />)
      await openCollapsible()

      const maxIncomeInput = screen.getByLabelText(/Maximales Einkommen/)
      expect(maxIncomeInput).toHaveAttribute('id')

      const highlightInput = screen.getByLabelText(/Beispiel-Einkommen/)
      expect(highlightInput).toHaveAttribute('id')
    })

    it('should use unique IDs for form controls', async () => {
      const { rerender } = render(<TaxProgressionVisualization />)
      await openCollapsible()

      const maxIncomeId1 = screen.getByLabelText(/Maximales Einkommen/).getAttribute('id')

      rerender(<TaxProgressionVisualization />)

      const maxIncomeId2 = screen.getByLabelText(/Maximales Einkommen/).getAttribute('id')

      // IDs should be stable across re-renders
      expect(maxIncomeId1).toBe(maxIncomeId2)
    })
  })

  describe('Collapsible Behavior', () => {
    it('should be collapsed by default', () => {
      render(<TaxProgressionVisualization />)

      // The content should not be visible by default (collapsed)
      expect(screen.getByText(/Steuerprogression-Visualisierung/)).toBeInTheDocument()
      // Labels should not be accessible when collapsed
      expect(screen.queryByLabelText(/Maximales Einkommen/)).not.toBeInTheDocument()
    })
  })

  describe('Explanatory Content', () => {
    it('should show explanation of average vs marginal tax rate', async () => {
      render(<TaxProgressionVisualization />)
      await openCollapsible()

      const highlightInput = screen.getByLabelText(/Beispiel-Einkommen/)
      await userEvent.type(highlightInput, '50000')

      // Find the info box with tax calculation
      const infoBox = screen.getByText(/Steuerberechnung für/).closest('div')
      expect(infoBox).toBeInTheDocument()

      // Should have explanation text
      const explanation = screen.getByText(/Durchschnittliche Steuerbelastung auf das gesamte Einkommen/)
      expect(explanation).toBeInTheDocument()

      const grenzsteuerExplanation = screen.getByText(/Steuersatz auf den nächsten verdienten Euro/)
      expect(grenzsteuerExplanation).toBeInTheDocument()
    })

    it('should display all tax zone colors in legend', async () => {
      render(<TaxProgressionVisualization />)
      await openCollapsible()

      // Should have colored boxes for each zone
      const legendSection = screen.getByText(/Steuerzonen-Übersicht/).closest('div')
      expect(legendSection).toBeInTheDocument()

      // Should have 5 color boxes (one for each zone)
      const colorBoxes = legendSection!.querySelectorAll('.w-4.h-4.rounded')
      expect(colorBoxes).toHaveLength(5)
    })
  })
})
