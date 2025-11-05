import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { InfoPanel } from './InfoPanel'

describe('InfoPanel', () => {
  it('should render information panel', () => {
    render(<InfoPanel />)

    expect(screen.getByText('ℹ️ Was sind Inflationsszenarien?')).toBeInTheDocument()
    expect(screen.getByText(/Inflationsszenarien helfen Ihnen/)).toBeInTheDocument()
  })

  it('should display hint about scenario combination', () => {
    render(<InfoPanel />)

    expect(screen.getByText(/Diese Szenarien überschreiben die normale Inflationsrate/)).toBeInTheDocument()
  })
})
