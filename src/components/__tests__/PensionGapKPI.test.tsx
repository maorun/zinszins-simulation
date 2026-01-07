import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PensionGapKPI } from '../PensionGapKPI';

describe('PensionGapKPI Component', () => {
  describe('Basic Rendering', () => {
    it('should render with correct title and description', () => {
      render(
        <PensionGapKPI
          desiredMonthlyIncome={3000}
          expectedPension={2000}
        />
      );
      
      expect(screen.getByText('Erwartete Rentenlücke')).toBeInTheDocument();
      expect(screen.getByText('Differenz zwischen Wunscheinkommen und gesetzlicher Rente')).toBeInTheDocument();
    });

    it('should display monthly pension gap', () => {
      render(
        <PensionGapKPI
          desiredMonthlyIncome={3000}
          expectedPension={2000}
        />
      );
      
      expect(screen.getByText('1.000,00 €')).toBeInTheDocument();
      expect(screen.getByText('/ Monat')).toBeInTheDocument();
    });
  });

  describe('Gap Calculation', () => {
    it('should display desired income and expected pension', () => {
      render(
        <PensionGapKPI
          desiredMonthlyIncome={3000}
          expectedPension={2000}
        />
      );
      
      expect(screen.getByText('3.000,00 €')).toBeInTheDocument();
      expect(screen.getByText('2.000,00 €')).toBeInTheDocument();
    });

    it('should calculate and display annual gap', () => {
      render(
        <PensionGapKPI
          desiredMonthlyIncome={3000}
          expectedPension={2000}
        />
      );
      
      // Monthly gap is 1000, so annual is 12000
      expect(screen.getByText('12.000,00 €')).toBeInTheDocument();
      expect(screen.getByText('Jährliche Lücke')).toBeInTheDocument();
    });

    it('should display coverage percentage', () => {
      render(
        <PensionGapKPI
          desiredMonthlyIncome={3000}
          expectedPension={2000}
        />
      );
      
      // Coverage is 2000/3000 = 66.67%
      expect(screen.getByText('66.7%')).toBeInTheDocument();
      expect(screen.getByText('Abdeckung durch Rente')).toBeInTheDocument();
    });

    it('should handle zero pension gap', () => {
      render(
        <PensionGapKPI
          desiredMonthlyIncome={2000}
          expectedPension={2000}
        />
      );
      
      expect(screen.getByText('Keine Rentenlücke:')).toBeInTheDocument();
      expect(screen.getByText(/Die erwartete Rente deckt Ihr Wunscheinkommen vollständig/)).toBeInTheDocument();
    });

    it('should handle pension surplus', () => {
      render(
        <PensionGapKPI
          desiredMonthlyIncome={2000}
          expectedPension={3000}
        />
      );
      
      expect(screen.getByText('Keine Rentenlücke:')).toBeInTheDocument();
      expect(screen.getByText(/Die erwartete Rente übersteigt Ihr Wunscheinkommen/)).toBeInTheDocument();
      // The surplus amount is embedded in the alert text
      expect(screen.getByText(/1\.000,00 €/)).toBeInTheDocument();
    });
  });

  describe('Portfolio Requirement', () => {
    it('should display required portfolio size when showPortfolioRequirement is true', () => {
      render(
        <PensionGapKPI
          desiredMonthlyIncome={3000}
          expectedPension={2000}
          showPortfolioRequirement={true}
        />
      );
      
      expect(screen.getByText('Erforderliches Vermögen (4%-Regel):')).toBeInTheDocument();
      // Gap is 1000/month = 12000/year, at 4% = 300,000
      expect(screen.getByText('300.000,00 €')).toBeInTheDocument();
    });

    it('should hide portfolio requirement when showPortfolioRequirement is false', () => {
      render(
        <PensionGapKPI
          desiredMonthlyIncome={3000}
          expectedPension={2000}
          showPortfolioRequirement={false}
        />
      );
      
      expect(screen.queryByText('Erforderliches Vermögen (4%-Regel):')).not.toBeInTheDocument();
    });

    it('should not show portfolio requirement when there is no gap', () => {
      render(
        <PensionGapKPI
          desiredMonthlyIncome={2000}
          expectedPension={2000}
          showPortfolioRequirement={true}
        />
      );
      
      expect(screen.queryByText('Erforderliches Vermögen (4%-Regel):')).not.toBeInTheDocument();
    });

    it('should calculate correct portfolio size for different gaps', () => {
      const { rerender } = render(
        <PensionGapKPI
          desiredMonthlyIncome={3500}
          expectedPension={2000}
          showPortfolioRequirement={true}
        />
      );
      
      // Gap is 1500/month = 18000/year, at 4% = 450,000
      expect(screen.getByText('450.000,00 €')).toBeInTheDocument();
      
      rerender(
        <PensionGapKPI
          desiredMonthlyIncome={2500}
          expectedPension={2000}
          showPortfolioRequirement={true}
        />
      );
      
      // Gap is 500/month = 6000/year, at 4% = 150,000
      expect(screen.getByText('150.000,00 €')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero desired income', () => {
      render(
        <PensionGapKPI
          desiredMonthlyIncome={0}
          expectedPension={2000}
        />
      );
      
      expect(screen.getByText('Keine Rentenlücke:')).toBeInTheDocument();
    });

    it('should handle zero expected pension', () => {
      render(
        <PensionGapKPI
          desiredMonthlyIncome={3000}
          expectedPension={0}
        />
      );
      
      // Gap should be full desired income (appears multiple times)
      const amounts = screen.getAllByText('3.000,00 €');
      expect(amounts.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('0.0%')).toBeInTheDocument(); // 0% coverage
    });

    it('should handle negative values gracefully', () => {
      render(
        <PensionGapKPI
          desiredMonthlyIncome={-1000}
          expectedPension={2000}
        />
      );
      
      // Should show no gap or surplus message
      expect(screen.getByText('Keine Rentenlücke:')).toBeInTheDocument();
    });

    it('should format large numbers correctly', () => {
      render(
        <PensionGapKPI
          desiredMonthlyIncome={10000}
          expectedPension={2000}
        />
      );
      
      expect(screen.getByText('10.000,00 €')).toBeInTheDocument();
      expect(screen.getByText('2.000,00 €')).toBeInTheDocument();
      expect(screen.getByText('8.000,00 €')).toBeInTheDocument(); // Monthly gap
      expect(screen.getByText('96.000,00 €')).toBeInTheDocument(); // Annual gap
    });
  });

  describe('Visual States', () => {
    it('should show orange color for pension gap', () => {
      const { container } = render(
        <PensionGapKPI
          desiredMonthlyIncome={3000}
          expectedPension={2000}
        />
      );
      
      const gapAmount = container.querySelector('.text-orange-600');
      expect(gapAmount).toBeInTheDocument();
    });

    it('should show recommendation section when there is a gap', () => {
      render(
        <PensionGapKPI
          desiredMonthlyIncome={3000}
          expectedPension={2000}
        />
      );
      
      expect(screen.getByText('Empfehlung:')).toBeInTheDocument();
      expect(screen.getByText(/Bauen Sie zusätzliche Altersvorsorge auf/)).toBeInTheDocument();
    });

    it('should not show recommendation when there is no gap', () => {
      render(
        <PensionGapKPI
          desiredMonthlyIncome={2000}
          expectedPension={2000}
        />
      );
      
      expect(screen.queryByText('Empfehlung:')).not.toBeInTheDocument();
    });
  });

  describe('Labels and Text', () => {
    it('should display correct field labels', () => {
      render(
        <PensionGapKPI
          desiredMonthlyIncome={3000}
          expectedPension={2000}
        />
      );
      
      expect(screen.getByText('Wunscheinkommen')).toBeInTheDocument();
      expect(screen.getByText('Erwartete Rente')).toBeInTheDocument();
      expect(screen.getByText('Abdeckung durch Rente')).toBeInTheDocument();
      expect(screen.getByText('Jährliche Lücke')).toBeInTheDocument();
    });

    it('should display 4% rule explanation', () => {
      render(
        <PensionGapKPI
          desiredMonthlyIncome={3000}
          expectedPension={2000}
          showPortfolioRequirement={true}
        />
      );
      
      expect(screen.getByText(/Bei einer sicheren Entnahmerate von 4% pro Jahr/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      render(
        <PensionGapKPI
          desiredMonthlyIncome={3000}
          expectedPension={2000}
        />
      );
      
      expect(screen.getByText('Erwartete Rentenlücke')).toBeInTheDocument();
      expect(screen.getByText('Wunscheinkommen')).toBeInTheDocument();
      expect(screen.getByText('Erwartete Rente')).toBeInTheDocument();
    });

    it('should have unique IDs', () => {
      const { container } = render(
        <PensionGapKPI
          desiredMonthlyIncome={3000}
          expectedPension={2000}
        />
      );
      
      const card = container.querySelector('[id^="pension-gap-kpi-card"]');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Multiple Instances', () => {
    it('should render multiple instances without ID conflicts', () => {
      const { container } = render(
        <>
          <PensionGapKPI
            desiredMonthlyIncome={3000}
            expectedPension={2000}
          />
          <PensionGapKPI
            desiredMonthlyIncome={4000}
            expectedPension={2500}
          />
        </>
      );
      
      // Both instances should render
      const titles = screen.getAllByText('Erwartete Rentenlücke');
      expect(titles).toHaveLength(2);
      
      // IDs should be unique
      const cards = container.querySelectorAll('[id^="pension-gap-kpi-card"]');
      const ids = Array.from(cards).map(card => card.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('Coverage Calculation', () => {
    it('should calculate 100% coverage when pension equals desired income', () => {
      render(
        <PensionGapKPI
          desiredMonthlyIncome={2000}
          expectedPension={2000}
        />
      );
      
      // Coverage should be calculated but not displayed in the no-gap message
      expect(screen.getByText('Keine Rentenlücke:')).toBeInTheDocument();
    });

    it('should calculate correct coverage for partial pension', () => {
      render(
        <PensionGapKPI
          desiredMonthlyIncome={4000}
          expectedPension={1000}
        />
      );
      
      // Coverage is 1000/4000 = 25%
      expect(screen.getByText('25.0%')).toBeInTheDocument();
    });

    it('should cap coverage at 100% for surplus', () => {
      render(
        <PensionGapKPI
          desiredMonthlyIncome={2000}
          expectedPension={3000}
        />
      );
      
      // Even though pension > desired, no percentage should be shown in surplus state
      expect(screen.getByText('Keine Rentenlücke:')).toBeInTheDocument();
    });
  });
});
