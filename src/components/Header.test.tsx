/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Header from './Header'

describe('Header', () => {
  it('renders the header with the correct title and subtitle', () => {
    render(<Header />)
    expect(screen.getByText('Zinseszins-Simulation')).toBeInTheDocument()
    expect(screen.getByText('Berechne deine Kapitalentwicklung mit deutschen Steuerregeln')).toBeInTheDocument()
  })

  it('has mobile-optimized typography classes', () => {
    const { container } = render(<Header />)
    const title = container.querySelector('h1')
    const subtitle = container.querySelector('p')

    // Mobile-first responsive typography
    expect(title).toHaveClass('text-xl')
    expect(title).toHaveClass('sm:text-2xl')
    expect(title).toHaveClass('mb-1.5')
    expect(title).toHaveClass('sm:mb-2')

    // Subtitle with proper mobile spacing
    expect(subtitle).toHaveClass('mb-3')
    expect(subtitle).toHaveClass('sm:mb-4')
    expect(subtitle).toHaveClass('px-1')
  })

  it('maintains responsive layout structure', () => {
    const { container } = render(<Header />)
    const header = container.querySelector('header')

    expect(header).toHaveClass('mb-3')
    expect(header).toHaveClass('sm:mb-4')
    
    // The text-center class is now on the inner div
    const textCenterDiv = container.querySelector('.text-center')
    expect(textCenterDiv).toBeInTheDocument()
  })
})
