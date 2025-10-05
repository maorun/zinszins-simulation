import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { Slider } from './ui/slider'
import { Button } from './ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { Trash2, Plus, ChevronDown } from 'lucide-react'
import { useSimulation } from '../contexts/useSimulation'
import { NestingProvider } from '../lib/nesting-context'
import BasiszinsConfiguration from './BasiszinsConfiguration'
import { useEffect } from 'react'
import { getGrundfreibetragForPlanningMode, isStandardGrundfreibetragValue, GERMAN_TAX_CONSTANTS } from '../../helpers/steuer'

interface TaxConfigurationProps {
  planningMode?: 'individual' | 'couple'
}

const TaxConfiguration = ({ planningMode = 'individual' }: TaxConfigurationProps) => {
  const {
    performSimulation,
    steuerlast,
    setSteuerlast,
    teilfreistellungsquote,
    setTeilfreistellungsquote,
    freibetragPerYear,
    setFreibetragPerYear,
    steuerReduzierenEndkapitalSparphase,
    setSteuerReduzierenEndkapitalSparphase,
    steuerReduzierenEndkapitalEntspharphase,
    setSteuerReduzierenEndkapitalEntspharphase,
    grundfreibetragAktiv,
    setGrundfreibetragAktiv,
    grundfreibetragBetrag,
    setGrundfreibetragBetrag,
    // Personal income tax settings for Günstigerprüfung
    personalTaxRate,
    setPersonalTaxRate,
    guenstigerPruefungAktiv,
    setGuenstigerPruefungAktiv,
    // Church tax (Kirchensteuer) settings
    kirchensteuerAktiv,
    setKirchensteuerAktiv,
    kirchensteuersatz,
    setKirchensteuersatz,
  } = useSimulation()

  const yearToday = new Date().getFullYear()

  // Calculate recommended Grundfreibetrag based on planning mode using constants
  const recommendedGrundfreibetrag = getGrundfreibetragForPlanningMode(planningMode)
  const planningModeLabel = planningMode === 'couple' ? 'Paare' : 'Einzelpersonen'

  // Automatically update Grundfreibetrag when planning mode changes
  // Only update if current value is a standard value to preserve custom user values
  useEffect(() => {
    if (grundfreibetragAktiv && isStandardGrundfreibetragValue(grundfreibetragBetrag)) {
      if (grundfreibetragBetrag !== recommendedGrundfreibetrag) {
        setGrundfreibetragBetrag(recommendedGrundfreibetrag)
        performSimulation()
      }
    }
  }, [
    planningMode,
    recommendedGrundfreibetrag,
    grundfreibetragAktiv,
    grundfreibetragBetrag,
    setGrundfreibetragBetrag,
    performSimulation,
  ])

  return (
    <NestingProvider level={1}>
      <div className="space-y-4">
        <Card nestingLevel={1}>
          <Collapsible defaultOpen={false}>
            <CardHeader nestingLevel={1}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors">
                  <CardTitle className="text-left">💰 Steuer-Konfiguration</CardTitle>
                  <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </div>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent nestingLevel={1} className="space-y-6">
                {/* ... existing tax configuration content ... */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="steuerlast">Kapitalertragsteuer (%)</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSteuerlast(26.375) // Default value
                        performSimulation()
                      }}
                      className="text-xs"
                    >
                      Reset
                    </Button>
                  </div>
                  <Slider
                    id="steuerlast"
                    value={[steuerlast]}
                    onValueChange={([value]) => {
                      setSteuerlast(value)
                      performSimulation()
                    }}
                    min={20}
                    max={35}
                    step={0.025}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>20%</span>
                    <span className="font-medium">
                      {steuerlast}
                      %
                    </span>
                    <span>35%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teilfreistellungsquote">Teilfreistellungsquote (%)</Label>
                  <Slider
                    id="teilfreistellungsquote"
                    value={[teilfreistellungsquote]}
                    onValueChange={([value]) => {
                      setTeilfreistellungsquote(value)
                      performSimulation()
                    }}
                    min={0}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>0%</span>
                    <span className="font-medium">
                      {teilfreistellungsquote}
                      %
                    </span>
                    <span>50%</span>
                  </div>
                </div>

                {/* Günstigerprüfung Configuration */}
                <div className="space-y-4 border rounded-lg p-4 bg-blue-50/50">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base font-medium">🔍 Günstigerprüfung</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatische Wahl zwischen Abgeltungssteuer und persönlichem Steuersatz
                      </p>
                    </div>
                    <Switch
                      id="guenstigerPruefungAktiv"
                      checked={guenstigerPruefungAktiv}
                      onCheckedChange={(checked) => {
                        setGuenstigerPruefungAktiv(checked)
                        performSimulation()
                      }}
                    />
                  </div>

                  {guenstigerPruefungAktiv && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="personalTaxRate">
                          Persönlicher Steuersatz (%)
                        </Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPersonalTaxRate(25) // Default value
                            performSimulation()
                          }}
                          className="text-xs"
                        >
                          Reset
                        </Button>
                      </div>
                      <Slider
                        id="personalTaxRate"
                        value={[personalTaxRate]}
                        onValueChange={([value]) => {
                          setPersonalTaxRate(value)
                          performSimulation()
                        }}
                        min={0}
                        max={45}
                        step={0.5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>0%</span>
                        <span className="font-medium">
                          {personalTaxRate}
                          %
                        </span>
                        <span>45%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Ihr persönlicher Einkommensteuersatz. Bei aktivierter Günstigerprüfung wird automatisch
                        der günstigere Steuersatz (Abgeltungssteuer vs. persönlicher Steuersatz) verwendet.
                      </p>
                    </div>
                  )}
                </div>

                {/* Kirchensteuer Configuration */}
                <div className="space-y-4 border rounded-lg p-4 bg-purple-50/50">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base font-medium">⛪ Kirchensteuer</Label>
                      <p className="text-sm text-muted-foreground">
                        Kirchensteuer wird als Prozentsatz der Einkommensteuer berechnet (8-9% je nach Bundesland)
                      </p>
                    </div>
                    <Switch
                      id="kirchensteuerAktiv"
                      checked={kirchensteuerAktiv}
                      onCheckedChange={(checked) => {
                        setKirchensteuerAktiv(checked)
                        performSimulation()
                      }}
                    />
                  </div>

                  {kirchensteuerAktiv && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="kirchensteuersatz">
                          Kirchensteuersatz (%)
                        </Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setKirchensteuersatz(9) // Default value
                            performSimulation()
                          }}
                          className="text-xs"
                        >
                          Reset
                        </Button>
                      </div>
                      <Slider
                        id="kirchensteuersatz"
                        value={[kirchensteuersatz]}
                        onValueChange={([value]) => {
                          setKirchensteuersatz(value)
                          performSimulation()
                        }}
                        min={8}
                        max={9}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>8%</span>
                        <span className="font-medium">
                          {kirchensteuersatz}
                          %
                        </span>
                        <span>9%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Kirchensteuer: Bayern/Baden-Württemberg 8%, andere Bundesländer 9%.
                        Wird automatisch bei der Günstigerprüfung und Einkommensteuerberechnung berücksichtigt.
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-medium">Steuer reduziert Endkapital</Label>
                  <p className="text-sm text-muted-foreground">
                    Konfigurieren Sie für jede Phase, ob die Steuer vom Endkapital abgezogen wird oder über ein
                    separates Verrechnungskonto bezahlt wird.
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="steuerReduzierenEndkapitalSparphase" className="font-medium">Sparphase</Label>
                        <p className="text-sm text-muted-foreground">
                          Während der Ansparphase vom Kapital abziehen
                        </p>
                      </div>
                      <Switch
                        id="steuerReduzierenEndkapitalSparphase"
                        checked={steuerReduzierenEndkapitalSparphase}
                        onCheckedChange={(checked) => {
                          setSteuerReduzierenEndkapitalSparphase(checked)
                          performSimulation()
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="steuerReduzierenEndkapitalEntspharphase" className="font-medium">Entsparphase</Label>
                        <p className="text-sm text-muted-foreground">
                          Während der Entnahmephase vom Kapital abziehen
                        </p>
                      </div>
                      <Switch
                        id="steuerReduzierenEndkapitalEntspharphase"
                        checked={steuerReduzierenEndkapitalEntspharphase}
                        onCheckedChange={(checked) => {
                          setSteuerReduzierenEndkapitalEntspharphase(checked)
                          performSimulation()
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="freibetragConfiguration">Sparerpauschbetrag pro Jahr (€)</Label>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="Jahr"
                        min={yearToday}
                        max={2100}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.target as HTMLInputElement
                            const year = Number(input.value)
                            if (year && !freibetragPerYear[year]) {
                              setFreibetragPerYear({
                                ...freibetragPerYear,
                                [year]: 2000, // Default value
                              })
                              performSimulation()
                              input.value = ''
                            }
                          }
                        }}
                      />
                    </div>
                    <Button
                      onClick={() => {
                        const year = yearToday
                        if (!freibetragPerYear[year]) {
                          setFreibetragPerYear({
                            ...freibetragPerYear,
                            [year]: 2000,
                          })
                          performSimulation()
                        }
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Jahr hinzufügen
                    </Button>
                  </div>
                  <div className="border rounded-md max-h-[200px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-center">Jahr</TableHead>
                          <TableHead className="text-center">Sparerpauschbetrag (€)</TableHead>
                          <TableHead className="text-center">Aktionen</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(freibetragPerYear).map(([year, amount]) => (
                          <TableRow key={year}>
                            <TableCell className="text-center">{year}</TableCell>
                            <TableCell className="text-center">
                              <Input
                                type="number"
                                value={amount}
                                min={0}
                                max={10000}
                                step={50}
                                onChange={(e) => {
                                  const value = Number(e.target.value)
                                  if (!isNaN(value)) {
                                    setFreibetragPerYear({
                                      ...freibetragPerYear,
                                      [year]: value,
                                    })
                                    performSimulation()
                                  }
                                }}
                                className="w-24 mx-auto"
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newFreibetrag = { ...freibetragPerYear }
                                  delete newFreibetrag[Number(year)]
                                  setFreibetragPerYear(newFreibetrag)
                                  performSimulation()
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Grundfreibetrag Configuration */}
        <Card nestingLevel={1}>
          <Collapsible defaultOpen={false}>
            <CardHeader nestingLevel={1}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors">
                  <CardTitle className="text-left">🏠 Grundfreibetrag-Konfiguration</CardTitle>
                  <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </div>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent nestingLevel={1} className="space-y-6">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <Label htmlFor="grundfreibetragAktiv" className="font-medium">Grundfreibetrag berücksichtigen</Label>
                    <p className="text-sm text-muted-foreground">
                      Berücksichtigt den Grundfreibetrag für die Einkommensteuer bei Entnahmen
                      (relevant für Rentner ohne weiteres Einkommen)
                    </p>
                  </div>
                  <Switch
                    id="grundfreibetragAktiv"
                    checked={grundfreibetragAktiv}
                    onCheckedChange={(checked) => {
                      setGrundfreibetragAktiv(checked)
                      // When activating, automatically set the correct value based on planning mode
                      if (checked) {
                        setGrundfreibetragBetrag(recommendedGrundfreibetrag)
                      }
                      performSimulation()
                    }}
                  />
                </div>

                {grundfreibetragAktiv && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="grundfreibetragBetrag">Grundfreibetrag pro Jahr (€)</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setGrundfreibetragBetrag(recommendedGrundfreibetrag)
                          performSimulation()
                        }}
                        className="text-xs"
                      >
                        Reset (
                        {planningModeLabel}
                        )
                      </Button>
                    </div>
                    <Input
                      id="grundfreibetragBetrag"
                      type="number"
                      value={grundfreibetragBetrag}
                      min={0}
                      max={50000}
                      step={100}
                      onChange={(e) => {
                        const value = Number(e.target.value)
                        if (!isNaN(value)) {
                          setGrundfreibetragBetrag(value)
                          performSimulation()
                        }
                      }}
                      className="w-full"
                    />
                    <div className="text-sm text-muted-foreground">
                      <p>
                        Aktueller Grundfreibetrag 2024: €
                        {GERMAN_TAX_CONSTANTS.GRUNDFREIBETRAG_2024.toLocaleString()}
                        {' '}
                        pro Person | Empfohlener Wert für
                        {' '}
                        {planningModeLabel}
                        : €
                        {recommendedGrundfreibetrag.toLocaleString()}
                      </p>
                      <p>
                        Der Grundfreibetrag wird automatisch basierend auf dem Planungsmodus
                        (Einzelperson/Ehepaar) gesetzt. Er wird sowohl für einheitliche Strategien
                        als auch für geteilte Entsparphasen berücksichtigt.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Basiszins Configuration - wrapped in nesting provider */}
        <NestingProvider>
          <BasiszinsConfiguration />
        </NestingProvider>
      </div>
    </NestingProvider>
  )
}

export default TaxConfiguration
