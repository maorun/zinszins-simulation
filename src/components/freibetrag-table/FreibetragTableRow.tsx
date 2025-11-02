import { TableCell, TableRow } from '../ui/table'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Trash2 } from 'lucide-react'

interface FreibetragTableRowProps {
  year: string
  amount: number
  onUpdateYear: (year: number, amount: number) => void
  onDeleteYear: (year: number) => void
}

export function FreibetragTableRow({
  year,
  amount,
  onUpdateYear,
  onDeleteYear,
}: FreibetragTableRowProps) {
  return (
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
              onUpdateYear(Number(year), value)
            }
          }}
          className="w-24 mx-auto"
        />
      </TableCell>
      <TableCell className="text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDeleteYear(Number(year))}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  )
}
