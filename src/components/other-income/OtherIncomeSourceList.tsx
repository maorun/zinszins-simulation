import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Switch } from '../ui/switch'
import { Trash2 } from 'lucide-react'
import {
  type OtherIncomeSource,
  getIncomeTypeDisplayName,
  getAmountTypeDisplayName,
} from '../../../helpers/other-income'

interface OtherIncomeSourceListProps {
  sources: OtherIncomeSource[]
  onSourceChange: (sourceId: string, updates: Partial<OtherIncomeSource>) => void
  onEditSource: (source: OtherIncomeSource) => void
  onDeleteSource: (sourceId: string) => void
  editingSource: OtherIncomeSource | null
}

export function OtherIncomeSourceList({
  sources,
  onSourceChange,
  onEditSource,
  onDeleteSource,
  editingSource,
}: OtherIncomeSourceListProps) {
  if (sources.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold">Konfigurierte Einkommensquellen</h3>
      {/* eslint-disable-next-line complexity -- UI rendering with multiple conditional displays per source */}
      {sources.map(source => (
        <Card key={source.id} className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                {/* Title and badges - stacked on mobile, inline on desktop */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h4 className="font-medium text-base">{source.name}</h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded whitespace-nowrap">
                      {getIncomeTypeDisplayName(source.type)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                      source.amountType === 'gross'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                    >
                      {getAmountTypeDisplayName(source.amountType)}
                    </span>
                    <div className="flex items-center">
                      <Switch
                        checked={source.enabled}
                        onCheckedChange={enabled => onSourceChange(source.id, { enabled })}
                      />
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>
                    💰
                    {' '}
                    {source.monthlyAmount.toLocaleString('de-DE')}
                    {' '}
                    €/Monat
                    (
                    {(source.monthlyAmount * 12).toLocaleString('de-DE')}
                    {' '}
                    €/Jahr)
                  </div>
                  <div>
                    📅
                    {' '}
                    {source.startYear}
                    {' '}
                    -
                    {' '}
                    {source.endYear || 'Unbegrenzt'}
                  </div>
                  <div>
                    📈
                    {' '}
                    {source.inflationRate}
                    % Inflation
                    {source.amountType === 'gross' && `, ${source.taxRate}% Steuersatz`}
                  </div>
                  {/* Real Estate Details */}
                  {source.type === 'rental' && source.realEstateConfig && (
                    <div className="text-green-700 bg-green-50 p-2 rounded text-xs space-y-1">
                      <div className="font-medium">🏠 Immobilien-Details:</div>
                      <div>
                        • Immobilienwert:
                        {' '}
                        {source.realEstateConfig.propertyValue.toLocaleString('de-DE')}
                        {' '}
                        €
                      </div>
                      <div>
                        • Instandhaltung:
                        {' '}
                        {source.realEstateConfig.maintenanceCostPercent}
                        %,
                        Leerstand:
                        {' '}
                        {source.realEstateConfig.vacancyRatePercent}
                        %
                      </div>
                      {source.realEstateConfig.monthlyMortgagePayment > 0 && (
                        <div>
                          • Finanzierung:
                          {' '}
                          {source.realEstateConfig.monthlyMortgagePayment.toLocaleString('de-DE')}
                          {' '}
                          €/Monat
                        </div>
                      )}
                      <div>
                        • Wertsteigerung:
                        {' '}
                        {source.realEstateConfig.propertyAppreciationRate}
                        %
                        {source.realEstateConfig.includeAppreciation ? ' (berücksichtigt)' : ' (nicht berücksichtigt)'}
                      </div>
                    </div>
                  )}
                  {source.notes && (
                    <div className="text-gray-500">
                      📝
                      {source.notes}
                    </div>
                  )}
                </div>
              </div>
              {/* Action buttons - better positioned for mobile */}
              <div className="flex flex-row sm:flex-col gap-2 sm:ml-4 sm:min-w-0">
                <Button
                  onClick={() => onEditSource(source)}
                  variant="outline"
                  size="sm"
                  disabled={editingSource !== null}
                  className="flex-1 sm:flex-initial min-w-0"
                >
                  <span className="truncate">Bearbeiten</span>
                </Button>
                <Button
                  onClick={() => onDeleteSource(source.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
