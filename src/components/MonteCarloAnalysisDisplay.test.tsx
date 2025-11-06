import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import MonteCarloAnalysisDisplay from './MonteCarloAnalysisDisplay'
import type { RandomReturnConfig } from '../utils/random-returns'

describe('MonteCarloAnalysisDisplay', () => {
  const mockConfig: RandomReturnConfig = {
    averageReturn: 0.07,
    standardDeviation: 0.15,
    seed: 123,
  }

  it('renders the Monte Carlo analysis with provided configuration', () => {
    render(<MonteCarloAnalysisDisplay config={mockConfig} title="Monte Carlo Analyse" phaseTitle="Testphase" />)

    expect(screen.getByText('📊 Monte Carlo Analyse - Testphase')).toBeInTheDocument()
    expect(screen.getByText(/Durchschnittliche Rendite 7.0%, Volatilität 15.0%/)).toBeInTheDocument()
    expect(screen.getAllByText(/Worst Case \(5% Perzentil\)/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Best Case \(95% Perzentil\)/).length).toBeGreaterThan(0)
    expect(screen.getByText(/Zufallsseed:/)).toBeInTheDocument()
    expect(screen.getByText(/123.*deterministische Ergebnisse/)).toBeInTheDocument()
  })

  it('renders without seed when not provided', () => {
    const configWithoutSeed = {
      averageReturn: 0.05,
      standardDeviation: 0.12,
    }

    render(<MonteCarloAnalysisDisplay config={configWithoutSeed} title="Test Analysis" phaseTitle="No Seed Phase" />)

    expect(screen.getByText('📊 Test Analysis - No Seed Phase')).toBeInTheDocument()
    expect(screen.getByText(/Durchschnittliche Rendite 5.0%, Volatilität 12.0%/)).toBeInTheDocument()
    expect(screen.queryByText(/Zufallsseed:/)).not.toBeInTheDocument()
  })

  it('renders all scenario types', () => {
    render(<MonteCarloAnalysisDisplay config={mockConfig} title="Monte Carlo Analyse" phaseTitle="Testphase" />)

    expect(screen.getAllByText(/Worst Case \(5% Perzentil\)/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Pessimistisches Szenario \(25% Perzentil\)/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Median-Szenario \(50% Perzentil\)/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Optimistisches Szenario \(75% Perzentil\)/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Best Case \(95% Perzentil\)/).length).toBeGreaterThan(0)
  })

  it('renders the disclaimer text', () => {
    render(<MonteCarloAnalysisDisplay config={mockConfig} title="Monte Carlo Analyse" phaseTitle="Testphase" />)

    expect(screen.getByText('💡 Hinweis zu Monte Carlo Simulationen:')).toBeInTheDocument()
    expect(screen.getByText(/Diese Szenarien basieren auf statistischen Modellen/)).toBeInTheDocument()
  })
})
