import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SavingsRateKPI } from '../SavingsRateKPI';

describe('SavingsRateKPI Component', () => {
  describe('Basic Rendering', () => {
    it('should render with correct title and description', () => {
      render(<SavingsRateKPI monthlySavings={1000} monthlyIncome={5000} />);
      
      expect(screen.getByText('Sparquote')).toBeInTheDocument();
      expect(screen.getByText('Prozentsatz des Einkommens, der gespart wird')).toBeInTheDocument();
    });

    it('should display correct savings rate percentage', () => {
      render(<SavingsRateKPI monthlySavings={1000} monthlyIncome={5000} />);
      
      expect(screen.getByText('20.0%')).toBeInTheDocument();
    });

    it('should display monthly savings and income', () => {
      render(<SavingsRateKPI monthlySavings={1500} monthlyIncome={4000} />);
      
      expect(screen.getByText('1.500 €')).toBeInTheDocument();
      expect(screen.getByText('4.000 €')).toBeInTheDocument();
    });

    it('should display recommendations section', () => {
      render(<SavingsRateKPI monthlySavings={1000} monthlyIncome={5000} />);
      
      expect(screen.getByText('Empfehlung:')).toBeInTheDocument();
      expect(screen.getByText(/> 20%: Ausgezeichnete Sparquote/)).toBeInTheDocument();
    });
  });

  describe('Category Display', () => {
    it('should show "Ausgezeichnet" for rates >= 20%', () => {
      render(<SavingsRateKPI monthlySavings={1000} monthlyIncome={5000} />);
      expect(screen.getByText('(Ausgezeichnet)')).toBeInTheDocument();
    });

    it('should show "Gut" for rates between 15-20%', () => {
      render(<SavingsRateKPI monthlySavings={750} monthlyIncome={5000} />);
      expect(screen.getByText('(Gut)')).toBeInTheDocument();
    });

    it('should show "Durchschnittlich" for rates between 10-15%', () => {
      render(<SavingsRateKPI monthlySavings={500} monthlyIncome={5000} />);
      expect(screen.getByText('(Durchschnittlich)')).toBeInTheDocument();
    });

    it('should show "Niedrig" for rates < 10%', () => {
      render(<SavingsRateKPI monthlySavings={400} monthlyIncome={5000} />);
      expect(screen.getByText('(Niedrig)')).toBeInTheDocument();
    });
  });

  describe('Trend Display', () => {
    it('should not show trend when showComparison is false', () => {
      render(
        <SavingsRateKPI 
          monthlySavings={1000} 
          monthlyIncome={5000}
          showComparison={false}
        />
      );
      
      expect(screen.queryByText('Unverändert')).not.toBeInTheDocument();
    });

    it('should show positive trend when savings rate increased', () => {
      render(
        <SavingsRateKPI 
          monthlySavings={1000} 
          monthlyIncome={5000}
          showComparison={true}
          previousSavingsRate={15}
        />
      );
      
      expect(screen.getByText('+5.0%')).toBeInTheDocument();
    });

    it('should show negative trend when savings rate decreased', () => {
      render(
        <SavingsRateKPI 
          monthlySavings={500} 
          monthlyIncome={5000}
          showComparison={true}
          previousSavingsRate={15}
        />
      );
      
      expect(screen.getByText('-5.0%')).toBeInTheDocument();
    });

    it('should show unchanged when difference is minimal', () => {
      render(
        <SavingsRateKPI 
          monthlySavings={1000} 
          monthlyIncome={5000}
          showComparison={true}
          previousSavingsRate={20}
        />
      );
      
      expect(screen.getByText('Unverändert')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero income gracefully', () => {
      render(<SavingsRateKPI monthlySavings={1000} monthlyIncome={0} />);
      
      expect(screen.getByText('0.0%')).toBeInTheDocument();
      expect(screen.getByText('(Niedrig)')).toBeInTheDocument();
    });

    it('should handle zero savings', () => {
      render(<SavingsRateKPI monthlySavings={0} monthlyIncome={5000} />);
      
      expect(screen.getByText('0.0%')).toBeInTheDocument();
      expect(screen.getByText('(Niedrig)')).toBeInTheDocument();
    });

    it('should handle high savings rates (>100%)', () => {
      render(<SavingsRateKPI monthlySavings={6000} monthlyIncome={5000} />);
      
      // Should be clamped at 100%
      expect(screen.getByText('100.0%')).toBeInTheDocument();
      expect(screen.getByText('(Ausgezeichnet)')).toBeInTheDocument();
    });

    it('should handle negative savings (spending)', () => {
      render(<SavingsRateKPI monthlySavings={-500} monthlyIncome={5000} />);
      
      // Should be clamped at 0%
      expect(screen.getByText('0.0%')).toBeInTheDocument();
    });

    it('should format large numbers correctly', () => {
      render(<SavingsRateKPI monthlySavings={5000} monthlyIncome={25000} />);
      
      expect(screen.getByText('5.000 €')).toBeInTheDocument();
      expect(screen.getByText('25.000 €')).toBeInTheDocument();
    });
  });

  describe('Progress Bar', () => {
    it('should render progress bar', () => {
      const { container } = render(
        <SavingsRateKPI monthlySavings={1000} monthlyIncome={5000} />
      );
      
      // Progress component should be rendered
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      render(<SavingsRateKPI monthlySavings={1000} monthlyIncome={5000} />);
      
      // Card should have proper structure
      expect(screen.getByText('Sparquote')).toBeInTheDocument();
      expect(screen.getByText('Monatliche Sparrate')).toBeInTheDocument();
      expect(screen.getByText('Monatliches Einkommen')).toBeInTheDocument();
    });

    it('should have unique IDs', () => {
      const { container } = render(<SavingsRateKPI monthlySavings={1000} monthlyIncome={5000} />);
      
      // Card should have an ID
      const card = container.querySelector('[id^="savings-rate-kpi-card"]');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Multiple Instances', () => {
    it('should render multiple instances without ID conflicts', () => {
      const { container } = render(
        <>
          <SavingsRateKPI monthlySavings={1000} monthlyIncome={5000} />
          <SavingsRateKPI monthlySavings={1500} monthlyIncome={6000} />
        </>
      );
      
      // Both instances should render
      const percentages = screen.getAllByText(/\.0%/);
      expect(percentages.length).toBeGreaterThanOrEqual(2);
      
      // IDs should be unique
      const cards = container.querySelectorAll('[id^="savings-rate-kpi-card"]');
      const ids = Array.from(cards).map(card => card.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});
