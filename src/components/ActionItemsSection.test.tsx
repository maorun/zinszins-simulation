import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ActionItemsSection from './ActionItemsSection'

describe('ActionItemsSection', () => {
  it('renders the action items section', () => {
    render(<ActionItemsSection />)

    expect(screen.getByText('✅ Handlungsempfehlungen')).toBeInTheDocument()
    expect(screen.getByText(/Fokussieren Sie sich auf die einflussreichsten Parameter/)).toBeInTheDocument()
  })

  it('displays all action items', () => {
    render(<ActionItemsSection />)

    expect(
      screen.getByText(/Nutzen Sie diese Erkenntnisse, um realistische Szenarien zu entwickeln/),
    ).toBeInTheDocument()
    expect(screen.getByText(/manche Parameter.*nicht direkt kontrollieren können/)).toBeInTheDocument()
    expect(screen.getByText(/Andere Parameter.*können Sie aktiv steuern/)).toBeInTheDocument()
  })
})
