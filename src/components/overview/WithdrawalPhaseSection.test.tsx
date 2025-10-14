import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WithdrawalPhaseSection } from './WithdrawalPhaseSection'
import type { EnhancedSummary } from '../../utils/summary-utils'

describe('WithdrawalPhaseSection', () => {
  describe('single withdrawal phase', () => {
    const mockSinglePhaseSummary: Partial<EnhancedSummary> = {
      endkapitalEntspharphase: 450000,
      monatlicheAuszahlung: 2500,
      isSegmentedWithdrawal: false,
    }

    it('should render the withdrawal phase header with year range', () => {
      render(
        <WithdrawalPhaseSection
          withdrawalStartYear={2041}
          withdrawalEndYear={2080}
          enhancedSummary={mockSinglePhaseSummary as EnhancedSummary}
        />,
      )

      expect(screen.getByText(/💸 Entsparphase/)).toBeInTheDocument()
      expect(screen.getByText(/2041/)).toBeInTheDocument()
      expect(screen.getByText(/2080/)).toBeInTheDocument()
    })

    it('should display end capital in single phase format', () => {
      render(
        <WithdrawalPhaseSection
          withdrawalStartYear={2041}
          withdrawalEndYear={2080}
          enhancedSummary={mockSinglePhaseSummary as EnhancedSummary}
        />,
      )

      expect(screen.getByText('🏁 Endkapital Entsparphase')).toBeInTheDocument()
      expect(screen.getByText('450.000,00 €')).toBeInTheDocument()
    })

    it('should display monthly withdrawal in single phase format', () => {
      render(
        <WithdrawalPhaseSection
          withdrawalStartYear={2041}
          withdrawalEndYear={2080}
          enhancedSummary={mockSinglePhaseSummary as EnhancedSummary}
        />,
      )

      expect(screen.getByText('💶 Monatliche Auszahlung')).toBeInTheDocument()
      expect(screen.getByText('2.500,00 €')).toBeInTheDocument()
    })

    it('should handle zero monthly withdrawal in single phase', () => {
      const summaryWithZeroWithdrawal: Partial<EnhancedSummary> = {
        ...mockSinglePhaseSummary,
        monatlicheAuszahlung: 0,
      }

      render(
        <WithdrawalPhaseSection
          withdrawalStartYear={2041}
          withdrawalEndYear={2080}
          enhancedSummary={summaryWithZeroWithdrawal as EnhancedSummary}
        />,
      )

      expect(screen.getByText('0,00 €')).toBeInTheDocument()
    })

    it('should not show phase count badge for single phase', () => {
      render(
        <WithdrawalPhaseSection
          withdrawalStartYear={2041}
          withdrawalEndYear={2080}
          enhancedSummary={mockSinglePhaseSummary as EnhancedSummary}
        />,
      )

      expect(screen.queryByText(/Phasen/)).not.toBeInTheDocument()
    })
  })

  describe('segmented withdrawal phases', () => {
    const mockSegmentedSummary: Partial<EnhancedSummary> = {
      endkapitalEntspharphase: 300000,
      monatlicheAuszahlung: 1800,
      isSegmentedWithdrawal: true,
      withdrawalSegments: [
        {
          id: '1',
          name: 'Aktive Phase',
          startYear: 2041,
          endYear: 2060,
          strategy: '4prozent',
          startkapital: 500000,
          endkapital: 400000,
          totalWithdrawn: 100000,
          averageMonthlyWithdrawal: 1500,
        },
        {
          id: '2',
          name: 'Pflegephase',
          startYear: 2061,
          endYear: 2075,
          strategy: 'dynamisch',
          startkapital: 400000,
          endkapital: 300000,
          totalWithdrawn: 100000,
          averageMonthlyWithdrawal: 2000,
        },
      ],
    }

    it('should show phase count badge for multiple segments', () => {
      render(
        <WithdrawalPhaseSection
          withdrawalStartYear={2041}
          withdrawalEndYear={2075}
          enhancedSummary={mockSegmentedSummary as EnhancedSummary}
        />,
      )

      expect(screen.getByText(/2.*Phasen/)).toBeInTheDocument()
    })

    it('should display all segment cards', () => {
      render(
        <WithdrawalPhaseSection
          withdrawalStartYear={2041}
          withdrawalEndYear={2075}
          enhancedSummary={mockSegmentedSummary as EnhancedSummary}
        />,
      )

      expect(screen.getByText(/Aktive Phase/)).toBeInTheDocument()
      expect(screen.getByText(/Pflegephase/)).toBeInTheDocument()
    })

    it('should display segment details correctly', () => {
      render(
        <WithdrawalPhaseSection
          withdrawalStartYear={2041}
          withdrawalEndYear={2075}
          enhancedSummary={mockSegmentedSummary as EnhancedSummary}
        />,
      )

      // First segment
      expect(screen.getByText(/2041.*-.*2060/)).toBeInTheDocument()
      expect(screen.getByText(/4prozent/)).toBeInTheDocument()

      // Second segment
      expect(screen.getByText(/2061.*-.*2075/)).toBeInTheDocument()
      expect(screen.getByText(/dynamisch/)).toBeInTheDocument()
    })

    it('should display segment financial data', () => {
      render(
        <WithdrawalPhaseSection
          withdrawalStartYear={2041}
          withdrawalEndYear={2075}
          enhancedSummary={mockSegmentedSummary as EnhancedSummary}
        />,
      )

      // Should show startkapital, endkapital, and totalWithdrawn for segments
      const allCurrencyValues = screen.getAllByText(/€/)
      expect(allCurrencyValues.length).toBeGreaterThan(0)

      // Check for specific values
      expect(screen.getAllByText('500.000,00 €')).toHaveLength(1)
      expect(screen.getAllByText('400.000,00 €')).toHaveLength(2) // Once as endkapital of segment 1, once as startkapital of segment 2
      expect(screen.getAllByText('300.000,00 €')).toHaveLength(2) // Once as endkapital of segment 2, once in overall summary
    })

    it('should show average monthly withdrawal for each segment', () => {
      render(
        <WithdrawalPhaseSection
          withdrawalStartYear={2041}
          withdrawalEndYear={2075}
          enhancedSummary={mockSegmentedSummary as EnhancedSummary}
        />,
      )

      expect(screen.getAllByText('💶 Monatlich Ø')).toHaveLength(2)
      expect(screen.getByText('1.500,00 €')).toBeInTheDocument()
      expect(screen.getByText('2.000,00 €')).toBeInTheDocument()
    })

    it('should hide average monthly withdrawal if zero', () => {
      const summaryWithZeroAvg: Partial<EnhancedSummary> = {
        ...mockSegmentedSummary,
        withdrawalSegments: [
          {
            ...mockSegmentedSummary.withdrawalSegments![0],
            averageMonthlyWithdrawal: 0,
          },
          mockSegmentedSummary.withdrawalSegments![1],
        ],
      }

      render(
        <WithdrawalPhaseSection
          withdrawalStartYear={2041}
          withdrawalEndYear={2075}
          enhancedSummary={summaryWithZeroAvg as EnhancedSummary}
        />,
      )

      // Should only show one "Monatlich Ø" for the second segment
      expect(screen.getAllByText('💶 Monatlich Ø')).toHaveLength(1)
    })

    it('should display overall summary section', () => {
      render(
        <WithdrawalPhaseSection
          withdrawalStartYear={2041}
          withdrawalEndYear={2075}
          enhancedSummary={mockSegmentedSummary as EnhancedSummary}
        />,
      )

      expect(screen.getByText('📊 Gesamt-Übersicht')).toBeInTheDocument()
      expect(screen.getByText('🏁 Endkapital Gesamt')).toBeInTheDocument()
      expect(screen.getByText('💶 Letzte Monatl. Auszahlung')).toBeInTheDocument()
    })

    it('should display overall end capital in summary', () => {
      render(
        <WithdrawalPhaseSection
          withdrawalStartYear={2041}
          withdrawalEndYear={2075}
          enhancedSummary={mockSegmentedSummary as EnhancedSummary}
        />,
      )

      // Overall end capital from enhancedSummary.endkapitalEntspharphase
      const overallSummary = screen.getByText('📊 Gesamt-Übersicht').closest('.bg-green-100')
      expect(overallSummary).toBeInTheDocument()
    })

    it('should handle missing monthly withdrawal in overall summary', () => {
      const summaryWithoutMonthly: Partial<EnhancedSummary> = {
        ...mockSegmentedSummary,
        monatlicheAuszahlung: undefined,
      }

      render(
        <WithdrawalPhaseSection
          withdrawalStartYear={2041}
          withdrawalEndYear={2075}
          enhancedSummary={summaryWithoutMonthly as EnhancedSummary}
        />,
      )

      expect(screen.queryByText('💶 Letzte Monatl. Auszahlung')).not.toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should return null if no withdrawal data exists', () => {
      const noWithdrawalSummary: Partial<EnhancedSummary> = {
        endkapitalEntspharphase: undefined,
      }

      const { container } = render(
        <WithdrawalPhaseSection
          withdrawalStartYear={2041}
          withdrawalEndYear={2080}
          enhancedSummary={noWithdrawalSummary as EnhancedSummary}
        />,
      )

      expect(container.firstChild).toBeNull()
    })

    it('should treat single segment as non-segmented', () => {
      const singleSegmentSummary: Partial<EnhancedSummary> = {
        endkapitalEntspharphase: 450000,
        monatlicheAuszahlung: 2500,
        isSegmentedWithdrawal: true,
        withdrawalSegments: [
          {
            id: '1',
            name: 'Phase 1',
            startYear: 2041,
            endYear: 2080,
            strategy: '4prozent',
            startkapital: 500000,
            endkapital: 450000,
            totalWithdrawn: 50000,
            averageMonthlyWithdrawal: 2500,
          },
        ],
      }

      render(
        <WithdrawalPhaseSection
          withdrawalStartYear={2041}
          withdrawalEndYear={2080}
          enhancedSummary={singleSegmentSummary as EnhancedSummary}
        />,
      )

      // Should not show phase count for single segment
      expect(screen.queryByText(/Phasen/)).not.toBeInTheDocument()
      // Should display in single phase format
      expect(screen.getByText('🏁 Endkapital Entsparphase')).toBeInTheDocument()
    })
  })
})
