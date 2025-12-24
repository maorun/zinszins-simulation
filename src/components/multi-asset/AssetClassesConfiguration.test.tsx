import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AssetClassesConfiguration } from './AssetClassesConfiguration'
import { createDefaultMultiAssetConfig } from '../../../helpers/multi-asset-portfolio'

describe('AssetClassesConfiguration', () => {
  const mockOnAssetClassChange = vi.fn()
  const mockOnNormalizeAllocations = vi.fn()
  const mockOnResetToDefaults = vi.fn()

  const defaultProps = {
    config: createDefaultMultiAssetConfig(),
    enabledAssetsCount: 4,
    onAssetClassChange: mockOnAssetClassChange,
    onNormalizeAllocations: mockOnNormalizeAllocations,
    onResetToDefaults: mockOnResetToDefaults,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render the component', () => {
      render(<AssetClassesConfiguration {...defaultProps} />)
      expect(screen.getByText('Anlageklassen')).toBeInTheDocument()
    })

    it('should render control buttons', () => {
      render(<AssetClassesConfiguration {...defaultProps} />)
      expect(screen.getByText('Normalisieren')).toBeInTheDocument()
      expect(screen.getByText('Zurücksetzen')).toBeInTheDocument()
    })

    it('should render all asset class editors', () => {
      render(<AssetClassesConfiguration {...defaultProps} />)
      // Check for default asset class names - some texts may appear in both labels and descriptions
      expect(screen.getAllByText(/Deutsche\/Europäische Aktien/i).length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText(/Internationale Aktien/i).length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText(/Staatsanleihen/i).length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText(/Unternehmensanleihen/i).length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText(/Immobilien \(REITs\)/i).length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText(/Rohstoffe/i).length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Alternative Investments Info Toggle', () => {
    it('should show alternative investments toggle button', () => {
      render(<AssetClassesConfiguration {...defaultProps} />)
      expect(screen.getByText(/Alternative Investments: REITs & Rohstoffe/i)).toBeInTheDocument()
    })

    it('should initially hide alternative investments info', () => {
      render(<AssetClassesConfiguration {...defaultProps} />)
      // Info panel should not be visible initially
      expect(screen.queryByText(/börsengehandelte Immobiliengesellschaften/i)).not.toBeInTheDocument()
    })

    it('should show alternative investments info when toggle button is clicked', () => {
      render(<AssetClassesConfiguration {...defaultProps} />)

      // Click the toggle button
      const toggleButton = screen.getByText(/Alternative Investments: REITs & Rohstoffe/i)
      fireEvent.click(toggleButton)

      // Info panel should now be visible
      expect(screen.getByText(/börsengehandelte Immobiliengesellschaften/i)).toBeInTheDocument()
    })

    it('should hide alternative investments info when toggle button is clicked again', () => {
      render(<AssetClassesConfiguration {...defaultProps} />)

      // Click to show
      const toggleButton = screen.getByText(/Alternative Investments: REITs & Rohstoffe/i)
      fireEvent.click(toggleButton)

      // Verify it's shown
      expect(screen.getByText(/börsengehandelte Immobiliengesellschaften/i)).toBeInTheDocument()

      // Click to hide
      fireEvent.click(toggleButton)

      // Verify it's hidden
      expect(screen.queryByText(/börsengehandelte Immobiliengesellschaften/i)).not.toBeInTheDocument()
    })

    it('should show chevron down icon when info is hidden', () => {
      render(<AssetClassesConfiguration {...defaultProps} />)

      // Look for chevron down in the toggle button
      const toggleButton = screen.getByText(/Alternative Investments: REITs & Rohstoffe/i).closest('button')
      expect(toggleButton).toBeInTheDocument()

      // Chevron down should be present
      const chevronDown = toggleButton?.querySelector('.lucide-chevron-down')
      expect(chevronDown).toBeInTheDocument()
    })

    it('should show chevron up icon when info is shown', () => {
      render(<AssetClassesConfiguration {...defaultProps} />)

      // Click to show info
      const toggleButton = screen.getByText(/Alternative Investments: REITs & Rohstoffe/i).closest('button')
      if (toggleButton) {
        fireEvent.click(toggleButton)
      }

      // Chevron up should be present
      const chevronUp = toggleButton?.querySelector('.lucide-chevron-up')
      expect(chevronUp).toBeInTheDocument()
    })
  })

  describe('Hint for Enabled Alternative Investments', () => {
    it('should not show hint when no alternative investments are enabled and info is hidden', () => {
      const config = createDefaultMultiAssetConfig()
      config.assetClasses.real_estate.enabled = false
      config.assetClasses.commodities.enabled = false

      render(<AssetClassesConfiguration {...defaultProps} config={config} />)

      expect(screen.queryByText(/Sie haben alternative Investments aktiviert/i)).not.toBeInTheDocument()
    })

    it('should show hint when REITs are enabled and info is hidden', () => {
      const config = createDefaultMultiAssetConfig()
      config.assetClasses.real_estate.enabled = true
      config.assetClasses.commodities.enabled = false

      render(<AssetClassesConfiguration {...defaultProps} config={config} />)

      expect(screen.getByText(/Sie haben alternative Investments aktiviert/i)).toBeInTheDocument()
    })

    it('should show hint when Commodities are enabled and info is hidden', () => {
      const config = createDefaultMultiAssetConfig()
      config.assetClasses.real_estate.enabled = false
      config.assetClasses.commodities.enabled = true

      render(<AssetClassesConfiguration {...defaultProps} config={config} />)

      expect(screen.getByText(/Sie haben alternative Investments aktiviert/i)).toBeInTheDocument()
    })

    it('should show hint when both alternative investments are enabled and info is hidden', () => {
      const config = createDefaultMultiAssetConfig()
      config.assetClasses.real_estate.enabled = true
      config.assetClasses.commodities.enabled = true

      render(<AssetClassesConfiguration {...defaultProps} config={config} />)

      expect(screen.getByText(/Sie haben alternative Investments aktiviert/i)).toBeInTheDocument()
    })

    it('should hide hint when info panel is shown', () => {
      const config = createDefaultMultiAssetConfig()
      config.assetClasses.real_estate.enabled = true

      render(<AssetClassesConfiguration {...defaultProps} config={config} />)

      // Hint should be visible initially
      expect(screen.getByText(/Sie haben alternative Investments aktiviert/i)).toBeInTheDocument()

      // Click to show info
      const toggleButton = screen.getByText(/Alternative Investments: REITs & Rohstoffe/i)
      fireEvent.click(toggleButton)

      // Hint should be hidden when info is shown
      expect(screen.queryByText(/Sie haben alternative Investments aktiviert/i)).not.toBeInTheDocument()
    })

    it('should allow clicking hint link to show info panel', () => {
      const config = createDefaultMultiAssetConfig()
      config.assetClasses.real_estate.enabled = true

      render(<AssetClassesConfiguration {...defaultProps} config={config} />)

      // Click the "Mehr erfahren" link in the hint
      const moreInfoLink = screen.getByText(/Mehr erfahren/i)
      fireEvent.click(moreInfoLink)

      // Info panel should now be visible
      expect(screen.getByText(/börsengehandelte Immobiliengesellschaften/i)).toBeInTheDocument()
    })
  })

  describe('Control Buttons', () => {
    it('should call onNormalizeAllocations when normalize button is clicked', () => {
      render(<AssetClassesConfiguration {...defaultProps} />)

      const normalizeButton = screen.getByText('Normalisieren')
      fireEvent.click(normalizeButton)

      expect(mockOnNormalizeAllocations).toHaveBeenCalledTimes(1)
    })

    it('should disable normalize button when no assets are enabled', () => {
      render(<AssetClassesConfiguration {...defaultProps} enabledAssetsCount={0} />)

      const normalizeButton = screen.getByText('Normalisieren')
      expect(normalizeButton).toBeDisabled()
    })

    it('should call onResetToDefaults when reset button is clicked', () => {
      render(<AssetClassesConfiguration {...defaultProps} />)

      const resetButton = screen.getByText('Zurücksetzen')
      fireEvent.click(resetButton)

      expect(mockOnResetToDefaults).toHaveBeenCalledTimes(1)
    })

    it('should not disable reset button when no assets are enabled', () => {
      render(<AssetClassesConfiguration {...defaultProps} enabledAssetsCount={0} />)

      const resetButton = screen.getByText('Zurücksetzen')
      expect(resetButton).not.toBeDisabled()
    })
  })

  describe('Visual Styling', () => {
    it('should have amber color scheme for alternative investments toggle', () => {
      const { container } = render(<AssetClassesConfiguration {...defaultProps} />)

      const toggleButton = container.querySelector('.bg-amber-50')
      expect(toggleButton).toBeInTheDocument()
    })

    it('should have blue color scheme for hint when alternatives are enabled', () => {
      const config = createDefaultMultiAssetConfig()
      config.assetClasses.real_estate.enabled = true

      const { container } = render(<AssetClassesConfiguration {...defaultProps} config={config} />)

      const hint = container.querySelector('.bg-blue-50')
      expect(hint).toBeInTheDocument()
    })
  })
})
