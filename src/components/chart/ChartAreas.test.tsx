import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ChartAreas } from './ChartAreas'
import { AreaChart } from 'recharts'

describe('ChartAreas', () => {
  const mockData = [
    { year: 2023, kumulativeEinzahlungen: 10000, zinsen: 500 },
    { year: 2024, kumulativeEinzahlungen: 20000, zinsen: 1050 },
  ]

  it('should render area components for nominal values', () => {
    const { container } = render(
      <AreaChart width={500} height={300} data={mockData}>
        <ChartAreas zinsenKey="zinsen" zinsenLabel="Zinsen/Gewinne" />
      </AreaChart>,
    )

    // Check that areas are rendered
    const areas = container.querySelectorAll('.recharts-area')
    expect(areas.length).toBeGreaterThan(0)
  })

  it('should render area components for inflation-adjusted values', () => {
    const mockDataWithReal = [
      { year: 2023, kumulativeEinzahlungen: 10000, zinsenReal: 450 },
      { year: 2024, kumulativeEinzahlungen: 20000, zinsenReal: 950 },
    ]

    const { container } = render(
      <AreaChart width={500} height={300} data={mockDataWithReal}>
        <ChartAreas zinsenKey="zinsenReal" zinsenLabel="Zinsen/Gewinne (real)" />
      </AreaChart>,
    )

    // Check that areas are rendered
    const areas = container.querySelectorAll('.recharts-area')
    expect(areas.length).toBeGreaterThan(0)
  })
})
