import { Table, TableBody, TableHead, TableHeader, TableRow } from '../ui/table'
import { FreibetragTableRow } from './FreibetragTableRow'

interface FreibetragTableContentProps {
  freibetragPerYear: Record<number, number>
  onUpdateYear: (year: number, amount: number) => void
  onDeleteYear: (year: number) => void
}

export function FreibetragTableContent({
  freibetragPerYear,
  onUpdateYear,
  onDeleteYear,
}: FreibetragTableContentProps) {
  return (
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
            <FreibetragTableRow
              key={year}
              year={year}
              amount={amount}
              onUpdateYear={onUpdateYear}
              onDeleteYear={onDeleteYear}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
