import type { RandomReturnConfig } from '../utils/random-returns'

/**
 * Helper function to get risk configuration based on phase
 */
export function getRiskConfig(
  phase: 'savings' | 'withdrawal',
  config: RandomReturnConfig | undefined,
  averageReturn: number,
  standardDeviation: number,
  randomSeed: number,
): RandomReturnConfig {
  if (config) {
    return config
  }

  return {
    averageReturn: phase === 'savings' ? averageReturn / 100 : 0.05,
    standardDeviation: phase === 'savings' ? standardDeviation / 100 : 0.12,
    seed: randomSeed,
  }
}

/**
 * Helper function to get phase title
 */
export function getPhaseTitle(phase: 'savings' | 'withdrawal'): string {
  return phase === 'savings' ? 'Ansparphase' : 'Entnahmephase'
}
