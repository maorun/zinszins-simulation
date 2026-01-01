import { lazy } from 'react'
import { CollapsibleCategory } from './CollapsibleCategory'
import { ConfigurationSection } from './ConfigurationSection'
import { useSimulation } from '../../contexts/useSimulation'

// Lazy load configuration components
const SimulationConfiguration = lazy(() => import('../SimulationConfiguration'))
const TimeRangeConfiguration = lazy(() => import('../TimeRangeConfiguration'))
const BenchmarkConfiguration = lazy(() =>
  import('../BenchmarkConfiguration').then(m => ({ default: m.BenchmarkConfiguration })),
)

/**
 * Grundeinstellungen Section - Basic configuration settings category
 * Groups together simulation config, time range (Sparphase-Ende), and benchmark comparison
 */
export function GrundeinstellungenSection() {
  const { benchmarkConfig, setBenchmarkConfig } = useSimulation()

  return (
    <CollapsibleCategory title="Grundeinstellungen" icon="📊" defaultOpen={false} nestingLevel={0}>
      {/* ⚙️ Simulation-Konfiguration */}
      <ConfigurationSection Component={SimulationConfiguration} />

      {/* 📅 Sparphase-Ende (Time Range Configuration) */}
      <ConfigurationSection Component={TimeRangeConfiguration} />

      {/* 📊 Benchmark-Vergleich */}
      <ConfigurationSection
        Component={BenchmarkConfiguration}
        componentProps={{
          benchmarkConfig,
          onBenchmarkConfigChange: setBenchmarkConfig,
          nestingLevel: 1,
        }}
      />
    </CollapsibleCategory>
  )
}
