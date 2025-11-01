import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ComparisonTableHeader } from './ComparisonTableHeader'

describe('ComparisonTableHeader', () => {
  it('renders all column headers correctly', () => {
    const { container } = render(
      <table>
        <ComparisonTableHeader />
      </table>,
    )

    const headers = container.querySelectorAll('th')
    expect(headers).toHaveLength(5)
    expect(headers[0]).toHaveTextContent('Strategie')
    expect(headers[1]).toHaveTextContent('Rendite')
    expect(headers[2]).toHaveTextContent('Endkapital')
    expect(headers[3]).toHaveTextContent('Ø Jährliche Entnahme')
    expect(headers[4]).toHaveTextContent('Vermögen reicht für')
  })

  it('applies correct styling to header row', () => {
    const { container } = render(
      <table>
        <ComparisonTableHeader />
      </table>,
    )

    const headerRow = container.querySelector('tr')
    expect(headerRow).toHaveStyle({ backgroundColor: '#f8f9fa' })
  })

  it('applies correct styling to header cells', () => {
    const { container } = render(
      <table>
        <ComparisonTableHeader />
      </table>,
    )

    const headers = container.querySelectorAll('th')

    // First header should be left-aligned
    expect(headers[0]).toHaveStyle({
      textAlign: 'left',
      padding: '10px',
      borderBottom: '1px solid #e5e5ea',
    })

    // Other headers should be right-aligned
    for (let i = 1; i < headers.length; i++) {
      expect(headers[i]).toHaveStyle({
        textAlign: 'right',
        padding: '10px',
        borderBottom: '1px solid #e5e5ea',
      })
    }
  })
})
