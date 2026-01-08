/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { ReactElement } from 'react'
import Header from './Header'

// Helper to render with router
function renderWithRouter(ui: ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('Header', () => {
  it('renders the header with the correct title and subtitle', () => {
    renderWithRouter(<Header />)
    expect(screen.getByText('Zinseszins-Simulation')).toBeInTheDocument()
    expect(screen.getByText('Berechne deine Kapitalentwicklung mit deutschen Steuerregeln')).toBeInTheDocument()
  })

  it('has mobile-optimized typography classes', () => {
    const { container } = renderWithRouter(<Header />)
    const title = container.querySelector('h1')
    const subtitle = container.querySelector('p')

    // Mobile-first responsive typography
    expect(title).toHaveClass('text-xl')
    expect(title).toHaveClass('sm:text-2xl')
    expect(title).toHaveClass('mb-1.5')
    expect(title).toHaveClass('sm:mb-2')

    // Subtitle with proper mobile spacing
    expect(subtitle).toHaveClass('text-sm')
    expect(subtitle).toHaveClass('text-gray-600')
    expect(subtitle).toHaveClass('px-1')
  })

  it('maintains responsive layout structure', () => {
    const { container } = renderWithRouter(<Header />)
    const header = container.querySelector('header')
    const centerDiv = container.querySelector('.text-center')

    expect(header).toHaveClass('mb-3')
    expect(header).toHaveClass('sm:mb-4')
    expect(centerDiv).toHaveClass('text-center')
  })
})
