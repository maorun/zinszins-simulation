import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ESGFilterConfiguration } from './ESGFilterConfiguration'
import { createDefaultESGFilterConfig } from '../../helpers/esg-scoring'
import { TooltipProvider } from './ui/tooltip'

// Wrapper component for tests
function renderESGFilterConfiguration(config = createDefaultESGFilterConfig(), onConfigChange = vi.fn()) {
  return render(
    <TooltipProvider>
      <ESGFilterConfiguration config={config} onConfigChange={onConfigChange} />
    </TooltipProvider>,
  )
}

describe('ESGFilterConfiguration', () => {
  it('should render component with title', () => {
    renderESGFilterConfiguration()

    expect(screen.getByText(/ESG-Filter \(Nachhaltigkeits-Filter\)/)).toBeInTheDocument()
    expect(screen.getByText(/Nachhaltigkeitskriterien nach EU-Standards/)).toBeInTheDocument()
  })

  it('should render enable/disable switch', () => {
    renderESGFilterConfiguration()

    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeInTheDocument()
    expect(switchElement).not.toBeChecked()
  })

  it('should call onConfigChange when enabling filter', () => {
    const onConfigChange = vi.fn()
    renderESGFilterConfiguration(createDefaultESGFilterConfig(), onConfigChange)

    const switchElement = screen.getByRole('switch')
    fireEvent.click(switchElement)

    expect(onConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
      }),
    )
  })

  it('should hide configuration options when disabled', () => {
    const disabledConfig = { ...createDefaultESGFilterConfig(), enabled: false }
    renderESGFilterConfiguration(disabledConfig)

    expect(screen.queryByText('Minimaler Gesamt-ESG-Score')).not.toBeInTheDocument()
  })

  it('should show configuration options when enabled', () => {
    const enabledConfig = { ...createDefaultESGFilterConfig(), enabled: true }
    renderESGFilterConfiguration(enabledConfig)

    expect(screen.getByText('Minimaler Gesamt-ESG-Score')).toBeInTheDocument()
    expect(screen.getByText(/Umwelt \(Environmental\)/)).toBeInTheDocument()
    expect(screen.getByText(/Soziales \(Social\)/)).toBeInTheDocument()
    expect(screen.getByText(/Unternehmensführung \(Governance\)/)).toBeInTheDocument()
  })

  it('should display current minimum overall score', () => {
    const config = { ...createDefaultESGFilterConfig(), enabled: true, minimumOverallScore: 7.5 }
    renderESGFilterConfiguration(config)

    expect(screen.getByText('7.5 / 10')).toBeInTheDocument()
  })

  it('should display current weight percentages', () => {
    const config = {
      ...createDefaultESGFilterConfig(),
      enabled: true,
      environmentalWeight: 0.4,
      socialWeight: 0.3,
      governanceWeight: 0.3,
    }
    renderESGFilterConfiguration(config)

    expect(screen.getByText('40%')).toBeInTheDocument()
    expect(screen.getAllByText('30%')).toHaveLength(2) // Social and Governance
  })

  it('should show information about ESG criteria', () => {
    const enabledConfig = { ...createDefaultESGFilterConfig(), enabled: true }
    renderESGFilterConfiguration(enabledConfig)

    expect(screen.getByText(/Klimaschutz, Ressourcennutzung/)).toBeInTheDocument()
    expect(screen.getByText(/Arbeitsbedingungen, Gemeinwohl/)).toBeInTheDocument()
    expect(screen.getByText(/Unternehmensführung, Ethik/)).toBeInTheDocument()
  })

  it('should render sliders for all weight configurations', () => {
    const enabledConfig = { ...createDefaultESGFilterConfig(), enabled: true }
    renderESGFilterConfiguration(enabledConfig)

    const sliders = screen.getAllByRole('slider')
    // 1 for overall score, 3 for weights = 4 sliders minimum
    expect(sliders.length).toBeGreaterThanOrEqual(4)
  })

  it('should show "Nicht gesetzt" for undefined pillar thresholds', () => {
    const config = {
      ...createDefaultESGFilterConfig(),
      enabled: true,
      minimumEnvironmentalScore: undefined,
      minimumSocialScore: undefined,
      minimumGovernanceScore: undefined,
    }
    renderESGFilterConfiguration(config)

    const nichtGesetztElements = screen.getAllByText('Nicht gesetzt')
    expect(nichtGesetztElements.length).toBeGreaterThan(0)
  })

  it('should show threshold values when set', () => {
    const config = {
      ...createDefaultESGFilterConfig(),
      enabled: true,
      minimumEnvironmentalScore: 7.0,
      minimumSocialScore: 8.0,
      minimumGovernanceScore: 6.5,
    }
    renderESGFilterConfiguration(config)

    expect(screen.getByText('7.0 / 10')).toBeInTheDocument()
    expect(screen.getByText('8.0 / 10')).toBeInTheDocument()
    expect(screen.getByText('6.5 / 10')).toBeInTheDocument()
  })

  it('should show "Schwellenwert hinzufügen" buttons for unset thresholds', () => {
    const config = {
      ...createDefaultESGFilterConfig(),
      enabled: true,
      minimumEnvironmentalScore: undefined,
    }
    renderESGFilterConfiguration(config)

    const addButtons = screen.getAllByText('Schwellenwert hinzufügen')
    expect(addButtons.length).toBeGreaterThan(0)
  })

  it('should show "Entfernen" buttons for set thresholds', () => {
    const config = {
      ...createDefaultESGFilterConfig(),
      enabled: true,
      minimumEnvironmentalScore: 7.0,
    }
    renderESGFilterConfiguration(config)

    const removeButtons = screen.getAllByText('Entfernen')
    expect(removeButtons.length).toBeGreaterThan(0)
  })

  it('should call onConfigChange when adding a pillar threshold', () => {
    const onConfigChange = vi.fn()
    const config = {
      ...createDefaultESGFilterConfig(),
      enabled: true,
      minimumEnvironmentalScore: undefined,
    }
    renderESGFilterConfiguration(config, onConfigChange)

    const addButton = screen.getAllByText('Schwellenwert hinzufügen')[0]
    fireEvent.click(addButton)

    expect(onConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({
        minimumEnvironmentalScore: 5,
      }),
    )
  })

  it('should call onConfigChange when removing a pillar threshold', () => {
    const onConfigChange = vi.fn()
    const config = {
      ...createDefaultESGFilterConfig(),
      enabled: true,
      minimumEnvironmentalScore: 7.0,
    }
    renderESGFilterConfiguration(config, onConfigChange)

    const removeButton = screen.getAllByText('Entfernen')[0]
    fireEvent.click(removeButton)

    expect(onConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({
        minimumEnvironmentalScore: undefined,
      }),
    )
  })

  it('should render EU standards information box', () => {
    const enabledConfig = { ...createDefaultESGFilterConfig(), enabled: true }
    renderESGFilterConfiguration(enabledConfig)

    expect(screen.getByText(/EU-Taxonomie und SFDR/)).toBeInTheDocument()
  })

  it('should warn about diversification trade-offs', () => {
    const enabledConfig = { ...createDefaultESGFilterConfig(), enabled: true }
    renderESGFilterConfiguration(enabledConfig)

    expect(screen.getByText(/Diversifikation und erwartete Rendite beeinflussen/)).toBeInTheDocument()
  })

  it('should render description about SFDR compliance', () => {
    renderESGFilterConfiguration()

    expect(screen.getByText(/SFDR/)).toBeInTheDocument()
  })

  it('should have accessible labels for all form controls', () => {
    const enabledConfig = { ...createDefaultESGFilterConfig(), enabled: true }
    renderESGFilterConfiguration(enabledConfig)

    expect(screen.getByText('ESG-Filter aktivieren')).toBeInTheDocument()
    expect(screen.getByText('Minimaler Gesamt-ESG-Score')).toBeInTheDocument()
  })

  it('should generate unique IDs for form elements', () => {
    const enabledConfig = { ...createDefaultESGFilterConfig(), enabled: true }
    const { container } = renderESGFilterConfiguration(enabledConfig)

    const switchElement = container.querySelector('button[role="switch"]')
    expect(switchElement).toHaveAttribute('id')

    const sliders = container.querySelectorAll('[role="slider"]')
    sliders.forEach((slider) => {
      expect(slider).toHaveAttribute('id')
    })
  })
})
