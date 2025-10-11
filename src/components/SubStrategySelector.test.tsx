import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SubStrategySelector } from './SubStrategySelector'

describe('SubStrategySelector', () => {
  it('renders all strategy options', () => {
    render(<SubStrategySelector value="4prozent" onChange={vi.fn()} />)

    expect(screen.getByText('4% Regel')).toBeInTheDocument()
    expect(screen.getByText('3% Regel')).toBeInTheDocument()
    expect(screen.getByText('Variable Prozent')).toBeInTheDocument()
    expect(screen.getByText('Monatlich fest')).toBeInTheDocument()
    expect(screen.getByText('Dynamische Strategie')).toBeInTheDocument()
  })

  it('displays helper text', () => {
    render(<SubStrategySelector value="4prozent" onChange={vi.fn()} />)

    expect(
      screen.getByText(/Wählen Sie die Entnahme-Strategie/),
    ).toBeInTheDocument()
  })

  it('displays strategy descriptions', () => {
    render(<SubStrategySelector value="4prozent" onChange={vi.fn()} />)

    expect(screen.getByText(/Jährliche Entnahme von 4% des Startkapitals/)).toBeInTheDocument()
    expect(screen.getByText(/Jährliche Entnahme von 3% des Startkapitals/)).toBeInTheDocument()
    expect(screen.getByText(/Benutzerdefinierter Entnahme-Prozentsatz/)).toBeInTheDocument()
    expect(screen.getByText(/Fester monatlicher Betrag/)).toBeInTheDocument()
    expect(screen.getByText(/Renditebasierte Anpassung/)).toBeInTheDocument()
  })
})
