import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RadioTile, RadioTileGroup } from './radio-tile'

describe('RadioTileGroup and RadioTile', () => {
  describe('RadioTileGroup', () => {
    it('renders children correctly', () => {
      render(
        <RadioTileGroup name="test-group" value="option1">
          <RadioTile value="option1" label="Option 1">
            Description 1
          </RadioTile>
          <RadioTile value="option2" label="Option 2">
            Description 2
          </RadioTile>
        </RadioTileGroup>,
      )

      expect(screen.getByLabelText('Option 1')).toBeInTheDocument()
      expect(screen.getByLabelText('Option 2')).toBeInTheDocument()
      expect(screen.getByText('Description 1')).toBeInTheDocument()
      expect(screen.getByText('Description 2')).toBeInTheDocument()
    })

    it('handles value selection correctly', () => {
      const handleChange = vi.fn()

      render(
        <RadioTileGroup name="test-group" value="option1" onValueChange={handleChange}>
          <RadioTile value="option1" label="Option 1">
            Description 1
          </RadioTile>
          <RadioTile value="option2" label="Option 2">
            Description 2
          </RadioTile>
        </RadioTileGroup>,
      )

      const option1Radio = screen.getByLabelText('Option 1') as HTMLInputElement
      const option2Radio = screen.getByLabelText('Option 2') as HTMLInputElement

      // Option 1 should be checked initially
      expect(option1Radio.checked).toBe(true)
      expect(option2Radio.checked).toBe(false)
    })

    it('calls onValueChange when selection changes', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()

      render(
        <RadioTileGroup name="test-group" value="option1" onValueChange={handleChange}>
          <RadioTile value="option1" label="Option 1">
            Description 1
          </RadioTile>
          <RadioTile value="option2" label="Option 2">
            Description 2
          </RadioTile>
        </RadioTileGroup>,
      )

      const option2Label = screen.getByText('Option 2')
      await user.click(option2Label)

      expect(handleChange).toHaveBeenCalledWith('option2')
    })

    it('applies correct styles to selected tile', () => {
      render(
        <RadioTileGroup name="test-group" value="option2">
          <RadioTile value="option1" label="Option 1">
            Description 1
          </RadioTile>
          <RadioTile value="option2" label="Option 2">
            Description 2
          </RadioTile>
        </RadioTileGroup>,
      )

      const option1Radio = screen.getByLabelText('Option 1')
      const option2Radio = screen.getByLabelText('Option 2')

      // Get the outermost tile container (the one with border and background styling)
      // Structure: div (tile container) > div (content wrapper) > div (radio container) > input
      const option1Container = option1Radio.parentElement?.parentElement?.parentElement
      const option2Container = option2Radio.parentElement?.parentElement?.parentElement

      // Option 2 should have selected styles
      expect(option2Container).toHaveClass('border-primary')
      expect(option2Container).toHaveClass('bg-accent')

      // Option 1 should not have selected styles (should have border-input instead)
      expect(option1Container).toHaveClass('border-input')
      expect(option1Container).not.toHaveClass('border-primary')
      expect(option1Container).not.toHaveClass('bg-accent')
    })

    it('uses custom name prop for radio group', () => {
      render(
        <RadioTileGroup name="custom-name" value="option1">
          <RadioTile value="option1" label="Option 1">
            Description 1
          </RadioTile>
          <RadioTile value="option2" label="Option 2">
            Description 2
          </RadioTile>
        </RadioTileGroup>,
      )

      const option1Radio = screen.getByLabelText('Option 1') as HTMLInputElement
      const option2Radio = screen.getByLabelText('Option 2') as HTMLInputElement

      // Both radios should have the same name attribute
      expect(option1Radio.name).toBe('custom-name')
      expect(option2Radio.name).toBe('custom-name')

      // IDs should be based on the name
      expect(option1Radio.id).toBe('custom-name-option1')
      expect(option2Radio.id).toBe('custom-name-option2')
    })

    it('handles click on tile container', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()

      render(
        <RadioTileGroup name="test-group" value="option1" onValueChange={handleChange}>
          <RadioTile value="option1" label="Option 1">
            Description 1
          </RadioTile>
          <RadioTile value="option2" label="Option 2">
            Description 2
          </RadioTile>
        </RadioTileGroup>,
      )

      // Click on the description text (part of the tile container)
      const description2 = screen.getByText('Description 2')
      await user.click(description2)

      expect(handleChange).toHaveBeenCalledWith('option2')
    })

    it('does not cause infinite re-renders when rendered inside collapsible', () => {
      // This test verifies that the custom implementation doesn't have the same
      // ref management issue as Radix UI's RadioGroup
      const handleChange = vi.fn()

      const { rerender } = render(
        <RadioTileGroup name="test-group" value="option1" onValueChange={handleChange}>
          <RadioTile value="option1" label="Option 1">
            Description 1
          </RadioTile>
          <RadioTile value="option2" label="Option 2">
            Description 2
          </RadioTile>
        </RadioTileGroup>,
      )

      // Re-render multiple times to simulate collapsible opening/closing
      for (let i = 0; i < 10; i++) {
        rerender(
          <RadioTileGroup name="test-group" value="option1" onValueChange={handleChange}>
            <RadioTile value="option1" label="Option 1">
              Description 1
            </RadioTile>
            <RadioTile value="option2" label="Option 2">
              Description 2
            </RadioTile>
          </RadioTileGroup>,
        )
      }

      // If we get here without timeout, the component doesn't have infinite re-render issues
      expect(screen.getByLabelText('Option 1')).toBeInTheDocument()
      expect(screen.getByLabelText('Option 2')).toBeInTheDocument()
    })
  })

  describe('RadioTile', () => {
    it('throws error when used outside RadioTileGroup', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        render(
          <RadioTile value="option1" label="Option 1">
            Description
          </RadioTile>,
        )
      }).toThrow('RadioTile must be used within a RadioTileGroup')

      consoleSpy.mockRestore()
    })

    it('displays label and children correctly', () => {
      render(
        <RadioTileGroup name="test-group">
          <RadioTile value="test" label="Test Label">
            Test Description
          </RadioTile>
        </RadioTileGroup>,
      )

      expect(screen.getByText('Test Label')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
    })

    it('shows visual indicator when selected', () => {
      render(
        <RadioTileGroup name="test-group" value="selected">
          <RadioTile value="selected" label="Selected Option">
            Selected Description
          </RadioTile>
          <RadioTile value="unselected" label="Unselected Option">
            Unselected Description
          </RadioTile>
        </RadioTileGroup>,
      )

      const selectedRadio = screen.getByLabelText('Selected Option')
      const unselectedRadio = screen.getByLabelText('Unselected Option')

      // The selected tile should have a Circle icon visible
      // Find the parent container that has the radio and icon
      const selectedParent = selectedRadio.closest('div')?.parentElement
      const unselectedParent = unselectedRadio.closest('div')?.parentElement

      // Check that both have SVG (the visual indicator structure)
      const selectedSvg = selectedParent?.querySelector('svg')
      const unselectedSvg = unselectedParent?.querySelector('svg')

      // Selected should have Circle icon (filled)
      expect(selectedSvg).toBeInTheDocument()
      // Unselected should not have Circle icon (empty)
      expect(unselectedSvg).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(
        <RadioTileGroup name="test-group" value="option1">
          <RadioTile value="option1" label="Option 1">
            Description 1
          </RadioTile>
          <RadioTile value="option2" label="Option 2">
            Description 2
          </RadioTile>
        </RadioTileGroup>,
      )

      // RadioGroup should have role="radiogroup"
      const radioGroup = screen.getByRole('radiogroup')
      expect(radioGroup).toBeInTheDocument()

      // Each radio should be accessible
      const option1 = screen.getByLabelText('Option 1')
      const option2 = screen.getByLabelText('Option 2')

      expect(option1).toHaveAttribute('type', 'radio')
      expect(option2).toHaveAttribute('type', 'radio')
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()

      render(
        <RadioTileGroup name="test-group" value="option1" onValueChange={handleChange}>
          <RadioTile value="option1" label="Option 1">
            Description 1
          </RadioTile>
          <RadioTile value="option2" label="Option 2">
            Description 2
          </RadioTile>
        </RadioTileGroup>,
      )

      const option2Radio = screen.getByLabelText('Option 2')

      // Focus on second radio and press Space to select
      option2Radio.focus()
      await user.keyboard(' ')

      expect(handleChange).toHaveBeenCalledWith('option2')
    })
  })
})
