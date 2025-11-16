import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CorrelationMatrixHeatmap } from './CorrelationMatrixHeatmap'
import {
  createDefaultMultiAssetConfig,
  type MultiAssetPortfolioConfig,
  type AssetClass,
} from '../../../helpers/multi-asset-portfolio'

describe('CorrelationMatrixHeatmap', () => {
  // Helper to create config with specific enabled assets
  function createConfigWithAssets(enabledAssets: AssetClass[]): MultiAssetPortfolioConfig {
    const config = createDefaultMultiAssetConfig()

    // Disable all assets first
    Object.keys(config.assetClasses).forEach(key => {
      config.assetClasses[key as AssetClass].enabled = false
    })

    // Enable only the specified assets
    enabledAssets.forEach(asset => {
      config.assetClasses[asset].enabled = true
    })

    return config
  }

  describe('Rendering', () => {
    it('should not render when fewer than 2 assets are enabled', () => {
      const config = createConfigWithAssets(['stocks_domestic'])
      const { container } = render(<CorrelationMatrixHeatmap config={config} />)
      expect(container.firstChild).toBeNull()
    })

    it('should render correlation matrix when 2 or more assets are enabled', () => {
      const config = createConfigWithAssets(['stocks_domestic', 'stocks_international'])
      render(<CorrelationMatrixHeatmap config={config} />)

      expect(screen.getByText('Korrelationsmatrix')).toBeInTheDocument()
    })

    it('should render table with correct dimensions for enabled assets', () => {
      const config = createConfigWithAssets(['stocks_domestic', 'stocks_international', 'bonds_government'])
      const { container } = render(<CorrelationMatrixHeatmap config={config} />)

      const table = container.querySelector('table')
      expect(table).toBeInTheDocument()

      // Should have 3 rows (excluding header) for 3 assets
      const rows = container.querySelectorAll('tbody tr')
      expect(rows).toHaveLength(3)

      // Each row should have 4 cells (1 header + 3 data cells)
      rows.forEach(row => {
        const cells = row.querySelectorAll('th, td')
        expect(cells).toHaveLength(4)
      })
    })

    it('should display asset short names correctly', () => {
      const config = createConfigWithAssets(['stocks_domestic', 'bonds_government'])
      render(<CorrelationMatrixHeatmap config={config} />)

      expect(screen.getAllByText('DE Aktien')).toHaveLength(2) // Header + row
      expect(screen.getAllByText('Staatsanl.')).toHaveLength(2) // Header + row
    })

    it('should display all enabled assets in both rows and columns', () => {
      const config = createConfigWithAssets([
        'stocks_domestic',
        'stocks_international',
        'bonds_government',
        'real_estate',
      ])
      render(<CorrelationMatrixHeatmap config={config} />)

      // Check headers
      expect(screen.getAllByText('DE Aktien')).toHaveLength(2)
      expect(screen.getAllByText('Int. Aktien')).toHaveLength(2)
      expect(screen.getAllByText('Staatsanl.')).toHaveLength(2)
      expect(screen.getAllByText('REITs')).toHaveLength(2)
    })
  })

  describe('Correlation Values', () => {
    it('should display correlation values in correct format', () => {
      const config = createConfigWithAssets(['stocks_domestic', 'stocks_international'])
      render(<CorrelationMatrixHeatmap config={config} />)

      // Check for diagonal values (should be 1.00)
      const diagonalValues = screen.getAllByText('1.00')
      expect(diagonalValues.length).toBeGreaterThan(0)

      // Check for off-diagonal value (stocks correlation is 0.85)
      expect(screen.getAllByText('0.85')).toHaveLength(2) // Symmetric matrix
    })

    it('should display negative correlations correctly', () => {
      const config = createConfigWithAssets(['stocks_domestic', 'bonds_government'])
      render(<CorrelationMatrixHeatmap config={config} />)

      // stocks_domestic and bonds_government have -0.15 correlation
      expect(screen.getAllByText('-0.15')).toHaveLength(2) // Symmetric
    })

    it('should display zero correlations correctly', () => {
      const config = createConfigWithAssets(['stocks_domestic', 'cash'])
      render(<CorrelationMatrixHeatmap config={config} />)

      // stocks_domestic and cash have 0.00 correlation
      expect(screen.getAllByText('0.00')).toHaveLength(2) // Symmetric
    })

    it('should show all correlation values for larger matrix', () => {
      const config = createConfigWithAssets(['stocks_domestic', 'stocks_international', 'bonds_government'])
      const { container } = render(<CorrelationMatrixHeatmap config={config} />)

      // Count all correlation cells (3x3 = 9 cells)
      const correlationCells = container.querySelectorAll('tbody td')
      expect(correlationCells).toHaveLength(9)

      // All cells should have a value
      correlationCells.forEach(cell => {
        expect(cell.textContent).toMatch(/^-?\d+\.\d{2}$/)
      })
    })
  })

  describe('Visual Styling', () => {
    it('should apply background colors to correlation cells', () => {
      const config = createConfigWithAssets(['stocks_domestic', 'stocks_international'])
      const { container } = render(<CorrelationMatrixHeatmap config={config} />)

      const cells = container.querySelectorAll('tbody td')
      cells.forEach(cell => {
        const bgColor = (cell as HTMLElement).style.backgroundColor
        expect(bgColor).toBeTruthy()
        expect(bgColor).toMatch(/^rgb\(\d+, \d+, \d+\)$/)
      })
    })

    it('should apply different colors for positive and negative correlations', () => {
      const config = createConfigWithAssets(['stocks_domestic', 'bonds_government'])
      const { container } = render(<CorrelationMatrixHeatmap config={config} />)

      const cells = Array.from(container.querySelectorAll('tbody td')) as HTMLElement[]

      // Find cells with negative correlation (-0.15)
      const negativeCells = cells.filter(cell => cell.textContent === '-0.15')
      expect(negativeCells.length).toBeGreaterThan(0)

      // Negative correlations should have reddish background (high red component)
      negativeCells.forEach(cell => {
        const bgColor = cell.style.backgroundColor
        const match = bgColor.match(/rgb\((\d+), (\d+), (\d+)\)/)
        if (match) {
          const [, r, g, b] = match.map(Number)
          // Red should be 255, others should be less
          expect(r).toBe(255)
          expect(g).toBeLessThan(255)
          expect(b).toBeLessThan(255)
        }
      })
    })

    it('should highlight diagonal cells (perfect correlation)', () => {
      const config = createConfigWithAssets(['stocks_domestic', 'stocks_international'])
      const { container } = render(<CorrelationMatrixHeatmap config={config} />)

      const diagonalCells = Array.from(container.querySelectorAll('tbody td')).filter(
        cell => cell.textContent === '1.00',
      )

      diagonalCells.forEach(cell => {
        expect(cell.className).toContain('font-semibold')
      })
    })
  })

  describe('Legend', () => {
    it('should display color legend with explanations', () => {
      const config = createConfigWithAssets(['stocks_domestic', 'stocks_international'])
      render(<CorrelationMatrixHeatmap config={config} />)

      expect(screen.getByText(/Starke positive Korrelation/)).toBeInTheDocument()
      expect(screen.getByText(/Keine Korrelation/)).toBeInTheDocument()
      expect(screen.getByText(/Starke negative Korrelation/)).toBeInTheDocument()
    })

    it('should display color swatches in legend', () => {
      const config = createConfigWithAssets(['stocks_domestic', 'stocks_international'])
      const { container } = render(<CorrelationMatrixHeatmap config={config} />)

      // Find all color swatches (divs with rounded border class and background color)
      const swatches = container.querySelectorAll('.rounded.border.border-gray-200')

      // Should have 3 swatches (positive, neutral, negative)
      expect(swatches.length).toBe(3)
    })
  })

  describe('Tooltips', () => {
    it('should have title attributes for asset name tooltips on headers', () => {
      const config = createConfigWithAssets(['stocks_domestic', 'bonds_government'])
      const { container } = render(<CorrelationMatrixHeatmap config={config} />)

      const headers = container.querySelectorAll('thead th[title]')
      expect(headers.length).toBeGreaterThan(0)

      // Check that titles contain full asset names
      const titleTexts = Array.from(headers)
        .map(h => h.getAttribute('title'))
        .filter(Boolean)

      expect(titleTexts).toContain('Deutsche/Europäische Aktien')
      expect(titleTexts).toContain('Staatsanleihen')
    })

    it('should have title attributes for correlation value tooltips on cells', () => {
      const config = createConfigWithAssets(['stocks_domestic', 'stocks_international'])
      const { container } = render(<CorrelationMatrixHeatmap config={config} />)

      const cells = container.querySelectorAll('tbody td[title]')
      expect(cells.length).toBeGreaterThan(0)

      // Check that titles describe the correlation
      const titleTexts = Array.from(cells)
        .map(c => c.getAttribute('title'))
        .filter(Boolean)

      expect(titleTexts.some(title => title?.includes('Korrelation zwischen'))).toBe(true)
    })
  })

  describe('Information Section', () => {
    it('should display information text about correlation matrix', () => {
      const config = createConfigWithAssets(['stocks_domestic', 'stocks_international'])
      render(<CorrelationMatrixHeatmap config={config} />)

      expect(screen.getByText('Korrelationsmatrix')).toBeInTheDocument()
      expect(
        screen.getByText(/Zeigt die historischen Korrelationen zwischen den Anlageklassen/),
      ).toBeInTheDocument()
    })

    it('should display info icon', () => {
      const config = createConfigWithAssets(['stocks_domestic', 'stocks_international'])
      const { container } = render(<CorrelationMatrixHeatmap config={config} />)

      const infoIcon = container.querySelector('svg')
      expect(infoIcon).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle all available asset classes', () => {
      const allAssets: AssetClass[] = [
        'stocks_domestic',
        'stocks_international',
        'bonds_government',
        'bonds_corporate',
        'real_estate',
        'commodities',
        'cash',
      ]
      const config = createConfigWithAssets(allAssets)
      const { container } = render(<CorrelationMatrixHeatmap config={config} />)

      const rows = container.querySelectorAll('tbody tr')
      expect(rows).toHaveLength(7)

      // Each row should have 8 cells (1 header + 7 data cells)
      rows.forEach(row => {
        const cells = row.querySelectorAll('th, td')
        expect(cells).toHaveLength(8)
      })
    })

    it('should handle config with only 2 assets', () => {
      const config = createConfigWithAssets(['stocks_domestic', 'bonds_government'])
      const { container } = render(<CorrelationMatrixHeatmap config={config} />)

      const rows = container.querySelectorAll('tbody tr')
      expect(rows).toHaveLength(2)
    })

    it('should not crash with empty enabled assets', () => {
      const config = createConfigWithAssets([])
      const { container } = render(<CorrelationMatrixHeatmap config={config} />)
      expect(container.firstChild).toBeNull()
    })
  })

  describe('Accessibility', () => {
    it('should use table structure for semantic correctness', () => {
      const config = createConfigWithAssets(['stocks_domestic', 'stocks_international'])
      const { container } = render(<CorrelationMatrixHeatmap config={config} />)

      expect(container.querySelector('table')).toBeInTheDocument()
      expect(container.querySelector('thead')).toBeInTheDocument()
      expect(container.querySelector('tbody')).toBeInTheDocument()
    })

    it('should use th elements for headers', () => {
      const config = createConfigWithAssets(['stocks_domestic', 'stocks_international'])
      const { container } = render(<CorrelationMatrixHeatmap config={config} />)

      const headers = container.querySelectorAll('th')
      expect(headers.length).toBeGreaterThan(0)
    })

    it('should provide descriptive text for screen readers', () => {
      const config = createConfigWithAssets(['stocks_domestic', 'stocks_international'])
      render(<CorrelationMatrixHeatmap config={config} />)

      // Info text provides context
      expect(
        screen.getByText(/Zeigt die historischen Korrelationen zwischen den Anlageklassen/),
      ).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('should use overflow-x-auto for horizontal scrolling on small screens', () => {
      const config = createConfigWithAssets(['stocks_domestic', 'stocks_international'])
      const { container } = render(<CorrelationMatrixHeatmap config={config} />)

      const scrollContainer = container.querySelector('.overflow-x-auto')
      expect(scrollContainer).toBeInTheDocument()
    })

    it('should prevent text wrapping in headers', () => {
      const config = createConfigWithAssets(['stocks_domestic', 'stocks_international'])
      const { container } = render(<CorrelationMatrixHeatmap config={config} />)

      const headerCells = container.querySelectorAll('thead th div')
      headerCells.forEach(cell => {
        expect(cell.className).toContain('whitespace-nowrap')
      })
    })
  })
})
