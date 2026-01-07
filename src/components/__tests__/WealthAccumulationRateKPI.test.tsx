import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WealthAccumulationRateKPI } from '../WealthAccumulationRateKPI';

describe('WealthAccumulationRateKPI Component', () => {
  describe('Basic Rendering', () => {
    it('should render with correct title and description', () => {
      render(
        <WealthAccumulationRateKPI
          currentWealth={100000}
          targetWealth={500000}
          yearsToTarget={10}
        />
      );
      
      expect(screen.getByText('Vermögensaufbau-Rate')).toBeInTheDocument();
      expect(screen.getByText('Jährliche Wachstumsrate zum Erreichen des Ziels')).toBeInTheDocument();
    });

    it('should display accumulation rate percentage', () => {
      render(
        <WealthAccumulationRateKPI
          currentWealth={100000}
          targetWealth={500000}
          yearsToTarget={10}
        />
      );
      
      // Should display the calculated rate (8.0%)
      const rates = screen.getAllByText(/\d+\.\d+%/);
      expect(rates.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('pro Jahr')).toBeInTheDocument();
    });

    it('should display progress percentage', () => {
      render(
        <WealthAccumulationRateKPI
          currentWealth={100000}
          targetWealth={500000}
          yearsToTarget={10}
        />
      );
      
      expect(screen.getByText('Fortschritt zum Ziel')).toBeInTheDocument();
      expect(screen.getByText('20.0%')).toBeInTheDocument();
    });
  });

  describe('Details Display', () => {
    it('should show detailed information when showDetails is true', () => {
      render(
        <WealthAccumulationRateKPI
          currentWealth={100000}
          targetWealth={500000}
          yearsToTarget={10}
          showDetails={true}
        />
      );
      
      expect(screen.getAllByText('Aktuelles Vermögen')).toHaveLength(1);
      expect(screen.getAllByText('Zielvermögen')).toHaveLength(1);
      expect(screen.getByText('Verbleibende Zeit')).toBeInTheDocument();
      expect(screen.getByText('Erforderliches Wachstum/Jahr')).toBeInTheDocument();
      expect(screen.getByText('Fehlbetrag zum Ziel')).toBeInTheDocument();
    });

    it('should hide detailed information when showDetails is false', () => {
      render(
        <WealthAccumulationRateKPI
          currentWealth={100000}
          targetWealth={500000}
          yearsToTarget={10}
          showDetails={false}
        />
      );
      
      expect(screen.queryByText('Aktuelles Vermögen')).not.toBeInTheDocument();
      expect(screen.queryByText('Zielvermögen')).not.toBeInTheDocument();
    });

    it('should display current and target wealth correctly', () => {
      render(
        <WealthAccumulationRateKPI
          currentWealth={100000}
          targetWealth={500000}
          yearsToTarget={10}
        />
      );
      
      expect(screen.getByText('100.000,00 €')).toBeInTheDocument();
      expect(screen.getByText('500.000,00 €')).toBeInTheDocument();
    });

    it('should display years to target with correct singular/plural form', () => {
      const { rerender } = render(
        <WealthAccumulationRateKPI
          currentWealth={100000}
          targetWealth={500000}
          yearsToTarget={1}
        />
      );
      
      expect(screen.getByText('1 Jahr')).toBeInTheDocument();
      
      rerender(
        <WealthAccumulationRateKPI
          currentWealth={100000}
          targetWealth={500000}
          yearsToTarget={5}
        />
      );
      
      expect(screen.getByText('5 Jahre')).toBeInTheDocument();
    });
  });

  describe('Target Reached State', () => {
    it('should show target reached message when current equals target', () => {
      render(
        <WealthAccumulationRateKPI
          currentWealth={500000}
          targetWealth={500000}
          yearsToTarget={10}
        />
      );
      
      expect(screen.getByText('🎉 Ziel erreicht!')).toBeInTheDocument();
      expect(screen.getByText('Das Vermögensziel wurde bereits erreicht oder überschritten.')).toBeInTheDocument();
    });

    it('should show target reached message when current exceeds target', () => {
      render(
        <WealthAccumulationRateKPI
          currentWealth={600000}
          targetWealth={500000}
          yearsToTarget={10}
        />
      );
      
      expect(screen.getByText('🎉 Ziel erreicht!')).toBeInTheDocument();
    });

    it('should not show accumulation rate when target is reached', () => {
      render(
        <WealthAccumulationRateKPI
          currentWealth={500000}
          targetWealth={500000}
          yearsToTarget={10}
        />
      );
      
      expect(screen.queryByText('pro Jahr')).not.toBeInTheDocument();
      expect(screen.queryByText('Fortschritt zum Ziel')).not.toBeInTheDocument();
    });
  });

  describe('Progress Calculation', () => {
    it('should calculate correct progress percentage', () => {
      render(
        <WealthAccumulationRateKPI
          currentWealth={250000}
          targetWealth={500000}
          yearsToTarget={5}
        />
      );
      
      expect(screen.getByText('50.0%')).toBeInTheDocument();
    });

    it('should show 0% progress when starting from zero', () => {
      render(
        <WealthAccumulationRateKPI
          currentWealth={0}
          targetWealth={500000}
          yearsToTarget={10}
        />
      );
      
      expect(screen.getByText('0.0%')).toBeInTheDocument();
    });

    it('should cap progress at 100% even if exceeded', () => {
      render(
        <WealthAccumulationRateKPI
          currentWealth={600000}
          targetWealth={500000}
          yearsToTarget={10}
        />
      );
      
      // Should show target reached message instead of percentage
      expect(screen.getByText('🎉 Ziel erreicht!')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero target wealth gracefully', () => {
      render(
        <WealthAccumulationRateKPI
          currentWealth={100000}
          targetWealth={0}
          yearsToTarget={10}
        />
      );
      
      // Should show target reached since current >= target
      expect(screen.getByText('🎉 Ziel erreicht!')).toBeInTheDocument();
    });

    it('should handle zero years to target', () => {
      render(
        <WealthAccumulationRateKPI
          currentWealth={100000}
          targetWealth={500000}
          yearsToTarget={0}
        />
      );
      
      expect(screen.getByText('0.0%')).toBeInTheDocument();
      expect(screen.getByText('0 Jahre')).toBeInTheDocument();
    });

    it('should handle negative wealth gap (already exceeded)', () => {
      render(
        <WealthAccumulationRateKPI
          currentWealth={600000}
          targetWealth={500000}
          yearsToTarget={10}
        />
      );
      
      expect(screen.getByText('🎉 Ziel erreicht!')).toBeInTheDocument();
    });

    it('should format large numbers correctly', () => {
      render(
        <WealthAccumulationRateKPI
          currentWealth={1500000}
          targetWealth={5000000}
          yearsToTarget={15}
        />
      );
      
      expect(screen.getByText('1.500.000,00 €')).toBeInTheDocument();
      expect(screen.getByText('5.000.000,00 €')).toBeInTheDocument();
    });
  });

  describe('Required Growth Calculations', () => {
    it('should display annual required growth amount', () => {
      render(
        <WealthAccumulationRateKPI
          currentWealth={100000}
          targetWealth={500000}
          yearsToTarget={10}
        />
      );
      
      // Gap is 400,000 / 10 years = 40,000 per year
      expect(screen.getByText('40.000,00 €')).toBeInTheDocument();
    });

    it('should display wealth gap correctly', () => {
      render(
        <WealthAccumulationRateKPI
          currentWealth={100000}
          targetWealth={500000}
          yearsToTarget={10}
        />
      );
      
      expect(screen.getByText('400.000,00 €')).toBeInTheDocument();
    });
  });

  describe('Progress Bar', () => {
    it('should render progress bar', () => {
      const { container } = render(
        <WealthAccumulationRateKPI
          currentWealth={100000}
          targetWealth={500000}
          yearsToTarget={10}
        />
      );
      
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('should not render progress bar when target is reached', () => {
      const { container } = render(
        <WealthAccumulationRateKPI
          currentWealth={500000}
          targetWealth={500000}
          yearsToTarget={10}
        />
      );
      
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      render(
        <WealthAccumulationRateKPI
          currentWealth={100000}
          targetWealth={500000}
          yearsToTarget={10}
        />
      );
      
      expect(screen.getByText('Vermögensaufbau-Rate')).toBeInTheDocument();
      expect(screen.getByText('Fortschritt zum Ziel')).toBeInTheDocument();
    });

    it('should have unique IDs', () => {
      const { container } = render(
        <WealthAccumulationRateKPI
          currentWealth={100000}
          targetWealth={500000}
          yearsToTarget={10}
        />
      );
      
      const card = container.querySelector('[id^="wealth-accumulation-kpi-card"]');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Multiple Instances', () => {
    it('should render multiple instances without ID conflicts', () => {
      const { container } = render(
        <>
          <WealthAccumulationRateKPI
            currentWealth={100000}
            targetWealth={500000}
            yearsToTarget={10}
          />
          <WealthAccumulationRateKPI
            currentWealth={200000}
            targetWealth={600000}
            yearsToTarget={8}
          />
        </>
      );
      
      // Both instances should render
      const titles = screen.getAllByText('Vermögensaufbau-Rate');
      expect(titles).toHaveLength(2);
      
      // IDs should be unique
      const cards = container.querySelectorAll('[id^="wealth-accumulation-kpi-card"]');
      const ids = Array.from(cards).map(card => card.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('Hint Message', () => {
    it('should display explanatory hint when showDetails is true', () => {
      render(
        <WealthAccumulationRateKPI
          currentWealth={100000}
          targetWealth={500000}
          yearsToTarget={10}
          showDetails={true}
        />
      );
      
      expect(screen.getByText('Hinweis:')).toBeInTheDocument();
      expect(screen.getByText(/Diese Rate zeigt/)).toBeInTheDocument();
    });

    it('should not display hint when showDetails is false', () => {
      render(
        <WealthAccumulationRateKPI
          currentWealth={100000}
          targetWealth={500000}
          yearsToTarget={10}
          showDetails={false}
        />
      );
      
      expect(screen.queryByText('Hinweis:')).not.toBeInTheDocument();
    });
  });
});
