import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PercentageSlider } from './PercentageSlider'

describe('PercentageSlider', () => {
  test('renders with provided label and value', () => {
    const onChange = vi.fn()
    render(
      <PercentageSlider
        label="Test Slider"
        value={0.5}
        onChange={onChange}
        min={0}
        max={100}
        step={1}
        helpText="This is a test slider"
      />,
    )

    expect(screen.getByText('Test Slider')).toBeInTheDocument()
    expect(screen.getByText('50.0%')).toBeInTheDocument()
    expect(screen.getByText('This is a test slider')).toBeInTheDocument()
  })

  test('displays correct min and max labels', () => {
    const onChange = vi.fn()
    render(
      <PercentageSlider
        label="Test Slider"
        value={0.5}
        onChange={onChange}
        min={20}
        max={80}
        step={1}
        helpText="Test"
      />,
    )

    expect(screen.getByText('20%')).toBeInTheDocument()
    expect(screen.getByText('80%')).toBeInTheDocument()
  })

  test('formats value with custom decimals', () => {
    const onChange = vi.fn()
    render(
      <PercentageSlider
        label="Test Slider"
        value={0.555}
        onChange={onChange}
        min={0}
        max={100}
        step={0.1}
        helpText="Test"
        decimals={0}
      />,
    )

    expect(screen.getByText('56%')).toBeInTheDocument()
  })

  test('renders slider with correct attributes', () => {
    const onChange = vi.fn()

    render(
      <PercentageSlider
        label="Test Slider"
        value={0.5}
        onChange={onChange}
        min={0}
        max={100}
        step={1}
        helpText="Test"
      />,
    )

    const slider = screen.getByRole('slider')
    expect(slider).toBeInTheDocument()
  })

  test('renders slider with correct min, max, and step attributes', () => {
    const onChange = vi.fn()
    render(
      <PercentageSlider
        label="Test Slider"
        value={0.5}
        onChange={onChange}
        min={10}
        max={90}
        step={5}
        helpText="Test"
      />,
    )

    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-valuemin', '10')
    expect(slider).toHaveAttribute('aria-valuemax', '90')
  })
})
