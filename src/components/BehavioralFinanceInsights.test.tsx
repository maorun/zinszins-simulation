import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BehavioralFinanceInsights } from './BehavioralFinanceInsights'

// Helper function to expand the main collapsible card
async function expandMainCard(user: ReturnType<typeof userEvent.setup>) {
  const mainHeader = screen.getByText('Behavioral Finance - Häufige Anlegerfehler')
  await user.click(mainHeader)
}

describe('BehavioralFinanceInsights', () => {
  it('should render the component with title and description', async () => {
    const user = userEvent.setup()
    render(<BehavioralFinanceInsights />)

    expect(screen.getByText('Behavioral Finance - Häufige Anlegerfehler')).toBeInTheDocument()
    
    // Expand to see description
    await expandMainCard(user)
    expect(screen.getByText(/Lernen Sie typische psychologische Fehler kennen/)).toBeInTheDocument()
  })

  it('should render search input', async () => {
    const user = userEvent.setup()
    render(<BehavioralFinanceInsights />)

    // Expand to see search input
    await expandMainCard(user)
    
    const searchInput = screen.getByPlaceholderText('Suche nach Bias...')
    expect(searchInput).toBeInTheDocument()
  })

  it('should render category badges', async () => {
    const user = userEvent.setup()
    render(<BehavioralFinanceInsights />)

    // Expand to see category badges
    await expandMainCard(user)
    
    expect(screen.getByText(/❤️ Emotional/)).toBeInTheDocument()
    expect(screen.getByText(/🧠 Kognitive Fehler/)).toBeInTheDocument()
    expect(screen.getByText(/👥 Soziale Einflüsse/)).toBeInTheDocument()
  })

  it('should render all biases in collapsed state', async () => {
    const user = userEvent.setup()
    render(<BehavioralFinanceInsights />)

    // Expand to see biases
    await expandMainCard(user)
    
    // Check for some key biases
    expect(screen.getByText(/Verlustaversion/)).toBeInTheDocument()
    expect(screen.getByText(/Dispositionseffekt/)).toBeInTheDocument()
    expect(screen.getByText(/Herdentrieb/)).toBeInTheDocument()
  })

  it('should expand bias when clicked', async () => {
    const user = userEvent.setup()
    render(<BehavioralFinanceInsights />)

    // First expand main card
    await expandMainCard(user)
    
    // Find and click a bias
    const lossAversionButton = screen.getByText(/Verlustaversion/)
    await user.click(lossAversionButton)

    // Check that detailed content is now visible
    expect(screen.getByText('Was ist das?')).toBeInTheDocument()
    expect(screen.getByText('🇩🇪 Deutsches Beispiel')).toBeInTheDocument()
    expect(screen.getByText('💡 So vermeiden Sie den Fehler')).toBeInTheDocument()
  })

  it('should filter biases based on search term', async () => {
    const user = userEvent.setup()
    render(<BehavioralFinanceInsights />)

    // Expand main card first
    await expandMainCard(user)
    
    const searchInput = screen.getByPlaceholderText('Suche nach Bias...')

    // Search for "Verlust"
    await user.type(searchInput, 'Verlust')

    // Should show Verlustaversion
    expect(screen.getByText(/Verlustaversion/)).toBeInTheDocument()
    
    // Should not show unrelated biases (they won't be in the filtered results)
    // We can check the count of cards instead
    const cards = screen.getAllByRole('button', { name: /.*/ })
    expect(cards.length).toBeLessThan(13) // Less than all 12 biases + main card
  })

  it('should show no results message when search has no matches', async () => {
    const user = userEvent.setup()
    render(<BehavioralFinanceInsights />)

    // Expand main card first
    await expandMainCard(user)
    
    const searchInput = screen.getByPlaceholderText('Suche nach Bias...')
    await user.type(searchInput, 'xyznotfound123')

    expect(screen.getByText(/Keine Ergebnisse gefunden/)).toBeInTheDocument()
  })

  it('should display related biases when bias is expanded', async () => {
    const user = userEvent.setup()
    render(<BehavioralFinanceInsights />)

    // Expand main card first
    await expandMainCard(user)
    
    // Find and expand Loss Aversion which has related biases
    const lossAversionButton = screen.getByText(/Verlustaversion/)
    await user.click(lossAversionButton)

    // Check for "Verwandte Biases" section
    expect(screen.getByText('Verwandte Biases')).toBeInTheDocument()
  })

  it('should show category badge for each bias', async () => {
    const user = userEvent.setup()
    render(<BehavioralFinanceInsights />)

    // Expand main card first
    await expandMainCard(user)
    
    // Check that category badges are present with biases
    const badges = screen.getAllByText('Emotional', { exact: false })
    expect(badges.length).toBeGreaterThan(0)
  })

  it('should render footer tip', async () => {
    const user = userEvent.setup()
    render(<BehavioralFinanceInsights />)

    // Expand main card first
    await expandMainCard(user)
    
    expect(screen.getByText(/Das Bewusstsein dieser psychologischen Fallen/)).toBeInTheDocument()
  })

  it('should toggle bias collapse state', async () => {
    const user = userEvent.setup()
    render(<BehavioralFinanceInsights />)

    // Expand main card first
    await expandMainCard(user)
    
    const biasButton = screen.getByText(/Verlustaversion/)

    // Expand
    await user.click(biasButton)
    expect(screen.getByText('Was ist das?')).toBeInTheDocument()

    // Collapse
    await user.click(biasButton)
    expect(screen.queryByText('Was ist das?')).not.toBeInTheDocument()
  })

  it('should clear search when search term is deleted', async () => {
    const user = userEvent.setup()
    render(<BehavioralFinanceInsights />)

    // Expand main card first
    await expandMainCard(user)
    
    const searchInput = screen.getByPlaceholderText('Suche nach Bias...')

    // Type search term
    await user.type(searchInput, 'Verlust')
    expect(screen.queryByText(/❤️ Emotional/)).not.toBeInTheDocument() // Categories hidden during search

    // Clear search
    await user.clear(searchInput)
    expect(screen.getByText(/❤️ Emotional/)).toBeInTheDocument() // Categories visible again
  })
})
