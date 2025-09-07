import { describe, it, expect } from 'vitest';
import { 
  createInterestExplanation, 
  createTaxExplanation, 
  createInflationExplanation, 
  createIncomeTaxExplanation,
  createWithdrawalInterestExplanation,
  createTaxableIncomeExplanation 
} from '../components/calculationHelpers';

describe('calculationHelpers', () => {
  describe('createInterestExplanation', () => {
    it('should create correct interest explanation for savings phase', () => {
      const explanation = createInterestExplanation(10000, 500, 5, 2023);
      
      expect(explanation.title).toBe('📈 Zinsen-Berechnung Schritt für Schritt');
      expect(explanation.introduction).toContain('Zinsen werden basierend auf dem Startkapital');
      expect(explanation.steps).toHaveLength(2);
      expect(explanation.steps[0].title).toBe('Schritt 1: Startkapital ermitteln');
      expect(explanation.steps[1].title).toBe('Schritt 2: Rendite anwenden');
      expect(explanation.finalResult.values).toHaveLength(3);
    });
  });

  describe('createTaxExplanation', () => {
    it('should create correct tax explanation for savings phase', () => {
      const explanation = createTaxExplanation(150, 1000, 0.26375, 0.3, 2000, 2023);
      
      expect(explanation.title).toBe('💸 Steuer-Berechnung Schritt für Schritt');
      expect(explanation.introduction).toContain('Steuerberechnung erfolgt basierend auf der Vorabpauschale');
      expect(explanation.steps).toHaveLength(3);
      expect(explanation.steps[0].title).toBe('Schritt 1: Vorabpauschale ermitteln');
      expect(explanation.steps[1].title).toBe('Schritt 2: Steuer vor Sparerpauschbetrag berechnen');
      expect(explanation.steps[2].title).toBe('Schritt 3: Sparerpauschbetrag anwenden');
      expect(explanation.finalResult.values).toHaveLength(4);
    });
  });

  describe('createInflationExplanation', () => {
    it('should create correct inflation explanation', () => {
      const explanation = createInflationExplanation(20000, 0.02, 5, 2000);
      
      expect(explanation.title).toBe('📈 Inflation-Anpassung Schritt für Schritt');
      expect(explanation.introduction).toContain('Inflation-Anpassung sorgt dafür');
      expect(explanation.steps).toHaveLength(3);
      expect(explanation.steps[0].title).toBe('Schritt 1: Basis-Entnahmebetrag');
      expect(explanation.steps[1].title).toBe('Schritt 2: Inflationsrate anwenden');
      expect(explanation.steps[2].title).toBe('Schritt 3: Inflations-Anpassung berechnen');
      expect(explanation.finalResult.values).toHaveLength(5);
    });
  });

  describe('createIncomeTaxExplanation', () => {
    it('should create correct income tax explanation', () => {
      const explanation = createIncomeTaxExplanation(20000, 10908, 25, 2273, 10908);
      
      expect(explanation.title).toBe('🏛️ Einkommensteuer-Berechnung Schritt für Schritt');
      expect(explanation.introduction).toContain('Einkommensteuer wird auf die Entnahme angewendet');
      expect(explanation.steps).toHaveLength(3);
      expect(explanation.steps[0].title).toBe('Schritt 1: Entnahmebetrag ermitteln');
      expect(explanation.steps[1].title).toBe('Schritt 2: Grundfreibetrag anwenden');
      expect(explanation.steps[2].title).toBe('Schritt 3: Einkommensteuer berechnen');
      expect(explanation.finalResult.values).toHaveLength(5);
    });
  });

  describe('createWithdrawalInterestExplanation', () => {
    it('should create correct withdrawal interest explanation', () => {
      const explanation = createWithdrawalInterestExplanation(500000, 25000, 5, 2041);
      
      expect(explanation.title).toBe('📈 Zinsen-Berechnung (Entnahme-Phase) Schritt für Schritt');
      expect(explanation.introduction).toContain('Auch während der Entnahme-Phase erwirtschaftet');
      expect(explanation.steps).toHaveLength(2);
      expect(explanation.steps[0].title).toBe('Schritt 1: Verfügbares Kapital');
      expect(explanation.steps[1].title).toBe('Schritt 2: Rendite erwirtschaften');
      expect(explanation.finalResult.values).toHaveLength(3);
    });
  });

  describe('createTaxableIncomeExplanation', () => {
    it('should create correct taxable income explanation', () => {
      const explanation = createTaxableIncomeExplanation(20000, 10908);
      
      expect(explanation.title).toBe('💰 Zu versteuerndes Einkommen Schritt für Schritt');
      expect(explanation.introduction).toContain('zu versteuernde Einkommen ergibt sich');
      expect(explanation.steps).toHaveLength(2);
      expect(explanation.steps[0].title).toBe('Schritt 1: Brutto-Entnahme');
      expect(explanation.steps[1].title).toBe('Schritt 2: Grundfreibetrag abziehen');
      expect(explanation.finalResult.values).toHaveLength(3);
    });
  });
});