import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { FixedReturnConfig } from './FixedReturnConfig'

describe('FixedReturnConfig', () => {
  it('renders with value', () => {
    render(<FixedReturnConfig formValueRendite={5} onFormValueRenditeChange={vi.fn()} />)

    expect(screen.getByText('Erwartete Rendite Entnahme-Phase (%)')).toBeInTheDocument()
    expect(screen.getByText('5%')).toBeInTheDocument()
  })

  it('renders slider with correct value', () => {
    render(<FixedReturnConfig formValueRendite={7} onFormValueRenditeChange={vi.fn()} />)

    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-valuenow', '7')
  })

  it('displays helper text', () => {
    render(<FixedReturnConfig formValueRendite={5} onFormValueRenditeChange={vi.fn()} />)

    expect(
      screen.getByText(/Feste Rendite für die gesamte Entnahme-Phase/),
    ).toBeInTheDocument()
  })

  it('displays correct min and max labels', () => {
    render(<FixedReturnConfig formValueRendite={5} onFormValueRenditeChange={vi.fn()} />)

    expect(screen.getByText('0%')).toBeInTheDocument()
    expect(screen.getByText('10%')).toBeInTheDocument()
  })
})
