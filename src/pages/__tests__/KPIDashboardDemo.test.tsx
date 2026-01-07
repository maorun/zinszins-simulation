import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KPIDashboardDemo } from '../KPIDashboardDemo';

describe('KPIDashboardDemo Page', () => {
  describe('Page Structure', () => {
    it('should render page title and description', () => {
      render(<KPIDashboardDemo />);
      
      expect(screen.getByText('Financial KPI Dashboard')).toBeInTheDocument();
      expect(screen.getByText(/Interaktive Übersicht wichtiger Finanzkennzahlen/)).toBeInTheDocument();
    });

    it('should render all three KPI sections', () => {
      render(<KPIDashboardDemo />);
      
      expect(screen.getByText('💰 Sparquote (Savings Rate)')).toBeInTheDocument();
      expect(screen.getByText('📈 Vermögensaufbau-Rate (Wealth Accumulation Rate)')).toBeInTheDocument();
      expect(screen.getByText('🏦 Erwartete Rentenlücke (Expected Pension Gap)')).toBeInTheDocument();
    });

    it('should render information section', () => {
      render(<KPIDashboardDemo />);
      
      expect(screen.getByText('ℹ️ Über diese KPIs')).toBeInTheDocument();
    });
  });

  describe('Savings Rate Section', () => {
    it('should render savings rate input fields', () => {
      render(<KPIDashboardDemo />);
      
      expect(screen.getByLabelText('Monatliche Sparrate (€)')).toBeInTheDocument();
      expect(screen.getByLabelText('Monatliches Bruttoeinkommen (€)')).toBeInTheDocument();
    });

    it('should render savings rate KPI with default values', () => {
      render(<KPIDashboardDemo />);
      
      // Default values: 1000 savings, 5000 income = 20%
      // "Sparquote" appears in multiple places (title, component, info section)
      expect(screen.getAllByText(/Sparquote/).length).toBeGreaterThanOrEqual(2);
      // 20.0% appears in the main display and progress indicator
      expect(screen.getAllByText('20.0%').length).toBeGreaterThanOrEqual(1);
    });

    it('should update savings rate when input changes', () => {
      render(<KPIDashboardDemo />);
      
      const savingsInput = screen.getByLabelText('Monatliche Sparrate (€)');
      fireEvent.change(savingsInput, { target: { value: '1500' } });
      
      // New rate: 1500/5000 = 30%
      expect(screen.getByText('30.0%')).toBeInTheDocument();
    });

    it('should update savings rate when income changes', () => {
      render(<KPIDashboardDemo />);
      
      const incomeInput = screen.getByLabelText('Monatliches Bruttoeinkommen (€)');
      fireEvent.change(incomeInput, { target: { value: '4000' } });
      
      // New rate: 1000/4000 = 25%
      expect(screen.getByText('25.0%')).toBeInTheDocument();
    });
  });

  describe('Wealth Accumulation Section', () => {
    it('should render wealth accumulation input fields', () => {
      render(<KPIDashboardDemo />);
      
      expect(screen.getByLabelText('Aktuelles Vermögen (€)')).toBeInTheDocument();
      expect(screen.getByLabelText('Zielvermögen (€)')).toBeInTheDocument();
      expect(screen.getByLabelText('Jahre bis zum Ziel')).toBeInTheDocument();
    });

    it('should render wealth accumulation KPI with default values', () => {
      render(<KPIDashboardDemo />);
      
      // Appears in card title, KPI component, and info section
      expect(screen.getAllByText(/Vermögensaufbau-Rate/)).toHaveLength(3);
      expect(screen.getByText('Fortschritt zum Ziel')).toBeInTheDocument();
    });

    it('should update wealth accumulation rate when inputs change', () => {
      render(<KPIDashboardDemo />);
      
      const currentWealthInput = screen.getByLabelText('Aktuelles Vermögen (€)');
      fireEvent.change(currentWealthInput, { target: { value: '200000' } });
      
      // Progress should update (200000/500000 = 40%)
      expect(screen.getByText('40.0%')).toBeInTheDocument();
    });
  });

  describe('Pension Gap Section', () => {
    it('should render pension gap input fields', () => {
      render(<KPIDashboardDemo />);
      
      expect(screen.getByLabelText('Gewünschtes monatliches Einkommen (€)')).toBeInTheDocument();
      expect(screen.getByLabelText('Erwartete gesetzliche Rente (€)')).toBeInTheDocument();
    });

    it('should render pension gap KPI with default values', () => {
      render(<KPIDashboardDemo />);
      
      // Appears in card title, KPI component, and info section
      expect(screen.getAllByText(/Erwartete Rentenlücke/)).toHaveLength(3);
      // Default: 3000 - 2000 = 1000 gap (appears in multiple places)
      const amounts = screen.getAllByText('1.000,00 €');
      expect(amounts.length).toBeGreaterThanOrEqual(1);
    });

    it('should update pension gap when inputs change', () => {
      render(<KPIDashboardDemo />);
      
      const desiredIncomeInput = screen.getByLabelText('Gewünschtes monatliches Einkommen (€)');
      fireEvent.change(desiredIncomeInput, { target: { value: '4000' } });
      
      // New gap: 4000 - 2000 = 2000 (may appear in multiple places)
      const amounts = screen.getAllByText('2.000,00 €');
      expect(amounts.length).toBeGreaterThanOrEqual(1);
    });

    it('should show no gap when pension covers desired income', () => {
      render(<KPIDashboardDemo />);
      
      const expectedPensionInput = screen.getByLabelText('Erwartete gesetzliche Rente (€)');
      fireEvent.change(expectedPensionInput, { target: { value: '3000' } });
      
      // Should show no gap message
      expect(screen.getByText('Keine Rentenlücke:')).toBeInTheDocument();
    });
  });

  describe('Information Section', () => {
    it('should display explanations for all KPIs', () => {
      render(<KPIDashboardDemo />);
      
      // These appear in both section titles and information section
      expect(screen.getAllByText(/Sparquote \(Savings Rate\)/)).toHaveLength(2);
      expect(screen.getAllByText(/Vermögensaufbau-Rate \(Wealth Accumulation Rate\)/)).toHaveLength(2);
      expect(screen.getAllByText(/Erwartete Rentenlücke \(Expected Pension Gap\)/)).toHaveLength(2);
    });

    it('should display detailed explanations', () => {
      render(<KPIDashboardDemo />);
      
      expect(screen.getByText(/Die Sparquote zeigt, welchen Prozentsatz/)).toBeInTheDocument();
      expect(screen.getByText(/Diese KPI zeigt, wie schnell Ihr Vermögen wachsen muss/)).toBeInTheDocument();
      expect(screen.getByText(/Die Rentenlücke ist die Differenz zwischen/)).toBeInTheDocument();
    });
  });

  describe('Responsiveness', () => {
    it('should render without errors on different screen sizes', () => {
      const { container } = render(<KPIDashboardDemo />);
      
      // Check for responsive grid classes
      expect(container.querySelector('.grid')).toBeInTheDocument();
      expect(container.querySelector('.md\\:grid-cols-2')).toBeInTheDocument();
      expect(container.querySelector('.md\\:grid-cols-3')).toBeInTheDocument();
    });
  });

  describe('Input Validation', () => {
    it('should have proper input types and attributes', () => {
      render(<KPIDashboardDemo />);
      
      const savingsInput = screen.getByLabelText('Monatliche Sparrate (€)');
      expect(savingsInput).toHaveAttribute('type', 'number');
      expect(savingsInput).toHaveAttribute('min', '0');
      expect(savingsInput).toHaveAttribute('step', '100');
    });

    it('should have proper year input constraints', () => {
      render(<KPIDashboardDemo />);
      
      const yearsInput = screen.getByLabelText('Jahre bis zum Ziel');
      expect(yearsInput).toHaveAttribute('type', 'number');
      expect(yearsInput).toHaveAttribute('min', '1');
      expect(yearsInput).toHaveAttribute('max', '50');
    });
  });

  describe('Accessibility', () => {
    it('should have labels for all inputs', () => {
      render(<KPIDashboardDemo />);
      
      const inputs = screen.getAllByRole('spinbutton');
      inputs.forEach(input => {
        expect(input).toHaveAccessibleName();
      });
    });

    it('should have semantic heading structure', () => {
      render(<KPIDashboardDemo />);
      
      expect(screen.getByRole('heading', { name: 'Financial KPI Dashboard', level: 1 })).toBeInTheDocument();
    });
  });
});
