import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { NestingProvider } from '../../lib/nesting-context'
import { CollapsibleCard, CollapsibleCardHeader, CollapsibleCardContent } from './collapsible-card'

describe('CollapsibleCard Components - Mobile Touch Targets', () => {
  it('should render collapsible card header with enhanced mobile touch targets', () => {
    render(
      <NestingProvider level={0}>
        <CollapsibleCard>
          <CollapsibleCardHeader>Test Header</CollapsibleCardHeader>
          <CollapsibleCardContent>Test Content</CollapsibleCardContent>
        </CollapsibleCard>
      </NestingProvider>,
    )

    const header = screen.getByText('Test Header')
    const triggerDiv = header.closest('div[class*="cursor-pointer"]')

    expect(triggerDiv).toHaveClass('min-h-[44px]')
    expect(triggerDiv).toHaveClass('sm:min-h-[36px]')
    expect(triggerDiv).toHaveClass('p-3')
    expect(triggerDiv).toHaveClass('sm:p-2')
  })

  it('should have larger chevron icons on mobile', () => {
    render(
      <NestingProvider level={0}>
        <CollapsibleCard>
          <CollapsibleCardHeader>Test Header</CollapsibleCardHeader>
          <CollapsibleCardContent>Test Content</CollapsibleCardContent>
        </CollapsibleCard>
      </NestingProvider>,
    )

    const chevronIcon = document.querySelector('svg[class*="h-5 w-5"]')
    expect(chevronIcon).toHaveClass('h-5')
    expect(chevronIcon).toHaveClass('w-5')
    expect(chevronIcon).toHaveClass('sm:h-4')
    expect(chevronIcon).toHaveClass('sm:w-4')
  })

  it('should have active state styling for better mobile feedback', () => {
    render(
      <NestingProvider level={0}>
        <CollapsibleCard>
          <CollapsibleCardHeader>Test Header</CollapsibleCardHeader>
          <CollapsibleCardContent>Test Content</CollapsibleCardContent>
        </CollapsibleCard>
      </NestingProvider>,
    )

    const header = screen.getByText('Test Header')
    const triggerDiv = header.closest('div[class*="cursor-pointer"]')

    expect(triggerDiv).toHaveClass('active:bg-gray-100')
    expect(triggerDiv).toHaveClass('hover:bg-gray-50')
    expect(triggerDiv).toHaveClass('transition-colors')
  })
})
