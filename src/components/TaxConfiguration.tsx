import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { Button } from './ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Trash2, Plus, ChevronDown } from 'lucide-react'
import { useSimulation } from '../contexts/useSimulation'
import { NestingProvider } from '../lib/nesting-context'
import BasiszinsConfiguration from './BasiszinsConfiguration'
import { useEffect } from 'react'
import { getGrundfreibetragForPlanningMode, isStandardGrundfreibetragValue } from '../../helpers/steuer'
import { TooltipProvider } from './ui/tooltip'
import { KapitalertragsteuerSection } from './tax-config/KapitalertragsteuerSection'
import { TeilfreistellungsquoteSection } from './tax-config/TeilfreistellungsquoteSection'
import { GuenstigerpruefungSection } from './tax-config/GuenstigerpruefungSection'
import { KirchensteuerSection } from './tax-config/KirchensteuerSection'
import { SteuerReduziertEndkapitalSection } from './tax-config/SteuerReduziertEndkapitalSection'
import { GrundfreibetragConfiguration } from './tax-config/GrundfreibetragConfiguration'

/** Freibetrag per year table component */
interface FreibetragPerYearTableProps {
  freibetragPerYear: Record<number, number>
  yearToday: number
  onUpdate: (newValues: Record<number, number>) => void
}

// eslint-disable-next-line max-lines-per-function -- Large component function
function FreibetragPerYearTable({
  freibetragPerYear,
  yearToday,
  onUpdate,
}: FreibetragPerYearTableProps) {
  const addYear = (year: number) => {
    if (!freibetragPerYear[year]) {
      onUpdate({
        ...freibetragPerYear,
        [year]: 2000,
      })
    }
  }

  const updateYear = (year: number, amount: number) => {
    onUpdate({
      ...freibetragPerYear,
      [year]: amount,
    })
  }

  const deleteYear = (year: number) => {
    const newFreibetrag = { ...freibetragPerYear }
    delete newFreibetrag[year]
    onUpdate(newFreibetrag)
  }

  return (
    <div className="space-y-2">
      <Label>
        Sparerpauschbetrag
        {' '}
        pro Jahr (€)
      </Label>
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
                if (year) {
                  addYear(year)
                  input.value = ''
                }
              }
            }}
          />
        </div>
        <Button onClick={() => addYear(yearToday)}>
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
                        updateYear(Number(year), value)
                      }
                    }}
                    className="w-24 mx-auto"
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteYear(Number(year))}
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
  )
}

interface TaxConfigurationProps {
  planningMode?: 'individual' | 'couple'
}

// eslint-disable-next-line max-lines-per-function -- Large component render function
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
    <TooltipProvider>
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
                  <KapitalertragsteuerSection
                    steuerlast={steuerlast}
                    onSteuerlastChange={(value) => {
                      setSteuerlast(value)
                      performSimulation()
                    }}
                  />

                  <TeilfreistellungsquoteSection
                    teilfreistellungsquote={teilfreistellungsquote}
                    onTeilfreistellungsquoteChange={(value) => {
                      setTeilfreistellungsquote(value)
                      performSimulation()
                    }}
                  />

                  {/* Günstigerprüfung Configuration */}
                  <GuenstigerpruefungSection
                    guenstigerPruefungAktiv={guenstigerPruefungAktiv}
                    personalTaxRate={personalTaxRate}
                    onGuenstigerPruefungAktivChange={(checked) => {
                      setGuenstigerPruefungAktiv(checked)
                      performSimulation()
                    }}
                    onPersonalTaxRateChange={(value) => {
                      setPersonalTaxRate(value)
                      performSimulation()
                    }}
                  />

                  {/* Kirchensteuer Configuration */}
                  <KirchensteuerSection
                    kirchensteuerAktiv={kirchensteuerAktiv}
                    kirchensteuersatz={kirchensteuersatz}
                    onKirchensteuerAktivChange={(checked) => {
                      setKirchensteuerAktiv(checked)
                      performSimulation()
                    }}
                    onKirchensteuersatzChange={(value) => {
                      setKirchensteuersatz(value)
                      performSimulation()
                    }}
                  />

                  <SteuerReduziertEndkapitalSection
                    steuerReduzierenEndkapitalSparphase={steuerReduzierenEndkapitalSparphase}
                    steuerReduzierenEndkapitalEntspharphase={steuerReduzierenEndkapitalEntspharphase}
                    onSteuerReduzierenSparphaseChange={(checked) => {
                      setSteuerReduzierenEndkapitalSparphase(checked)
                      performSimulation()
                    }}
                    onSteuerReduzierenEntspharphaseChange={(checked) => {
                      setSteuerReduzierenEndkapitalEntspharphase(checked)
                      performSimulation()
                    }}
                  />

                  <FreibetragPerYearTable
                    freibetragPerYear={freibetragPerYear}
                    yearToday={yearToday}
                    onUpdate={(newValues) => {
                      setFreibetragPerYear(newValues)
                      performSimulation()
                    }}
                  />
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Grundfreibetrag Configuration */}
          <GrundfreibetragConfiguration
            grundfreibetragAktiv={grundfreibetragAktiv}
            grundfreibetragBetrag={grundfreibetragBetrag}
            recommendedGrundfreibetrag={recommendedGrundfreibetrag}
            planningModeLabel={planningModeLabel}
            onGrundfreibetragAktivChange={(checked) => {
              setGrundfreibetragAktiv(checked)
              // When activating, automatically set the correct value based on planning mode
              if (checked) {
                setGrundfreibetragBetrag(recommendedGrundfreibetrag)
              }
              performSimulation()
            }}
            onGrundfreibetragBetragChange={(value) => {
              setGrundfreibetragBetrag(value)
              performSimulation()
            }}
          />

          {/* Basiszins Configuration - wrapped in nesting provider */}
          <NestingProvider>
            <BasiszinsConfiguration />
          </NestingProvider>
        </div>
      </NestingProvider>
    </TooltipProvider>
  )
}

export default TaxConfiguration
