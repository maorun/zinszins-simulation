/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import { SavedSparplansList } from './SavedSparplansList'
import type { Sparplan } from '../utils/sparplan-utils'

// Mock the sub-components
vi.mock('./SavedSparplansListHeader', () => ({
  SavedSparplansListHeader: () => <div data-testid="saved-sparplans-list-header">Header</div>,
}))

vi.mock('./SavedSparplansListDescription', () => ({
  SavedSparplansListDescription: () => <div data-testid="saved-sparplans-list-description">Description</div>,
}))

vi.mock('./SavedSparplansListContent', () => ({
  SavedSparplansListContent: () => <div data-testid="saved-sparplans-list-content">Content</div>,
}))

describe('SavedSparplansList', () => {
  const mockProps = {
    sparplans: [] as Sparplan[],
    simulationAnnual: 'yearly' as const,
    isEditMode: false,
    editingSparplan: null,
    sparplanFormValues: {
      start: new Date(),
      end: null,
      einzahlung: '',
      ter: '',
      transactionCostPercent: '',
      transactionCostAbsolute: '',
    },
    singleFormValue: {
      date: new Date(),
      einzahlung: '',
      ter: '',
      transactionCostPercent: '',
      transactionCostAbsolute: '',
    },
    formatDateForInput: vi.fn(),
    handleDateChange: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onSaveEdit: vi.fn(),
    onCancelEdit: vi.fn(),
    onSparplanFormChange: vi.fn(),
    onSingleFormChange: vi.fn(),
  }

  it('should render all sub-components correctly', () => {
    render(<SavedSparplansList {...mockProps} />)

    expect(screen.getByTestId('saved-sparplans-list-header')).toBeInTheDocument()
    expect(screen.getByTestId('saved-sparplans-list-description')).toBeInTheDocument()
    expect(screen.getByTestId('saved-sparplans-list-content')).toBeInTheDocument()
  })

  it('should render Card component with correct className', () => {
    const { container } = render(<SavedSparplansList {...mockProps} />)

    const cardElement = container.querySelector('.mb-6')
    expect(cardElement).toBeInTheDocument()
  })

  it('should render Collapsible component with defaultOpen true', () => {
    const { container } = render(<SavedSparplansList {...mockProps} />)

    // Collapsible component should be present
    expect(container.querySelector('[data-state]')).toBeInTheDocument()
  })
})
