import { Trash2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { TableCell, TableRow } from '../ui/table'
import type { BasiszinsData } from '../../services/bundesbank-api'
import { SourceBadge } from './SourceBadge'

interface RateTableRowProps {
  year: number
  data: BasiszinsData
  currentYear: number
  onUpdateRate: (year: number, newRateValue: string) => void
  onRemoveYear: (year: number) => void
}

/**
 * Renders a single row in the rates table
 */
export function RateTableRow({ year, data, currentYear, onUpdateRate, onRemoveYear }: RateTableRowProps) {
  return (
    <TableRow key={year}>
      <TableCell className="text-center font-medium">{year}</TableCell>
      <TableCell className="text-center">
        <Input
          type="number"
          value={(data.rate * 100).toFixed(2)}
          min={-2}
          max={10}
          step={0.01}
          onChange={(e) => onUpdateRate(year, e.target.value)}
          className="w-20 mx-auto text-center"
        />
      </TableCell>
      <TableCell className="text-center">
        <SourceBadge source={data.source} />
      </TableCell>
      <TableCell className="text-center text-sm text-muted-foreground">
        {data.lastUpdated ? new Date(data.lastUpdated).toLocaleDateString('de-DE') : 'N/A'}
      </TableCell>
      <TableCell className="text-center">
        <Button variant="ghost" size="sm" onClick={() => onRemoveYear(year)} disabled={year <= currentYear - 1}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  )
}
