import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StickyBottomOverview } from './StickyBottomOverview';
import { useSimulation } from '../contexts/useSimulation';
import { getEnhancedOverviewSummary } from '../utils/enhanced-summary';

// Mock the dependencies
vi.mock('../contexts/useSimulation');
vi.mock('../utils/enhanced-summary');

describe('StickyBottomOverview - Withdrawal Phase Display', () => {
  const mockOverviewRef = { current: document.createElement('div') };
  const mockUseSimulation = vi.mocked(useSimulation);
  const mockGetEnhancedOverviewSummary = vi.mocked(getEnhancedOverviewSummary);

  const mockSimulationData = {
    sparplanElements: [{ start: '2025-01-01', amount: 2000 }]
  };

  const mockEnhancedSummary = {
    endkapital: 561391.60,
    startkapital: 369057.85,
    zinsen: 192333.75,
    renditeAnsparphase: 2.84,
    endkapitalEntspharphase: 450000.00,
    monatlicheAuszahlung: 2500.00,
    jahreEntspharphase: 30
  };

  beforeEach(() => {
    mockUseSimulation.mockReturnValue({
      simulationData: mockSimulationData,
      startEnd: [2040, 2080],
      withdrawalResults: null,
      rendite: 5,
      steuerlast: 26.375,
      teilfreistellungsquote: 30
    } as any);

    mockGetEnhancedOverviewSummary.mockReturnValue(mockEnhancedSummary as any);

    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', { value: 1024 });

    // Mock scroll behavior
    vi.spyOn(window, 'addEventListener');
    vi.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('visibility conditions', () => {
    it('should not render when simulationData is not available', () => {
      mockUseSimulation.mockReturnValue({
        simulationData: null,
        startEnd: [2040, 2080],
        withdrawalResults: null,
        rendite: 5,
        steuerlast: 26.375,
        teilfreistellungsquote: 30
      } as any);

      render(
        <StickyBottomOverview 
          overviewElementRef={mockOverviewRef}
        />
      );

      expect(screen.queryByText('💸 Entsparphase')).not.toBeInTheDocument();
    });

    it('should not render when enhancedSummary is not available', () => {
      mockGetEnhancedOverviewSummary.mockReturnValue(null as any);

      render(
        <StickyBottomOverview 
          overviewElementRef={mockOverviewRef}
        />
      );

      expect(screen.queryByText('💸 Entsparphase')).not.toBeInTheDocument();
    });

    it('should not render when withdrawal data (endkapitalEntspharphase) is not available', () => {
      mockGetEnhancedOverviewSummary.mockReturnValue({
        ...mockEnhancedSummary,
        endkapitalEntspharphase: undefined
      } as any);

      render(
        <StickyBottomOverview 
          overviewElementRef={mockOverviewRef}
        />
      );

      expect(screen.queryByText('💸 Entsparphase')).not.toBeInTheDocument();
    });

    it('should not render when overview element is still visible (bottom >= 0)', () => {
      // Mock getBoundingClientRect to simulate overview still visible
      const mockGetBoundingClientRect = vi.fn(() => ({
        top: -100,
        bottom: 50, // Still visible
        height: 400,
        width: 800,
        left: 0,
        right: 800,
        x: 0,
        y: -100,
        toJSON: () => ({})
      } as DOMRect));
      
      mockOverviewRef.current!.getBoundingClientRect = mockGetBoundingClientRect;

      render(
        <StickyBottomOverview 
          overviewElementRef={mockOverviewRef}
        />
      );

      expect(screen.queryByText('💸 Entsparphase')).not.toBeInTheDocument();
    });
  });

  describe('desktop rendering when sticky', () => {
    beforeEach(() => {
      // Mock getBoundingClientRect to simulate overview out of view
      const mockGetBoundingClientRect = vi.fn(() => ({
        top: -400,
        bottom: -50, // Out of view
        height: 400,
        width: 800,
        left: 0,
        right: 800,
        x: 0,
        y: -400,
        toJSON: () => ({})
      } as DOMRect));
      
      mockOverviewRef.current!.getBoundingClientRect = mockGetBoundingClientRect;
      Object.defineProperty(window, 'innerWidth', { value: 1024 }); // Desktop
    });

    it('should render desktop withdrawal phase layout when all conditions are met', () => {
      render(
        <StickyBottomOverview 
          overviewElementRef={mockOverviewRef}
        />
      );

      // Check title
      expect(screen.getByText('💸 Entsparphase (2041 - 2080)')).toBeInTheDocument();

      // Check start capital
      expect(screen.getByText('🏁 Startkapital')).toBeInTheDocument();
      expect(screen.getByText('561.391,60 €')).toBeInTheDocument();

      // Check end capital (highlighted)
      expect(screen.getByText('💰 Endkapital')).toBeInTheDocument();
      expect(screen.getByText('450.000,00 €')).toBeInTheDocument();

      // Check monthly withdrawal
      expect(screen.getByText('💶 Monatliche Auszahlung')).toBeInTheDocument();
      expect(screen.getByText('2.500,00 €')).toBeInTheDocument();
    });

    it('should render without monthly withdrawal when not available', () => {
      mockGetEnhancedOverviewSummary.mockReturnValue({
        ...mockEnhancedSummary,
        monatlicheAuszahlung: undefined
      } as any);

      render(
        <StickyBottomOverview 
          overviewElementRef={mockOverviewRef}
        />
      );

      // Should still render the main elements
      expect(screen.getByText('💸 Entsparphase (2041 - 2080)')).toBeInTheDocument();
      expect(screen.getByText('🏁 Startkapital')).toBeInTheDocument();
      expect(screen.getByText('💰 Endkapital')).toBeInTheDocument();
      
      // But not the monthly withdrawal
      expect(screen.queryByText('💶 Monatliche Auszahlung')).not.toBeInTheDocument();
    });

    it('should display segmented withdrawal information when multiple phases exist', () => {
      mockGetEnhancedOverviewSummary.mockReturnValue({
        ...mockEnhancedSummary,
        isSegmentedWithdrawal: true,
        withdrawalSegments: [
          { name: 'Phase 1' },
          { name: 'Phase 2' },
          { name: 'Phase 3' }
        ]
      } as any);

      render(
        <StickyBottomOverview 
          overviewElementRef={mockOverviewRef}
        />
      );

      // Should show segment count in title
      expect(screen.getByText('💸 Entsparphase (2041 - 2080)')).toBeInTheDocument();
      // Check that the span contains the segment information (text is split by whitespace)
      const segmentSpan = screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'span' && 
               element?.className.includes('text-teal-600') && 
               content.includes('3') && 
               content.includes('Phasen');
      });
      expect(segmentSpan).toBeInTheDocument();
    });
  });

  describe('mobile rendering when sticky', () => {
    beforeEach(() => {
      // Mock getBoundingClientRect to simulate overview out of view
      const mockGetBoundingClientRect = vi.fn(() => ({
        top: -400,
        bottom: -50, // Out of view
        height: 400,
        width: 800,
        left: 0,
        right: 800,
        x: 0,
        y: -400,
        toJSON: () => ({})
      } as DOMRect));
      
      mockOverviewRef.current!.getBoundingClientRect = mockGetBoundingClientRect;
      Object.defineProperty(window, 'innerWidth', { value: 600 }); // Mobile
    });

    it('should render mobile withdrawal phase layout with compact formatting', () => {
      render(
        <StickyBottomOverview 
          overviewElementRef={mockOverviewRef}
        />
      );

      // Check for mobile icons and compact currency formatting
      expect(screen.getByText('⏱️')).toBeInTheDocument();
      expect(screen.getByText('🏁')).toBeInTheDocument();
      expect(screen.getByText('💰')).toBeInTheDocument();

      // Check for year range
      expect(screen.getByText('2041 - 2080')).toBeInTheDocument();

      // Check for compact currency (should show "561k €" and "450k €")
      expect(screen.getByText('561k €')).toBeInTheDocument();
      expect(screen.getByText('450k €')).toBeInTheDocument();
    });

    it('should show segment count in mobile view when segmented withdrawal exists', () => {
      mockGetEnhancedOverviewSummary.mockReturnValue({
        ...mockEnhancedSummary,
        isSegmentedWithdrawal: true,
        withdrawalSegments: [
          { name: 'Phase 1' },
          { name: 'Phase 2' }
        ]
      } as any);

      render(
        <StickyBottomOverview 
          overviewElementRef={mockOverviewRef}
        />
      );

      // Should show segment count with year range
      expect(screen.getByText('2041 - 2080 (2)')).toBeInTheDocument();
    });
  });

  describe('currency formatting edge cases', () => {
    beforeEach(() => {
      // Mock getBoundingClientRect to simulate overview out of view
      const mockGetBoundingClientRect = vi.fn(() => ({
        top: -400,
        bottom: -50, // Out of view
        height: 400,
        width: 800,
        left: 0,
        right: 800,
        x: 0,
        y: -400,
        toJSON: () => ({})
      } as DOMRect));
      
      mockOverviewRef.current!.getBoundingClientRect = mockGetBoundingClientRect;
      Object.defineProperty(window, 'innerWidth', { value: 600 }); // Mobile for compact formatting
    });

    it('should format millions correctly in mobile view', () => {
      mockGetEnhancedOverviewSummary.mockReturnValue({
        ...mockEnhancedSummary,
        endkapital: 1500000, // 1.5M
        endkapitalEntspharphase: 2300000 // 2.3M
      } as any);

      render(
        <StickyBottomOverview 
          overviewElementRef={mockOverviewRef}
        />
      );

      expect(screen.getByText('1.5M €')).toBeInTheDocument();
      expect(screen.getByText('2.3M €')).toBeInTheDocument();
    });

    it('should format thousands correctly in mobile view', () => {
      mockGetEnhancedOverviewSummary.mockReturnValue({
        ...mockEnhancedSummary,
        endkapital: 85000, // 85k
        endkapitalEntspharphase: 123000 // 123k
      } as any);

      render(
        <StickyBottomOverview 
          overviewElementRef={mockOverviewRef}
        />
      );

      expect(screen.getByText('85k €')).toBeInTheDocument();
      expect(screen.getByText('123k €')).toBeInTheDocument();
    });

    it('should format small amounts without abbreviation in mobile view', () => {
      mockGetEnhancedOverviewSummary.mockReturnValue({
        ...mockEnhancedSummary,
        endkapital: 500, // Small amount
        endkapitalEntspharphase: 750 // Small amount
      } as any);

      render(
        <StickyBottomOverview 
          overviewElementRef={mockOverviewRef}
        />
      );

      expect(screen.getByText('500,00 €')).toBeInTheDocument();
      expect(screen.getByText('750,00 €')).toBeInTheDocument();
    });
  });

  describe('event listener management', () => {
    it('should add and remove scroll event listener properly', () => {
      const { unmount } = render(
        <StickyBottomOverview 
          overviewElementRef={mockOverviewRef}
        />
      );

      // Should add event listeners
      expect(window.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
      expect(window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));

      unmount();

      // Should remove event listeners
      expect(window.removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
      expect(window.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    });
  });
});