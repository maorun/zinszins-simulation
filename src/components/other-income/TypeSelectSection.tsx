import type { ChangeEvent } from 'react'
import { Label } from '../ui/label'
import type { OtherIncomeSource } from '../../../helpers/other-income'

interface TypeSelectSectionProps {
  editingSource: OtherIncomeSource
  onTypeChange: (e: ChangeEvent<HTMLSelectElement>) => void
}

export function TypeSelectSection({ editingSource, onTypeChange }: TypeSelectSectionProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="source-type">Art der Einkünfte</Label>
      <select
        id="source-type"
        value={editingSource.type}
        onChange={onTypeChange}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="rental">Mieteinnahmen</option>
        <option value="pension">Rente/Pension</option>
        <option value="business">Gewerbeeinkünfte</option>
        <option value="investment">Kapitalerträge</option>
        <option value="kindergeld">Kindergeld</option>
        <option value="elterngeld">Elterngeld</option>
        <option value="bu_rente">BU-Rente</option>
        <option value="kapitallebensversicherung">Kapitallebensversicherung</option>
        <option value="pflegezusatzversicherung">Pflegezusatzversicherung</option>
        <option value="risikolebensversicherung">Risikolebensversicherung</option>
        <option value="kinder_bildung">Kinder-Bildung</option>
        <option value="depot_auf_kind">Depot-auf-Kind-Strategie</option>
        <option value="ruerup_rente">Rürup-Rente</option>
        <option value="riester_rente">Riester-Rente</option>
        <option value="other">Sonstige Einkünfte</option>
      </select>
    </div>
  )
}
