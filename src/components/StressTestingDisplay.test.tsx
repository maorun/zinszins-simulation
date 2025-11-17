/**
 * Tests for StressTestingDisplay component
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import StressTestingDisplay from './StressTestingDisplay'
import { getStressTestScenarios, calculateStressTestResult, calculateStressTestSummary } from '../utils/stress-testing'

describe('StressTestingDisplay', () => {
  const baseConfig = {
    baselineCapital: 100000,
    annualContribution: 10000,
    normalReturn: 0.07,
    testDurationYears: 10,
  }

  const scenarios = getStressTestScenarios()
  const results = scenarios.map(scenario => calculateStressTestResult(scenario, baseConfig))
  const summary = calculateStressTestSummary(results)

  it('should render stress testing section collapsed by default', () => {
    render(<StressTestingDisplay results={results} summary={summary} />)

    expect(screen.getByText(/Stress-Testing - Portfolio-Resilienz/)).toBeInTheDocument()

    // Content should not be visible initially
    expect(screen.queryByText(/Zusammenfassung Stress-Tests/)).not.toBeInTheDocument()
  })

  it('should expand stress testing section when clicked', async () => {
    const user = userEvent.setup()
    render(<StressTestingDisplay results={results} summary={summary} />)

    const header = screen.getByText(/Stress-Testing - Portfolio-Resilienz/)
    await user.click(header)

    expect(screen.getByText(/Zusammenfassung Stress-Tests/)).toBeInTheDocument()
  })

  it('should display summary statistics', async () => {
    const user = userEvent.setup()
    render(<StressTestingDisplay results={results} summary={summary} />)

    const header = screen.getByText(/Stress-Testing - Portfolio-Resilienz/)
    await user.click(header)

    expect(screen.getByText(/Getestete Szenarien:/)).toBeInTheDocument()
    expect(screen.getByText(summary.totalScenariosTestedCount.toString())).toBeInTheDocument()
    expect(screen.getByText(/Schlimmstes Szenario:/)).toBeInTheDocument()
    expect(screen.getByText(/Durchschnittlicher Verlust:/)).toBeInTheDocument()
    expect(screen.getByText(/Durchschnittliche Erholungszeit:/)).toBeInTheDocument()
  })

  it('should display all stress test results in table', async () => {
    const user = userEvent.setup()
    render(<StressTestingDisplay results={results} summary={summary} />)

    const header = screen.getByText(/Stress-Testing - Portfolio-Resilienz/)
    await user.click(header)

    // Check table headers
    expect(screen.getByText('Krisenszenario')).toBeInTheDocument()
    expect(screen.getByText('Beschreibung')).toBeInTheDocument()
    expect(screen.getByText('Erholungszeit')).toBeInTheDocument()
    expect(screen.getByText('Endkapital')).toBeInTheDocument()

    // Check that all scenarios are displayed
    results.forEach(result => {
      const elements = screen.getAllByText(result.scenario.name)
      expect(elements.length).toBeGreaterThan(0)
    })
  })

  it('should display worst case scenario in summary', async () => {
    const user = userEvent.setup()
    render(<StressTestingDisplay results={results} summary={summary} />)

    const header = screen.getByText(/Stress-Testing - Portfolio-Resilienz/)
    await user.click(header)

    const worstCaseName = summary.worstCaseScenario.scenario.name
    const worstCaseElements = screen.getAllByText(worstCaseName)

    // Should appear at least once in the table
    expect(worstCaseElements.length).toBeGreaterThanOrEqual(1)
  })

  it('should display info box with explanation', async () => {
    const user = userEvent.setup()
    render(<StressTestingDisplay results={results} summary={summary} />)

    const header = screen.getByText(/Stress-Testing - Portfolio-Resilienz/)
    await user.click(header)

    expect(screen.getByText(/Was sind Stress-Tests?/)).toBeInTheDocument()
    expect(screen.getByText(/Stress-Tests simulieren/i)).toBeInTheDocument()
  })

  it('should format currency values correctly', async () => {
    const user = userEvent.setup()
    render(<StressTestingDisplay results={results} summary={summary} />)

    const header = screen.getByText(/Stress-Testing - Portfolio-Resilienz/)
    await user.click(header)

    // Currency should be formatted with EUR symbol
    const currencyElements = screen.getAllByText(/€/)
    expect(currencyElements.length).toBeGreaterThan(0)
  })

  it('should display recovery years for each scenario', async () => {
    const user = userEvent.setup()
    render(<StressTestingDisplay results={results} summary={summary} />)

    const header = screen.getByText(/Stress-Testing - Portfolio-Resilienz/)
    await user.click(header)

    results.forEach(result => {
      const recoveryText = `${result.recoveryYearsNeeded} Jahre`
      expect(screen.getByText(recoveryText)).toBeInTheDocument()
    })
  })

  it('should show percentage loss for each scenario', async () => {
    const user = userEvent.setup()
    render(<StressTestingDisplay results={results} summary={summary} />)

    const header = screen.getByText(/Stress-Testing - Portfolio-Resilienz/)
    await user.click(header)

    // Check that percentage values are displayed (text may be in nested elements)
    results.forEach(result => {
      const percentageValue = result.percentageLoss.toFixed(1)
      // Use getAllByText as the value might appear in multiple places
      const elements = screen.getAllByText(new RegExp(percentageValue))
      expect(elements.length).toBeGreaterThan(0)
    })
  })

  it('should handle empty results gracefully', () => {
    const emptyResults: typeof results = []
    const mockSummary = {
      ...summary,
      totalScenariosTestedCount: 0,
    }

    render(<StressTestingDisplay results={emptyResults} summary={mockSummary} />)

    expect(screen.getByText(/Stress-Testing - Portfolio-Resilienz/)).toBeInTheDocument()
  })
})
