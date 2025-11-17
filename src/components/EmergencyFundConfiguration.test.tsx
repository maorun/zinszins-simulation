import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SimulationProvider } from '../contexts/SimulationContext'
import EmergencyFundConfiguration from './EmergencyFundConfiguration'
import React from 'react'

// Mock the collapsible component to be always open for testing purposes.
vi.mock('./ui/collapsible-card', () => ({
  CollapsibleCard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CollapsibleCardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CollapsibleCardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('EmergencyFundConfiguration', () => {
  it('renders component with header', () => {
    render(
      <SimulationProvider>
        <EmergencyFundConfiguration />
      </SimulationProvider>,
    )

    expect(screen.getByText(/Liquiditätsreserve/)).toBeInTheDocument()
    expect(screen.getByText(/Planen Sie Ihre finanzielle Notfallreserve/)).toBeInTheDocument()
  })

  it('shows enable toggle', () => {
    render(
      <SimulationProvider>
        <EmergencyFundConfiguration />
      </SimulationProvider>,
    )

    const toggle = screen.getByRole('switch', { name: /Notfallfonds-Planung aktivieren/i })
    expect(toggle).toBeInTheDocument()
  })

  it('hides advanced options when toggle is disabled', () => {
    render(
      <SimulationProvider>
        <EmergencyFundConfiguration />
      </SimulationProvider>,
    )

    // Status display should not be visible when disabled by default
    expect(screen.queryByText(/Aktueller Status/i)).not.toBeInTheDocument()
  })
})
