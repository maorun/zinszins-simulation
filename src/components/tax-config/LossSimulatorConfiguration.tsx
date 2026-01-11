import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Alert, AlertDescription } from '../ui/alert'
import { Calculator, BarChart3, AlertTriangle } from 'lucide-react'
import { generateFormId } from '../../utils/unique-id'

interface LossSimulatorConfigurationProps {
  stockLosses: number
  otherLosses: number
  planningYears: number
  maxStockGains: number
  maxOtherGains: number
  currentYear: number
  validationErrors: string[]
  onStockLossesChange: (value: number) => void
  onOtherLossesChange: (value: number) => void
  onPlanningYearsChange: (value: number) => void
  onMaxStockGainsChange: (value: number) => void
  onMaxOtherGainsChange: (value: number) => void
  onRunSimulation: () => void
}

export function LossSimulatorConfiguration({
  stockLosses,
  otherLosses,
  planningYears,
  maxStockGains,
  maxOtherGains,
  currentYear,
  validationErrors,
  onStockLossesChange,
  onOtherLossesChange,
  onPlanningYearsChange,
  onMaxStockGainsChange,
  onMaxOtherGainsChange,
  onRunSimulation,
}: LossSimulatorConfigurationProps) {
  const ids = useFormIds()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Simulator-Konfiguration
        </CardTitle>
        <CardDescription>
          Konfigurieren Sie Ihre Verlustvorträge und geplanten Gewinne für die Mehrjahres-Simulation
        </CardDescription>
      </CardHeader>
      <ConfigurationForm
        ids={ids}
        stockLosses={stockLosses}
        otherLosses={otherLosses}
        planningYears={planningYears}
        maxStockGains={maxStockGains}
        maxOtherGains={maxOtherGains}
        currentYear={currentYear}
        validationErrors={validationErrors}
        onStockLossesChange={onStockLossesChange}
        onOtherLossesChange={onOtherLossesChange}
        onPlanningYearsChange={onPlanningYearsChange}
        onMaxStockGainsChange={onMaxStockGainsChange}
        onMaxOtherGainsChange={onMaxOtherGainsChange}
        onRunSimulation={onRunSimulation}
      />
    </Card>
  )
}

function useFormIds() {
  return useMemo(
    () => ({
      stockLossesId: generateFormId('loss-simulator', 'stock-losses'),
      otherLossesId: generateFormId('loss-simulator', 'other-losses'),
      planningYearsId: generateFormId('loss-simulator', 'planning-years'),
      maxStockGainsId: generateFormId('loss-simulator', 'max-stock-gains'),
      maxOtherGainsId: generateFormId('loss-simulator', 'max-other-gains'),
    }),
    [],
  )
}

interface ConfigurationFormProps {
  ids: ReturnType<typeof useFormIds>
  stockLosses: number
  otherLosses: number
  planningYears: number
  maxStockGains: number
  maxOtherGains: number
  currentYear: number
  validationErrors: string[]
  onStockLossesChange: (value: number) => void
  onOtherLossesChange: (value: number) => void
  onPlanningYearsChange: (value: number) => void
  onMaxStockGainsChange: (value: number) => void
  onMaxOtherGainsChange: (value: number) => void
  onRunSimulation: () => void
}

function ConfigurationForm(props: ConfigurationFormProps) {
  return (
    <CardContent className="space-y-6">
      <FormInputs
        ids={props.ids}
        stockLosses={props.stockLosses}
        otherLosses={props.otherLosses}
        planningYears={props.planningYears}
        maxStockGains={props.maxStockGains}
        maxOtherGains={props.maxOtherGains}
        currentYear={props.currentYear}
        onStockLossesChange={props.onStockLossesChange}
        onOtherLossesChange={props.onOtherLossesChange}
        onPlanningYearsChange={props.onPlanningYearsChange}
        onMaxStockGainsChange={props.onMaxStockGainsChange}
        onMaxOtherGainsChange={props.onMaxOtherGainsChange}
      />
      <ValidationErrors errors={props.validationErrors} />
      <Button onClick={props.onRunSimulation} className="w-full" size="lg">
        <BarChart3 className="h-4 w-4 mr-2" />
        Simulation starten
      </Button>
    </CardContent>
  )
}

