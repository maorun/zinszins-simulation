/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BenchmarkConfiguration } from './BenchmarkConfiguration'
import type { BenchmarkConfig } from '../../helpers/benchmark'

describe('BenchmarkConfiguration', () => {
  const defaultConfig: BenchmarkConfig = {
    enabled: false,
    benchmarkType: 'msci-world',
    customAnnualReturn: 0.07,
    customName: 'Benutzerdefinierter Benchmark',
  }

  const onBenchmarkConfigChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the component collapsed by default', () => {
    render(<BenchmarkConfiguration benchmarkConfig={defaultConfig} onBenchmarkConfigChange={onBenchmarkConfigChange} />)

    expect(screen.getByText('📊 Benchmark-Vergleich')).toBeInTheDocument()
    // The switch should not be visible when collapsed
    expect(screen.queryByRole('switch')).not.toBeInTheDocument()
  })

  it('should expand and show configuration when clicked', () => {
    render(<BenchmarkConfiguration benchmarkConfig={defaultConfig} onBenchmarkConfigChange={onBenchmarkConfigChange} />)

    const trigger = screen.getByText('📊 Benchmark-Vergleich')
    fireEvent.click(trigger)

    expect(screen.getByRole('switch')).toBeInTheDocument()
    expect(screen.getByText('Benchmark-Vergleich aktivieren')).toBeInTheDocument()
  })

  it('should show benchmark name when enabled', () => {
    const enabledConfig: BenchmarkConfig = {
      ...defaultConfig,
      enabled: true,
    }

    render(<BenchmarkConfiguration benchmarkConfig={enabledConfig} onBenchmarkConfigChange={onBenchmarkConfigChange} />)

    expect(screen.getByText(/MSCI World/)).toBeInTheDocument()
  })

  it('should toggle enabled state when switch is clicked', () => {
    render(<BenchmarkConfiguration benchmarkConfig={defaultConfig} onBenchmarkConfigChange={onBenchmarkConfigChange} />)

    // Expand the section
    const trigger = screen.getByText('📊 Benchmark-Vergleich')
    fireEvent.click(trigger)

    // Click the switch
    const switchElement = screen.getByRole('switch')
    fireEvent.click(switchElement)

    expect(onBenchmarkConfigChange).toHaveBeenCalledWith({
      ...defaultConfig,
      enabled: true,
    })
  })

  it('should show benchmark selection options when enabled', () => {
    const enabledConfig: BenchmarkConfig = {
      ...defaultConfig,
      enabled: true,
    }

    render(<BenchmarkConfiguration benchmarkConfig={enabledConfig} onBenchmarkConfigChange={onBenchmarkConfigChange} />)

    // Expand the section
    const trigger = screen.getByText('📊 Benchmark-Vergleich')
    fireEvent.click(trigger)

    expect(screen.getByLabelText(/MSCI World/)).toBeInTheDocument()
    expect(screen.getByLabelText(/DAX/)).toBeInTheDocument()
    expect(screen.getByLabelText(/MSCI ACWI/)).toBeInTheDocument()
    expect(screen.getByLabelText(/S&P 500/)).toBeInTheDocument()
    expect(screen.getByLabelText(/STOXX Europe 600/)).toBeInTheDocument()
    expect(screen.getByLabelText(/MSCI Emerging Markets/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Benutzerdefiniert/)).toBeInTheDocument()
  })

  it('should change benchmark type when radio button is selected', () => {
    const enabledConfig: BenchmarkConfig = {
      ...defaultConfig,
      enabled: true,
    }

    render(<BenchmarkConfiguration benchmarkConfig={enabledConfig} onBenchmarkConfigChange={onBenchmarkConfigChange} />)

    // Expand the section
    const trigger = screen.getByText('📊 Benchmark-Vergleich')
    fireEvent.click(trigger)

    // Select DAX
    const daxRadio = screen.getByLabelText(/DAX/)
    fireEvent.click(daxRadio)

    expect(onBenchmarkConfigChange).toHaveBeenCalledWith({
      ...enabledConfig,
      benchmarkType: 'dax',
    })
  })

  it('should show custom configuration fields when custom benchmark is selected', () => {
    const customConfig: BenchmarkConfig = {
      enabled: true,
      benchmarkType: 'custom',
      customAnnualReturn: 0.08,
      customName: 'My Custom Benchmark',
    }

    render(<BenchmarkConfiguration benchmarkConfig={customConfig} onBenchmarkConfigChange={onBenchmarkConfigChange} />)

    // Expand the section
    const trigger = screen.getByText('📊 Benchmark-Vergleich')
    fireEvent.click(trigger)

    expect(screen.getByLabelText(/Benchmark-Name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Jährliche Rendite/)).toBeInTheDocument()
  })

  it('should update custom name when input changes', () => {
    const customConfig: BenchmarkConfig = {
      enabled: true,
      benchmarkType: 'custom',
      customAnnualReturn: 0.08,
      customName: 'My Custom Benchmark',
    }

    render(<BenchmarkConfiguration benchmarkConfig={customConfig} onBenchmarkConfigChange={onBenchmarkConfigChange} />)

    // Expand the section
    const trigger = screen.getByText('📊 Benchmark-Vergleich')
    fireEvent.click(trigger)

    const nameInput = screen.getByLabelText(/Benchmark-Name/) as HTMLInputElement
    fireEvent.change(nameInput, { target: { value: 'New Name' } })

    expect(onBenchmarkConfigChange).toHaveBeenCalledWith({
      ...customConfig,
      customName: 'New Name',
    })
  })

  it('should update custom return when input changes', () => {
    const customConfig: BenchmarkConfig = {
      enabled: true,
      benchmarkType: 'custom',
      customAnnualReturn: 0.08,
      customName: 'My Custom Benchmark',
    }

    render(<BenchmarkConfiguration benchmarkConfig={customConfig} onBenchmarkConfigChange={onBenchmarkConfigChange} />)

    // Expand the section
    const trigger = screen.getByText('📊 Benchmark-Vergleich')
    fireEvent.click(trigger)

    const returnInput = screen.getByLabelText(/Jährliche Rendite/) as HTMLInputElement
    fireEvent.change(returnInput, { target: { value: '10.5' } })

    expect(onBenchmarkConfigChange).toHaveBeenCalledWith({
      ...customConfig,
      customAnnualReturn: 0.105, // 10.5% as decimal
    })
  })

  it('should display validation errors for invalid custom configuration', () => {
    const invalidConfig: BenchmarkConfig = {
      enabled: true,
      benchmarkType: 'custom',
      // Missing customAnnualReturn
    }

    render(<BenchmarkConfiguration benchmarkConfig={invalidConfig} onBenchmarkConfigChange={onBenchmarkConfigChange} />)

    // Expand the section
    const trigger = screen.getByText('📊 Benchmark-Vergleich')
    fireEvent.click(trigger)

    expect(screen.getByText(/Konfigurationsfehler/)).toBeInTheDocument()
    expect(screen.getByText(/Benutzerdefinierte Rendite muss angegeben werden/)).toBeInTheDocument()
  })

  it('should show historical data information for standard benchmarks', () => {
    const enabledConfig: BenchmarkConfig = {
      enabled: true,
      benchmarkType: 'dax',
    }

    render(<BenchmarkConfiguration benchmarkConfig={enabledConfig} onBenchmarkConfigChange={onBenchmarkConfigChange} />)

    // Expand the section
    const trigger = screen.getByText('📊 Benchmark-Vergleich')
    fireEvent.click(trigger)

    expect(screen.getByText(/Historische Daten/)).toBeInTheDocument()
    expect(screen.getByText(/2000-2023/)).toBeInTheDocument()
  })

  it('should not show historical data information for custom benchmark', () => {
    const customConfig: BenchmarkConfig = {
      enabled: true,
      benchmarkType: 'custom',
      customAnnualReturn: 0.08,
      customName: 'Custom',
    }

    render(<BenchmarkConfiguration benchmarkConfig={customConfig} onBenchmarkConfigChange={onBenchmarkConfigChange} />)

    // Expand the section
    const trigger = screen.getByText('📊 Benchmark-Vergleich')
    fireEvent.click(trigger)

    expect(screen.queryByText(/Historische Daten/)).not.toBeInTheDocument()
  })

  it('should hide benchmark selection when disabled', () => {
    const disabledConfig: BenchmarkConfig = {
      ...defaultConfig,
      enabled: false,
    }

    render(
      <BenchmarkConfiguration benchmarkConfig={disabledConfig} onBenchmarkConfigChange={onBenchmarkConfigChange} />,
    )

    // Expand the section
    const trigger = screen.getByText('📊 Benchmark-Vergleich')
    fireEvent.click(trigger)

    // Benchmark selection should not be visible
    expect(screen.queryByLabelText(/MSCI World/)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/DAX/)).not.toBeInTheDocument()
  })
})
