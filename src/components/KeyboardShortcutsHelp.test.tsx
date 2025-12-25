import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp'
import type { KeyboardShortcut } from '../hooks/useKeyboardShortcuts'

describe('KeyboardShortcutsHelp', () => {
  const mockOnClose = vi.fn()

  const mockShortcuts: KeyboardShortcut[] = [
    {
      key: '1',
      alt: true,
      description: 'Wechseln zu Sparen',
      category: 'navigation',
      action: () => {},
    },
    {
      key: '2',
      alt: true,
      description: 'Wechseln zu Entnahme',
      category: 'navigation',
      action: () => {},
    },
    {
      key: 's',
      ctrl: true,
      description: 'Speichern',
      category: 'actions',
      action: () => {},
    },
    {
      key: '?',
      shift: true,
      description: 'Hilfe anzeigen',
      category: 'help',
      action: () => {},
    },
  ]

  beforeEach(() => {
    mockOnClose.mockClear()
  })

  it('should not render when closed', () => {
    render(
      <KeyboardShortcutsHelp open={false} onClose={mockOnClose} shortcuts={mockShortcuts} />,
    )

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('should render when open', () => {
    render(<KeyboardShortcutsHelp open={true} onClose={mockOnClose} shortcuts={mockShortcuts} />)

    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(screen.getByText('Tastaturkürzel')).toBeInTheDocument()
  })

  it('should display the description', () => {
    render(<KeyboardShortcutsHelp open={true} onClose={mockOnClose} shortcuts={mockShortcuts} />)

    expect(
      screen.getByText(
        /Verwenden Sie diese Tastaturkürzel für eine schnellere Navigation und effizienteres Arbeiten/,
      ),
    ).toBeInTheDocument()
  })

  it('should organize shortcuts by category', () => {
    render(<KeyboardShortcutsHelp open={true} onClose={mockOnClose} shortcuts={mockShortcuts} />)

    expect(screen.getByText('Navigation')).toBeInTheDocument()
    expect(screen.getByText('Aktionen')).toBeInTheDocument()
    expect(screen.getByText('Hilfe')).toBeInTheDocument()
  })

  it('should display all navigation shortcuts', () => {
    render(<KeyboardShortcutsHelp open={true} onClose={mockOnClose} shortcuts={mockShortcuts} />)

    expect(screen.getByText('Wechseln zu Sparen')).toBeInTheDocument()
    expect(screen.getByText('Wechseln zu Entnahme')).toBeInTheDocument()
  })

  it('should display all action shortcuts', () => {
    render(<KeyboardShortcutsHelp open={true} onClose={mockOnClose} shortcuts={mockShortcuts} />)

    expect(screen.getByText('Speichern')).toBeInTheDocument()
  })

  it('should display all help shortcuts', () => {
    render(<KeyboardShortcutsHelp open={true} onClose={mockOnClose} shortcuts={mockShortcuts} />)

    expect(screen.getByText('Hilfe anzeigen')).toBeInTheDocument()
  })

  it('should display formatted shortcut keys', () => {
    render(<KeyboardShortcutsHelp open={true} onClose={mockOnClose} shortcuts={mockShortcuts} />)

    expect(screen.getByText('Alt + 1')).toBeInTheDocument()
    expect(screen.getByText('Alt + 2')).toBeInTheDocument()
    expect(screen.getByText('Strg + S')).toBeInTheDocument()
    expect(screen.getByText('Shift + ?')).toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<KeyboardShortcutsHelp open={true} onClose={mockOnClose} shortcuts={mockShortcuts} />)

    const closeButton = screen.getByRole('button', { name: /schließen/i })
    await user.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should handle empty shortcuts array', () => {
    render(<KeyboardShortcutsHelp open={true} onClose={mockOnClose} shortcuts={[]} />)

    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(screen.queryByText('Navigation')).not.toBeInTheDocument()
    expect(screen.queryByText('Aktionen')).not.toBeInTheDocument()
    expect(screen.queryByText('Hilfe')).not.toBeInTheDocument()
  })

  it('should only display categories with shortcuts', () => {
    const navigationOnly: KeyboardShortcut[] = [
      {
        key: '1',
        alt: true,
        description: 'Navigate',
        category: 'navigation',
        action: () => {},
      },
    ]

    render(<KeyboardShortcutsHelp open={true} onClose={mockOnClose} shortcuts={navigationOnly} />)

    expect(screen.getByText('Navigation')).toBeInTheDocument()
    expect(screen.queryByText('Aktionen')).not.toBeInTheDocument()
    expect(screen.queryByText('Hilfe')).not.toBeInTheDocument()
  })

  it('should render keyboard icon in title', () => {
    render(<KeyboardShortcutsHelp open={true} onClose={mockOnClose} shortcuts={mockShortcuts} />)

    // Check for Lucide Keyboard icon - it's an SVG element
    const title = screen.getByText('Tastaturkürzel')
    const iconSvg = title.parentElement?.querySelector('svg')
    expect(iconSvg).toBeInTheDocument()
  })

  it('should have scrollable content area', () => {
    render(<KeyboardShortcutsHelp open={true} onClose={mockOnClose} shortcuts={mockShortcuts} />)

    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toHaveClass('overflow-y-auto')
  })

  it('should display shortcut rows with proper styling', () => {
    render(<KeyboardShortcutsHelp open={true} onClose={mockOnClose} shortcuts={mockShortcuts} />)

    // Check that shortcut keys are displayed in <kbd> elements
    const kbdElements = document.querySelectorAll('kbd')
    expect(kbdElements.length).toBe(4) // One for each shortcut
  })

  it('should apply hover styles to shortcut rows', () => {
    render(<KeyboardShortcutsHelp open={true} onClose={mockOnClose} shortcuts={mockShortcuts} />)

    const firstShortcutRow = screen.getByText('Wechseln zu Sparen').parentElement
    expect(firstShortcutRow).toHaveClass('hover:bg-gray-50')
  })
})
