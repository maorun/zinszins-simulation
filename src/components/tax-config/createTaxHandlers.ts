import { type AssetClass, getTeilfreistellungsquoteForAssetClass } from '../../../helpers/asset-class'
import type { SimulationContext } from './TaxSectionsContent'

export function createTaxHandlers(simulation: SimulationContext) {
  const makeHandler =
    <T>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value)
      simulation.performSimulation()
    }

  // Special handler for asset class that also updates teilfreistellungsquote
  const handleAssetClassChange = (assetClass: AssetClass) => {
    simulation.setAssetClass(assetClass)
    // Update teilfreistellungsquote based on asset class
    const quote = getTeilfreistellungsquoteForAssetClass(assetClass)
    simulation.setTeilfreistellungsquote(quote * 100) // Convert to percentage
    simulation.performSimulation()
  }

  // Special handler for custom teilfreistellungsquote
  const handleCustomTeilfreistellungsquoteChange = (value: number) => {
    simulation.setCustomTeilfreistellungsquote(value)
    // Also update the main teilfreistellungsquote when custom is selected
    simulation.setTeilfreistellungsquote(value * 100) // Convert to percentage
    simulation.performSimulation()
  }

  return {
    handleSteuerlastChange: makeHandler(simulation.setSteuerlast),
    handleTeilfreistellungsquoteChange: makeHandler(simulation.setTeilfreistellungsquote),
    handleAssetClassChange,
    handleCustomTeilfreistellungsquoteChange,
    handleGuenstigerPruefungAktivChange: makeHandler(simulation.setGuenstigerPruefungAktiv),
    handlePersonalTaxRateChange: makeHandler(simulation.setPersonalTaxRate),
    handleKirchensteuerAktivChange: makeHandler(simulation.setKirchensteuerAktiv),
    handleKirchensteuersatzChange: makeHandler(simulation.setKirchensteuersatz),
    handleSteuerReduzierenSparphaseChange: makeHandler(simulation.setSteuerReduzierenEndkapitalSparphase),
    handleSteuerReduzierenEntspharphaseChange: makeHandler(simulation.setSteuerReduzierenEndkapitalEntspharphase),
    handleFreibetragPerYearUpdate: makeHandler(simulation.setFreibetragPerYear),
  }
}
