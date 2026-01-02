import { lazy } from 'react'
import { CollapsibleCategory } from './CollapsibleCategory'
import { ConfigurationSection } from './ConfigurationSection'
import type { SensitivityAnalysisConfig } from '../../utils/sensitivity-analysis'
import type { ReturnConfiguration } from '../../utils/random-returns'

// Lazy load analysis and tool components
const DataExport = lazy(() => import('../DataExport'))
const SensitivityAnalysisDisplay = lazy(() => import('../SensitivityAnalysisDisplay'))
const ProfileManagement = lazy(() => import('../ProfileManagement'))

interface AnalysenWerkzeugeSectionProps {
  sensitivityConfig: SensitivityAnalysisConfig
  returnConfig: ReturnConfiguration
  hasSimulationData: boolean
}

/**
 * Analysen & Werkzeuge Section - Analysis and tools category
 * Groups together export functionality, sensitivity analysis, and profile management
 */
export function AnalysenWerkzeugeSection({
  sensitivityConfig,
  returnConfig,
  hasSimulationData,
}: AnalysenWerkzeugeSectionProps) {
  return (
    <CollapsibleCategory title="Analysen & Werkzeuge" icon="📊" defaultOpen={false} nestingLevel={0}>
      {/* 📤 Export */}
      <ConfigurationSection Component={DataExport} />

      {/* 📊 Sensitivitätsanalyse */}
      <ConfigurationSection
        Component={SensitivityAnalysisDisplay}
        componentProps={{ config: sensitivityConfig, returnConfig }}
        condition={hasSimulationData}
      />

      {/* 👤 Profile verwalten */}
      <ConfigurationSection Component={ProfileManagement} />
    </CollapsibleCategory>
  )
}
