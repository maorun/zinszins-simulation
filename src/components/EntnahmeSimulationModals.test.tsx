import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EntnahmeSimulationModals } from './EntnahmeSimulationModals'
import type { CalculationExplanation } from '../hooks/useWithdrawalModals.types'

// Mock the modal components
vi.mock('./CalculationExplanationModal', () => ({
  default: ({ open, title }: { open: boolean, title: string }) =>
    open
      ? (
          <div data-testid="calculation-modal">
            {title}
          </div>
        )
      : null,
}))

vi.mock('./VorabpauschaleExplanationModal', () => ({
  default: ({ open }: { open: boolean }) =>
    open ? <div data-testid="vorabpauschale-modal">Vorabpauschale Modal</div> : null,
}))

describe('EntnahmeSimulationModals', () => {
  const mockSetShowCalculationModal = vi.fn()
  const mockSetShowVorabpauschaleModal = vi.fn()

  const defaultProps = {
    showCalculationModal: false,
    setShowCalculationModal: mockSetShowCalculationModal,
    calculationDetails: null,
    showVorabpauschaleModal: false,
    setShowVorabpauschaleModal: mockSetShowVorabpauschaleModal,
    selectedVorabDetails: null,
  }

  const createMockCalculationDetails = (): CalculationExplanation => ({
    title: 'Test Calculation',
    introduction: 'Test intro',
    steps: [],
    finalResult: {
      title: 'Final Result',
      values: [],
    },
  })

  const createMockVorabDetails = () => ({
    basiszins: 2.55,
    basisertrag: 25500,
    vorabpauschaleAmount: 25500,
    steuerVorFreibetrag: 6732.5,
    genutzterFreibetrag: 2000,
    steuerNachFreibetrag: 4732.5,
    jahresgewinn: 50000,
    anteilImJahr: 1,
  })

  it('should not render modals when closed and no details', () => {
    const { container } = render(<EntnahmeSimulationModals {...defaultProps} />)

    expect(container.firstChild).toBeNull()
  })

  it('should render calculation modal when open with details', () => {
    const props = {
      ...defaultProps,
      showCalculationModal: true,
      calculationDetails: createMockCalculationDetails(),
    }

    render(<EntnahmeSimulationModals {...props} />)

    expect(screen.getByTestId('calculation-modal')).toBeInTheDocument()
    expect(screen.getByText('Test Calculation')).toBeInTheDocument()
  })

  it('should not render calculation modal when closed even with details', () => {
    const props = {
      ...defaultProps,
      showCalculationModal: false,
      calculationDetails: createMockCalculationDetails(),
    }

    render(<EntnahmeSimulationModals {...props} />)

    expect(screen.queryByTestId('calculation-modal')).not.toBeInTheDocument()
  })

  it('should render vorabpauschale modal when open with details', () => {
    const props = {
      ...defaultProps,
      showVorabpauschaleModal: true,
      selectedVorabDetails: createMockVorabDetails(),
    }

    render(<EntnahmeSimulationModals {...props} />)

    expect(screen.getByTestId('vorabpauschale-modal')).toBeInTheDocument()
  })

  it('should not render vorabpauschale modal when closed even with details', () => {
    const props = {
      ...defaultProps,
      showVorabpauschaleModal: false,
      selectedVorabDetails: createMockVorabDetails(),
    }

    render(<EntnahmeSimulationModals {...props} />)

    expect(screen.queryByTestId('vorabpauschale-modal')).not.toBeInTheDocument()
  })

  it('should render both modals when both are open with details', () => {
    const props = {
      showCalculationModal: true,
      setShowCalculationModal: mockSetShowCalculationModal,
      calculationDetails: createMockCalculationDetails(),
      showVorabpauschaleModal: true,
      setShowVorabpauschaleModal: mockSetShowVorabpauschaleModal,
      selectedVorabDetails: createMockVorabDetails(),
    }

    render(<EntnahmeSimulationModals {...props} />)

    expect(screen.getByTestId('calculation-modal')).toBeInTheDocument()
    expect(screen.getByTestId('vorabpauschale-modal')).toBeInTheDocument()
  })
})
