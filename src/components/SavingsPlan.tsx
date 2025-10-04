import { SparplanEingabe } from './SparplanEingabe'
import { SparplanSimulationsAusgabe } from './SparplanSimulationsAusgabe'
import RiskAssessment from './RiskAssessment'
import ReturnConfiguration from './ReturnConfiguration'
import { useSimulation } from '../contexts/useSimulation'
import { convertSparplanToElements } from '../utils/sparplan-utils'
import { CollapsibleCard, CollapsibleCardContent, CollapsibleCardHeader } from './ui/collapsible-card'

const SavingsPlan = () => {
  const { setSparplan, sparplan, startEnd, simulationAnnual, setSparplanElemente, simulationData } = useSimulation()

  return (
    <div className="space-y-4">
      <ReturnConfiguration />

      <CollapsibleCard
        navigationId="savings-plans"
        navigationTitle="Sparpläne erstellen"
        navigationIcon="💼"
      >
        <CollapsibleCardHeader>💼 Sparpläne erstellen</CollapsibleCardHeader>
        <CollapsibleCardContent>
          <SparplanEingabe
            dispatch={(sparplan) => {
              setSparplan(sparplan)
              setSparplanElemente(convertSparplanToElements(sparplan, startEnd, simulationAnnual))
            }}
            simulationAnnual={simulationAnnual}
            currentSparplans={sparplan}
          />
        </CollapsibleCardContent>
      </CollapsibleCard>

      {simulationData && (
        <CollapsibleCard
          navigationId="savings-history"
          navigationTitle="Sparplan-Verlauf"
          navigationIcon="📊"
        >
          <CollapsibleCardHeader>📊 Sparplan-Verlauf</CollapsibleCardHeader>
          <CollapsibleCardContent>
            <SparplanSimulationsAusgabe
              elemente={simulationData.sparplanElements}
            />

            {/* Risk Assessment with Monte Carlo Analysis moved to collapsible panel */}
            <RiskAssessment phase="savings" />
          </CollapsibleCardContent>
        </CollapsibleCard>
      )}
    </div>
  )
}

export default SavingsPlan
