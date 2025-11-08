import type { WithdrawalResult } from '../../helpers/withdrawal'
import type { WithdrawalFormValue, ComparisonStrategy, SegmentedComparisonStrategy } from '../utils/config-storage'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { ChevronDown } from 'lucide-react'
import { EntnahmeSimulationDisplay } from './EntnahmeSimulationDisplay'
import { useState, useEffect } from 'react'

type ComparisonResult = {
  strategy: ComparisonStrategy
  finalCapital: number
  totalWithdrawal: number
  averageAnnualWithdrawal: number
  duration: number | string
}

type SegmentedComparisonResult = {
  strategy: SegmentedComparisonStrategy
  finalCapital: number
  totalWithdrawal: number
  averageAnnualWithdrawal: number
  duration: number | string
  result: WithdrawalResult
}

type WithdrawalRowData = Record<string, unknown> & {
  year: number
  startkapital: number
  endkapital: number
  entnahme: number
  zinsen: number
  bezahlteSteuer: number
  genutzterFreibetrag: number
}

interface EntnahmeSimulationSectionProps {
  withdrawalData: {
    startingCapital: number
    withdrawalArray: WithdrawalRowData[]
    withdrawalResult: WithdrawalResult
    duration: number | null
  } | null
  formValue: WithdrawalFormValue
  useComparisonMode: boolean
  comparisonResults: ComparisonResult[]
  useSegmentedComparisonMode: boolean
  segmentedComparisonResults: SegmentedComparisonResult[]
  onCalculationInfoClick: (explanationType: string, rowData: unknown) => void
}

export function EntnahmeSimulationSection(props: EntnahmeSimulationSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [renderContent, setRenderContent] = useState(false)

  // Delay content rendering to avoid Recharts mounting during collapsible animation
  useEffect(() => {
    if (isOpen) {
      // Wait for collapsible animation to complete before rendering charts
      const timer = setTimeout(() => {
        setRenderContent(true)
      }, 500) // Increased delay to ensure animation is complete
      return () => clearTimeout(timer)
    } else {
      setRenderContent(false)
    }
  }, [isOpen])

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md transition-colors group p-3 -m-3 sm:p-2 sm:-m-2 min-h-[44px] sm:min-h-[36px] active:bg-gray-100 mobile-interactive">
              <CardTitle className="text-left">Simulation</CardTitle>
              <ChevronDown className="h-5 w-5 sm:h-4 sm:w-4 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            {renderContent ? (
              <div className="form-grid space-y-4">
                <EntnahmeSimulationDisplay {...props} />
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                <div className="text-center">
                  <div className="mb-2">Lade Simulation...</div>
                  <div className="text-sm">Bereite Daten vor</div>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
