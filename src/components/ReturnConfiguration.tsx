import { useSimulation } from '../contexts/useSimulation'
import { CollapsibleCard, CollapsibleCardContent, CollapsibleCardHeader } from './ui/collapsible-card'
import ReturnModeSelector from './return-configuration/ReturnModeSelector'
import InflationConfiguration from './return-configuration/InflationConfiguration'
import ReturnModeContent from './return-configuration/ReturnModeContent'
import { useReturnConfigurationHandlers } from './return-configuration/useReturnConfigurationHandlers'

const ReturnConfiguration = () => {
  const simulation = useSimulation()
  const {
    returnMode,
    inflationAktivSparphase,
    inflationsrateSparphase,
    inflationAnwendungSparphase,
    multiAssetConfig,
  } = simulation

  const handlers = useReturnConfigurationHandlers({
    setReturnMode: simulation.setReturnMode,
    setInflationAktivSparphase: simulation.setInflationAktivSparphase,
    setInflationsrateSparphase: simulation.setInflationsrateSparphase,
    setInflationAnwendungSparphase: simulation.setInflationAnwendungSparphase,
    setMultiAssetConfig: simulation.setMultiAssetConfig,
    performSimulation: simulation.performSimulation,
  })

  return (
    <CollapsibleCard
      navigationId="return-configuration"
      navigationTitle="Rendite-Konfiguration (Sparphase)"
      navigationIcon="📈"
    >
      <CollapsibleCardHeader>📈 Rendite-Konfiguration (Sparphase)</CollapsibleCardHeader>
      <CollapsibleCardContent>
        <ReturnModeSelector returnMode={returnMode} onReturnModeChange={handlers.handleReturnModeChange} />
        <InflationConfiguration
          inflationAktivSparphase={inflationAktivSparphase}
          inflationsrateSparphase={inflationsrateSparphase}
          inflationAnwendungSparphase={inflationAnwendungSparphase}
          onInflationAktivChange={handlers.handleInflationAktivChange}
          onInflationsrateChange={handlers.handleInflationsrateChange}
          onInflationAnwendungChange={handlers.handleInflationAnwendungChange}
        />
        <ReturnModeContent
          returnMode={returnMode}
          multiAssetConfig={multiAssetConfig}
          onMultiAssetConfigChange={handlers.handleMultiAssetConfigChange}
        />
      </CollapsibleCardContent>
    </CollapsibleCard>
  )
}

export default ReturnConfiguration
