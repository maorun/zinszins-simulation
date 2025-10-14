import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { IncomeTaxSection } from './IncomeTaxSection'

describe('IncomeTaxSection', () => {
  const mockOnCalculationInfoClick = vi.fn()

  beforeEach(() => {
    mockOnCalculationInfoClick.mockClear()
  })

  test('renders nothing when Grundfreibetrag is not enabled', () => {
    const { container } = render(
      <IncomeTaxSection
        rowData={{
          einkommensteuer: 200,
          genutzterGrundfreibetrag: 10908,
        }}
        isGrundfreibetragEnabled={false}
        onCalculationInfoClick={mockOnCalculationInfoClick}
      />,
    )

    expect(container.firstChild).toBeNull()
  })

  test('renders income tax when Grundfreibetrag is enabled', () => {
    const { container } = render(
      <IncomeTaxSection
        rowData={{
          einkommensteuer: 200,
          genutzterGrundfreibetrag: 10908,
        }}
        isGrundfreibetragEnabled={true}
        onCalculationInfoClick={mockOnCalculationInfoClick}
      />,
    )

    expect(screen.getByText(/🏛️ Einkommensteuer:/)).toBeInTheDocument()
    expect(screen.getByText(/200,00 €/)).toBeInTheDocument()

    // Test info icon click
    const infoIcons = container.querySelectorAll('svg.lucide-info')
    expect(infoIcons.length).toBeGreaterThan(0)
    fireEvent.click(infoIcons[0])
    expect(mockOnCalculationInfoClick).toHaveBeenCalledWith('incomeTax', expect.any(Object))
  })

  test('renders Grundfreibetrag when enabled', () => {
    const { container } = render(
      <IncomeTaxSection
        rowData={{
          einkommensteuer: 200,
          genutzterGrundfreibetrag: 10908,
        }}
        isGrundfreibetragEnabled={true}
        onCalculationInfoClick={mockOnCalculationInfoClick}
      />,
    )

    expect(screen.getByText(/🆓 Grundfreibetrag:/)).toBeInTheDocument()
    expect(screen.getByText(/10\.908,00 €/)).toBeInTheDocument()

    // Test info icon click for Grundfreibetrag
    const infoIcons = container.querySelectorAll('svg.lucide-info')
    expect(infoIcons.length).toBeGreaterThan(1)
    fireEvent.click(infoIcons[1])
    expect(mockOnCalculationInfoClick).toHaveBeenCalledWith('incomeTax', expect.any(Object))
  })

  test('does not render income tax when undefined', () => {
    render(
      <IncomeTaxSection
        rowData={{
          genutzterGrundfreibetrag: 10908,
        }}
        isGrundfreibetragEnabled={true}
        onCalculationInfoClick={mockOnCalculationInfoClick}
      />,
    )

    expect(screen.queryByText(/🏛️ Einkommensteuer:/)).not.toBeInTheDocument()
    expect(screen.getByText(/🆓 Grundfreibetrag:/)).toBeInTheDocument()
  })

  test('does not render Grundfreibetrag when undefined', () => {
    render(
      <IncomeTaxSection
        rowData={{
          einkommensteuer: 200,
        }}
        isGrundfreibetragEnabled={true}
        onCalculationInfoClick={mockOnCalculationInfoClick}
      />,
    )

    expect(screen.getByText(/🏛️ Einkommensteuer:/)).toBeInTheDocument()
    expect(screen.queryByText(/🆓 Grundfreibetrag:/)).not.toBeInTheDocument()
  })

  test('renders both income tax and Grundfreibetrag when both are available', () => {
    render(
      <IncomeTaxSection
        rowData={{
          einkommensteuer: 200,
          genutzterGrundfreibetrag: 10908,
        }}
        isGrundfreibetragEnabled={true}
        onCalculationInfoClick={mockOnCalculationInfoClick}
      />,
    )

    expect(screen.getByText(/🏛️ Einkommensteuer:/)).toBeInTheDocument()
    expect(screen.getByText(/🆓 Grundfreibetrag:/)).toBeInTheDocument()
  })
})
