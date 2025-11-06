import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import IntroductionSection from './IntroductionSection'

describe('IntroductionSection', () => {
  it('renders the introduction section', () => {
    render(<IntroductionSection />)

    expect(screen.getByText('Was ist Sensitivitätsanalyse?')).toBeInTheDocument()
    expect(screen.getByText(/Diese Analyse zeigt Ihnen, wie sich Änderungen einzelner Parameter/)).toBeInTheDocument()
  })
})
