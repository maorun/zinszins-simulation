import { zinszinsVorabpauschale, vorabpauschale } from './steuer';

test('zinszinsVorabpauschale should calculate the correct tax and remaining tax-free amount', () => {
  const result = zinszinsVorabpauschale(10000, 0.0255, 1000, 0.26375, 0.7, 0.3, 12);
  expect(result.steuer).toBeCloseTo(0, 5);
  expect(result.verbleibenderFreibetrag).toBeCloseTo(1000, 5);
});

test('vorabpauschale should calculate the correct flat rate interest', () => {
  const result = vorabpauschale(10000, 0.0255, 0.26375, 0.7, 0.3, 12);
  expect(result).toBeCloseTo(263.75, 5);
});
