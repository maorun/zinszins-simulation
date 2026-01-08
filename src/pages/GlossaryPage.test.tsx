import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { ReactElement } from 'react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import GlossaryPage from './GlossaryPage'

// Helper to render with router
function renderWithRouter(ui: ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('GlossaryPage', () => {
  it('renders the glossary page header', () => {
    renderWithRouter(<GlossaryPage />)

    expect(screen.getByText('Finanzglossar')).toBeInTheDocument()
    expect(
      screen.getByText('Alphabetisch sortierte Erklärungen wichtiger Finanzbegriffe für die deutsche Finanzplanung'),
    ).toBeInTheDocument()
  })

  it('renders back button', () => {
    renderWithRouter(<GlossaryPage />)

    expect(screen.getByRole('button', { name: /zurück zur startseite/i })).toBeInTheDocument()
  })

  it('renders search input', () => {
    renderWithRouter(<GlossaryPage />)

    expect(screen.getByPlaceholderText('Begriffe durchsuchen...')).toBeInTheDocument()
  })

  it('renders category filters', () => {
    renderWithRouter(<GlossaryPage />)

    expect(screen.getByRole('button', { name: 'Alle' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Steuern' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Investitionen' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rente' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Versicherungen' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Allgemein' })).toBeInTheDocument()
  })

  it('displays all terms by default', () => {
    renderWithRouter(<GlossaryPage />)

    // Should show all terms
    expect(screen.getByText('Vorabpauschale')).toBeInTheDocument()
    expect(screen.getByText('Kapitalertragsteuer')).toBeInTheDocument()
    expect(screen.getByText('Sparerpauschbetrag')).toBeInTheDocument()
  })

  it('shows results count', () => {
    renderWithRouter(<GlossaryPage />)

    // Should show count of all terms
    expect(screen.getByText(/\d+ Begriffe gefunden/)).toBeInTheDocument()
  })

  it('filters terms by category when category button is clicked', async () => {
    const user = userEvent.setup()
    renderWithRouter(<GlossaryPage />)

    // Click on "Steuern" category
    const steuernButton = screen.getByRole('button', { name: 'Steuern' })
    await user.click(steuernButton)

    // Should show tax-related terms
    expect(screen.getByText('Vorabpauschale')).toBeInTheDocument()
    expect(screen.getByText('Kapitalertragsteuer')).toBeInTheDocument()

    // Results count should update
    expect(screen.getByText(/\d+ Begriffe gefunden/)).toBeInTheDocument()
  })

  it('searches terms when user types in search box', async () => {
    const user = userEvent.setup()
    renderWithRouter(<GlossaryPage />)

    const searchInput = screen.getByPlaceholderText('Begriffe durchsuchen...')
    await user.type(searchInput, 'Vorabpauschale')

    // Should show matching terms
    expect(screen.getByText('Vorabpauschale')).toBeInTheDocument()

    // Should not show non-matching terms
    expect(screen.queryByText('Kindergeld')).not.toBeInTheDocument()
  })

  it('shows no results message when search has no matches', async () => {
    const user = userEvent.setup()
    renderWithRouter(<GlossaryPage />)

    const searchInput = screen.getByPlaceholderText('Begriffe durchsuchen...')
    await user.type(searchInput, 'xyznomatchxyz')

    expect(screen.getByText('Keine Begriffe gefunden. Versuchen Sie eine andere Suche oder Kategorie.')).toBeInTheDocument()
  })

  it('displays term details including category badge', () => {
    renderWithRouter(<GlossaryPage />)

    // Find a term card (e.g., Vorabpauschale)
    const vorabCard = screen.getByText('Vorabpauschale').closest('div')
    expect(vorabCard).toBeInTheDocument()

    // Should show category badge
    if (vorabCard) {
      expect(within(vorabCard).getByText('Steuern')).toBeInTheDocument()
    }
  })

  it('displays term examples when available', () => {
    renderWithRouter(<GlossaryPage />)

    // Vorabpauschale has an example
    expect(screen.getByText(/Beispiel:/)).toBeInTheDocument()
  })

  it('displays related terms when available', () => {
    renderWithRouter(<GlossaryPage />)

    // Vorabpauschale has related terms
    expect(screen.getByText('Verwandte Begriffe:')).toBeInTheDocument()
  })

  it('resets to all terms when "Alle" category is clicked', async () => {
    const user = userEvent.setup()
    renderWithRouter(<GlossaryPage />)

    // First, filter by a category
    await user.click(screen.getByRole('button', { name: 'Steuern' }))

    // Then click "Alle"
    await user.click(screen.getByRole('button', { name: 'Alle' }))

    // Should show all terms again
    expect(screen.getByText('Vorabpauschale')).toBeInTheDocument()
    expect(screen.getByText('Volatilität')).toBeInTheDocument()
  })

  it('shows proper German plural for single result', async () => {
    const user = userEvent.setup()
    renderWithRouter(<GlossaryPage />)

    // Search for a specific term that should return exactly one result
    const searchInput = screen.getByPlaceholderText('Begriffe durchsuchen...')
    await user.type(searchInput, 'Vorabpauschale')

    // Should show singular form
    expect(screen.getByText('1 Begriff gefunden')).toBeInTheDocument()
  })

  it('shows proper German plural for multiple results', () => {
    renderWithRouter(<GlossaryPage />)

    // By default, should show plural form
    expect(screen.getByText(/\d+ Begriffe gefunden/)).toBeInTheDocument()
  })
})
