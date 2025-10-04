import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { RadioTileGroup, RadioTile } from './ui/radio-tile'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { useSimulation } from '../contexts/useSimulation'
import { useNavigationItem } from '../hooks/useNavigationItem'
import { calculateEndOfLifeYear, calculateCurrentAge, getDefaultLifeExpectancy } from '../../helpers/life-expectancy'
import { calculateJointLifeExpectancy } from '../../helpers/rmd-tables'
import { CoupleStatutoryPensionConfiguration } from './StatutoryPensionConfiguration'
import { CareCostConfiguration } from './CareCostConfiguration'
import { useEffect } from 'react'

interface GlobalPlanningConfigurationProps {
  startOfIndependence: number
}

export function GlobalPlanningConfiguration({ startOfIndependence }: GlobalPlanningConfigurationProps) {
  const {
    endOfLife: globalEndOfLife,
    lifeExpectancyTable,
    customLifeExpectancy,
    setEndOfLife,
    setLifeExpectancyTable,
    setCustomLifeExpectancy,
    birthYear,
    setBirthYear,
    expectedLifespan,
    setExpectedLifespan,
    useAutomaticCalculation,
    setUseAutomaticCalculation,
    // Gender and couple planning
    planningMode,
    setPlanningMode,
    gender,
    setGender,
    spouse,
    setSpouse,
    // Couple statutory pension configuration (new)
    coupleStatutoryPensionConfig,
    setCoupleStatutoryPensionConfig,
    // Care cost configuration
    careCostConfiguration,
    setCareCostConfiguration,
  } = useSimulation()

  // Automatic calculation effect - triggers when automatic mode is enabled and relevant data changes
  useEffect(() => {
    if (useAutomaticCalculation) {
      if (planningMode === 'individual') {
        // Individual planning: calculate when birth year and expected lifespan are available
        if (birthYear && expectedLifespan) {
          const calculatedYear = calculateEndOfLifeYear(birthYear, expectedLifespan)
          setEndOfLife(Math.round(calculatedYear))
        }
      }
      else if (planningMode === 'couple') {
        // Couple planning: calculate when both birth years and genders are available
        if (birthYear && spouse?.birthYear && gender && spouse?.gender) {
          const age1 = calculateCurrentAge(birthYear)
          const age2 = calculateCurrentAge(spouse.birthYear)
          const jointLifeExpectancy = calculateJointLifeExpectancy(
            age1, age2, gender, spouse.gender,
          )

          // Use the older person's birth year + joint life expectancy
          const olderBirthYear = Math.min(birthYear, spouse.birthYear)
          const calculatedYear = calculateEndOfLifeYear(
            olderBirthYear,
            jointLifeExpectancy + calculateCurrentAge(olderBirthYear),
          )
          setEndOfLife(Math.round(calculatedYear))
        }
      }
    }
  }, [
    useAutomaticCalculation,
    planningMode,
    birthYear,
    spouse,
    gender,
    expectedLifespan,
    setEndOfLife,
  ])

  const navigationRef = useNavigationItem({
    id: 'global-planning',
    title: 'Globale Planung (Einzelperson/Ehepaar)',
    icon: '👥',
    level: 0,
  })

  return (
    <Card className="mb-6" ref={navigationRef}>
      <Collapsible defaultOpen={false}>
        <CardHeader>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors group">
              <CardTitle className="text-lg font-semibold text-blue-800">👥 Globale Planung (Einzelperson/Ehepaar)</CardTitle>
              <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            <div className="space-y-6">
              {/* Planning Mode Selection */}
              <div className="space-y-2">
                <Label>Planungsmodus</Label>
                <RadioTileGroup
                  value={planningMode}
                  onValueChange={(value: string) => setPlanningMode(value as 'individual' | 'couple')}
                >
                  <RadioTile value="individual" label="Einzelperson">
                    Planung für eine Person mit individueller Lebenserwartung
                  </RadioTile>
                  <RadioTile value="couple" label="Ehepaar/Partner">
                    Planung für zwei Personen mit gemeinsamer Lebenserwartung (längerer überlebender Partner)
                  </RadioTile>
                </RadioTileGroup>
              </div>

              {/* Gender Configuration */}
              {planningMode === 'individual'
                ? (
                    <div className="space-y-2">
                      <Label>Geschlecht für Lebenserwartung</Label>
                      <RadioTileGroup
                        value={gender || ''}
                        onValueChange={(value: string) => setGender(value as 'male' | 'female' | undefined)}
                      >
                        <RadioTile value="male" label="Männlich">
                          Verwende Lebenserwartung für Männer
                        </RadioTile>
                        <RadioTile value="female" label="Weiblich">
                          Verwende Lebenserwartung für Frauen
                        </RadioTile>
                      </RadioTileGroup>
                      {gender && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="text-sm text-blue-800 font-medium">
                            ℹ️ Automatische Sterbetafel-Auswahl
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {gender === 'male'
                              ? 'Es wird automatisch die deutsche Sterbetafel für Männer (2020-2022) verwendet. Die männliche Lebenserwartung liegt im Durchschnitt ca. 5 Jahre unter der weiblichen.'
                              : 'Es wird automatisch die deutsche Sterbetafel für Frauen (2020-2022) verwendet. Die weibliche Lebenserwartung liegt im Durchschnitt ca. 5 Jahre über der männlichen.'}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                : (
                    <div className="space-y-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm font-medium text-blue-900">Konfiguration für Ehepaar/Partner</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Person 1 - Geschlecht</Label>
                          <RadioTileGroup
                            value={gender || 'male'}
                            onValueChange={(value: string) => setGender(value as 'male' | 'female')}
                            idPrefix="person1"
                          >
                            <RadioTile value="male" label="Männlich">
                              Verwende Lebenserwartung für Männer
                            </RadioTile>
                            <RadioTile value="female" label="Weiblich">
                              Verwende Lebenserwartung für Frauen
                            </RadioTile>
                          </RadioTileGroup>
                        </div>
                        <div className="space-y-2">
                          <Label>Person 2 - Geschlecht</Label>
                          <RadioTileGroup
                            value={spouse?.gender || 'female'}
                            onValueChange={(value: string) => setSpouse({
                              ...spouse,
                              gender: value as 'male' | 'female',
                            })}
                            idPrefix="person2"
                          >
                            <RadioTile value="male" label="Männlich">
                              Männlich
                            </RadioTile>
                            <RadioTile value="female" label="Weiblich">
                              Weiblich
                            </RadioTile>
                          </RadioTileGroup>
                        </div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm text-blue-800 font-medium">
                          ℹ️ Automatische Sterbetafel-Auswahl für Paare
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Es werden automatisch geschlechtsspezifische deutsche Sterbetafeln (2020-2022) für
                          beide Partner verwendet.
                          Die gemeinsame Lebenserwartung wird nach aktuariellen Methoden als "Joint Life
                          Expectancy" berechnet.
                        </div>
                      </div>
                    </div>
                  )}

              {/* Birth Year Configuration - Moved up one level */}
              <div className="space-y-2">
                <Label>Geburtsjahr Konfiguration</Label>
                {planningMode === 'individual' ? (
                  // Individual Birth Year
                  <div className="p-3 border rounded-lg bg-white">
                    <div className="space-y-2">
                      <Label htmlFor="birth-year-main" className="text-sm font-medium">Geburtsjahr</Label>
                      <Input
                        id="birth-year-main"
                        type="number"
                        value={birthYear || ''}
                        onChange={(e) => {
                          const year = e.target.value ? Number(e.target.value) : undefined
                          setBirthYear(year)
                          // Auto-suggest life expectancy based on current age and gender
                          if (year) {
                            const currentAge = calculateCurrentAge(year)
                            const suggestedLifespan = getDefaultLifeExpectancy(currentAge, gender)
                            if (!expectedLifespan) {
                              setExpectedLifespan(suggestedLifespan)
                            }
                          }
                        }}
                        placeholder="1974"
                        min={1930}
                        max={new Date().getFullYear() - 18}
                        className="w-40"
                      />
                      {birthYear && (
                        <div className="text-sm text-muted-foreground">
                          Aktuelles Alter:
                          {' '}
                          {calculateCurrentAge(birthYear)}
                          {' '}
                          Jahre
                          {gender && (
                            <span className="ml-2">
                              (
                              {gender === 'male' ? '♂ Männlich' : '♀ Weiblich'}
                              )
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Couple Birth Years
                  <div className="p-3 border rounded-lg bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="birth-year-person1-main" className="text-sm font-medium">
                          Person 1 Geburtsjahr (
                          {gender === 'male' ? '♂ Männlich' : '♀ Weiblich'}
                          )
                        </Label>
                        <Input
                          id="birth-year-person1-main"
                          type="number"
                          value={birthYear || ''}
                          onChange={(e) => {
                            const year = e.target.value ? Number(e.target.value) : undefined
                            setBirthYear(year)
                          }}
                          placeholder="1974"
                          min={1930}
                          max={new Date().getFullYear() - 18}
                          className="w-40"
                        />
                        {birthYear && (
                          <div className="text-sm text-muted-foreground">
                            Alter:
                            {' '}
                            {calculateCurrentAge(birthYear)}
                            {' '}
                            Jahre
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="birth-year-person2-main" className="text-sm font-medium">
                          Person 2 Geburtsjahr (
                          {spouse?.gender === 'male' ? '♂ Männlich' : '♀ Weiblich'}
                          )
                        </Label>
                        <Input
                          id="birth-year-person2-main"
                          type="number"
                          value={spouse?.birthYear || ''}
                          onChange={(e) => {
                            const year = e.target.value ? Number(e.target.value) : undefined
                            setSpouse({
                              ...spouse,
                              gender: spouse?.gender || 'female',
                              birthYear: year,
                            })
                          }}
                          placeholder="1976"
                          min={1930}
                          max={new Date().getFullYear() - 18}
                          className="w-40"
                        />
                        {spouse?.birthYear && (
                          <div className="text-sm text-muted-foreground">
                            Alter:
                            {' '}
                            {calculateCurrentAge(spouse.birthYear)}
                            {' '}
                            Jahre
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Life Expectancy Calculation Card */}
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

              {/* Statutory Pension Configuration Card */}
              <div className="mb-6">
                <CoupleStatutoryPensionConfiguration
                  config={coupleStatutoryPensionConfig}
                  onChange={setCoupleStatutoryPensionConfig}
                  currentYear={new Date().getFullYear()}
                  birthYear={birthYear}
                  spouseBirthYear={spouse?.birthYear}
                  planningMode={planningMode}
                />
              </div>

              {/* Care Cost Configuration Card */}
              <div className="mb-6">
                <CareCostConfiguration
                  values={careCostConfiguration}
                  onChange={setCareCostConfiguration}
                  currentYear={new Date().getFullYear()}
                  birthYear={birthYear}
                  spouseBirthYear={spouse?.birthYear}
                  planningMode={planningMode}
                  nestingLevel={1}
                />
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
