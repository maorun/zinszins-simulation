/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SavedSparplansListDescription } from './SavedSparplansListDescription'

describe('SavedSparplansListDescription', () => {
  it('should render description text', () => {
    render(<SavedSparplansListDescription />)

    expect(screen.getByText('Ihre konfigurierten Sparpläne und Einmalzahlungen')).toBeInTheDocument()
  })

  it('should apply correct styling classes', () => {
    const { container } = render(<SavedSparplansListDescription />)

    const descriptionDiv = container.querySelector('div')
    expect(descriptionDiv).toHaveClass('pt-4')
    expect(descriptionDiv).toHaveClass('px-6')
    expect(descriptionDiv).toHaveClass('pb-2')
    expect(descriptionDiv).toHaveClass('text-[#666]')
    expect(descriptionDiv).toHaveClass('text-sm')
    expect(descriptionDiv).toHaveClass('border-b')
  })
})
