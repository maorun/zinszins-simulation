/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SavedSparplansListHeader } from './SavedSparplansListHeader'
import { Collapsible } from './ui/collapsible'

describe('SavedSparplansListHeader', () => {
  it('should render header with correct title', () => {
    render(
      <Collapsible>
        <SavedSparplansListHeader />
      </Collapsible>,
    )

    expect(screen.getByText('📋 Gespeicherte Sparpläne & Einmalzahlungen')).toBeInTheDocument()
  })

  it('should render CardHeader with correct className', () => {
    const { container } = render(
      <Collapsible>
        <SavedSparplansListHeader />
      </Collapsible>,
    )

    const cardHeader = container.querySelector('.pb-4')
    expect(cardHeader).toBeInTheDocument()
  })

  it('should render CollapsibleTrigger', () => {
    const { container } = render(
      <Collapsible>
        <SavedSparplansListHeader />
      </Collapsible>,
    )

    // Check that the trigger wrapper exists
    const trigger = container.querySelector('.cursor-pointer')
    expect(trigger).toBeInTheDocument()
  })

  it('should render ChevronDown icon', () => {
    const { container } = render(
      <Collapsible>
        <SavedSparplansListHeader />
      </Collapsible>,
    )

    const chevron = container.querySelector('.h-5.w-5')
    expect(chevron).toBeInTheDocument()
  })
})
