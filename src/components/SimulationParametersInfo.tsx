import type { RandomReturnConfig } from '../utils/random-returns'
import { formatPercent } from '../utils/currency'

interface SimulationParametersInfoProps {
  config: RandomReturnConfig
  blackSwanEventName?: string
  hasBlackSwanScenario: boolean
}

const SimulationParametersInfo = ({
  config,
  blackSwanEventName,
  hasBlackSwanScenario,
}: SimulationParametersInfoProps) => (
  <div className="mb-5">
    <p className="mb-2">
      <strong>Simulationsparameter:</strong>
      {' '}
      Durchschnittliche Rendite
      {' '}
      {formatPercent(config.averageReturn)}
      , Volatilität
      {' '}
      {formatPercent(config.standardDeviation || 0.15)}
    </p>
    <p className="mb-2">
      <strong>Annahme:</strong>
      {' '}
      Die jährlichen Renditen folgen einer Normalverteilung. Reale Märkte können von dieser Annahme abweichen.
    </p>
    {config.seed && (
      <p className="mb-2">
        <strong>Zufallsseed:</strong>
        {' '}
        {config.seed}
        {' '}
        (deterministische Ergebnisse)
      </p>
    )}
    {hasBlackSwanScenario && (
      <p className="mb-2">
        <strong>Black Swan Ereignis:</strong>
        {' '}
        {blackSwanEventName}
        {' '}
        wurde in die Analyse integriert
      </p>
    )}
  </div>
)

export default SimulationParametersInfo
