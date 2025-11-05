import { GlossaryTerm } from './GlossaryTerm'
import type { FinancialScenario } from '../data/scenarios'

interface ConfigFieldProps {
  label: string
  value: string | number
  useGlossary?: boolean
  glossaryTerm?: string
}

function ConfigField({ label, value, useGlossary = false, glossaryTerm }: ConfigFieldProps) {
  return (
    <div>
      <span className="text-blue-700 font-medium">
        {useGlossary && glossaryTerm ? (
          <GlossaryTerm term={glossaryTerm}>{label}</GlossaryTerm>
        ) : (
          label
        )}
        :
      </span>
      <div className="text-gray-700">{value}</div>
    </div>
  )
}

interface ScenarioConfigurationOverviewProps {
  scenario: FinancialScenario
}

/**
 * Displays configuration overview for a scenario
 */
export function ScenarioConfigurationOverview({ scenario }: ScenarioConfigurationOverviewProps) {
  const years = scenario.config.retirementYear - scenario.config.startYear

  return (
    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
      <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
        📊 Szenario-Konfiguration
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
        <ConfigField label="Zeitraum" value={`${years} Jahre`} />
        <ConfigField label="Monatlich" value={`${scenario.config.monthlyContribution}€`} />
        {scenario.config.initialInvestment && (
          <ConfigField
            label="Startkapital"
            value={`${scenario.config.initialInvestment.toLocaleString('de-DE')}€`}
          />
        )}
        <ConfigField label="Erwartete Rendite" value={`${scenario.config.expectedReturn}% p.a.`} />
        {scenario.config.volatility && (
          <ConfigField
            label="Volatilität"
            value={`${scenario.config.volatility}%`}
            useGlossary
            glossaryTerm="volatilitaet"
          />
        )}
        <ConfigField label="TER" value={`${scenario.config.ter || 0}% p.a.`} />
      </div>
    </div>
  )
}
