import { Table, TableBody, TableHead, TableHeader, TableRow } from '../ui/table'
import type { BasiszinsConfiguration } from '../../services/bundesbank-api'
import { RateTableRow } from './RateTableRow'

interface RatesTableProps {
  basiszinsConfiguration: BasiszinsConfiguration
  currentYear: number
  onUpdateRate: (year: number, newRateValue: string) => void
  onRemoveYear: (year: number) => void
}

/**
 * Renders the table of basiszins rates with edit and delete functionality
 */
export function RatesTable({ basiszinsConfiguration, currentYear, onUpdateRate, onRemoveYear }: RatesTableProps) {
  // Sort years for display
  const sortedYears = Object.keys(basiszinsConfiguration)
    .map(Number)
    .sort((a, b) => b - a) // Newest first

  return (
    <div className="border rounded-md max-h-[400px] overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Jahr</TableHead>
            <TableHead className="text-center">Basiszins (%)</TableHead>
            <TableHead className="text-center">Quelle</TableHead>
            <TableHead className="text-center">Zuletzt aktualisiert</TableHead>
            <TableHead className="text-center">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedYears.map(year => (
            <RateTableRow
              key={year}
              year={year}
              data={basiszinsConfiguration[year]}
              currentYear={currentYear}
              onUpdateRate={onUpdateRate}
              onRemoveYear={onRemoveYear}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
