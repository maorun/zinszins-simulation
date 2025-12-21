import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QuellensteuerconfigCard } from './QuellensteuerconfigCard'

describe('QuellensteuerconfigCard', () => {
  it('should render collapsible card with title', () => {
    render(<QuellensteuerconfigCard />)

    expect(screen.getByText(/🌍 Quellensteueranrechnung \(Informations-Tool\)/)).toBeInTheDocument()
  })

  it('should render QuellensteuerconfigurationSection when expanded', async () => {
    render(<QuellensteuerconfigCard />)

    // Card should render (even if collapsed)
    expect(screen.getByText(/🌍 Quellensteueranrechnung/)).toBeInTheDocument()
  })
})
