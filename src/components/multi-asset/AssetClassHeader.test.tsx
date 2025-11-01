import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AssetClassHeader } from './AssetClassHeader'

describe('AssetClassHeader', () => {
  const mockOnEnabledChange = vi.fn()

  it('should render name and description', () => {
    render(
      <AssetClassHeader
        name="Test Asset Class"
        description="Test description"
        isEnabled={true}
        onEnabledChange={mockOnEnabledChange}
      />,
    )

    expect(screen.getByText('Test Asset Class')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('should render enabled switch', () => {
    render(
      <AssetClassHeader
        name="Test Asset Class"
        description="Test description"
        isEnabled={true}
        onEnabledChange={mockOnEnabledChange}
      />,
    )

    const switchButton = screen.getByRole('switch')
    expect(switchButton).toBeInTheDocument()
    expect(switchButton).toBeChecked()
  })

  it('should render disabled switch', () => {
    render(
      <AssetClassHeader
        name="Test Asset Class"
        description="Test description"
        isEnabled={false}
        onEnabledChange={mockOnEnabledChange}
      />,
    )

    const switchButton = screen.getByRole('switch')
    expect(switchButton).toBeInTheDocument()
    expect(switchButton).not.toBeChecked()
  })

  it('should call onEnabledChange when switch is clicked', async () => {
    const user = userEvent.setup()
    mockOnEnabledChange.mockClear()

    render(
      <AssetClassHeader
        name="Test Asset Class"
        description="Test description"
        isEnabled={true}
        onEnabledChange={mockOnEnabledChange}
      />,
    )

    const switchButton = screen.getByRole('switch')
    await user.click(switchButton)

    expect(mockOnEnabledChange).toHaveBeenCalledWith(false)
  })

  it('should display name in correct style', () => {
    render(
      <AssetClassHeader
        name="Test Asset Class"
        description="Test description"
        isEnabled={true}
        onEnabledChange={mockOnEnabledChange}
      />,
    )

    const nameLabel = screen.getByText('Test Asset Class')
    expect(nameLabel).toHaveClass('text-sm', 'font-medium')
  })

  it('should display description in correct style', () => {
    render(
      <AssetClassHeader
        name="Test Asset Class"
        description="Test description"
        isEnabled={true}
        onEnabledChange={mockOnEnabledChange}
      />,
    )

    const description = screen.getByText('Test description')
    expect(description).toHaveClass('text-xs', 'text-gray-600')
  })
})
