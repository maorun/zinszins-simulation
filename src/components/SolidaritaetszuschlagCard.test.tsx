import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SolidaritaetszuschlagCard } from './SolidaritaetszuschlagCard'

describe('SolidaritaetszuschlagCard', () => {
  it('should render without crashing', () => {
    render(<SolidaritaetszuschlagCard />)
    expect(screen.getByText(/Solidaritätszuschlag-Rechner/)).toBeInTheDocument()
  })

  it('should display subtitle when expanded', async () => {
    const user = userEvent.setup()
    render(<SolidaritaetszuschlagCard />)
    
    // Click to expand
    const header = screen.getByText(/Solidaritätszuschlag-Rechner/)
    await user.click(header)
    
    expect(screen.getByText(/Berechnung nach 2021 Reform/)).toBeInTheDocument()
  })

  it('should display info message when expanded', async () => {
    const user = userEvent.setup()
    render(<SolidaritaetszuschlagCard />)
    
    // Click to expand
    const header = screen.getByText(/Solidaritätszuschlag-Rechner/)
    await user.click(header)
    
    expect(screen.getByText(/Informations-Tool/)).toBeInTheDocument()
  })
})
