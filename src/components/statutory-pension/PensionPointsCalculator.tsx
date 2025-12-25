import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Calculator, Info, Plus } from 'lucide-react'
import { ManualYearEntry } from './ManualYearEntry'
import { CalculationResults } from './PensionCalculationResults'
import { PensionPointsInformationCard } from './PensionPointsInformationCard'
import { usePensionCalculator } from './usePensionCalculator'

interface PensionPointsCalculatorProps {
  nestingLevel: number
  onCalculatedPensionChange?: (monthlyPension: number) => void
}

interface QuickModeConfigProps {
  startYear: number
  endYear: number
  startingSalary: number
  annualIncrease: number
  onStartYearChange: (year: number) => void
  onEndYearChange: (year: number) => void
  onStartingSalaryChange: (salary: number) => void
  onAnnualIncreaseChange: (increase: number) => void
}

interface ManualModeConfigProps {
  manualSalaries: { [year: number]: number }
  onAddYear: () => void
  onYearChange: (oldYear: number, newYear: number, salary: number) => void
  onUpdateSalary: (year: number, salary: number) => void
  onRemoveYear: (year: number) => void
}

function ModeSelector({ quickMode, onModeChange }: { quickMode: boolean; onModeChange: (quick: boolean) => void }) {
  return (
    <div className="space-y-2">
      <Label>Eingabemodus</Label>
      <div className="flex gap-2">
        <Button variant={quickMode ? 'default' : 'outline'} onClick={() => onModeChange(true)} className="flex-1">
          Schnell-Konfiguration
        </Button>
        <Button variant={!quickMode ? 'default' : 'outline'} onClick={() => onModeChange(false)} className="flex-1">
          Manuelle Eingabe
        </Button>
      </div>
    </div>
  )
}

function RegionSelector({ region, onRegionChange }: { region: 'west' | 'east'; onRegionChange: (region: 'west' | 'east') => void }) {
  return (
    <div className="space-y-2">
      <Label>Region</Label>
      <div className="flex gap-2">
        <Button variant={region === 'west' ? 'default' : 'outline'} onClick={() => onRegionChange('west')} className="flex-1">
          West
        </Button>
        <Button variant={region === 'east' ? 'default' : 'outline'} onClick={() => onRegionChange('east')} className="flex-1">
          Ost
        </Button>
      </div>
    </div>
  )
}

function QuickModeConfig({ startYear, endYear, startingSalary, annualIncrease, onStartYearChange, onEndYearChange, onStartingSalaryChange, onAnnualIncreaseChange }: QuickModeConfigProps) {
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start-year">Startjahr</Label>
          <Input id="start-year" type="number" value={startYear} onChange={e => onStartYearChange(Number(e.target.value))} min={1960} max={2060} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end-year">Endjahr</Label>
          <Input id="end-year" type="number" value={endYear} onChange={e => onEndYearChange(Number(e.target.value))} min={startYear} max={2070} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="starting-salary">Anfangsgehalt (€)</Label>
          <Input id="starting-salary" type="number" value={startingSalary} onChange={e => onStartingSalaryChange(Number(e.target.value))} min={0} step={1000} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="annual-increase">Jährliche Steigerung (%)</Label>
          <Input id="annual-increase" type="number" value={annualIncrease} onChange={e => onAnnualIncreaseChange(Number(e.target.value))} min={0} max={20} step={0.1} />
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p>Keine Jahre hinzugefügt</p>
      <p className="text-sm">Klicken Sie auf "Jahr hinzufügen" um zu beginnen</p>
    </div>
  )
}

function ManualModeConfig({ manualSalaries, onAddYear, onYearChange, onUpdateSalary, onRemoveYear }: ManualModeConfigProps) {
  const sortedYears = Object.keys(manualSalaries)
    .map(Number)
    .sort((a, b) => a - b)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>Gehaltshistorie</Label>
        <Button onClick={onAddYear} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-1" />
          Jahr hinzufügen
        </Button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {sortedYears.length === 0 ? (
          <EmptyState />
        ) : (
          sortedYears.map(year => (
            <ManualYearEntry key={year} year={year} salary={manualSalaries[year]} onYearChange={onYearChange} onSalaryChange={onUpdateSalary} onRemove={onRemoveYear} />
          ))
        )}
      </div>
    </div>
  )
}

/**
 * Interactive Pension Points Calculator Component
 *
 * Allows users to calculate their expected German statutory pension
 * based on their salary history using the Rentenpunkte (pension points) system.
 */
export function PensionPointsCalculator({ nestingLevel, onCalculatedPensionChange }: PensionPointsCalculatorProps) {
  const {
    quickMode,
    setQuickMode,
    startYear,
    setStartYear,
    endYear,
    setEndYear,
    startingSalary,
    setStartingSalary,
    annualIncrease,
    setAnnualIncrease,
    manualSalaries,
    region,
    setRegion,
    calculationResult,
    handleAddYear,
    handleRemoveYear,
    handleUpdateSalary,
    handleYearChange,
  } = usePensionCalculator()

  // Apply calculated pension to parent component
  const handleApplyPension = () => {
    if (calculationResult && onCalculatedPensionChange) {
      onCalculatedPensionChange(calculationResult.monthlyPension)
    }
  }

  return (
    <Card nestingLevel={nestingLevel}>
      <CardHeader nestingLevel={nestingLevel}>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Rentenpunkte-Rechner
        </CardTitle>
      </CardHeader>
      <CardContent nestingLevel={nestingLevel}>
        <div className="space-y-6">
          <ModeSelector quickMode={quickMode} onModeChange={setQuickMode} />

          <RegionSelector region={region} onRegionChange={setRegion} />

          {quickMode && <QuickModeConfig startYear={startYear} endYear={endYear} startingSalary={startingSalary} annualIncrease={annualIncrease} onStartYearChange={setStartYear} onEndYearChange={setEndYear} onStartingSalaryChange={setStartingSalary} onAnnualIncreaseChange={setAnnualIncrease} />}

          {!quickMode && <ManualModeConfig manualSalaries={manualSalaries} onAddYear={handleAddYear} onYearChange={handleYearChange} onRemoveYear={handleRemoveYear} onUpdateSalary={handleUpdateSalary} />}

          {calculationResult && <CalculationResults result={calculationResult} nestingLevel={nestingLevel} onApply={onCalculatedPensionChange ? handleApplyPension : undefined} />}

          <PensionPointsInformationCard nestingLevel={nestingLevel} />
        </div>
      </CardContent>
    </Card>
  )
}
