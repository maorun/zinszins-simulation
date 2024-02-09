import { expect, test } from 'vitest';
import { vorabpauschale, zinszinsVorabpauschale } from './steuer';

test('vorabpauschale should calculate the correct flat rate interest', () => {
  const result = vorabpauschale(20100, 20200);
  expect(result).toEqual({
        basisertrag: 358.78,
        vorabpauschale: 18.46
    });
});
