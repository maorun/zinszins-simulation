import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { ChevronDown, Download, FileText, Copy, Info } from 'lucide-react'
import { useParameterExport } from '../hooks/useParameterExport'
import { useDataExport } from '../hooks/useDataExport'
import { useSimulation } from '../contexts/useSimulation'
import { useNestingLevel } from '../lib/nesting-utils'
import { useNavigationItem } from '../hooks/useNavigationItem'

type ButtonVariant = 'default' | 'secondary' | 'destructive' | 'outline'

interface ParameterExportSectionProps {
  isExporting: boolean
  lastExportResult: 'success' | 'error' | null
  onExport: () => Promise<boolean>
}

function ParameterExportSection({ isExporting, lastExportResult, onExport }: ParameterExportSectionProps) {
  const getButtonText = () => {
    if (isExporting) return 'Exportiere...'
    if (lastExportResult === 'success') return '✓ Kopiert!'
    if (lastExportResult === 'error') return '✗ Fehler'
    return '📋 Parameter kopieren'
  }

  const getButtonVariant = (): ButtonVariant => {
    if (lastExportResult === 'success') return 'secondary'
    if (lastExportResult === 'error') return 'destructive'
    return 'outline'
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <Copy className="h-4 w-4" />
        Parameter Export
      </h3>
      <p className="text-sm text-gray-600">
        Exportiert alle Konfigurationsparameter in die Zwischenablage für Entwicklung und Fehlerbeschreibung.
      </p>
      <Button
        variant={getButtonVariant()}
        size="sm"
        onClick={onExport}
        disabled={isExporting}
        className="w-full sm:w-auto"
      >
        {getButtonText()}
      </Button>
      <div className="block sm:hidden text-xs text-gray-500">
        💡 Kopiert alle Parameter in die Zwischenablage
      </div>
    </div>
  )
}

interface CSVExportSectionProps {
  hasSavingsData: boolean
  hasWithdrawalCapability: boolean
  isExporting: boolean
  exportResult: string | null
  exportType: string | null
  onExportSavings: () => void
  onExportWithdrawal: () => void
  onExportAll: () => void
}

interface CSVExportButtonProps {
  label: string
  onClick: () => void
  isExporting: boolean
  variant: ButtonVariant
  isBold?: boolean
}

function CSVExportButton({ label, onClick, isExporting, variant, isBold = false }: CSVExportButtonProps) {
  return (
    <Button
      variant={variant}
      size="sm"
      onClick={onClick}
      disabled={isExporting}
      className={`w-full text-xs ${isBold ? 'font-medium' : ''}`}
    >
      <Download className="h-3 w-3 mr-1" />
      {label}
    </Button>
  )
}

function CSVExportSection({
  hasSavingsData,
  hasWithdrawalCapability,
  isExporting,
  exportResult,
  exportType,
  onExportSavings,
  onExportWithdrawal,
  onExportAll,
}: CSVExportSectionProps) {
  const buttonVariant = getExportButtonState(isExporting, exportResult, exportType, 'csv').variant

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">CSV Format</h4>

      {hasSavingsData && (
        <CSVExportButton
          label="Sparphase"
          onClick={onExportSavings}
          isExporting={isExporting}
          variant={buttonVariant}
        />
      )}

      {hasWithdrawalCapability && (
        <CSVExportButton
          label="Entnahmephase"
          onClick={onExportWithdrawal}
          isExporting={isExporting}
          variant={buttonVariant}
        />
      )}

      {hasSavingsData && hasWithdrawalCapability && (
        <CSVExportButton
          label="Komplett"
          onClick={onExportAll}
          isExporting={isExporting}
          variant={buttonVariant}
          isBold
        />
      )}
    </div>
  )
}

interface MarkdownExportSectionProps {
  isExporting: boolean
  exportResult: string | null
  exportType: string | null
  onExport: () => void
}

