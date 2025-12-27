import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GenerationalWealthTransferConfiguration from './GenerationalWealthTransferConfiguration'

describe('GenerationalWealthTransferConfiguration', () => {
  it('should render with switch disabled by default', () => {
    render(<GenerationalWealthTransferConfiguration />)

    expect(screen.getByText('Generationenübergreifende Vermögensplanung')).toBeInTheDocument()
    expect(
      screen.getByText('Generationenübergreifende Planung aktivieren'),
    ).toBeInTheDocument()
  })

  it('should show family member manager when enabled', async () => {
    const user = userEvent.setup()
    render(<GenerationalWealthTransferConfiguration />)

    const enableSwitch = screen.getByRole('switch')
    await user.click(enableSwitch)

    expect(screen.getByText('Familienmitglieder')).toBeInTheDocument()
  })

  it('should not show configuration options until family members are added', async () => {
    const user = userEvent.setup()
    render(<GenerationalWealthTransferConfiguration />)

    const enableSwitch = screen.getByRole('switch')
    await user.click(enableSwitch)

    // Should show family member manager but not configuration
    expect(screen.getByText('Familienmitglieder')).toBeInTheDocument()
    expect(
      screen.queryByText('Vermögensübertragung konfigurieren'),
    ).not.toBeInTheDocument()
  })
})
