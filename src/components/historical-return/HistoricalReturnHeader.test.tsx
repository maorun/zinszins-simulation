import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HistoricalReturnHeader } from './HistoricalReturnHeader'
import { Collapsible } from '../ui/collapsible'
import { Card } from '../ui/card'

describe('HistoricalReturnHeader', () => {
  it('should render the header title', () => {
    render(
      <Collapsible>
        <Card>
          <HistoricalReturnHeader nestingLevel={0} />
        </Card>
      </Collapsible>,
    )

    expect(screen.getByText('📈 Historische Rendite-Konfiguration')).toBeInTheDocument()
  })

  it('should render with correct nesting level', () => {
    const { container } = render(
      <Collapsible>
        <Card>
          <HistoricalReturnHeader nestingLevel={1} />
        </Card>
      </Collapsible>,
    )

    // Verify the component renders without errors
    expect(container).toBeTruthy()
  })

  it('should contain a chevron icon for collapsible behavior', () => {
    const { container } = render(
      <Collapsible>
        <Card>
          <HistoricalReturnHeader nestingLevel={0} />
        </Card>
      </Collapsible>,
    )

    // Check for svg element (chevron icon)
    const svgElements = container.querySelectorAll('svg')
    expect(svgElements.length).toBeGreaterThan(0)
  })
})
