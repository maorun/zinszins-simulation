export function createTaxHandlers(
  performSimulation: () => void,
  setSteuerlast: (value: number) => void,
  setTeilfreistellungsquote: (value: number) => void,
  setGuenstigerPruefungAktiv: (value: boolean) => void,
  setPersonalTaxRate: (value: number) => void,
  setKirchensteuerAktiv: (value: boolean) => void,
  setKirchensteuersatz: (value: number) => void,
  setSteuerReduzierenSparphase: (value: boolean) => void,
  setSteuerReduzierenEntspharphase: (value: boolean) => void,
  setFreibetragPerYear: (values: Record<number, number>) => void,
) {
  const makeHandler =
    <T>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value)
      performSimulation()
    }

  return {
    handleSteuerlastChange: makeHandler(setSteuerlast),
    handleTeilfreistellungsquoteChange: makeHandler(setTeilfreistellungsquote),
    handleGuenstigerPruefungAktivChange: makeHandler(setGuenstigerPruefungAktiv),
    handlePersonalTaxRateChange: makeHandler(setPersonalTaxRate),
    handleKirchensteuerAktivChange: makeHandler(setKirchensteuerAktiv),
    handleKirchensteuersatzChange: makeHandler(setKirchensteuersatz),
    handleSteuerReduzierenSparphaseChange: makeHandler(setSteuerReduzierenSparphase),
    handleSteuerReduzierenEntspharphaseChange: makeHandler(setSteuerReduzierenEntspharphase),
    handleFreibetragPerYearUpdate: makeHandler(setFreibetragPerYear),
  }
}
