import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StickyBottomOverview } from './StickyBottomOverview';
import { useSimulation } from '../contexts/useSimulation';
import { getEnhancedOverviewSummary } from '../utils/enhanced-summary';

// Mock the dependencies
vi.mock('../contexts/useSimulation');
vi.mock('../utils/enhanced-summary');

describe('StickyBottomOverview', () => {
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
          activeTab="ansparen" 
          overviewElementRef={mockOverviewRef}
        />
      );

      expect(screen.queryByText('🎯 Endsparphase')).not.toBeInTheDocument();
    });

    it('should not render when enhancedSummary is not available', () => {
      mockGetEnhancedOverviewSummary.mockReturnValue(null as any);

      render(
        <StickyBottomOverview 
          activeTab="ansparen" 
          overviewElementRef={mockOverviewRef}
        />
      );

      expect(screen.queryByText('🎯 Endsparphase')).not.toBeInTheDocument();
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
          activeTab="ansparen" 
          overviewElementRef={mockOverviewRef}
        />
      );

      expect(screen.queryByText('🎯 Endsparphase')).not.toBeInTheDocument();
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

    describe('savings phase (ansparen)', () => {
      it('should render desktop layout with correct savings data when conditions are met', () => {
        render(
          <StickyBottomOverview 
            activeTab="ansparen" 
            overviewElementRef={mockOverviewRef}
          />
        );

        // Check title
        expect(screen.getByText('🎯 Endsparphase (2025 - 2040)')).toBeInTheDocument();

        // Check end capital (highlighted)
        expect(screen.getByText('561.391,60 €')).toBeInTheDocument();
        expect(screen.getByText('🎯 Endkapital')).toBeInTheDocument();

        // Check interest
        expect(screen.getByText('192.333,75 €')).toBeInTheDocument();
        expect(screen.getByText('📊 Zinsen')).toBeInTheDocument();

        // Check return rate - use flexible text matcher for split content
        expect(screen.getByText(/2\.84.*p\.a\./)).toBeInTheDocument();
        expect(screen.getByText('📈 Rendite')).toBeInTheDocument();
      });
    });

    describe('withdrawal phase (entnehmen)', () => {
      it('should render desktop layout with correct withdrawal data when activeTab is entnehmen', () => {
        render(
          <StickyBottomOverview 
            activeTab="entnehmen" 
            overviewElementRef={mockOverviewRef}
          />
        );

        // Check title
        expect(screen.getByText('💸 Entsparphase (2041 - 2080)')).toBeInTheDocument();

        // Check start capital (from end of savings phase)
        expect(screen.getByText('561.391,60 €')).toBeInTheDocument();
        expect(screen.getByText('🏁 Startkapital')).toBeInTheDocument();

        // Check end capital after withdrawal (highlighted)
        expect(screen.getByText('450.000,00 €')).toBeInTheDocument();
        expect(screen.getByText('💰 Endkapital')).toBeInTheDocument();

        // Check monthly withdrawal
        expect(screen.getByText('2.500,00 €')).toBeInTheDocument();
        expect(screen.getByText('💶 Monatliche Auszahlung')).toBeInTheDocument();
      });

      it('should not render withdrawal content when withdrawal data is not available', () => {
        mockGetEnhancedOverviewSummary.mockReturnValue({
          ...mockEnhancedSummary,
          endkapitalEntspharphase: undefined,
        } as any);

        render(
          <StickyBottomOverview 
            activeTab="entnehmen" 
            overviewElementRef={mockOverviewRef}
          />
        );

        expect(screen.queryByText('💸 Entsparphase')).not.toBeInTheDocument();
      });

      it('should handle withdrawal content without monthly withdrawal amount', () => {
        mockGetEnhancedOverviewSummary.mockReturnValue({
          ...mockEnhancedSummary,
          endkapitalEntspharphase: 400000,
          monatlicheAuszahlung: undefined,
        } as any);

        render(
          <StickyBottomOverview 
            activeTab="entnehmen" 
            overviewElementRef={mockOverviewRef}
          />
        );

        // Should show title and capital amounts
        expect(screen.getByText('💸 Entsparphase (2041 - 2080)')).toBeInTheDocument();
        expect(screen.getByText('400.000,00 €')).toBeInTheDocument();
        
        // Should not show monthly withdrawal section
        expect(screen.queryByText('💶 Monatliche Auszahlung')).not.toBeInTheDocument();
      });

      it('should display segmented withdrawal information when available', () => {
        mockGetEnhancedOverviewSummary.mockReturnValue({
          ...mockEnhancedSummary,
          isSegmentedWithdrawal: true,
          withdrawalSegments: [
            { id: '1', name: 'Phase 1' },
            { id: '2', name: 'Phase 2' },
            { id: '3', name: 'Phase 3' }
          ]
        } as any);

        render(
          <StickyBottomOverview 
            activeTab="entnehmen" 
            overviewElementRef={mockOverviewRef}
          />
        );

        expect(screen.getByText((_content, element) => {
          return element?.textContent === '💸 Entsparphase (2041 - 2080) - 3 Phasen';
        })).toBeInTheDocument();
      });
    });

    it('should have correct styling classes for desktop', () => {
      const { container } = render(
        <StickyBottomOverview 
          activeTab="ansparen" 
          overviewElementRef={mockOverviewRef}
        />
      );

      const stickyElement = container.firstChild as HTMLElement;
      expect(stickyElement).toHaveClass('fixed', 'bottom-0', 'left-0', 'right-0', 'z-[999]');
      expect(stickyElement).toHaveClass('bg-white/95', 'backdrop-blur-sm', 'border-t', 'border-gray-200');
      expect(stickyElement).toHaveClass('shadow-lg', 'animate-slide-up');
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

    describe('savings phase (ansparen)', () => {
      it('should render mobile layout with compact format for savings', () => {
        render(
          <StickyBottomOverview 
            activeTab="ansparen" 
            overviewElementRef={mockOverviewRef}
          />
        );

        // Check time range
        expect(screen.getByText('2025 - 2040')).toBeInTheDocument();

        // Check compact end capital format (should be 561k €)
        expect(screen.getByText('561k €')).toBeInTheDocument();

        // Check compact return rate
        expect(screen.getByText('2.8%')).toBeInTheDocument();

        // Check icons are present
        expect(screen.getByText('⏱️')).toBeInTheDocument();
        expect(screen.getByText('🎯')).toBeInTheDocument();
        expect(screen.getByText('📈')).toBeInTheDocument();
      });
    });

    describe('withdrawal phase (entnehmen)', () => {
      it('should render mobile layout with compact format for withdrawal', () => {
        render(
          <StickyBottomOverview 
            activeTab="entnehmen" 
            overviewElementRef={mockOverviewRef}
          />
        );

        // Check time range
        expect(screen.getByText('2041 - 2080')).toBeInTheDocument();

        // Check compact start capital format (561k €)
        expect(screen.getByText('561k €')).toBeInTheDocument();

        // Check compact end capital format (450k €)
        expect(screen.getByText('450k €')).toBeInTheDocument();

        // Check icons are present
        expect(screen.getByText('⏱️')).toBeInTheDocument();
        expect(screen.getByText('🏁')).toBeInTheDocument();
        expect(screen.getByText('💰')).toBeInTheDocument();
      });

      it('should display segment count in mobile withdrawal view when available', () => {
        mockGetEnhancedOverviewSummary.mockReturnValue({
          ...mockEnhancedSummary,
          isSegmentedWithdrawal: true,
          withdrawalSegments: [
            { id: '1', name: 'Phase 1' },
            { id: '2', name: 'Phase 2' }
          ]
        } as any);

        render(
          <StickyBottomOverview 
            activeTab="entnehmen" 
            overviewElementRef={mockOverviewRef}
          />
        );

        expect(screen.getByText('2041 - 2080 (2)')).toBeInTheDocument();
      });
    });
  });

  describe('scroll event handling', () => {
    it('should add and remove scroll event listener', () => {
      const { unmount } = render(
        <StickyBottomOverview 
          activeTab="ansparen" 
          overviewElementRef={mockOverviewRef}
        />
      );

      // Check that scroll event listener was added
      expect(window.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));

      unmount();

      // Check that scroll event listener was removed
      expect(window.removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
    });

    it('should add and remove resize event listener for mobile detection', () => {
      const { unmount } = render(
        <StickyBottomOverview 
          activeTab="ansparen" 
          overviewElementRef={mockOverviewRef}
        />
      );

      // Check that resize event listener was added
      expect(window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));

      unmount();

      // Check that resize event listener was removed
      expect(window.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    });
  });

  describe('currency formatting', () => {
    beforeEach(() => {
      const mockGetBoundingClientRect = vi.fn(() => ({
        top: -400,
        bottom: -50,
        height: 400,
        width: 800,
        left: 0,
        right: 800,
        x: 0,
        y: -400,
        toJSON: () => ({})
      } as DOMRect));
      
      mockOverviewRef.current!.getBoundingClientRect = mockGetBoundingClientRect;
    });

    it('should format large amounts correctly in mobile view - savings phase', () => {
      Object.defineProperty(window, 'innerWidth', { value: 600 }); // Mobile
      
      mockGetEnhancedOverviewSummary.mockReturnValue({
        ...mockEnhancedSummary,
        endkapital: 1500000, // 1.5M
      } as any);

      render(
        <StickyBottomOverview 
          activeTab="ansparen" 
          overviewElementRef={mockOverviewRef}
        />
      );

      expect(screen.getByText('1.5M €')).toBeInTheDocument();
    });

    it('should format large amounts correctly in mobile view - withdrawal phase', () => {
      Object.defineProperty(window, 'innerWidth', { value: 600 }); // Mobile
      
      mockGetEnhancedOverviewSummary.mockReturnValue({
        ...mockEnhancedSummary,
        endkapital: 1500000, // 1.5M start capital
        endkapitalEntspharphase: 1200000, // 1.2M end capital
      } as any);

      render(
        <StickyBottomOverview 
          activeTab="entnehmen" 
          overviewElementRef={mockOverviewRef}
        />
      );

      expect(screen.getByText('1.5M €')).toBeInTheDocument(); // Start capital
      expect(screen.getByText('1.2M €')).toBeInTheDocument(); // End capital
    });

    it('should format medium amounts correctly in mobile view', () => {
      Object.defineProperty(window, 'innerWidth', { value: 600 }); // Mobile
      
      mockGetEnhancedOverviewSummary.mockReturnValue({
        ...mockEnhancedSummary,
        endkapital: 250000, // 250k
      } as any);

      render(
        <StickyBottomOverview 
          activeTab="ansparen" 
          overviewElementRef={mockOverviewRef}
        />
      );

      expect(screen.getByText('250k €')).toBeInTheDocument();
    });
  });

  describe('years range calculation', () => {
    beforeEach(() => {
      const mockGetBoundingClientRect = vi.fn(() => ({
        top: -400,
        bottom: -50,
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

    it('should calculate years range correctly from sparplan elements', () => {
      mockUseSimulation.mockReturnValue({
        simulationData: {
          sparplanElements: [
            { start: '2023-01-01', amount: 1000 },
            { start: '2025-06-01', amount: 2000 }
          ]
        },
        startEnd: [2040, 2080],
        withdrawalResults: null,
        rendite: 5,
        steuerlast: 26.375,
        teilfreistellungsquote: 30
      } as any);

      render(
        <StickyBottomOverview 
          activeTab="ansparen" 
          overviewElementRef={mockOverviewRef}
        />
      );

      expect(screen.getByText('🎯 Endsparphase (2023 - 2040)')).toBeInTheDocument();
    });
  });
});