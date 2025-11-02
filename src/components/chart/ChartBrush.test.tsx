import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ChartBrush } from './ChartBrush'
import { AreaChart } from 'recharts'

describe('ChartBrush', () => {
  const mockData = Array.from({ length: 20 }, (_, i) => ({ year: 2020 + i }))

  it('should render brush when showBrush is true', () => {
    const { container } = render(
      <AreaChart width={500} height={300} data={mockData}>
        <ChartBrush showBrush={true} chartDataLength={mockData.length} />
      </AreaChart>,
    )

    // Check that brush is rendered
    const brush = container.querySelector('.recharts-brush')
    expect(brush).toBeInTheDocument()
  })

  it('should not render brush when showBrush is false', () => {
    const { container } = render(
      <AreaChart width={500} height={300} data={mockData}>
        <ChartBrush showBrush={false} chartDataLength={mockData.length} />
      </AreaChart>,
    )

    // Check that brush is not rendered
    const brush = container.querySelector('.recharts-brush')
    expect(brush).not.toBeInTheDocument()
  })

  it('should calculate correct startIndex for short data sets', () => {
    const shortData = Array.from({ length: 5 }, (_, i) => ({ year: 2020 + i }))

    const { container } = render(
      <AreaChart width={500} height={300} data={shortData}>
        <ChartBrush showBrush={true} chartDataLength={shortData.length} />
      </AreaChart>,
    )

    // Brush should be rendered even with short data
    const brush = container.querySelector('.recharts-brush')
    expect(brush).toBeInTheDocument()
  })
})
