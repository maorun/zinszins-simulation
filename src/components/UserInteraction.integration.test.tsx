/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { SimulationProvider } from '../contexts/SimulationContext'
import SimulationParameters from './SimulationParameters'

describe('User Interaction Components Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders simulation parameters interface', () => {
    render(
      <SimulationProvider>
        <SimulationParameters />
      </SimulationProvider>,
    )

    // Should render the main configuration panel
    expect(screen.getByText('⚙️ Konfiguration')).toBeInTheDocument()
  })
})
