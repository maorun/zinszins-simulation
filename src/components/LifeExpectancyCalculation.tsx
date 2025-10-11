import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Switch } from './ui/switch'
import { RadioTileGroup, RadioTile } from './ui/radio-tile'
import { calculateCurrentAge } from '../../helpers/life-expectancy'
import { calculateJointLifeExpectancy } from '../../helpers/rmd-tables'

interface LifeExpectancyCalculationProps {
  startOfIndependence: number
  globalEndOfLife: number
  setEndOfLife: (year: number) => void
  useAutomaticCalculation: boolean
  setUseAutomaticCalculation: (value: boolean) => void
  planningMode: 'individual' | 'couple'
  birthYear: number | undefined
  expectedLifespan: number | undefined
  setExpectedLifespan: (lifespan: number | undefined) => void
  gender: 'male' | 'female' | undefined
  spouse: { gender: 'male' | 'female', birthYear?: number } | undefined
  lifeExpectancyTable: 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom'
  setLifeExpectancyTable: (table: 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom') => void
  customLifeExpectancy: number | undefined
  setCustomLifeExpectancy: (value: number | undefined) => void
}

export function LifeExpectancyCalculation({
  startOfIndependence,
  globalEndOfLife,
  setEndOfLife,
  useAutomaticCalculation,
  setUseAutomaticCalculation,
  planningMode,
  birthYear,
  expectedLifespan,
  setExpectedLifespan,
  gender,
  spouse,
  lifeExpectancyTable,
  setLifeExpectancyTable,
  customLifeExpectancy,
  setCustomLifeExpectancy,
}: LifeExpectancyCalculationProps) {
  return (
    <Card>
      <Collapsible defaultOpen={false}>
        <CardHeader>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors group">
              <CardTitle className="text-base font-semibold text-green-800">🕰️ Lebensende Berechnung</CardTitle>
              <ChevronDown className="h-4 w-4 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            {/* Toggle between manual and automatic calculation */}
            <div className="mb-6 p-3 border rounded-lg bg-white">
              <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div className="space-y-1">
                  <Label htmlFor="calculation-mode" className="font-medium">Berechnungsmodus</Label>
                  <p className="text-sm text-muted-foreground hidden sm:block">
                    Manuell für direkte Jahreseingabe, Automatisch für Geburtsjahr-basierte Berechnung
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-sm ${!useAutomaticCalculation ? 'font-medium' : 'text-muted-foreground'}`}>
                    Manuell
                  </span>
                  <Switch
                    id="calculation-mode"
                    checked={useAutomaticCalculation}
                    onCheckedChange={setUseAutomaticCalculation}
                  />
                  <span className={`text-sm ${useAutomaticCalculation ? 'font-medium' : 'text-muted-foreground'}`}>
                    Automatisch
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3 sm:hidden">
                Manuell für direkte Jahreseingabe, Automatisch für Geburtsjahr-basierte Berechnung
              </p>
            </div>

            <div className="space-y-6">
              {/* End of Life Year Configuration */}
              <div className="space-y-2">
                <Label>Lebensende (Jahr)</Label>
                <Input
                  type="number"
                  value={globalEndOfLife}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : 2080
                    setEndOfLife(value)
                  }}
                  min={startOfIndependence + 1}
                  max={2150}
                  disabled={useAutomaticCalculation}
                />
                <div className="text-sm text-muted-foreground">
                  Das Jahr, in dem die Entnahmephase enden soll (z.B. 2080)
                </div>

                {/* Automatic calculation helper */}
                {useAutomaticCalculation && (
                  <div className="p-3 bg-blue-50 rounded-lg space-y-3">
                    <div className="text-sm font-medium text-blue-900">Lebensende automatisch berechnen</div>

                    {planningMode === 'individual' ? (
                      // Individual Planning Mode - using birth year from main level
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="expected-lifespan" className="text-sm">Lebenserwartung (Alter)</Label>
                          <Input
                            id="expected-lifespan"
                            type="number"
                            value={expectedLifespan || 85}
                            onChange={e => setExpectedLifespan(Number(e.target.value))}
                            min={50}
                            max={120}
                            className="w-32"
                          />
                        </div>
                        {birthYear && (
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>
                              Aktuelles Alter:
                              {' '}
                              {calculateCurrentAge(birthYear)}
                              {' '}
                              Jahre
                            </div>
                            {gender && (
                              <div>
                                Geschlechts-spezifische Lebenserwartung:
                                {gender === 'male' ? ' ♂ Männlich (ca. 78 Jahre)' : ' ♀ Weiblich (ca. 83 Jahre)'}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      // Couple Planning Mode - using birth years from main level
                      <>
                        {birthYear && spouse?.birthYear && gender && spouse?.gender && (
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>
                              Gemeinsame Lebenserwartung:
                              {' '}
                              {Math.round(calculateJointLifeExpectancy(
                                calculateCurrentAge(birthYear),
                                calculateCurrentAge(spouse.birthYear),
                                gender,
                                spouse.gender,
                              ))}
                              {' '}
                              Jahre (längerer überlebender Partner)
                            </div>
                            <div>
                              Dies entspricht der Wahrscheinlichkeit, dass mindestens eine Person noch am
                              Leben ist.
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Life Expectancy Table Configuration */}
              <div className="space-y-2">
                <Label>Datengrundlage für Lebenserwartung</Label>
                {(planningMode === 'individual' && gender)
                  || (planningMode === 'couple' && gender && spouse?.gender) ? (
                // Smart mode: Gender is specified, auto-select appropriate table and only show custom option
                      <>
                        <RadioTileGroup
                          value={lifeExpectancyTable === 'custom' ? 'custom' : 'auto'}
                          onValueChange={(value: string) => {
                            if (value === 'custom') {
                              setLifeExpectancyTable('custom')
                            }
                            else {
                            // Auto-select based on context
                              if (planningMode === 'couple') {
                              // For couples, we use gender-specific tables automatically
                                setLifeExpectancyTable('german_2020_22') // The system will use gender-specific data
                              }
                              else {
                              // For individuals, use gender-specific table
                                setLifeExpectancyTable(gender === 'male' ? 'german_male_2020_22' : 'german_female_2020_22')
                              }
                            }
                          }}
                        >
                          <RadioTile value="auto" label="Automatische Auswahl">
                            {planningMode === 'couple'
                              ? 'Geschlechtsspezifische Sterbetafeln für beide Partner'
                              : `Deutsche Sterbetafel für ${gender === 'male' ? 'Männer' : 'Frauen'}`}
                          </RadioTile>
                          <RadioTile value="custom" label="Benutzerdefiniert">
                            Eigene Lebenserwartung eingeben
                          </RadioTile>
                        </RadioTileGroup>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="text-sm text-blue-800 font-medium">
                            ℹ️ Automatische Sterbetafel-Auswahl
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {planningMode === 'couple'
                              ? `Basierend auf den gewählten Geschlechtern (${gender === 'male' ? 'Männlich' : 'Weiblich'} und ${spouse?.gender === 'male' ? 'Männlich' : 'Weiblich'}) werden automatisch die entsprechenden deutschen Sterbetafeln (2020-2022) verwendet.`
                              : `Basierend auf dem gewählten Geschlecht (${gender === 'male' ? 'Männlich' : 'Weiblich'}) wird automatisch die entsprechende deutsche Sterbetafel (2020-2022) verwendet.`}
                          </div>
                        </div>
                      </>
                    ) : (
                // Manual mode: No gender specified, show neutral and custom options
                      <RadioTileGroup
                        value={lifeExpectancyTable}
                        onValueChange={(value: string) => setLifeExpectancyTable(value as 'german_2020_22' | 'custom')}
                      >
                        <RadioTile value="german_2020_22" label="Deutsche Sterbetafel (Durchschnitt)">
                          Offizielle Sterbetafel 2020-2022 vom Statistischen Bundesamt (geschlechtsneutral)
                        </RadioTile>
                        <RadioTile value="custom" label="Benutzerdefiniert">
                          Eigene Lebenserwartung eingeben
                        </RadioTile>
                      </RadioTileGroup>
                    )}

                {lifeExpectancyTable === 'custom' && (
                  <div className="space-y-2 mt-2">
                    <Label>Lebenserwartung (Jahre)</Label>
                    <Input
                      type="number"
                      value={customLifeExpectancy || ''}
                      onChange={(e) => {
                        const value = e.target.value ? Number(e.target.value) : undefined
                        setCustomLifeExpectancy(value)
                      }}
                      min={1}
                      max={50}
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
