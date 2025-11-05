import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ComparisonTableRow } from './ComparisonTableRow'
import type { ComparisonStrategy } from '../utils/config-storage'

describe('ComparisonTableRow', () => {
  it('renders comparison strategy data correctly', () => {
    const result = {
      strategy: {
        id: '1',
        name: '3% Regel',
        strategie: '3prozent' as const,
        rendite: 4,
      } as ComparisonStrategy,
      finalCapital: 450000,
      totalWithdrawal: 375000,
      averageAnnualWithdrawal: 15000,
      duration: 30,
    }

    const { container } = render(
      <table>
        <tbody>
          <ComparisonTableRow result={result} />
        </tbody>
      </table>,
    )

    const cells = container.querySelectorAll('td')
    expect(cells).toHaveLength(5)

    // Check strategy name
    expect(cells[0]).toHaveTextContent('3% Regel')

    // Check rendite
    expect(cells[1]).toHaveTextContent('4%')

    // Check formatted capital
    expect(cells[2]).toHaveTextContent('450.000,00 €')

    // Check formatted average withdrawal
    expect(cells[3]).toHaveTextContent('15.000,00 €')

    // Check duration
    expect(cells[4]).toHaveTextContent('30 Jahre')
  })

  it('handles numeric duration correctly', () => {
    const result = {
      strategy: {
        id: 'test',
        name: 'Test Strategy',
        strategie: '4prozent' as const,
        rendite: 5,
      } as ComparisonStrategy,
      finalCapital: 500000,
      totalWithdrawal: 400000,
      averageAnnualWithdrawal: 20000,
      duration: 20,
    }

    const { container } = render(
      <table>
        <tbody>
          <ComparisonTableRow result={result} />
        </tbody>
      </table>,
    )

    const cells = container.querySelectorAll('td')
    expect(cells[4]).toHaveTextContent('20 Jahre')
  })

  it('handles string duration correctly', () => {
    const result = {
      strategy: {
        id: 'test',
        name: 'Test Strategy',
        strategie: 'variabel_prozent' as const,
        rendite: 3,
      } as ComparisonStrategy,
      finalCapital: 600000,
      totalWithdrawal: 500000,
      averageAnnualWithdrawal: 18000,
      duration: 'unbegrenzt',
    }

    const { container } = render(
      <table>
        <tbody>
          <ComparisonTableRow result={result} />
        </tbody>
      </table>,
    )

    const cells = container.querySelectorAll('td')
    expect(cells[4]).toHaveTextContent('unbegrenzt')
  })

  it('formats currency values correctly', () => {
    const result = {
      strategy: {
        id: 'test',
        name: 'Test',
        strategie: '4prozent' as const,
        rendite: 5.25,
      } as ComparisonStrategy,
      finalCapital: 987654.32,
      totalWithdrawal: 300000,
      averageAnnualWithdrawal: 23456.78,
      duration: 12,
    }

    const { container } = render(
      <table>
        <tbody>
          <ComparisonTableRow result={result} />
        </tbody>
      </table>,
    )

    const cells = container.querySelectorAll('td')

    // Check formatted values
    expect(cells[2]).toHaveTextContent('987.654,32 €')
    expect(cells[3]).toHaveTextContent('23.456,78 €')
  })

  it('applies correct text alignment to cells', () => {
    const result = {
      strategy: {
        id: 'test',
        name: 'Test',
        strategie: '4prozent' as const,
        rendite: 5,
      } as ComparisonStrategy,
      finalCapital: 500000,
      totalWithdrawal: 400000,
      averageAnnualWithdrawal: 20000,
      duration: 25,
    }

    const { container } = render(
      <table>
        <tbody>
          <ComparisonTableRow result={result} />
        </tbody>
      </table>,
    )

    const cells = container.querySelectorAll('td')

    // First cell (strategy name) should not have text-right class
    expect(cells[0]).not.toHaveClass('text-right')

    // Other cells should be right-aligned
    for (let i = 1; i < cells.length; i++) {
      expect(cells[i]).toHaveClass('text-right')
    }
  })
})
