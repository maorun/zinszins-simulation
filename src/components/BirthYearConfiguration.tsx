import type React from 'react'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { calculateCurrentAge, getDefaultLifeExpectancy } from '../../helpers/life-expectancy'

interface BirthYearConfigurationProps {
  config: {
    planningMode: 'individual' | 'couple'
    gender: 'male' | 'female' | undefined
    birthYear: number | undefined
    expectedLifespan: number | undefined
    spouse: { gender: 'male' | 'female', birthYear?: number } | undefined
  }
  onChange: {
    birthYear: (year: number | undefined) => void
    expectedLifespan: (lifespan: number | undefined) => void
    spouse: (spouse?: { gender: 'male' | 'female', birthYear?: number }) => void
  }
}

interface BirthYearInputProps {
  birthYear: number | undefined
  gender: 'male' | 'female' | undefined
  expectedLifespan: number | undefined
  onChange: {
    birthYear: (year: number | undefined) => void
    expectedLifespan: (years: number | undefined) => void
  }
  idPrefix: string
}

function BirthYearInput({
  birthYear,
  gender,
  expectedLifespan,
  onChange,
  idPrefix,
}: BirthYearInputProps) {
  const handleBirthYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = e.target.value ? Number(e.target.value) : undefined
    onChange.birthYear(year)

    // Auto-suggest life expectancy based on current age and gender
    if (year && !expectedLifespan) {
      const currentAge = calculateCurrentAge(year)
      const suggestedLifespan = getDefaultLifeExpectancy(currentAge, gender)
      onChange.expectedLifespan(suggestedLifespan)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={idPrefix} className="text-sm font-medium">Geburtsjahr</Label>
      <Input
        id={idPrefix}
        type="number"
        value={birthYear || ''}
        onChange={handleBirthYearChange}
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
  )
}

function IndividualBirthYearConfig({
  config,
  onChange,
}: BirthYearConfigurationProps) {
  return (
    <div className="space-y-2">
      <Label>Geburtsjahr Konfiguration</Label>
      <div className="p-3 border rounded-lg bg-white">
        <BirthYearInput
          birthYear={config.birthYear}
          gender={config.gender}
          expectedLifespan={config.expectedLifespan}
          onChange={onChange}
          idPrefix="birth-year-main"
        />
      </div>
    </div>
  )
}

function PersonBirthYearInput({
  id,
  personLabel,
  gender,
  birthYear,
  onChange,
  placeholder,
}: {
  id: string
  personLabel: string
  gender: 'male' | 'female' | undefined
  birthYear: number | undefined
  onChange: (year: number | undefined) => void
  placeholder: string
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {personLabel}
        {' '}
        (
        {gender === 'male' ? '♂ Männlich' : '♀ Weiblich'}
        )
      </Label>
      <Input
        id={id}
        type="number"
        value={birthYear || ''}
        onChange={(e) => {
          const year = e.target.value ? Number(e.target.value) : undefined
          onChange(year)
        }}
        placeholder={placeholder}
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
  )
}

function CoupleBirthYearConfig({
  config,
  onChange,
}: BirthYearConfigurationProps) {
  const { birthYear, gender, spouse } = config

  return (
    <div className="space-y-2">
      <Label>Geburtsjahr Konfiguration</Label>
      <div className="p-3 border rounded-lg bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PersonBirthYearInput
            id="birth-year-person1-main"
            personLabel="Person 1 Geburtsjahr"
            gender={gender}
            birthYear={birthYear}
            onChange={onChange.birthYear}
            placeholder="1974"
          />
          <PersonBirthYearInput
            id="birth-year-person2-main"
            personLabel="Person 2 Geburtsjahr"
            gender={spouse?.gender}
            birthYear={spouse?.birthYear}
            onChange={(year) => {
              onChange.spouse({
                ...spouse,
                gender: spouse?.gender || 'female',
                birthYear: year,
              })
            }}
            placeholder="1976"
          />
        </div>
      </div>
    </div>
  )
}

export function BirthYearConfiguration({
  config,
  onChange,
}: BirthYearConfigurationProps) {
  if (config.planningMode === 'individual') {
    return <IndividualBirthYearConfig config={config} onChange={onChange} />
  }

  return <CoupleBirthYearConfig config={config} onChange={onChange} />
}
