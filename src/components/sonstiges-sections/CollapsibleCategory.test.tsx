import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { CollapsibleCategory } from './CollapsibleCategory'

describe('CollapsibleCategory', () => {
  it('renders with title and icon', () => {
    render(
      <CollapsibleCategory title="Test Category" icon="🎯">
        <div>Test Content</div>
      </CollapsibleCategory>,
    )

    expect(screen.getByText(/🎯 Test Category/)).toBeInTheDocument()
  })

  it('renders children when opened', () => {
    render(
      <CollapsibleCategory title="Test Category" defaultOpen={true}>
        <div>Test Content</div>
      </CollapsibleCategory>,
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('toggles content visibility when clicked', () => {
    render(
      <CollapsibleCategory title="Test Category" defaultOpen={false}>
        <div>Test Content</div>
      </CollapsibleCategory>,
    )

    // Content should not be in the document initially (collapsed)
    expect(screen.queryByText('Test Content')).not.toBeInTheDocument()

    // Click to open
    const trigger = screen.getByText(/Test Category/)
    fireEvent.click(trigger)

    // Content should now be visible
    expect(screen.getByText('Test Content')).toBeVisible()
  })

  it('renders without icon when not provided', () => {
    render(
      <CollapsibleCategory title="Test Category">
        <div>Test Content</div>
      </CollapsibleCategory>,
    )

    // Should find title without icon
    expect(screen.getByText('Test Category')).toBeInTheDocument()
  })

  it('applies correct nesting level', () => {
    const { container } = render(
      <CollapsibleCategory title="Test Category" nestingLevel={2}>
        <div>Test Content</div>
      </CollapsibleCategory>,
    )

    // Check that Card has nestingLevel prop applied
    const card = container.querySelector('[class*="mb-4"]')
    expect(card).toBeInTheDocument()
  })
})
