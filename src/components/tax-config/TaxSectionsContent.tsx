import { KapitalertragsteuerSection } from './KapitalertragsteuerSection'
import { AssetClassSelector } from './AssetClassSelector'
import { GuenstigerpruefungSection } from './GuenstigerpruefungSection'
import { ProgressiveTaxInfoSection } from './ProgressiveTaxSection'
import { KirchensteuerSection } from './KirchensteuerSection'
import { SteuerReduziertEndkapitalSection } from './SteuerReduziertEndkapitalSection'
import { FreibetragPerYearTable } from './FreibetragPerYearTable'
import { createTaxHandlers } from './createTaxHandlers'
import type { AssetClass } from '../../../helpers/asset-class'

export interface SimulationContext {
  performSimulation: () => void
  steuerlast: number
  setSteuerlast: (value: number) => void
  teilfreistellungsquote: number
  setTeilfreistellungsquote: (value: number) => void
  assetClass: AssetClass
  setAssetClass: (value: AssetClass) => void
  customTeilfreistellungsquote: number
  setCustomTeilfreistellungsquote: (value: number) => void
  guenstigerPruefungAktiv: boolean
  setGuenstigerPruefungAktiv: (value: boolean) => void
  personalTaxRate: number
  setPersonalTaxRate: (value: number) => void
  kirchensteuerAktiv: boolean
  setKirchensteuerAktiv: (value: boolean) => void
  kirchensteuersatz: number
  setKirchensteuersatz: (value: number) => void
  steuerReduzierenEndkapitalSparphase: boolean
  setSteuerReduzierenEndkapitalSparphase: (value: boolean) => void
  steuerReduzierenEndkapitalEntspharphase: boolean
  setSteuerReduzierenEndkapitalEntspharphase: (value: boolean) => void
  freibetragPerYear: Record<number, number>
  setFreibetragPerYear: (values: Record<number, number>) => void
}

interface TaxSectionsContentProps {
  simulation: SimulationContext
  yearToday: number
}

export function TaxSectionsContent({ simulation, yearToday }: TaxSectionsContentProps) {
  const handlers = createTaxHandlers(simulation)

  return (
    <div className="space-y-6">
      <KapitalertragsteuerSection
        steuerlast={simulation.steuerlast}
        onSteuerlastChange={handlers.handleSteuerlastChange}
      />
      <AssetClassSelector
        assetClass={simulation.assetClass}
        customTeilfreistellungsquote={simulation.customTeilfreistellungsquote}
        onAssetClassChange={handlers.handleAssetClassChange}
        onCustomTeilfreistellungsquoteChange={handlers.handleCustomTeilfreistellungsquoteChange}
      />
      <GuenstigerpruefungSection
        guenstigerPruefungAktiv={simulation.guenstigerPruefungAktiv}
        onGuenstigerPruefungAktivChange={handlers.handleGuenstigerPruefungAktivChange}
      />
      <ProgressiveTaxInfoSection guenstigerPruefungAktiv={simulation.guenstigerPruefungAktiv} />
      <KirchensteuerSection
        kirchensteuerAktiv={simulation.kirchensteuerAktiv}
        kirchensteuersatz={simulation.kirchensteuersatz}
        onKirchensteuerAktivChange={handlers.handleKirchensteuerAktivChange}
        onKirchensteuersatzChange={handlers.handleKirchensteuersatzChange}
      />
      <SteuerReduziertEndkapitalSection
        steuerReduzierenEndkapitalSparphase={simulation.steuerReduzierenEndkapitalSparphase}
        steuerReduzierenEndkapitalEntspharphase={simulation.steuerReduzierenEndkapitalEntspharphase}
        onSteuerReduzierenSparphaseChange={handlers.handleSteuerReduzierenSparphaseChange}
        onSteuerReduzierenEntspharphaseChange={handlers.handleSteuerReduzierenEntspharphaseChange}
      />
      <FreibetragPerYearTable
        freibetragPerYear={simulation.freibetragPerYear}
        yearToday={yearToday}
        onUpdate={handlers.handleFreibetragPerYearUpdate}
      />
    </div>
  )
}

