import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ComparisonTableBaseRow } from './ComparisonTableBaseRow'

describe('ComparisonTableBaseRow', () => {
  it('renders base strategy data correctly', () => {
    const { container } = render(
      <table>
        <tbody>
          <ComparisonTableBaseRow
            baseStrategyName="4% Regel"
            baseStrategyRendite={5}
            baseStrategyEndkapital={498000}
            baseStrategyAverageWithdrawal={20400}
            baseStrategyDuration="25 Jahre"
          />
        </tbody>
      </table>,
    )

    const cells = container.querySelectorAll('td')
    expect(cells).toHaveLength(5)

    // Check strategy name with emoji and (Basis) suffix
    expect(cells[0]).toHaveTextContent('📊 4% Regel (Basis)')

    // Check rendite
    expect(cells[1]).toHaveTextContent('5%')

    // Check formatted capital
    expect(cells[2]).toHaveTextContent('498.000,00 €')

    // Check formatted average withdrawal
    expect(cells[3]).toHaveTextContent('20.400,00 €')

    // Check duration
    expect(cells[4]).toHaveTextContent('25 Jahre')
  })

  it('applies correct styling to base row', () => {
    const { container } = render(
      <table>
        <tbody>
          <ComparisonTableBaseRow
            baseStrategyName="Test"
            baseStrategyRendite={5}
            baseStrategyEndkapital={100000}
            baseStrategyAverageWithdrawal={5000}
            baseStrategyDuration="20 Jahre"
          />
        </tbody>
      </table>,
    )

    const row = container.querySelector('tr')
    expect(row).toHaveClass('bg-[#f8f9ff]')
    expect(row).toHaveClass('font-bold')
  })

  it('formats currency values correctly', () => {
    const { container } = render(
      <table>
        <tbody>
          <ComparisonTableBaseRow
            baseStrategyName="Test"
            baseStrategyRendite={6.5}
            baseStrategyEndkapital={1234567.89}
            baseStrategyAverageWithdrawal={45678.90}
            baseStrategyDuration="15 Jahre"
          />
        </tbody>
      </table>,
    )

    const cells = container.querySelectorAll('td')

    // Check formatted values
    expect(cells[2]).toHaveTextContent('1.234.567,89 €')
    expect(cells[3]).toHaveTextContent('45.678,90 €')
  })

  it('handles unlimited duration', () => {
    const { container } = render(
      <table>
        <tbody>
          <ComparisonTableBaseRow
            baseStrategyName="Conservative"
            baseStrategyRendite={3}
            baseStrategyEndkapital={500000}
            baseStrategyAverageWithdrawal={15000}
            baseStrategyDuration="unbegrenzt"
          />
        </tbody>
      </table>,
    )

    const cells = container.querySelectorAll('td')
    expect(cells[4]).toHaveTextContent('unbegrenzt')
  })
})
