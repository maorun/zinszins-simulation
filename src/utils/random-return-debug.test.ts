import { describe, test, expect } from 'vitest'
import { generateRandomReturns } from '../../helpers/random-returns'

describe('Random Return Debug', () => {
  test('should show what returns are generated with seed 42', () => {
    const years = [2040, 2041, 2042, 2043, 2044]
    const config = {
      averageReturn: 0.07, // 7%
      standardDeviation: 0.15, // 15%
      seed: 42,
    }

    const returns = generateRandomReturns(years, config)

    console.log('Generated returns with seed 42:')
    for (const year of years) {
      console.log(`${year}: ${(returns[year] * 100).toFixed(2)}%`)
    }

    // The first year (2040) return should explain the massive loss
    expect(returns[2040]).toBeDefined()
  })
})
