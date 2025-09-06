import { describe, it, expect } from 'vitest';
import { createDefaultWithdrawalSegment } from './segmented-withdrawal';

describe('createDefaultWithdrawalSegment', () => {
  it('should create a withdrawal segment with default 18% income tax rate', () => {
    const segment = createDefaultWithdrawalSegment('test-id', 'Test Phase', 2041, 2080);
    
    expect(segment.incomeTaxRate).toBe(0.18);
  });

  it('should create a withdrawal segment with all required properties', () => {
    const segment = createDefaultWithdrawalSegment('test-id', 'Test Phase', 2041, 2080);
    
    expect(segment).toEqual({
      id: 'test-id',
      name: 'Test Phase',
      startYear: 2041,
      endYear: 2080,
      strategy: '4prozent',
      withdrawalFrequency: 'yearly',
      returnConfig: {
        mode: 'fixed',
        fixedRate: 0.05
      },
      inflationConfig: {
        inflationRate: 0.02
      },
      enableGrundfreibetrag: false,
      incomeTaxRate: 0.18,
      steuerReduzierenEndkapital: true
    });
  });

  it('should create segments with different parameters', () => {
    const segment1 = createDefaultWithdrawalSegment('id1', 'Early Retirement', 2041, 2050);
    const segment2 = createDefaultWithdrawalSegment('id2', 'Late Retirement', 2051, 2080);
    
    expect(segment1.id).toBe('id1');
    expect(segment1.name).toBe('Early Retirement');
    expect(segment1.startYear).toBe(2041);
    expect(segment1.endYear).toBe(2050);
    expect(segment1.incomeTaxRate).toBe(0.18);
    
    expect(segment2.id).toBe('id2');
    expect(segment2.name).toBe('Late Retirement');
    expect(segment2.startYear).toBe(2051);
    expect(segment2.endYear).toBe(2080);
    expect(segment2.incomeTaxRate).toBe(0.18);
  });

  it('should have Grundfreibetrag disabled by default', () => {
    const segment = createDefaultWithdrawalSegment('test-id', 'Test Phase', 2041, 2080);
    
    expect(segment.enableGrundfreibetrag).toBe(false);
  });

  it('should have correct default return configuration', () => {
    const segment = createDefaultWithdrawalSegment('test-id', 'Test Phase', 2041, 2080);
    
    expect(segment.returnConfig.mode).toBe('fixed');
    expect(segment.returnConfig.fixedRate).toBe(0.05);
  });

  it('should have correct default inflation configuration', () => {
    const segment = createDefaultWithdrawalSegment('test-id', 'Test Phase', 2041, 2080);
    
    expect(segment.inflationConfig?.inflationRate).toBe(0.02);
  });
});