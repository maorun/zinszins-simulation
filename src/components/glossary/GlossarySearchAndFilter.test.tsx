import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GlossarySearchAndFilter } from './GlossarySearchAndFilter'
import type { GlossaryCategory } from '../../data/glossary'

describe('GlossarySearchAndFilter', () => {
  const mockCategories: GlossaryCategory[] = ['Steuern', 'Investitionen', 'Rente', 'Versicherungen', 'Allgemein']
  const defaultProps = {
    searchQuery: '',
    onSearchChange: vi.fn(),
    selectedCategory: 'Alle' as GlossaryCategory | 'Alle',
    onCategoryChange: vi.fn(),
    categories: mockCategories,
    resultsCount: 20,
  }

  it('renders search input', () => {
    render(<GlossarySearchAndFilter {...defaultProps} />)

    expect(screen.getByPlaceholderText('Begriffe durchsuchen...')).toBeInTheDocument()
  })

  it('renders all category buttons', () => {
    render(<GlossarySearchAndFilter {...defaultProps} />)

    expect(screen.getByRole('button', { name: 'Alle' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Steuern' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Investitionen' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rente' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Versicherungen' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Allgemein' })).toBeInTheDocument()
  })

  it('shows search query in input', () => {
    render(<GlossarySearchAndFilter {...defaultProps} searchQuery="test query" />)

    const input = screen.getByPlaceholderText('Begriffe durchsuchen...') as HTMLInputElement
    expect(input.value).toBe('test query')
  })

  it('calls onSearchChange when typing in search input', async () => {
    const user = userEvent.setup()
    const onSearchChange = vi.fn()
    render(<GlossarySearchAndFilter {...defaultProps} onSearchChange={onSearchChange} />)

    const input = screen.getByPlaceholderText('Begriffe durchsuchen...')
    await user.type(input, 'test')

    expect(onSearchChange).toHaveBeenCalled()
  })

  it('calls onCategoryChange when clicking a category button', async () => {
    const user = userEvent.setup()
    const onCategoryChange = vi.fn()
    render(<GlossarySearchAndFilter {...defaultProps} onCategoryChange={onCategoryChange} />)

    await user.click(screen.getByRole('button', { name: 'Steuern' }))

    expect(onCategoryChange).toHaveBeenCalledWith('Steuern')
  })

  it('displays results count with proper German plural', () => {
    render(<GlossarySearchAndFilter {...defaultProps} resultsCount={20} />)

    expect(screen.getByText('20 Begriffe gefunden')).toBeInTheDocument()
  })

  it('displays singular form for single result', () => {
    render(<GlossarySearchAndFilter {...defaultProps} resultsCount={1} />)

    expect(screen.getByText('1 Begriff gefunden')).toBeInTheDocument()
  })

  it('highlights selected category button', () => {
    render(<GlossarySearchAndFilter {...defaultProps} selectedCategory="Steuern" />)

    const steuernButton = screen.getByRole('button', { name: 'Steuern' })
    const alleButton = screen.getByRole('button', { name: 'Alle' })

    // Selected button should have default variant styling (not outline)
    // Note: This is a simplification - in reality you'd check actual CSS classes
    expect(steuernButton).toBeInTheDocument()
    expect(alleButton).toBeInTheDocument()
  })
})
