import { useState } from 'react'
import { type BenchmarkConfig, getDefaultBenchmarkConfig } from '../../../../helpers/benchmark'

/**
 * Hook for managing benchmark comparison state
 */
export function useBenchmarkState() {
  const [benchmarkConfig, setBenchmarkConfig] = useState<BenchmarkConfig>(getDefaultBenchmarkConfig())

  return {
    benchmarkConfig,
    setBenchmarkConfig,
  }
}