function MarkdownExportSection({ isExporting, exportResult, exportType, onExport }: MarkdownExportSectionProps) {
  const state = getExportButtonState(isExporting, exportResult, exportType, 'markdown')

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Markdown</h4>
      <Button
        variant={state.variant}
        size="sm"
        onClick={onExport}
        disabled={isExporting}
        className="w-full text-xs"
      >
        <FileText className="h-3 w-3 mr-1" />
        {state.text}
      </Button>
    </div>
  )
}

interface CalculationsExportSectionProps {
  isExporting: boolean
  exportResult: string | null
  exportType: string | null
  onExport: () => void
}

function CalculationsExportSection({
  isExporting,
  exportResult,
  exportType,
  onExport,
}: CalculationsExportSectionProps) {
  const state = getExportButtonState(isExporting, exportResult, exportType, 'clipboard')

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Berechnungen</h4>
      <Button
        variant={state.variant}
        size="sm"
        onClick={onExport}
        disabled={isExporting}
        className="w-full text-xs"
      >
        <Copy className="h-3 w-3 mr-1" />
        {state.text}
      </Button>
    </div>
  )
}

function FormatInformationSection() {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <Info className="h-4 w-4" />
        Format-Informationen
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">CSV Export</h4>
          <ul className="text-gray-600 space-y-1">
            <li>• Tabellenformat für Excel/Calc</li>
            <li>• Jahr/Monat Aufschlüsselung</li>
            <li>• Alle Einzahlungen nach Sparplänen</li>
            <li>• Vorabpauschale & Steuerdetails</li>
            <li>• Deutsche Zahlenformatierung</li>
          </ul>
        </div>
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Markdown Export</h4>
          <ul className="text-gray-600 space-y-1">
            <li>• Vollständiger Bericht</li>
            <li>• Parameter & Berechnungsformeln</li>
            <li>• Übersichtstabellen</li>
            <li>• Dokumentations-freundlich</li>
            <li>• GitHub/Wiki kompatibel</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

interface DataExportSectionProps {
  hasAnyData: boolean
  hasSavingsData: boolean
  hasWithdrawalCapability: boolean
  isExporting: boolean
  exportResult: string | null
  exportType: string | null
  onExportSavings: () => void
  onExportWithdrawal: () => void
  onExportAll: () => void
  onExportMarkdown: () => void
  onCopyCalculations: () => void
}

function NoDataWarning() {
  return (
    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
      <div className="flex items-center gap-2 text-yellow-800 text-sm">
        <Info className="h-4 w-4 flex-shrink-0" />
        <span>
          Keine Simulationsdaten verfügbar. Führen Sie zuerst eine Simulation durch.
        </span>
      </div>
    </div>
  )
}

function DataExportSection({
  hasAnyData,
  hasSavingsData,
  hasWithdrawalCapability,
  isExporting,
  exportResult,
  exportType,
  onExportSavings,
  onExportWithdrawal,
  onExportAll,
  onExportMarkdown,
  onCopyCalculations,
}: DataExportSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <Download className="h-4 w-4" />
        Daten Export
      </h3>
      <p className="text-sm text-gray-600">
        Exportiert Simulationsdaten in verschiedenen Formaten mit Jahr-für-Jahr Aufschlüsselung.
      </p>

      {!hasAnyData && <NoDataWarning />}

      {hasAnyData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <CSVExportSection
            hasSavingsData={hasSavingsData}
            hasWithdrawalCapability={hasWithdrawalCapability}
            isExporting={isExporting}
            exportResult={exportResult}
            exportType={exportType}
            onExportSavings={onExportSavings}
            onExportWithdrawal={onExportWithdrawal}
            onExportAll={onExportAll}
          />

          <MarkdownExportSection
            isExporting={isExporting}
            exportResult={exportResult}
            exportType={exportType}
            onExport={onExportMarkdown}
          />

          <CalculationsExportSection
            isExporting={isExporting}
            exportResult={exportResult}
            exportType={exportType}
            onExport={onCopyCalculations}
          />
        </div>
      )}
    </div>
  )
}

