/**
 * Component to display loss offset (Verlustverrechnung) details in simulation results
 */

import { formatCurrency } from '../utils/currency'
import type { LossOffsetResult } from '../../helpers/loss-offset-accounts'
import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

interface LossOffsetDisplayProps {
  lossOffsetDetails: LossOffsetResult
  year: number
}

interface TooltipInfoProps {
  lossOffsetDetails: LossOffsetResult
  year: number
}

function LossOffsetTooltip({ lossOffsetDetails, year }: TooltipInfoProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="text-muted-foreground hover:text-foreground">
            <Info className="h-3 w-3" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <div className="space-y-2">
            <div className="font-medium">Verlustverrechnung {year}</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between gap-4">
                <span>Aktienverluste genutzt:</span>
                <span className="font-medium">{formatCurrency(lossOffsetDetails.stockLossesUsed)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Sonstige Verluste genutzt:</span>
                <span className="font-medium">{formatCurrency(lossOffsetDetails.otherLossesUsed)}</span>
              </div>
              <div className="flex justify-between gap-4 pt-2 border-t">
                <span className="font-medium">Steuerersparnis:</span>
                <span className="font-medium text-green-700">{formatCurrency(lossOffsetDetails.taxSavings)}</span>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * Compact display of loss offset information within simulation year row
 */
export function LossOffsetDisplay({ lossOffsetDetails, year }: LossOffsetDisplayProps) {
  const { totalLossesUsed, remainingLosses } = lossOffsetDetails

  // Don't display if no losses were used
  if (totalLossesUsed === 0 && remainingLosses.stockLosses === 0 && remainingLosses.otherLosses === 0) {
    return null
  }

  const totalCarryForward = remainingLosses.stockLosses + remainingLosses.otherLosses

  return (
    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
      <span className="inline-flex items-center gap-1">
        📉 Verlustverrechnung:
        {totalLossesUsed > 0 && (
          <>
            <span className="font-medium text-green-700">{formatCurrency(totalLossesUsed)}</span>
            <span>verrechnet</span>
            <LossOffsetTooltip lossOffsetDetails={lossOffsetDetails} year={year} />
          </>
        )}
      </span>
      {totalCarryForward > 0 && <span className="text-xs">(Vortrag: {formatCurrency(totalCarryForward)})</span>}
    </div>
  )
}

function LossUsageSection({ lossOffsetDetails }: { lossOffsetDetails: LossOffsetResult }) {
  const { stockLossesUsed, otherLossesUsed, totalLossesUsed, taxSavings } = lossOffsetDetails

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div className="space-y-2 text-sm">
        <div className="font-medium text-blue-900 mb-2">Verlustverwendung</div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-blue-800">Aktienverluste verrechnet:</span>
            <span className="font-medium text-blue-900">{formatCurrency(stockLossesUsed)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-800">Sonstige Verluste verrechnet:</span>
            <span className="font-medium text-blue-900">{formatCurrency(otherLossesUsed)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-blue-300">
            <span className="font-medium text-blue-900">Gesamt verrechnet:</span>
            <span className="font-medium text-blue-900">{formatCurrency(totalLossesUsed)}</span>
          </div>
        </div>
        {totalLossesUsed > 0 && (
          <div className="pt-2 border-t border-blue-300">
            <div className="flex justify-between">
              <span className="font-medium text-green-900">💰 Steuerersparnis:</span>
              <span className="font-bold text-green-900 text-base">{formatCurrency(taxSavings)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function LossCarryForwardSection({ remainingLosses }: { remainingLosses: LossOffsetResult['remainingLosses'] }) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
      <div className="space-y-2 text-sm">
        <div className="font-medium text-yellow-900 mb-2">Verlustvortrag ins nächste Jahr</div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-yellow-800">Aktienverlusttopf:</span>
            <span className="font-medium text-yellow-900">{formatCurrency(remainingLosses.stockLosses)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-yellow-800">Sonstiger Verlusttopf:</span>
            <span className="font-medium text-yellow-900">{formatCurrency(remainingLosses.otherLosses)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-yellow-300">
            <span className="font-medium text-yellow-900">Gesamt Vortrag:</span>
            <span className="font-medium text-yellow-900">
              {formatCurrency(remainingLosses.stockLosses + remainingLosses.otherLosses)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Detailed modal/card display of loss offset information
 */
export function LossOffsetDetailedView({ lossOffsetDetails, year }: LossOffsetDisplayProps) {
  const { remainingLosses } = lossOffsetDetails
  const hasCarryForward = remainingLosses.stockLosses > 0 || remainingLosses.otherLosses > 0

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium text-sm mb-2">📉 Verlustverrechnung {year}</h4>
        <p className="text-xs text-muted-foreground mb-3">
          Verluste aus Vorjahren werden mit Gewinnen verrechnet, um die Steuerlast zu reduzieren.
        </p>
      </div>

      <LossUsageSection lossOffsetDetails={lossOffsetDetails} />

      {hasCarryForward && <LossCarryForwardSection remainingLosses={remainingLosses} />}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="text-xs text-gray-700 space-y-1">
          <p className="font-medium mb-1">ℹ️ Verlustverrechnungsregeln:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Aktienverluste können nur mit Aktiengewinnen verrechnet werden</li>
            <li>Sonstige Verluste können mit allen Kapitalerträgen verrechnet werden</li>
            <li>Nicht genutzte Verluste werden unbegrenzt vorgetragen</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
