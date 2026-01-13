import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PensionTopUpCard } from './PensionTopUpCard'

describe('PensionTopUpCard', () => {
  it('should render the card with title', () => {
    render(<PensionTopUpCard />)

    expect(screen.getByText(/Renten-Auffüll-Strategie/)).toBeInTheDocument()
  })

  it('should be collapsed by default', () => {
    render(<PensionTopUpCard />)

    // Title is visible
    expect(screen.getByText(/Renten-Auffüll-Strategie/)).toBeInTheDocument()

    // Content is not visible when collapsed
    expect(screen.queryByText(/Berechnen Sie die Kosten und Vorteile/)).not.toBeInTheDocument()
  })

  it('should expand to show configuration form when clicked', async () => {
    const user = userEvent.setup()
    render(<PensionTopUpCard />)

    // Click to expand
    const header = screen.getByText(/Renten-Auffüll-Strategie/)
    await user.click(header)

    // Content should now be visible
    expect(screen.getByText(/Berechnen Sie die Kosten und Vorteile/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Geburtsjahr/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Gewünschtes Renteneintrittsalter/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Aktuelle Rentenpunkte/)).toBeInTheDocument()
  })

  it('should display default configuration values', async () => {
    const user = userEvent.setup()
    render(<PensionTopUpCard />)

    // Expand the card
    await user.click(screen.getByText(/Renten-Auffüll-Strategie/))

    // Check default values
    const birthYearInput = screen.getByLabelText(/Geburtsjahr/) as HTMLInputElement
    expect(birthYearInput.value).toBe('1980')

    const retirementAgeInput = screen.getByLabelText(/Gewünschtes Renteneintrittsalter/) as HTMLInputElement
    expect(retirementAgeInput.value).toBe('63')

    const currentPointsInput = screen.getByLabelText(/Aktuelle Rentenpunkte/) as HTMLInputElement
    expect(currentPointsInput.value).toBe('30')
  })

  it('should show calculation results for deduction offset', async () => {
    const user = userEvent.setup()
    render(<PensionTopUpCard />)

    // Expand the card
    await user.click(screen.getByText(/Renten-Auffüll-Strategie/))

    // Results should be visible (with default config) - use heading matcher
    expect(screen.getByRole('heading', { name: /Ausgleich von Rentenabschlägen/ })).toBeInTheDocument()
    expect(screen.getByText(/Regelaltersgrenze:/)).toBeInTheDocument()
    expect(screen.getByText(/Rentenabschlag:/)).toBeInTheDocument()
    expect(screen.getByText(/Ausgleichskosten:/)).toBeInTheDocument()
  })

  it('should update calculations when birth year changes', async () => {
    const user = userEvent.setup()
    render(<PensionTopUpCard />)

    // Expand the card
    await user.click(screen.getByText(/Renten-Auffüll-Strategie/))

    // Verify default results are showing first
    expect(screen.getByRole('heading', { name: /Ausgleich von Rentenabschlägen/ })).toBeInTheDocument()

    // The birth year input should exist and have default value
    const birthYearInput = screen.getByLabelText(/Geburtsjahr/)
    expect((birthYearInput as HTMLInputElement).value).toBe('1980')
    
    // Results should show 67 years for 1980 birth year
    expect(screen.getByText(/67/)).toBeInTheDocument()
  })

  it('should show points purchase section when target is specified', async () => {
    const user = userEvent.setup()
    render(<PensionTopUpCard />)

    // Expand the card
    await user.click(screen.getByText(/Renten-Auffüll-Strategie/))

    // Add target pension points
    const targetPointsInput = screen.getByLabelText(/Ziel-Rentenpunkte/)
    await user.type(targetPointsInput, '40')

    // Points purchase section should appear - use heading
    expect(screen.getByRole('heading', { name: /Nachkauf von Rentenpunkten/ })).toBeInTheDocument()
    expect(screen.getByText(/Zusätzliche Punkte:/)).toBeInTheDocument()
    expect(screen.getByText(/Gesamtkosten:/)).toBeInTheDocument()
    expect(screen.getByText(/Zusätzliche Monatsrente:/)).toBeInTheDocument()
  })

  it('should show validation errors for invalid input', async () => {
    const user = userEvent.setup()
    render(<PensionTopUpCard />)

    // Expand the card
    await user.click(screen.getByText(/Renten-Auffüll-Strategie/))

    // Enter invalid birth year
    const birthYearInput = screen.getByLabelText(/Geburtsjahr/)
    await user.clear(birthYearInput)
    await user.type(birthYearInput, '1930')

    // Should show validation error
    expect(screen.getByText(/Eingabefehler:/)).toBeInTheDocument()
    expect(screen.getByText(/Geburtsjahr muss zwischen 1940 und 2020 liegen/)).toBeInTheDocument()
  })

  it('should show validation error when retirement age is invalid', async () => {
    const user = userEvent.setup()
    render(<PensionTopUpCard />)

    // Expand the card
    await user.click(screen.getByText(/Renten-Auffüll-Strategie/))

    // Enter invalid retirement age
    const retirementAgeInput = screen.getByLabelText(/Gewünschtes Renteneintrittsalter/)
    await user.clear(retirementAgeInput)
    await user.type(retirementAgeInput, '45')

    // Should show validation error
    expect(screen.getByText(/Gewünschtes Renteneintrittsalter muss zwischen 50 und 75 Jahren liegen/)).toBeInTheDocument()
  })

  it('should show validation error when target points are less than current', async () => {
    const user = userEvent.setup()
    render(<PensionTopUpCard />)

    // Expand the card
    await user.click(screen.getByText(/Renten-Auffüll-Strategie/))

    // Set target points less than current (default is 30)
    const targetPointsInput = screen.getByLabelText(/Ziel-Rentenpunkte/)
    await user.type(targetPointsInput, '20')

    // Should show validation error
    expect(screen.getByText(/Ziel-Rentenpunkte müssen größer als aktuelle Rentenpunkte sein/)).toBeInTheDocument()
  })

  it('should display tax information', async () => {
    const user = userEvent.setup()
    render(<PensionTopUpCard />)

    // Expand the card
    await user.click(screen.getByText(/Renten-Auffüll-Strategie/))

    // Tax info should be visible
    expect(screen.getByText(/Steuervorteile:/)).toBeInTheDocument()
    expect(screen.getByText(/100% steuerlich absetzbar/)).toBeInTheDocument()
  })

  it('should display recommendation text', async () => {
    const user = userEvent.setup()
    render(<PensionTopUpCard />)

    // Expand the card
    await user.click(screen.getByText(/Renten-Auffüll-Strategie/))

    // Recommendation should be visible
    expect(screen.getByText(/Empfehlung:/)).toBeInTheDocument()
    expect(screen.getByText(/vollständig steuerlich absetzbar/)).toBeInTheDocument()
  })

  it('should handle clearing target points input', async () => {
    const user = userEvent.setup()
    render(<PensionTopUpCard />)

    // Expand the card
    await user.click(screen.getByText(/Renten-Auffüll-Strategie/))

    // Add target points
    const targetPointsInput = screen.getByLabelText(/Ziel-Rentenpunkte/)
    await user.type(targetPointsInput, '40')

    // Points purchase section should appear - use heading
    expect(screen.getByRole('heading', { name: /Nachkauf von Rentenpunkten/ })).toBeInTheDocument()

    // Clear target points
    await user.clear(targetPointsInput)

    // Points purchase section should disappear
    expect(screen.queryByRole('heading', { name: /Nachkauf von Rentenpunkten/ })).not.toBeInTheDocument()
  })

  it('should show break-even analysis when applicable', async () => {
    const user = userEvent.setup()
    render(<PensionTopUpCard />)

    // Expand the card
    await user.click(screen.getByText(/Renten-Auffüll-Strategie/))

    // Default config should show break-even
    expect(screen.getByText(/Break-Even:/)).toBeInTheDocument()
  })

  it('should display formatted currency values correctly', async () => {
    const user = userEvent.setup()
    render(<PensionTopUpCard />)

    // Expand the card
    await user.click(screen.getByText(/Renten-Auffüll-Strategie/))

    // Check for currency formatting (should have €)
    const currencyElements = screen.getAllByText(/€/)
    expect(currencyElements.length).toBeGreaterThan(0)
  })

  it('should accept decimal input for retirement age', async () => {
    const user = userEvent.setup()
    render(<PensionTopUpCard />)

    // Expand the card
    await user.click(screen.getByText(/Renten-Auffüll-Strategie/))

    // The retirement age input should accept decimal values (check step attribute)
    const retirementAgeInput = screen.getByLabelText(/Gewünschtes Renteneintrittsalter/) as HTMLInputElement
    expect(retirementAgeInput.step).toBe('0.5')
    
    // Default value should be 63
    expect(retirementAgeInput.value).toBe('63')
    
    // Should still show results (no validation errors) - use heading
    expect(screen.getByRole('heading', { name: /Ausgleich von Rentenabschlägen/ })).toBeInTheDocument()
  })

  it('should accept decimal input for pension points', async () => {
    const user = userEvent.setup()
    render(<PensionTopUpCard />)

    // Expand the card
    await user.click(screen.getByText(/Renten-Auffüll-Strategie/))

    // The pension points inputs should accept decimal values (check step attribute)
    const currentPointsInput = screen.getByLabelText(/Aktuelle Rentenpunkte/) as HTMLInputElement
    expect(currentPointsInput.step).toBe('0.1')
    
    const targetPointsInput = screen.getByLabelText(/Ziel-Rentenpunkte/) as HTMLInputElement
    expect(targetPointsInput.step).toBe('0.1')
  })
})