function hasWithdrawalCapability(
  hasWithdrawalData: boolean,
  hasWithdrawalConfig: boolean,
  hasWithdrawalConfigFromStorage: boolean,
  hasSavingsData: boolean,
  withdrawalConfig: { formValue?: unknown } | null,
): boolean {
  return hasWithdrawalData
    || hasWithdrawalConfig
    || hasWithdrawalConfigFromStorage
    || (hasSavingsData && !!withdrawalConfig)
}

function getExportButtonState(
  isExporting: boolean,
  exportResult: string | null,
  exportType: string | null,
  buttonType: string,
): { text: string, variant: ButtonVariant } {
  if (isExporting && exportType === buttonType) {
    return { text: 'Exportiere...', variant: 'default' }
  }
  if (exportResult === 'success' && exportType === buttonType) {
    return { text: '✓ Erfolg!', variant: 'secondary' }
  }
  if (exportResult === 'error' && exportType === buttonType) {
    return { text: '✗ Fehler', variant: 'destructive' }
  }

  const defaultTexts = {
    csv: 'CSV herunterladen',
    markdown: 'Markdown herunterladen',
    clipboard: 'Formeln kopieren',
  }

  return {
    text: defaultTexts[buttonType as keyof typeof defaultTexts] || 'Export',
    variant: 'default',
  }
}

const DataExport = () => {
  const {
    exportParameters,
    isExporting: isParameterExporting,
    lastExportResult: parameterExportResult,
  } = useParameterExport()
  const {
    exportSavingsDataCSV,
    exportWithdrawalDataCSV,
    exportAllDataCSV,
    exportDataMarkdown,
    copyCalculationExplanations,
    isExporting: isDataExporting,
    lastExportResult: dataExportResult,
    exportType,
  } = useDataExport()

  const { simulationData, withdrawalResults, withdrawalConfig } = useSimulation()
  const nestingLevel = useNestingLevel()
  const navigationRef = useNavigationItem({
    id: 'data-export',
    title: 'Export',
    icon: '📤',
    level: 0,
  })

  const hasSavingsData = !!(simulationData?.sparplanElements && simulationData.sparplanElements.length > 0)
  const hasWithdrawalData = !!(withdrawalResults && Object.keys(withdrawalResults).length > 0)
  const hasWithdrawalConfig = !!(withdrawalConfig && withdrawalConfig.formValue)
  const hasWithdrawalConfigFromStorage = !!(withdrawalConfig && (
    withdrawalConfig.formValue
    || withdrawalConfig.useSegmentedWithdrawal
    || withdrawalConfig.withdrawalSegments?.length > 0
  ))
  const hasWithdrawalCapabilityValue = hasWithdrawalCapability(
    hasWithdrawalData,
    hasWithdrawalConfig,
    hasWithdrawalConfigFromStorage,
    hasSavingsData,
    withdrawalConfig,
  )
  const hasAnyData = hasSavingsData
    || hasWithdrawalData
    || hasWithdrawalConfig
    || hasWithdrawalConfigFromStorage

  return (
    <Card nestingLevel={nestingLevel} className="mb-4" ref={navigationRef}>
      <Collapsible defaultOpen={false}>
        <CardHeader nestingLevel={nestingLevel}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors group">
              <CardTitle className="text-left">📤 Export</CardTitle>
              <div className="flex items-center gap-2">
                <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent nestingLevel={nestingLevel}>
            <div className="space-y-6">
              <ParameterExportSection
                isExporting={isParameterExporting}
                lastExportResult={parameterExportResult}
                onExport={exportParameters}
              />

              <DataExportSection
                hasAnyData={hasAnyData}
                hasSavingsData={hasSavingsData}
                hasWithdrawalCapability={hasWithdrawalCapabilityValue}
                isExporting={isDataExporting}
                exportResult={dataExportResult}
                exportType={exportType}
                onExportSavings={exportSavingsDataCSV}
                onExportWithdrawal={exportWithdrawalDataCSV}
                onExportAll={exportAllDataCSV}
                onExportMarkdown={exportDataMarkdown}
                onCopyCalculations={copyCalculationExplanations}
              />

              <FormatInformationSection />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

export default DataExport
