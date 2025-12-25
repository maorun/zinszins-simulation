import { useState, useMemo } from 'react'
import { Card, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent } from './ui/collapsible'
import { CollapsibleCardHeader } from './ui/collapsible-card'
import { Label } from './ui/label'
import { Slider } from './ui/slider'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import {
  calculateSolidaritaetszuschlag,
  SOLI_CONSTANTS,
  type SoliPlanningMode,
} from '../../helpers/solidaritaetszuschlag'
import { formatCurrency } from '../utils/currency'

function InfoMessage() {
  return (
    <div className="text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-3">
      <p className="font-medium text-blue-900 mb-1">💡 Informations-Tool</p>
      <p className="text-xs text-blue-800">
        Dieser Rechner zeigt die Berechnung des Solidaritätszuschlags nach der Reform von 2021. Die Reform führte
        Freigrenzen und eine Gleitzone ein, sodass etwa 90% der Steuerzahler keinen oder reduzierten Soli zahlen.
      </p>
    </div>
  )
}

interface SoliResultsDisplayProps {
  result: ReturnType<typeof calculateSolidaritaetszuschlag>
  incomeTax: number
}

function ZoneHeader({ zone }: { zone: string }) {
  const labels = {
    below_freigrenze: '✅ Unter Freigrenze - Kein Soli',
    gleitzone: '⚠️ In Gleitzone - Reduzierter Soli',
    full_soli: '🔴 Über Gleitzone - Voller Soli',
  }
  return <h4 className="font-medium mb-3">{labels[zone as keyof typeof labels]}</h4>
}

function SavingsInfo({ calculation }: { calculation: { soliWithoutReform: number; soliSaved: number } }) {
  return (
    <div className="mt-3 pt-3 border-t border-opacity-50 text-xs">
      <p className="font-medium mb-1">💰 Ersparnis durch 2021 Reform:</p>
      <div className="space-y-1">
        <div>Soli ohne Reform (5,5%): {formatCurrency(calculation.soliWithoutReform)}</div>
        <div className="font-medium">
          Ersparnis: <span className="text-green-700">{formatCurrency(calculation.soliSaved)}</span>
        </div>
      </div>
    </div>
  )
}

