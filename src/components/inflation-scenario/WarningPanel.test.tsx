import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WarningPanel } from './WarningPanel'

describe('WarningPanel', () => {
  it('should render warning panel', () => {
    render(<WarningPanel />)

    expect(screen.getByText('⚠️ Wichtiger Hinweis')).toBeInTheDocument()
    expect(screen.getByText(/Inflationsszenarien sind Extremszenarien/)).toBeInTheDocument()
  })
})
