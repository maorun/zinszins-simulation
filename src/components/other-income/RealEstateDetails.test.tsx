import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RealEstateDetails } from './RealEstateDetails'
import type { RealEstateConfig } from '../../../helpers/other-income'

describe('RealEstateDetails', () => {
  it('renders all real estate details correctly', () => {
    const config: RealEstateConfig = {
      propertyValue: 500000,
      maintenanceCostPercent: 1.5,
      vacancyRatePercent: 5,
      monthlyMortgagePayment: 1500,
      propertyAppreciationRate: 2,
      includeAppreciation: true,
    }

    render(<RealEstateDetails config={config} />)

    expect(screen.getByText(/🏠 Immobilien-Details:/)).toBeInTheDocument()
    expect(screen.getByText(/Immobilienwert:.*500\.000.*€/)).toBeInTheDocument()
    expect(screen.getByText(/Instandhaltung:.*1\.5%/)).toBeInTheDocument()
    expect(screen.getByText(/Leerstand:.*5%/)).toBeInTheDocument()
    expect(screen.getByText(/Finanzierung:.*1\.500.*€\/Monat/)).toBeInTheDocument()
    expect(screen.getByText(/Wertsteigerung:.*2%.*\(berücksichtigt\)/)).toBeInTheDocument()
  })

  it('hides mortgage payment when zero', () => {
    const config: RealEstateConfig = {
      propertyValue: 500000,
      maintenanceCostPercent: 1.5,
      vacancyRatePercent: 5,
      monthlyMortgagePayment: 0,
      propertyAppreciationRate: 2,
      includeAppreciation: false,
    }

    render(<RealEstateDetails config={config} />)

    expect(screen.queryByText(/Finanzierung:/)).not.toBeInTheDocument()
  })

  it('shows "nicht berücksichtigt" when appreciation is not included', () => {
    const config: RealEstateConfig = {
      propertyValue: 500000,
      maintenanceCostPercent: 1.5,
      vacancyRatePercent: 5,
      monthlyMortgagePayment: 0,
      propertyAppreciationRate: 2,
      includeAppreciation: false,
    }

    render(<RealEstateDetails config={config} />)

    expect(screen.getByText(/Wertsteigerung:.*2%.*\(nicht berücksichtigt\)/)).toBeInTheDocument()
  })
})
