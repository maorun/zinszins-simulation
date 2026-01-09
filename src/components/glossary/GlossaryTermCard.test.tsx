import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GlossaryTermCard } from './GlossaryTermCard'
import type { GlossaryTerm } from '../../data/glossary'

describe('GlossaryTermCard', () => {
  const mockTerm: GlossaryTerm = {
    term: 'Test Term',
    category: 'Steuern',
    shortDefinition: 'Short definition of test term',
    detailedExplanation: 'Detailed explanation of the test term with more information.',
    example: 'Example: This is an example of the test term.',
    relatedTerms: ['related1', 'related2'],
  }

  const mockFilteredTerms: GlossaryTerm[] = [
    mockTerm,
    {
      term: 'Related Term 1',
      category: 'Investitionen',
      shortDefinition: 'Related term 1',
      detailedExplanation: 'Explanation for related term 1',
    },
    {
      term: 'Related Term 2',
      category: 'Rente',
      shortDefinition: 'Related term 2',
      detailedExplanation: 'Explanation for related term 2',
    },
  ]

  it('renders term name', () => {
    render(<GlossaryTermCard term={mockTerm} index={0} filteredTerms={mockFilteredTerms} />)

    expect(screen.getByText('Test Term')).toBeInTheDocument()
  })

  it('renders category badge', () => {
    render(<GlossaryTermCard term={mockTerm} index={0} filteredTerms={mockFilteredTerms} />)

    expect(screen.getByText('Steuern')).toBeInTheDocument()
  })

  it('renders short definition', () => {
    render(<GlossaryTermCard term={mockTerm} index={0} filteredTerms={mockFilteredTerms} />)

    expect(screen.getByText('Short definition of test term')).toBeInTheDocument()
  })

  it('renders detailed explanation', () => {
    render(<GlossaryTermCard term={mockTerm} index={0} filteredTerms={mockFilteredTerms} />)

    expect(screen.getByText('Detailed explanation of the test term with more information.')).toBeInTheDocument()
  })

  it('renders example when provided', () => {
    render(<GlossaryTermCard term={mockTerm} index={0} filteredTerms={mockFilteredTerms} />)

    expect(screen.getByText(/Beispiel:/)).toBeInTheDocument()
    expect(screen.getByText('Example: This is an example of the test term.')).toBeInTheDocument()
  })

  it('does not render example section when not provided', () => {
    const termWithoutExample: GlossaryTerm = {
      ...mockTerm,
      example: undefined,
    }
    render(<GlossaryTermCard term={termWithoutExample} index={0} filteredTerms={mockFilteredTerms} />)

    expect(screen.queryByText(/Beispiel:/)).not.toBeInTheDocument()
  })

  it('renders related terms section when provided', () => {
    render(<GlossaryTermCard term={mockTerm} index={0} filteredTerms={mockFilteredTerms} />)

    expect(screen.getByText('Verwandte Begriffe:')).toBeInTheDocument()
  })

  it('does not render related terms section when not provided', () => {
    const termWithoutRelated: GlossaryTerm = {
      ...mockTerm,
      relatedTerms: undefined,
    }
    render(<GlossaryTermCard term={termWithoutRelated} index={0} filteredTerms={mockFilteredTerms} />)

    expect(screen.queryByText('Verwandte Begriffe:')).not.toBeInTheDocument()
  })

  it('renders related term buttons', () => {
    render(<GlossaryTermCard term={mockTerm} index={0} filteredTerms={mockFilteredTerms} />)

    // Related terms are rendered as keys, not the actual term names from filteredTerms
    expect(screen.getByRole('button', { name: 'related1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'related2' })).toBeInTheDocument()
  })

  it('handles empty related terms array', () => {
    const termWithEmptyRelated: GlossaryTerm = {
      ...mockTerm,
      relatedTerms: [],
    }
    render(<GlossaryTermCard term={termWithEmptyRelated} index={0} filteredTerms={mockFilteredTerms} />)

    expect(screen.queryByText('Verwandte Begriffe:')).not.toBeInTheDocument()
  })
})
