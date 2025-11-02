import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ChartLines } from './ChartLines'
import { AreaChart } from 'recharts'

describe('ChartLines', () => {
  const mockData = [
    { year: 2023, endkapital: 10000, bezahlteSteuer: 100 },
    { year: 2024, endkapital: 21000, bezahlteSteuer: 200 },
  ]

  it('should render line components with taxes', () => {
    const { container } = render(
      <AreaChart width={500} height={300} data={mockData}>
        <ChartLines
          endkapitalKey="endkapital"
          endkapitalLabel="Endkapital"
          endkapitalDot={false}
          showTaxes={true}
          taxDot={false}
        />
      </AreaChart>,
    )

    // Check that lines are rendered
    const lines = container.querySelectorAll('.recharts-line')
    expect(lines.length).toBeGreaterThan(0)
  })

  it('should render line components without taxes', () => {
    const { container } = render(
      <AreaChart width={500} height={300} data={mockData}>
        <ChartLines
          endkapitalKey="endkapital"
          endkapitalLabel="Endkapital"
          endkapitalDot={false}
          showTaxes={false}
          taxDot={false}
        />
      </AreaChart>,
    )

    // Check that lines are rendered
    const lines = container.querySelectorAll('.recharts-line')
    expect(lines.length).toBeGreaterThan(0)
  })

  it('should render with inflation-adjusted values', () => {
    const mockDataWithReal = [
      { year: 2023, endkapitalReal: 9500, bezahlteSteuer: 100 },
      { year: 2024, endkapitalReal: 19500, bezahlteSteuer: 200 },
    ]

    const { container } = render(
      <AreaChart width={500} height={300} data={mockDataWithReal}>
        <ChartLines
          endkapitalKey="endkapitalReal"
          endkapitalLabel="Endkapital (real)"
          endkapitalDot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
          showTaxes={true}
          taxDot={{ fill: '#f59e0b', strokeWidth: 1, r: 2 }}
        />
      </AreaChart>,
    )

    // Check that lines are rendered
    const lines = container.querySelectorAll('.recharts-line')
    expect(lines.length).toBeGreaterThan(0)
  })
})
