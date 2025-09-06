import { describe, it, expect } from 'vitest';
import { calculateIncomeTax } from './withdrawal';

describe('calculateIncomeTax', () => {
  it('should use default income tax rate of 18% when no rate is provided', () => {
    const withdrawalAmount = 20000;
    const grundfreibetrag = 10908;
    const expectedTaxableIncome = withdrawalAmount - grundfreibetrag;
    const expectedTax = expectedTaxableIncome * 0.18;
    
    const result = calculateIncomeTax(withdrawalAmount, grundfreibetrag);
    
    expect(result).toBe(expectedTax);
  });

  it('should use default Grundfreibetrag when not provided', () => {
    const withdrawalAmount = 20000;
    const expectedTaxableIncome = withdrawalAmount - 10908; // Default grundfreibetrag[2023]
    const expectedTax = expectedTaxableIncome * 0.18;
    
    const result = calculateIncomeTax(withdrawalAmount);
    
    expect(result).toBe(expectedTax);
  });

  it('should use custom income tax rate when provided', () => {
    const withdrawalAmount = 20000;
    const grundfreibetrag = 10908;
    const customTaxRate = 0.25;
    const expectedTaxableIncome = withdrawalAmount - grundfreibetrag;
    const expectedTax = expectedTaxableIncome * customTaxRate;
    
    const result = calculateIncomeTax(withdrawalAmount, grundfreibetrag, customTaxRate);
    
    expect(result).toBe(expectedTax);
  });

  it('should return 0 tax when withdrawal amount is below Grundfreibetrag', () => {
    const withdrawalAmount = 5000;
    const grundfreibetrag = 10908;
    
    const result = calculateIncomeTax(withdrawalAmount, grundfreibetrag);
    
    expect(result).toBe(0);
  });

  it('should handle exact Grundfreibetrag amount', () => {
    const withdrawalAmount = 10908;
    const grundfreibetrag = 10908;
    
    const result = calculateIncomeTax(withdrawalAmount, grundfreibetrag);
    
    expect(result).toBe(0);
  });

  it('should calculate correctly with different Grundfreibetrag amounts', () => {
    const withdrawalAmount = 15000;
    const customGrundfreibetrag = 12000;
    const expectedTaxableIncome = withdrawalAmount - customGrundfreibetrag;
    const expectedTax = expectedTaxableIncome * 0.18;
    
    const result = calculateIncomeTax(withdrawalAmount, customGrundfreibetrag);
    
    expect(result).toBe(expectedTax);
  });

  it('should handle edge case with zero withdrawal amount', () => {
    const withdrawalAmount = 0;
    const grundfreibetrag = 10908;
    
    const result = calculateIncomeTax(withdrawalAmount, grundfreibetrag);
    
    expect(result).toBe(0);
  });
});