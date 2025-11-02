import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ChartAxesAndGrid } from './ChartAxesAndGrid'
import { AreaChart } from 'recharts'

describe('ChartAxesAndGrid', () => {
  const formatYAxisTick = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M €`
    }
    else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k €`
    }
    return `${value} €`
  }

  it('should render axes and grid components', () => {
    const { container } = render(
      <AreaChart width={500} height={300} data={[]}>
        <ChartAxesAndGrid
          xAxisAngle={0}
          xAxisTextAnchor="middle"
          xAxisHeight={30}
          formatYAxisTick={formatYAxisTick}
        />
      </AreaChart>,
    )

    // Check that CartesianGrid is rendered
    const grid = container.querySelector('.recharts-cartesian-grid')
    expect(grid).toBeInTheDocument()
  })

  it('should render with angled x-axis configuration', () => {
    const { container } = render(
      <AreaChart width={500} height={300} data={[]}>
        <ChartAxesAndGrid
          xAxisAngle={-45}
          xAxisTextAnchor="end"
          xAxisHeight={60}
          formatYAxisTick={formatYAxisTick}
        />
      </AreaChart>,
    )

    // Check that the component renders
    expect(container.querySelector('.recharts-cartesian-grid')).toBeInTheDocument()
  })
})
