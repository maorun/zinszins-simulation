/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SavedSparplansListDescription } from './SavedSparplansListDescription'

describe('SavedSparplansListDescription', () => {
  it('should render description text', () => {
    render(<SavedSparplansListDescription />)

    expect(screen.getByText('Ihre konfigurierten Sparpläne und Einmalzahlungen')).toBeInTheDocument()
  })

  it('should apply correct inline styles', () => {
    const { container } = render(<SavedSparplansListDescription />)

    const descriptionDiv = container.querySelector('div')
    expect(descriptionDiv).toHaveStyle({
      padding: '1rem 1.5rem 0.5rem',
      color: '#666',
      fontSize: '0.9rem',
      borderBottom: '1px solid #f0f0f0',
    })
  })
})
