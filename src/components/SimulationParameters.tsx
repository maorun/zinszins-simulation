import { useSimulation } from '../contexts/useSimulation'
import SimulationConfiguration from './SimulationConfiguration'
import TaxConfiguration from './TaxConfiguration'
import TimeRangeConfiguration from './TimeRangeConfiguration'
import { CollapsibleCard, CollapsibleCardContent, CollapsibleCardHeader } from './ui/collapsible-card'

const SimulationParameters = () => {
  const { planningMode } = useSimulation()

  return (
    <CollapsibleCard navigationId="configuration" navigationTitle="Konfiguration" navigationIcon="⚙️">
      <CollapsibleCardHeader>⚙️ Konfiguration</CollapsibleCardHeader>
      <CollapsibleCardContent>
        <SimulationConfiguration />
        <TimeRangeConfiguration />
        <TaxConfiguration planningMode={planningMode} />
      </CollapsibleCardContent>
    </CollapsibleCard>
  )
}

export default SimulationParameters
