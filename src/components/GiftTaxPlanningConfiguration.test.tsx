import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GiftTaxPlanningConfiguration from './GiftTaxPlanningConfiguration'

async function expandCard(user: ReturnType<typeof userEvent.setup>) {
  const cardHeader = screen.getByText('Schenkungssteuer-Planung')
  await user.click(cardHeader)
}

describe('GiftTaxPlanningConfiguration', () => {
  it('should render collapsed by default', () => {
    render(<GiftTaxPlanningConfiguration />)

    expect(screen.getByText('Schenkungssteuer-Planung')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Optimieren Sie lebzeitige Vermögensübertragungen unter Nutzung der 10-Jahres-Freibeträge',
      ),
    ).toBeInTheDocument()
  })

  it('should show enable switch when expanded', async () => {
    const user = userEvent.setup()
    render(<GiftTaxPlanningConfiguration />)

    await expandCard(user)

    const enableSwitch = screen.getByRole('switch', {
      name: /Schenkungssteuer-Planung aktivieren/i,
    })
    expect(enableSwitch).toBeInTheDocument()
    expect(enableSwitch).not.toBeChecked()
  })

  it('should show configuration form when enabled', async () => {
    const user = userEvent.setup()
    render(<GiftTaxPlanningConfiguration />)

    await expandCard(user)

    const enableSwitch = screen.getByRole('switch', {
      name: /Schenkungssteuer-Planung aktivieren/i,
    })
    await user.click(enableSwitch)

    expect(screen.getByText('Planungsparameter')).toBeInTheDocument()
    expect(screen.getByLabelText(/Zu übertragendes Vermögen/i)).toBeInTheDocument()
    expect(screen.getByText(/Verwandtschaftsverhältnis/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Verfügbarer Planungszeitraum/i)).toBeInTheDocument()
  })

  it('should display optimization results when enabled', async () => {
    const user = userEvent.setup()
    render(<GiftTaxPlanningConfiguration />)

    await expandCard(user)

    const enableSwitch = screen.getByRole('switch', {
      name: /Schenkungssteuer-Planung aktivieren/i,
    })
    await user.click(enableSwitch)

    // Check for optimization results
    expect(screen.getByText('Steuerersparnis durch Optimierung')).toBeInTheDocument()
    expect(screen.getByText('Empfohlener Schenkungsplan')).toBeInTheDocument()
    expect(screen.getByText(/Hinweise zur Schenkungssteuer/i)).toBeInTheDocument()
  })

  it('should show tax savings information', async () => {
    const user = userEvent.setup()
    render(<GiftTaxPlanningConfiguration />)

    await expandCard(user)

    const enableSwitch = screen.getByRole('switch', {
      name: /Schenkungssteuer-Planung aktivieren/i,
    })
    await user.click(enableSwitch)

    expect(screen.getByText('Steuerersparnis')).toBeInTheDocument()
    expect(screen.getByText('Steuer bei Optimierung')).toBeInTheDocument()
    expect(screen.getByText('Netto beim Beschenkten')).toBeInTheDocument()
  })

  it('should show educational hints', async () => {
    const user = userEvent.setup()
    render(<GiftTaxPlanningConfiguration />)

    await expandCard(user)

    const enableSwitch = screen.getByRole('switch', {
      name: /Schenkungssteuer-Planung aktivieren/i,
    })
    await user.click(enableSwitch)

    expect(screen.getByText(/10-Jahres-Regel/i)).toBeInTheDocument()
    expect(screen.getByText(/Frühe Planung/i)).toBeInTheDocument()
    expect(screen.getByText(/Dokumentation/i)).toBeInTheDocument()
    expect(screen.getByText(/Meldepflicht/i)).toBeInTheDocument()
  })

  it('should hide results when disabled', async () => {
    const user = userEvent.setup()
    render(<GiftTaxPlanningConfiguration />)

    await expandCard(user)

    const enableSwitch = screen.getByRole('switch', {
      name: /Schenkungssteuer-Planung aktivieren/i,
    })

    // Enable
    await user.click(enableSwitch)
    expect(screen.getByText('Empfohlener Schenkungsplan')).toBeInTheDocument()

    // Disable
    await user.click(enableSwitch)
    expect(screen.queryByText('Empfohlener Schenkungsplan')).not.toBeInTheDocument()
  })
})
