import { useSimulation } from '../contexts/useSimulation'
import { EntnahmeSimulationsAusgabe } from './EntnahmeSimulationsAusgabe'
import RiskAssessment from './RiskAssessment'

const WithdrawalPlan = () => {
  const { startEnd, simulationData, setStartEnd, setWithdrawalResults, steuerlast, teilfreistellungsquote, endOfLife } =
    useSimulation()

  if (!simulationData) return null

  return (
    <div className="space-y-4">
      <EntnahmeSimulationsAusgabe
        startEnd={[startEnd[0], endOfLife]}
        elemente={simulationData.sparplanElements}
        dispatchEnd={val => setStartEnd([val[0], endOfLife])}
        onWithdrawalResultsChange={setWithdrawalResults}
        steuerlast={steuerlast / 100}
        teilfreistellungsquote={teilfreistellungsquote / 100}
      />

      {/* Risk Assessment with Monte Carlo Analysis moved to collapsible panel */}
      <RiskAssessment phase="withdrawal" />
    </div>
  )
}

export default WithdrawalPlan
