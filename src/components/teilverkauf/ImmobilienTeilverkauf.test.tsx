import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { ImmobilienTeilverkauf } from './ImmobilienTeilverkauf'

describe('ImmobilienTeilverkauf', () => {
  it('renders the component with collapsed state by default', () => {
    render(<ImmobilienTeilverkauf />)

    expect(screen.getByText(/Immobilien-Teilverkauf mit Nießbrauchrecht/i)).toBeInTheDocument()
  })

  it('expands when clicking the header', async () => {
    const user = userEvent.setup()
    render(<ImmobilienTeilverkauf />)

    const header = screen.getByText(/Immobilien-Teilverkauf mit Nießbrauchrecht/i)
    await user.click(header)

    await waitFor(() => {
      expect(screen.getByText(/Der Immobilien-Teilverkauf ermöglicht/i)).toBeInTheDocument()
    })
  })

  it('shows configuration when expanded', async () => {
    const user = userEvent.setup()
    render(<ImmobilienTeilverkauf />)

    const header = screen.getByText(/Immobilien-Teilverkauf mit Nießbrauchrecht/i)
    await user.click(header)

    await waitFor(() => {
      expect(screen.getByText('Immobilien-Teilverkauf')).toBeInTheDocument()
      expect(screen.getByText('Aktivieren')).toBeInTheDocument()
    })
  })

  it('enables configuration when switch is toggled', async () => {
    const user = userEvent.setup()
    render(<ImmobilienTeilverkauf />)

    // Expand the section
    const header = screen.getByText(/Immobilien-Teilverkauf mit Nießbrauchrecht/i)
    await user.click(header)

    // Find and toggle the switch
    await waitFor(() => {
      expect(screen.getByText('Aktivieren')).toBeInTheDocument()
    })

    const switchElement = screen.getByRole('switch')
    await user.click(switchElement)

    // Check that configuration fields appear
    await waitFor(() => {
      expect(screen.getByLabelText(/Immobilienwert/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Verkaufsanteil/i)).toBeInTheDocument()
    })
  })

  it('shows comparison settings when enabled', async () => {
    const user = userEvent.setup()
    render(<ImmobilienTeilverkauf />)

    // Expand and enable
    const header = screen.getByText(/Immobilien-Teilverkauf mit Nießbrauchrecht/i)
    await user.click(header)

    await waitFor(() => {
      expect(screen.getByRole('switch')).toBeInTheDocument()
    })

    const switchElement = screen.getByRole('switch')
    await user.click(switchElement)

    // Check for comparison settings
    await waitFor(() => {
      expect(screen.getByText('Vergleichsszenarien')).toBeInTheDocument()
      expect(screen.getByLabelText(/Alternative Miete monatlich/i)).toBeInTheDocument()
    })
  })

  it('displays comparison results when enabled', async () => {
    const user = userEvent.setup()
    render(<ImmobilienTeilverkauf />)

    // Expand and enable
    const header = screen.getByText(/Immobilien-Teilverkauf mit Nießbrauchrecht/i)
    await user.click(header)

    await waitFor(() => {
      expect(screen.getByRole('switch')).toBeInTheDocument()
    })

    const switchElement = screen.getByRole('switch')
    await user.click(switchElement)

    // Check for comparison results
    await waitFor(() => {
      expect(screen.getByText('Vergleichsergebnisse')).toBeInTheDocument()
      expect(screen.getByText('Teilverkauf')).toBeInTheDocument()
      expect(screen.getByText('Vollverkauf + Miete')).toBeInTheDocument()
      expect(screen.getByText('Leibrente')).toBeInTheDocument()
    })
  })

  it('updates property value when input changes', async () => {
    const user = userEvent.setup()
    render(<ImmobilienTeilverkauf />)

    // Expand and enable
    const header = screen.getByText(/Immobilien-Teilverkauf mit Nießbrauchrecht/i)
    await user.click(header)

    await waitFor(() => {
      expect(screen.getByRole('switch')).toBeInTheDocument()
    })

    const switchElement = screen.getByRole('switch')
    await user.click(switchElement)

    // Find property value input
    await waitFor(() => {
      expect(screen.getByLabelText(/Immobilienwert/i)).toBeInTheDocument()
    })

    const propertyValueInput = screen.getByLabelText(/Immobilienwert/i) as HTMLInputElement
    await user.clear(propertyValueInput)
    await user.type(propertyValueInput, '600000')

    expect(propertyValueInput.value).toBe('600000')
  })
})
