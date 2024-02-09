import { expect, test } from 'vitest';
import { vorabpauschale, zinszinsVorabpauschale } from './steuer';

test('vorabpauschale should calculate the correct flat rate interest', () => {
  const result1 = vorabpauschale(20100, 20200);
  expect(result1).toEqual({
        basisertrag: 358.78,
        vorabpauschale: 18.46
    });

  const result2 = vorabpauschale(201000, 202000);
  expect(result2).toEqual({
        basisertrag: 3587.80,
        vorabpauschale: 184.60
    });
});
