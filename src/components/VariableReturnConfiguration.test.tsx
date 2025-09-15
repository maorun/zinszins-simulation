/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import VariableReturnConfiguration from './VariableReturnConfiguration'
import { SimulationProvider } from '../contexts/SimulationContext'

describe('VariableReturnConfiguration', () => {
  it('renders the variable return configuration section', () => {
    render(
      <SimulationProvider>
        <VariableReturnConfiguration />
      </SimulationProvider>,
    )
    expect(screen.getByText('Variable Renditen pro Jahr')).toBeInTheDocument()
  })
})
