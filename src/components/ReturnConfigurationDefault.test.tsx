/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ReturnConfiguration from './ReturnConfiguration'
import { SimulationProvider } from '../contexts/SimulationContext'

describe('ReturnConfiguration', () => {
  it('renders the random return configuration by default', async () => {
    render(
      <SimulationProvider>
        <ReturnConfiguration />
      </SimulationProvider>,
    )

    // Check that return configuration is rendered (the heading should be visible)
    const heading = screen.getByText('📈 Rendite-Konfiguration (Sparphase)')
    expect(heading).toBeInTheDocument()

    // Expand the collapsible section to access the content
    fireEvent.click(heading)

    // Wait for content to become visible and check the options
    await waitFor(() => {
      expect(screen.getByText('Zufällige Rendite')).toBeInTheDocument()
      expect(screen.getByText('Feste Rendite')).toBeInTheDocument()
      expect(screen.getByText('Variable Rendite')).toBeInTheDocument()
      // Check that the random return configuration is visible by default (since it's the default mode)
      expect(screen.getByText('Durchschnittliche Rendite')).toBeInTheDocument()
    })
  })
})
