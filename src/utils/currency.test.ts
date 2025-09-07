import { describe, it, expect } from 'vitest';
import { formatCurrency } from './currency';

describe('formatCurrency', () => {
  it('formats positive numbers correctly', () => {
    const result = formatCurrency(1000);
    expect(result).toContain('1.000');
    expect(result).toContain('€');
    expect(formatCurrency(500000)).toContain('500.000');
  });

  it('formats negative numbers correctly', () => {
    const result = formatCurrency(-1000);
    expect(result).toContain('-1.000');
    expect(result).toContain('€');
  });

  it('formats zero correctly', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
    expect(result).toContain('€');
  });

  it('formats decimal numbers correctly', () => {
    const result = formatCurrency(1.23);
    expect(result).toContain('1,23');
    expect(result).toContain('€');
  });

  it('formats large numbers correctly', () => {
    const result = formatCurrency(1000000);
    expect(result).toContain('1.000.000');
    expect(result).toContain('€');
  });
});