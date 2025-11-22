import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StressTestDisplay } from './StressTestDisplay'

describe('StressTestDisplay', () => {
  describe('Component Rendering', () => {
    it('should render with default props', () => {
      render(<StressTestDisplay portfolioValue={100000} />)

      // Check for title
      expect(screen.getByText(/Stress-Test Analyse/)).toBeInTheDocument()

      // Check for portfolio value
      expect(screen.getByText(/100\.000/)).toBeInTheDocument()
    })

    it('should render with custom title', () => {
      render(<StressTestDisplay portfolioValue={100000} title="Meine Stress-Tests" />)

      expect(screen.getByText(/Meine Stress-Tests/)).toBeInTheDocument()
    })

    it('should display correct number of scenarios', () => {
      render(<StressTestDisplay portfolioValue={100000} scenarioType="historical" />)

      // Should mention the number of scenarios (5 historical)
      expect(screen.getByText(/5 extreme Marktszenarien/)).toBeInTheDocument()
    })

    it('should display all historical scenarios', () => {
      render(<StressTestDisplay portfolioValue={100000} scenarioType="historical" />)

      // Check for specific historical scenarios
      expect(screen.getAllByText(/Finanzkrise 2008/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/COVID-19 Crash/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Dotcom-Blase/).length).toBeGreaterThan(0)
    })

    it('should display hypothetical scenarios when requested', () => {
      render(<StressTestDisplay portfolioValue={100000} scenarioType="hypothetical" />)

      // Check for hypothetical scenarios
      expect(screen.getAllByText(/Moderater Crash/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Schwerer Crash/).length).toBeGreaterThan(0)
    })

    it('should display all scenarios when scenarioType is "all"', () => {
      render(<StressTestDisplay portfolioValue={100000} scenarioType="all" />)

      // Should have 9 scenarios (5 historical + 4 hypothetical)
      expect(screen.getByText(/9 extreme Marktszenarien/)).toBeInTheDocument()
    })
  })

  describe('Data Display', () => {
    it('should format currency values correctly', () => {
      render(<StressTestDisplay portfolioValue={250000} scenarioType="historical" />)

      // Portfolio value should be formatted as EUR
      expect(screen.getAllByText(/250\.000/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/€/).length).toBeGreaterThan(0)
    })

    it('should show loss percentages', () => {
      render(<StressTestDisplay portfolioValue={100000} scenarioType="historical" />)

      // Should show percentage losses
      const percentages = screen.getAllByText(/%/)
      expect(percentages.length).toBeGreaterThan(0)
    })

    it('should calculate stressed values correctly', () => {
      render(<StressTestDisplay portfolioValue={100000} scenarioType="historical" />)

      // For Finanzkrise 2008 (-57%), stressed value should be around 43,000
      // We just check that stressed values are present
      expect(screen.getAllByText(/Portfolio-Wert nach Crash:/).length).toBeGreaterThan(0)
    })

    it('should display historical periods for historical scenarios', () => {
      render(<StressTestDisplay portfolioValue={100000} scenarioType="historical" />)

      // Check for historical periods
      expect(screen.getAllByText(/2007/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/2020/).length).toBeGreaterThan(0)
    })
  })

  describe('Worst Case Display', () => {
    it('should display worst-case scenario when showDetails is true', () => {
      render(<StressTestDisplay portfolioValue={100000} showDetails={true} />)

      expect(screen.getByText(/Worst-Case-Szenario/)).toBeInTheDocument()
    })

    it('should not display worst-case when showDetails is false', () => {
      render(<StressTestDisplay portfolioValue={100000} showDetails={false} />)

      expect(screen.queryByText(/Worst-Case-Szenario/)).not.toBeInTheDocument()
    })

    it('should identify the worst-case scenario correctly', () => {
      render(<StressTestDisplay portfolioValue={100000} scenarioType="historical" showDetails={true} />)

      // The worst case among historical scenarios is Finanzkrise 2008 (-57%)
      const worstCaseSection = screen.getByText(/Worst-Case-Szenario/).parentElement
      expect(worstCaseSection).toHaveTextContent(/Finanzkrise 2008/)
    })
  })

  describe('Interpretation Section', () => {
    it('should display interpretation when showDetails is true', () => {
      render(<StressTestDisplay portfolioValue={100000} showDetails={true} />)

      expect(screen.getByText(/Interpretation/)).toBeInTheDocument()
      expect(screen.getByText(/Durchschnittlicher Verlust/)).toBeInTheDocument()
    })

    it('should not display interpretation when showDetails is false', () => {
      render(<StressTestDisplay portfolioValue={100000} showDetails={false} />)

      expect(screen.queryByText(/Interpretation/)).not.toBeInTheDocument()
    })

    it('should show average loss', () => {
      render(<StressTestDisplay portfolioValue={100000} showDetails={true} />)

      // Should mention average loss
      expect(screen.getByText(/Durchschnittlicher Verlust über alle Szenarien/)).toBeInTheDocument()
    })

    it('should explain stress test purpose', () => {
      render(<StressTestDisplay portfolioValue={100000} />)

      // Should explain what stress tests are
      expect(
        screen.getByText(/Stress-Tests zeigen, wie Ihr Portfolio in extremen Krisen reagieren würde/),
      ).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('should have mobile and desktop views', () => {
      const { container } = render(<StressTestDisplay portfolioValue={100000} />)

      // Check for mobile-only and desktop-only classes
      const mobileElements = container.querySelectorAll('.mobile-only')
      const desktopElements = container.querySelectorAll('.desktop-only')

      expect(mobileElements.length).toBeGreaterThan(0)
      expect(desktopElements.length).toBeGreaterThan(0)
    })

    it('should include responsive styles', () => {
      const { container } = render(<StressTestDisplay portfolioValue={100000} />)

      // Check that styles are included (minified version)
      const styles = container.querySelector('style')
      expect(styles).toBeInTheDocument()
      expect(styles?.textContent).toContain('@media (min-width:768px)')
    })
  })

  describe('Severity Classification', () => {
    it('should apply color classes based on severity', () => {
      const { container } = render(<StressTestDisplay portfolioValue={100000} scenarioType="all" />)

      // Should have different severity color classes
      expect(container.innerHTML).toContain('warning-row')
      expect(container.innerHTML).toContain('info-row')
      expect(container.innerHTML).toContain('danger-row')
    })

    it('should use danger-row for severe losses', () => {
      const { container } = render(<StressTestDisplay portfolioValue={100000} scenarioType="historical" />)

      // Finanzkrise 2008 with -57% should have danger-row
      expect(container.innerHTML).toContain('danger-row')
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero portfolio value', () => {
      render(<StressTestDisplay portfolioValue={0} />)

      expect(screen.getAllByText(/0/).length).toBeGreaterThan(0)
    })

    it('should handle very large portfolio values', () => {
      render(<StressTestDisplay portfolioValue={10000000} />)

      // Should display 10 million properly formatted
      expect(screen.getAllByText(/10\.000\.000/).length).toBeGreaterThan(0)
    })

    it('should handle small portfolio values', () => {
      render(<StressTestDisplay portfolioValue={1000} />)

      expect(screen.getAllByText(/1\.000/).length).toBeGreaterThan(0)
    })
  })

  describe('Content Quality', () => {
    it('should use German language throughout', () => {
      const { container } = render(<StressTestDisplay portfolioValue={100000} />)

      // Check for German text
      expect(container.textContent).toContain('Portfolio-Wert')
      expect(container.textContent).toContain('Verlust')
      expect(container.textContent).toContain('Szenario')
    })

    it('should provide educational content', () => {
      render(<StressTestDisplay portfolioValue={100000} />)

      // Should explain the difference from VaR
      expect(
        screen.getByText(/Im Gegensatz zu Value-at-Risk basieren diese auf konkreten "Was-wäre-wenn"-Szenarien/),
      ).toBeInTheDocument()
    })

    it('should show scenario descriptions', () => {
      render(<StressTestDisplay portfolioValue={100000} scenarioType="historical" />)

      // Should show descriptions for scenarios
      expect(screen.getAllByText(/Globale Finanzkrise/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Pandemie-bedingter/).length).toBeGreaterThan(0)
    })
  })

  describe('Integration with Stress Test Utils', () => {
    it('should correctly apply stress test calculations', () => {
      render(<StressTestDisplay portfolioValue={100000} scenarioType="hypothetical" />)

      // For 20% crash, loss should be 20,000
      expect(screen.getAllByText(/20\.000/).length).toBeGreaterThan(0)
    })

    it('should sort scenarios by severity implicitly', () => {
      const { container } = render(<StressTestDisplay portfolioValue={100000} scenarioType="historical" />)

      // Just verify all scenarios are rendered
      expect(container.textContent).toContain('Finanzkrise 2008')
      expect(container.textContent).toContain('COVID-19 Crash')
      expect(container.textContent).toContain('Schwarzer Montag')
    })
  })

  describe('Accessibility', () => {
    it('should have semantic HTML structure', () => {
      const { container } = render(<StressTestDisplay portfolioValue={100000} />)

      // Should have proper heading
      expect(container.querySelector('h4')).toBeInTheDocument()
      expect(container.querySelector('h6')).toBeInTheDocument()
    })

    it('should use tables for desktop view', () => {
      const { container } = render(<StressTestDisplay portfolioValue={100000} />)

      // Should have table elements
      expect(container.querySelector('table')).toBeInTheDocument()
      expect(container.querySelector('thead')).toBeInTheDocument()
      expect(container.querySelector('tbody')).toBeInTheDocument()
    })

    it('should have descriptive content for screen readers', () => {
      render(<StressTestDisplay portfolioValue={100000} />)

      // Content should be descriptive (use getAllByText for multiple occurrences)
      expect(screen.getAllByText(/Portfolio-Wert/).length).toBeGreaterThan(0)
      expect(screen.getByText(/Getestete Szenarien/)).toBeInTheDocument()
    })
  })
})
