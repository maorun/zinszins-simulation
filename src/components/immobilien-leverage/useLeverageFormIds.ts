import { useMemo } from 'react'
import { generateFormId } from '../../utils/unique-id'

export function useLeverageFormIds() {
  return useMemo(
    () => ({
      enabled: generateFormId('leverage-comparison', 'enabled'),
      totalPrice: generateFormId('leverage-comparison', 'total-price'),
      buildingValue: generateFormId('leverage-comparison', 'building-value'),
      landValue: generateFormId('leverage-comparison', 'land-value'),
      annualRent: generateFormId('leverage-comparison', 'annual-rent'),
      operatingCosts: generateFormId('leverage-comparison', 'operating-costs'),
      appreciation: generateFormId('leverage-comparison', 'appreciation'),
      taxRate: generateFormId('leverage-comparison', 'tax-rate'),
      buildingYear: generateFormId('leverage-comparison', 'building-year'),
      baseInterest: generateFormId('leverage-comparison', 'base-interest'),
    }),
    [],
  )
}
