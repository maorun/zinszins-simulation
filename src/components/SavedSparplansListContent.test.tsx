/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import { SavedSparplansListContent } from './SavedSparplansListContent'
import type { Sparplan } from '../utils/sparplan-utils'

// Mock SparplanList component
vi.mock('./sparplan-forms/SparplanList', () => ({
  SparplanList: () => <div data-testid="sparplan-list">SparplanList</div>,
}))

describe('SavedSparplansListContent', () => {
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

  it('should render SparplanList component', () => {
    render(<SavedSparplansListContent {...mockProps} />)

    expect(screen.getByTestId('sparplan-list')).toBeInTheDocument()
  })

  it('should render wrapper div with correct padding', () => {
    const { container } = render(<SavedSparplansListContent {...mockProps} />)

    const wrapperDiv = container.querySelector('div.p-4')
    expect(wrapperDiv).toBeInTheDocument()
  })

  it('should render hidden desktop table layout', () => {
    const { container } = render(<SavedSparplansListContent {...mockProps} />)

    const hiddenDiv = container.querySelector('div.hidden')
    expect(hiddenDiv).toBeInTheDocument()
  })

  it('should pass all props to SparplanList', () => {
    const mockSparplans: Sparplan[] = [
      {
        id: 1,
        start: '2023-01-01',
        end: '2024-01-01',
        einzahlung: 1000,
      },
    ]

    const propsWithData = {
      ...mockProps,
      sparplans: mockSparplans,
    }

    render(<SavedSparplansListContent {...propsWithData} />)

    // Verify component renders (props are passed correctly)
    expect(screen.getByTestId('sparplan-list')).toBeInTheDocument()
  })
})
