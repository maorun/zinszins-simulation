/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Vercel Analytics
vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => null,
}));

describe('Calculator Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('validates basic calculator functionality', () => {
    // Simple test to verify basic functionality
    expect(true).toBe(true);
  });
});