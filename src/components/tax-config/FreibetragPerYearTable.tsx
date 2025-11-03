import { FreibetragYearInput } from '../freibetrag-table/FreibetragYearInput'
import { FreibetragTableContent } from '../freibetrag-table/FreibetragTableContent'
import { Label } from '../ui/label'

interface FreibetragPerYearTableProps {
  freibetragPerYear: Record<number, number>
  yearToday: number
  onUpdate: (newValues: Record<number, number>) => void
}

export function FreibetragPerYearTable({
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
      <FreibetragYearInput yearToday={yearToday} onAddYear={addYear} />
      <FreibetragTableContent
        freibetragPerYear={freibetragPerYear}
        onUpdateYear={updateYear}
        onDeleteYear={deleteYear}
      />
    </div>
  )
}