function SoliResultsDisplay({ result, incomeTax }: SoliResultsDisplayProps) {
  const { soli, zone, effectiveSoliRate, calculation } = result

  const colorScheme =
    zone === 'below_freigrenze'
      ? { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', light: 'text-green-800' }
      : zone === 'gleitzone'
        ? { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-900', light: 'text-yellow-800' }
        : { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', light: 'text-red-800' }

  return (
    <div className={`mt-4 p-4 ${colorScheme.bg} border ${colorScheme.border} rounded-lg`}>
      <ZoneHeader zone={zone} />
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className={colorScheme.light}>Einkommensteuer:</span>
          <span className={`font-medium ${colorScheme.text}`}>{formatCurrency(incomeTax)}</span>
        </div>
        <div className="flex justify-between">
          <span className={colorScheme.light}>Freigrenze:</span>
          <span className={`font-medium ${colorScheme.text}`}>{formatCurrency(result.freigrenze)}</span>
        </div>
        {zone !== 'below_freigrenze' && (
          <>
            <div className="flex justify-between">
              <span className={colorScheme.light}>Gleitzone Obergrenze:</span>
              <span className={`font-medium ${colorScheme.text}`}>{formatCurrency(result.gleitzoneUpper)}</span>
            </div>
            <div className="flex justify-between">
              <span className={colorScheme.light}>Effektiver Soli-Satz:</span>
              <span className={`font-medium ${colorScheme.text}`}>{(effectiveSoliRate * 100).toFixed(2)}%</span>
            </div>
          </>
        )}
        <div className="flex justify-between pt-2 border-t border-opacity-50">
          <span className={`font-medium ${colorScheme.text}`}>Solidaritätszuschlag:</span>
          <span className={`font-bold ${colorScheme.text} text-lg`}>{formatCurrency(soli)}</span>
        </div>
      </div>

      <SavingsInfo calculation={calculation} />
      
      <div className={`mt-3 pt-3 border-t border-opacity-50 text-xs ${colorScheme.light}`}>
        <p className="font-medium mb-1">ℹ️ Erklärung:</p>
        <p>{calculation.explanation}</p>
      </div>
    </div>
  )
}

/**
 * Planning mode selection component
 */
function PlanningModeSelector({
  planningMode,
  onPlanningModeChange,
}: {
  planningMode: SoliPlanningMode
  onPlanningModeChange: (mode: SoliPlanningMode) => void
}) {
  return (
    <div className="space-y-3">
      <Label htmlFor="planning-mode" className="text-sm font-medium">
        Planungsmodus
      </Label>
      <RadioGroup
        id="planning-mode"
        value={planningMode}
        onValueChange={(value) => onPlanningModeChange(value as SoliPlanningMode)}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="individual" id="individual" />
          <Label htmlFor="individual" className="font-normal cursor-pointer">
            Einzelperson (Freigrenze: {formatCurrency(SOLI_CONSTANTS.FREIGRENZE_INDIVIDUAL)})
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="couple" id="couple" />
          <Label htmlFor="couple" className="font-normal cursor-pointer">
            Ehepaar/Partner (Freigrenze: {formatCurrency(SOLI_CONSTANTS.FREIGRENZE_COUPLE)})
          </Label>
        </div>
      </RadioGroup>
    </div>
  )
}

/**
 * Income tax slider component
 */
function IncomeTaxSlider({ incomeTax, onChange }: { incomeTax: number; onChange: (value: number) => void }) {
  const handleChange = (value: number[]) => onChange(value[0])

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label htmlFor="income-tax-slider" className="text-sm font-medium">
          Einkommensteuer (jährlich)
        </Label>
        <span className="text-sm font-medium text-primary">{formatCurrency(incomeTax)}</span>
      </div>
      <Slider
        id="income-tax-slider"
        min={0}
        max={100000}
        step={1000}
        value={[incomeTax]}
        onValueChange={handleChange}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0 €</span>
        <span>100.000 €</span>
      </div>
    </div>
  )
}

/**
 * Background information component
 */
function BackgroundInfo() {
  return (
    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700">
      <p className="font-medium mb-2">📚 Hintergrundinformation:</p>
      <ul className="space-y-1 ml-4 list-disc">
        <li>Der Solidaritätszuschlag beträgt grundsätzlich 5,5% der Einkommensteuer</li>
        <li>Seit 2021 gilt eine Freigrenze: Etwa 90% der Steuerzahler zahlen keinen Soli mehr</li>
        <li>
          In der Gleitzone wird der Soli schrittweise eingeführt (11,9% des Betrags über der Freigrenze)
        </li>
        <li>Oberhalb der Gleitzone wird der volle Soli (5,5%) auf die gesamte Einkommensteuer fällig</li>
      </ul>
    </div>
  )
}

/**
 * Solidaritätszuschlag Information Card
 *
 * Educational component that demonstrates Soli calculation with the 2021 reform
 * (Freigrenze and Gleitzone). Allows users to see how Soli is calculated based on
 * different income tax amounts and planning modes.
 */
export function SolidaritaetszuschlagCard() {
  const [isOpen, setIsOpen] = useState(false)
  const [planningMode, setPlanningMode] = useState<SoliPlanningMode>('individual')
  const [incomeTax, setIncomeTax] = useState(25000)

  const soliResult = useMemo(
    () => calculateSolidaritaetszuschlag(incomeTax, planningMode),
    [incomeTax, planningMode],
  )

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleCardHeader titleClassName="text-left">
          🏛️ Solidaritätszuschlag-Rechner
        </CollapsibleCardHeader>
        <CollapsibleContent>
          <CardContent className="pt-4 space-y-4">
            <div className="text-sm text-muted-foreground mb-2">
              Berechnung nach 2021 Reform mit Freigrenze und Gleitzone
            </div>
            <InfoMessage />
            <PlanningModeSelector planningMode={planningMode} onPlanningModeChange={setPlanningMode} />
            <IncomeTaxSlider incomeTax={incomeTax} onChange={setIncomeTax} />
            <SoliResultsDisplay result={soliResult} incomeTax={incomeTax} />
            <BackgroundInfo />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
