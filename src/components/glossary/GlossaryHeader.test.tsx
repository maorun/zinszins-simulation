import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { GlossaryHeader } from './GlossaryHeader'

// Mock useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

describe('GlossaryHeader', () => {
  it('renders glossary title', () => {
    render(
      <BrowserRouter>
        <GlossaryHeader />
      </BrowserRouter>,
    )

    expect(screen.getByText('Finanzglossar')).toBeInTheDocument()
  })

  it('renders glossary description', () => {
    render(
      <BrowserRouter>
        <GlossaryHeader />
      </BrowserRouter>,
    )

    expect(
      screen.getByText('Alphabetisch sortierte Erklärungen wichtiger Finanzbegriffe für die deutsche Finanzplanung'),
    ).toBeInTheDocument()
  })

  it('renders back button', () => {
    render(
      <BrowserRouter>
        <GlossaryHeader />
      </BrowserRouter>,
    )

    expect(screen.getByRole('button', { name: /zurück zur startseite/i })).toBeInTheDocument()
  })

  it('renders icon', () => {
    render(
      <BrowserRouter>
        <GlossaryHeader />
      </BrowserRouter>,
    )

    // The BookOpen icon should be rendered (check for its parent container)
    const iconContainer = screen.getByText('Finanzglossar').closest('div')?.previousElementSibling
    expect(iconContainer).toBeInTheDocument()
  })
})
