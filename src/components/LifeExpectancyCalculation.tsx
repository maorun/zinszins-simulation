import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Switch } from './ui/switch'
import { AutomaticCalculationHelper } from './AutomaticCalculationHelper'
import { LifeExpectancyTableConfiguration } from './LifeExpectancyTableConfiguration'

interface LifeExpectancyCalculationProps {
  config: {
    startOfIndependence: number
    globalEndOfLife: number
    useAutomaticCalculation: boolean
    planningMode: 'individual' | 'couple'
    birthYear: number | undefined
    expectedLifespan: number | undefined
    gender: 'male' | 'female' | undefined
    spouse: { gender: 'male' | 'female', birthYear?: number } | undefined
    lifeExpectancyTable: 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom'
    customLifeExpectancy: number | undefined
  }
  onChange: {
    endOfLife: (year: number) => void
    useAutomaticCalculation: (value: boolean) => void
    expectedLifespan: (lifespan: number | undefined) => void
    lifeExpectancyTable: (table: 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom') => void
    customLifeExpectancy: (value: number | undefined) => void
  }
}

// eslint-disable-next-line max-lines-per-function -- Large component function
export function LifeExpectancyCalculation({
  config,
  onChange,
}: LifeExpectancyCalculationProps) {
  const {
    startOfIndependence,
    globalEndOfLife,
    useAutomaticCalculation,
    planningMode,
    birthYear,
    expectedLifespan,
    gender,
    spouse,
    lifeExpectancyTable,
    customLifeExpectancy,
  } = config
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
                    onCheckedChange={onChange.useAutomaticCalculation}
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
                    onChange.endOfLife(value)
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
                  <AutomaticCalculationHelper
                    config={{
                      planningMode,
                      birthYear,
                      expectedLifespan,
                      gender,
                      spouse,
                    }}
                    onChange={{
                      expectedLifespan: onChange.expectedLifespan,
                    }}
                  />
                )}
              </div>

              {/* Life Expectancy Table Configuration */}
              <LifeExpectancyTableConfiguration
                config={{
                  planningMode,
                  gender,
                  spouse,
                  lifeExpectancyTable,
                  customLifeExpectancy,
                }}
                onChange={{
                  lifeExpectancyTable: onChange.lifeExpectancyTable,
                  customLifeExpectancy: onChange.customLifeExpectancy,
                }}
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