interface FormInputsProps {
  ids: ReturnType<typeof useFormIds>
  stockLosses: number
  otherLosses: number
  planningYears: number
  maxStockGains: number
  maxOtherGains: number
  currentYear: number
  onStockLossesChange: (value: number) => void
  onOtherLossesChange: (value: number) => void
  onPlanningYearsChange: (value: number) => void
  onMaxStockGainsChange: (value: number) => void
  onMaxOtherGainsChange: (value: number) => void
}

function FormInputs(props: FormInputsProps) {
  return (
    <>
      <LossInputs
        stockLossesId={props.ids.stockLossesId}
        otherLossesId={props.ids.otherLossesId}
        stockLosses={props.stockLosses}
        otherLosses={props.otherLosses}
        onStockLossesChange={props.onStockLossesChange}
        onOtherLossesChange={props.onOtherLossesChange}
      />
      <PlanningPeriodInput
        planningYearsId={props.ids.planningYearsId}
        planningYears={props.planningYears}
        currentYear={props.currentYear}
        onPlanningYearsChange={props.onPlanningYearsChange}
      />
      <GainsInputs
        maxStockGainsId={props.ids.maxStockGainsId}
        maxOtherGainsId={props.ids.maxOtherGainsId}
        maxStockGains={props.maxStockGains}
        maxOtherGains={props.maxOtherGains}
        onMaxStockGainsChange={props.onMaxStockGainsChange}
        onMaxOtherGainsChange={props.onMaxOtherGainsChange}
      />
    </>
  )
}

function ValidationErrors({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <ul className="list-disc list-inside">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
}

function LossInputs({
  stockLossesId,
  otherLossesId,
  stockLosses,
  otherLosses,
  onStockLossesChange,
  onOtherLossesChange,
}: {
  stockLossesId: string
  otherLossesId: string
  stockLosses: number
  otherLosses: number
  onStockLossesChange: (value: number) => void
  onOtherLossesChange: (value: number) => void
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor={stockLossesId}>Verfügbare Aktienverluste (€)</Label>
        <Input
          id={stockLossesId}
          type="number"
          min="0"
          step="1000"
          value={stockLosses}
          onChange={e => onStockLossesChange(Number(e.target.value))}
        />
        <p className="text-xs text-muted-foreground">Aktueller Verlustvortrag aus Aktienverkäufen</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={otherLossesId}>Sonstige Verluste (€)</Label>
        <Input
          id={otherLossesId}
          type="number"
          min="0"
          step="1000"
          value={otherLosses}
          onChange={e => onOtherLossesChange(Number(e.target.value))}
        />
        <p className="text-xs text-muted-foreground">Verluste aus anderen Kapitalanlagen</p>
      </div>
    </div>
  )
}

function PlanningPeriodInput({
  planningYearsId,
  planningYears,
  currentYear,
  onPlanningYearsChange,
}: {
  planningYearsId: string
  planningYears: number
  currentYear: number
  onPlanningYearsChange: (value: number) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={planningYearsId}>Planungszeitraum (Jahre)</Label>
      <Input
        id={planningYearsId}
        type="number"
        min="1"
        max="20"
        value={planningYears}
        onChange={e => onPlanningYearsChange(Number(e.target.value))}
      />
      <p className="text-xs text-muted-foreground">
        Simulation von {currentYear} bis {currentYear + planningYears - 1} ({planningYears} Jahre)
      </p>
    </div>
  )
}

function GainsInputs({
  maxStockGainsId,
  maxOtherGainsId,
  maxStockGains,
  maxOtherGains,
  onMaxStockGainsChange,
  onMaxOtherGainsChange,
}: {
  maxStockGainsId: string
  maxOtherGainsId: string
  maxStockGains: number
  maxOtherGains: number
  onMaxStockGainsChange: (value: number) => void
  onMaxOtherGainsChange: (value: number) => void
}) {
  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">Maximal realisierbare Gewinne pro Jahr</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={maxStockGainsId}>Aktiengewinne (€/Jahr)</Label>
          <Input
            id={maxStockGainsId}
            type="number"
            min="0"
            step="1000"
            value={maxStockGains}
            onChange={e => onMaxStockGainsChange(Number(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={maxOtherGainsId}>Sonstige Gewinne (€/Jahr)</Label>
          <Input
            id={maxOtherGainsId}
            type="number"
            min="0"
            step="1000"
            value={maxOtherGains}
            onChange={e => onMaxOtherGainsChange(Number(e.target.value))}
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Maximale Gewinne, die Sie jährlich realisieren könnten (z.B. durch Verkäufe)
      </p>
    </div>
  )
}
