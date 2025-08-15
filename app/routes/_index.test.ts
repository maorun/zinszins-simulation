// Import the unique function from the main route
// Since this is exported from the _index.tsx, we need to import it
import { unique } from './_index';

describe('Utility Functions', () => {
  describe('unique function', () => {
    test('should handle undefined input', () => {
      const result = unique(undefined);
      expect(result).toEqual([]);
    });

    test('should handle null input', () => {
      const result = unique(null);
      expect(result).toEqual([]);
    });

    test('should handle empty array', () => {
      const result = unique([]);
      expect(result).toEqual([]);
    });

    test('should remove duplicate numbers', () => {
      const input = [1, 2, 2, 3, 3, 3, 4];
      const result = unique(input);
      expect(result).toEqual([1, 2, 3, 4]);
    });

    test('should remove duplicate strings', () => {
      const input = ['a', 'b', 'b', 'c', 'a'];
      const result = unique(input);
      expect(result).toEqual(['a', 'b', 'c']);
    });

    test('should handle array with no duplicates', () => {
      const input = [1, 2, 3, 4, 5];
      const result = unique(input);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    test('should handle array with all same values', () => {
      const input = [5, 5, 5, 5];
      const result = unique(input);
      expect(result).toEqual([5]);
    });

    test('should preserve order of first occurrence', () => {
      const input = [3, 1, 4, 1, 5, 9, 2, 6, 5];
      const result = unique(input);
      expect(result).toEqual([3, 1, 4, 5, 9, 2, 6]);
    });

    test('should handle mixed number types', () => {
      const input = [1, 1.0, 2, 2.0, 3];
      const result = unique(input);
      expect(result).toEqual([1, 2, 3]);
    });

    test('should work with years (realistic simulation data)', () => {
      // Simulate the kind of data this function would process in the app
      const input = [2023, 2024, 2025, 2023, 2024, 2026];
      const result = unique(input);
      expect(result).toEqual([2023, 2024, 2025, 2026]);
    });

    test('should handle single element array', () => {
      const input = [42];
      const result = unique(input);
      expect(result).toEqual([42]);
    });

    test('should maintain type safety', () => {
      // Test with numbers
      const numberResult = unique([1, 2, 3]);
      expect(typeof numberResult[0]).toBe('number');

      // Test with strings  
      const stringResult = unique(['a', 'b', 'c']);
      expect(typeof stringResult[0]).toBe('string');
    });
  });
});