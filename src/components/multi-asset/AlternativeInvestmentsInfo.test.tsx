import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AlternativeInvestmentsInfo } from './AlternativeInvestmentsInfo'

describe('AlternativeInvestmentsInfo', () => {
  it('should render the component', () => {
    render(<AlternativeInvestmentsInfo />)
    expect(screen.getByText(/Alternative Investments: REITs & Rohstoffe/i)).toBeInTheDocument()
  })

  describe('REITs Information', () => {
    it('should display REITs section header', () => {
      render(<AlternativeInvestmentsInfo />)
      expect(screen.getByText(/REITs \(Real Estate Investment Trusts\)/i)).toBeInTheDocument()
    })

    it('should explain what REITs are', () => {
      render(<AlternativeInvestmentsInfo />)
      expect(
        screen.getByText(/börsengehandelte Immobiliengesellschaften/i),
      ).toBeInTheDocument()
    })

    it('should list REITs benefits', () => {
      render(<AlternativeInvestmentsInfo />)
      expect(screen.getByText(/Diversifikation durch Streuung/i)).toBeInTheDocument()
      expect(screen.getByText(/Regelmäßige Ausschüttungen/i)).toBeInTheDocument()
      expect(screen.getByText(/Liquidität durch Börsenhandel/i)).toBeInTheDocument()
      expect(screen.getByText(/Professionelles Management/i)).toBeInTheDocument()
    })

    it('should explain German tax treatment for REITs', () => {
      render(<AlternativeInvestmentsInfo />)
      expect(screen.getByText(/Teilfreistellung für Immobilienfonds/i)).toBeInTheDocument()
      // Kapitalertragsteuer appears multiple times in the document
      expect(screen.getAllByText(/Kapitalertragsteuer/i).length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Commodities Information', () => {
    it('should display Commodities section header', () => {
      render(<AlternativeInvestmentsInfo />)
      expect(screen.getByText(/Rohstoffe \(Commodities\)/i)).toBeInTheDocument()
    })

    it('should explain what Commodities are', () => {
      render(<AlternativeInvestmentsInfo />)
      expect(screen.getByText(/Gold, Öl, Industriemetalle/i)).toBeInTheDocument()
    })

    it('should list Commodities benefits', () => {
      render(<AlternativeInvestmentsInfo />)
      expect(screen.getByText(/Inflationsschutz bei steigenden Preisen/i)).toBeInTheDocument()
      expect(screen.getByText(/Diversifikation mit geringer Korrelation/i)).toBeInTheDocument()
      expect(screen.getByText(/Portfolio-Absicherung in Krisenzeiten/i)).toBeInTheDocument()
      expect(screen.getByText(/Profiteur von Wirtschaftswachstum/i)).toBeInTheDocument()
    })

    it('should explain German tax treatment for Commodities', () => {
      render(<AlternativeInvestmentsInfo />)
      expect(screen.getByText(/Rohstoff-ETCs und -ETFs/i)).toBeInTheDocument()
      expect(screen.getByText(/physischem Gold/i)).toBeInTheDocument()
      expect(screen.getByText(/1 Jahr Haltedauer steuerfrei/i)).toBeInTheDocument()
    })
  })

  describe('Risk Warnings', () => {
    it('should display risk warning section', () => {
      render(<AlternativeInvestmentsInfo />)
      expect(screen.getByText(/Wichtige Risikohinweise:/i)).toBeInTheDocument()
    })

    it('should warn about higher volatility', () => {
      render(<AlternativeInvestmentsInfo />)
      expect(screen.getByText(/Höhere Volatilität:/i)).toBeInTheDocument()
      expect(screen.getByText(/25% Volatilität/i)).toBeInTheDocument()
    })

    it('should warn about lack of regular income', () => {
      render(<AlternativeInvestmentsInfo />)
      expect(screen.getByText(/Keine laufenden Erträge:/i)).toBeInTheDocument()
    })

    it('should warn about complexity', () => {
      render(<AlternativeInvestmentsInfo />)
      expect(screen.getByText(/Komplexität:/i)).toBeInTheDocument()
    })

    it('should provide portfolio allocation recommendation', () => {
      render(<AlternativeInvestmentsInfo />)
      expect(screen.getByText(/5-15% des Portfolios/i)).toBeInTheDocument()
    })
  })

  describe('When to Use Section', () => {
    it('should display when to use section', () => {
      render(<AlternativeInvestmentsInfo />)
      expect(screen.getByText(/Wann sind alternative Investments sinnvoll?/i)).toBeInTheDocument()
    })

    it('should list appropriate use cases', () => {
      render(<AlternativeInvestmentsInfo />)
      expect(screen.getByText(/Zur weiteren Diversifikation/i)).toBeInTheDocument()
      expect(screen.getByText(/Als Inflationsschutz/i)).toBeInTheDocument()
      expect(screen.getByText(/Für erfahrene Anleger/i)).toBeInTheDocument()
      expect(screen.getByText(/langfristigem Anlagehorizont/i)).toBeInTheDocument()
      expect(screen.getByText(/höhere Volatilität zu akzeptieren/i)).toBeInTheDocument()
    })
  })

  describe('Visual Styling', () => {
    it('should have amber color scheme for the card', () => {
      const { container } = render(<AlternativeInvestmentsInfo />)
      const card = container.querySelector('.border-l-amber-500')
      expect(card).toBeInTheDocument()
    })

    it('should render icons for visual clarity', () => {
      const { container } = render(<AlternativeInvestmentsInfo />)
      // Check that icons are rendered (they use specific Lucide icon classes)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have semantic HTML structure', () => {
      const { container } = render(<AlternativeInvestmentsInfo />)
      expect(container.querySelector('h4')).toBeInTheDocument()
      expect(container.querySelector('ul')).toBeInTheDocument()
    })

    it('should provide clear headings for each section', () => {
      render(<AlternativeInvestmentsInfo />)
      expect(screen.getByText(/REITs \(Real Estate Investment Trusts\)/i)).toBeInTheDocument()
      expect(screen.getByText(/Rohstoffe \(Commodities\)/i)).toBeInTheDocument()
      expect(screen.getByText(/Wichtige Risikohinweise:/i)).toBeInTheDocument()
      expect(screen.getByText(/Wann sind alternative Investments sinnvoll?/i)).toBeInTheDocument()
    })
  })
})
