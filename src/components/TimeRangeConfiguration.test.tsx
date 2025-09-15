/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import TimeRangeConfiguration from './TimeRangeConfiguration'
import { SimulationProvider } from '../contexts/SimulationContext'

describe('TimeRangeConfiguration', () => {
  it('renders the time range configuration section', () => {
    render(
      <SimulationProvider>
        <TimeRangeConfiguration />
      </SimulationProvider>,
    )
    expect(screen.getAllByText(/Sparphase-Ende/)[0]).toBeInTheDocument()
  })
})
