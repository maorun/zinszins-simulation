import React from 'react'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { RadioTileGroup, RadioTile } from './ui/radio-tile'
import type { WithdrawalFormValue } from '../utils/config-storage'
import { getRMDDescription } from '../../helpers/rmd-tables'
import { useSimulation } from '../contexts/useSimulation'

interface RMDConfigValues {
  startAge: number
  lifeExpectancyTable: 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom'
  customLifeExpectancy?: number
}

interface RMDChangeHandlers {
  onStartAgeChange: (age: number) => void
  onLifeExpectancyTableChange: (table: 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom') => void
  onCustomLifeExpectancyChange: (years: number) => void
}

interface RMDWithdrawalConfigurationProps {
  // For existing form-based usage (Einheitlich)
  formValue?: WithdrawalFormValue
  updateFormValue?: (newValue: WithdrawalFormValue) => void

  // For direct state management (Segmentiert)
  values?: RMDConfigValues
  onChange?: RMDChangeHandlers
}

export function RMDWithdrawalConfiguration({
  formValue,
  updateFormValue,
  values,
  onChange,
}: RMDWithdrawalConfigurationProps) {
  // Use global life expectancy settings
  const { lifeExpectancyTable, customLifeExpectancy, setLifeExpectancyTable, setCustomLifeExpectancy } = useSimulation()

  // Determine which mode we're in
  const isFormMode = formValue !== undefined && updateFormValue !== undefined
  const isDirectMode = values !== undefined && onChange !== undefined

  if (!isFormMode && !isDirectMode) {
    throw new Error('RMDWithdrawalConfiguration requires either (formValue + updateFormValue) or (values + onChange)')
  }

  // Get current values based on mode
  const currentValues = isFormMode ? {
    startAge: formValue!.rmdStartAge,
    lifeExpectancyTable: lifeExpectancyTable, // Use global setting
    customLifeExpectancy: customLifeExpectancy, // Use global setting
  } : values!
  const handleAgeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const age = Number(event.target.value)
    if (isFormMode) {
      updateFormValue!({
        ...formValue!,
        rmdStartAge: age,
      })
    }
    else {
      onChange!.onStartAgeChange(age)
    }
  }

  const handleTableChange = (value: string) => {
    const table = value as 'german_2020_22' | 'custom'
    if (isFormMode) {
      // Update global setting instead of form value
      setLifeExpectancyTable(table)
    }
    else {
      onChange!.onLifeExpectancyTableChange(table)
    }
  }

  const handleCustomLifeExpectancyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const years = Number(event.target.value)
    if (isFormMode) {
      // Update global setting instead of form value
      setCustomLifeExpectancy(years)
    }
    else {
      onChange!.onCustomLifeExpectancyChange(years)
    }
  }

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="space-y-2">
        <Label htmlFor={isFormMode ? 'rmdStartAge' : 'rmd-start-age'}>
          Alter zu Beginn der Entnahmephase
        </Label>
        <Input
          id={isFormMode ? 'rmdStartAge' : 'rmd-start-age'}
          type="number"
          value={currentValues.startAge}
          onChange={handleAgeChange}
          min={50}
          max={100}
          step={1}
          className="w-32"
        />
        <div className="text-sm text-muted-foreground">
          {isFormMode
            ? 'Das Alter, mit dem die RMD-Entnahme beginnt (Standard: 65 Jahre)'
            : 'Das Alter zu Beginn dieser Entnahme-Phase (wird für die Berechnung der Lebenserwartung verwendet)'}
        </div>
      </div>

      <div className="space-y-2">
        <Label>{isFormMode ? 'Datengrundlage für Lebenserwartung' : 'Sterbetabelle'}</Label>
        <RadioTileGroup
          value={currentValues.lifeExpectancyTable}
          onValueChange={handleTableChange}
        >
          <RadioTile value="german_2020_22" label={isFormMode ? 'Deutsche Sterbetafel' : 'Deutsche Sterbetabelle 2020/22'}>
            {isFormMode
              ? 'Offizielle Sterbetafel 2020-2022 vom Statistischen Bundesamt'
              : 'Offizielle deutsche Sterbetabelle (aktuarisch)'}
          </RadioTile>
          <RadioTile value="custom" label="Benutzerdefiniert">
            {isFormMode
              ? 'Eigene Lebenserwartung festlegen'
              : 'Eigene Lebenserwartung festlegen'}
          </RadioTile>
        </RadioTileGroup>
      </div>

      {currentValues.lifeExpectancyTable === 'custom' && (
        <div className="space-y-2">
          <Label htmlFor={isFormMode ? 'rmdCustomLifeExpectancy' : 'rmd-custom-life-expectancy'}>
            {isFormMode ? 'Verbleibende Lebenserwartung (Jahre)' : 'Benutzerdefinierte Lebenserwartung (Jahre)'}
          </Label>
          <Input
            id={isFormMode ? 'rmdCustomLifeExpectancy' : 'rmd-custom-life-expectancy'}
            type="number"
            value={currentValues.customLifeExpectancy || 20}
            onChange={handleCustomLifeExpectancyChange}
            min={isFormMode ? 1 : 5}
            max={50}
            step={isFormMode ? 0.1 : 1}
            className="w-32"
          />
          <div className="text-sm text-muted-foreground">
            {isFormMode
              ? 'Anzahl der Jahre, die das Portfolio vorhalten soll'
              : `Erwartete Lebensdauer ab dem Startalter (z.B. 20 Jahre bedeutet Leben bis Alter ${currentValues.startAge + (currentValues.customLifeExpectancy || 20)})`}
          </div>
        </div>
      )}

      <div className="p-3 bg-blue-50 rounded-md">
        <div className="text-sm font-medium text-blue-900 mb-1">
          Entnahme-Berechnung
        </div>
        <div className="text-sm text-blue-800">
          {getRMDDescription(currentValues.startAge)}
        </div>
        <div className="text-xs text-blue-700 mt-2">
          Die jährliche Entnahme wird berechnet als:
          {' '}
          <strong>Portfoliowert ÷ Divisor (Lebenserwartung)</strong>
          <br />
          Der Divisor sinkt mit jedem Jahr, wodurch die Entnahme steigt und das Portfolio bis zum Lebensende aufgebraucht wird.
        </div>
      </div>
    </div>
  )
}
