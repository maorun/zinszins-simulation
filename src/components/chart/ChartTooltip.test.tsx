import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChartTooltip } from './ChartTooltip'

describe('ChartTooltip', () => {
  const mockPayload = [
    {
      name: 'Kumulierte Einzahlungen',
      value: 10000,
      color: '#3b82f6',
      payload: {
        year: 2025,
        startkapital: 10000,
        endkapital: 10500,
        zinsen: 500,
        kumulativeEinzahlungen: 10000,
        bezahlteSteuer: 50,
      },
    },
    {
      name: 'Zinsen/Gewinne',
      value: 500,
      color: '#10b981',
      payload: {
        year: 2025,
        startkapital: 10000,
        endkapital: 10500,
        zinsen: 500,
        kumulativeEinzahlungen: 10000,
        bezahlteSteuer: 50,
      },
    },
  ]

  it('renders tooltip when active with payload', () => {
    render(<ChartTooltip active={true} payload={mockPayload} label={2025} />)

    expect(screen.getByText('📅 Jahr: 2025')).toBeInTheDocument()
    expect(screen.getByText(/Kumulierte Einzahlungen/)).toBeInTheDocument()
    expect(screen.getByText(/Zinsen\/Gewinne/)).toBeInTheDocument()
  })

  it('displays formatted currency values', () => {
    render(<ChartTooltip active={true} payload={mockPayload} label={2025} />)

    expect(screen.getByText(/10\.000,00/)).toBeInTheDocument()
    expect(screen.getByText(/500,00/)).toBeInTheDocument()
  })

  it('calculates and displays total return percentage', () => {
    render(<ChartTooltip active={true} payload={mockPayload} label={2025} />)

    expect(screen.getByText('Gesamtrendite:')).toBeInTheDocument()
    expect(screen.getByText('+5.0%')).toBeInTheDocument()
  })

  it('returns null when not active', () => {
    const { container } = render(<ChartTooltip active={false} payload={mockPayload} label={2025} />)

    expect(container.firstChild).toBeNull()
  })

  it('returns null when no payload', () => {
    const { container } = render(<ChartTooltip active={true} payload={[]} label={2025} />)

    expect(container.firstChild).toBeNull()
  })

  it('handles negative returns correctly', () => {
    const negativePayload = [
      {
        name: 'Test',
        value: 9500,
        color: '#ef4444',
        payload: {
          year: 2025,
          startkapital: 10000,
          endkapital: 9500,
          zinsen: -500,
          kumulativeEinzahlungen: 10000,
          bezahlteSteuer: 0,
        },
      },
    ]

    render(<ChartTooltip active={true} payload={negativePayload} label={2025} />)

    expect(screen.getByText('-5.0%')).toBeInTheDocument()
  })
})
