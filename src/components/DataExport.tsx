import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { ChevronDown, Download, FileText, Copy, Info } from 'lucide-react'
import { useParameterExport } from '../hooks/useParameterExport'
import { useDataExport } from '../hooks/useDataExport'
import { useDataAvailability } from '../hooks/useDataAvailability'
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
      <div className="block sm:hidden text-xs text-gray-500">💡 Kopiert alle Parameter in die Zwischenablage</div>
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

interface ExcelExportSectionProps {
  hasSavingsData: boolean
  hasWithdrawalCapability: boolean
  isExporting: boolean
  exportResult: string | null
  exportType: string | null
  onExportSavings: () => void
  onExportWithdrawal: () => void
  onExportAll: () => void
}

interface ExcelExportButtonProps {
  label: string
  onClick: () => void
  isExporting: boolean
  variant: ButtonVariant
  isBold?: boolean
}

function ExcelExportButton({ label, onClick, isExporting, variant, isBold = false }: ExcelExportButtonProps) {
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

function ExcelExportSection({
  hasSavingsData,
  hasWithdrawalCapability,
  isExporting,
  exportResult,
  exportType,
  onExportSavings,
  onExportWithdrawal,
  onExportAll,
}: ExcelExportSectionProps) {
  const buttonVariant = getExportButtonState(isExporting, exportResult, exportType, 'excel').variant

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Excel Format</h4>

      {hasSavingsData && (
        <ExcelExportButton
          label="Sparphase"
          onClick={onExportSavings}
          isExporting={isExporting}
          variant={buttonVariant}
        />
      )}

      {hasWithdrawalCapability && (
        <ExcelExportButton
          label="Entnahmephase"
          onClick={onExportWithdrawal}
          isExporting={isExporting}
          variant={buttonVariant}
        />
      )}

      {hasSavingsData && hasWithdrawalCapability && (
        <ExcelExportButton
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
      <Button variant={state.variant} size="sm" onClick={onExport} disabled={isExporting} className="w-full text-xs">
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
      <Button variant={state.variant} size="sm" onClick={onExport} disabled={isExporting} className="w-full text-xs">
        <Copy className="h-3 w-3 mr-1" />
        {state.text}
      </Button>
    </div>
  )
}

interface PDFExportSectionProps {
  hasSavingsData: boolean
  hasWithdrawalCapability: boolean
  isExporting: boolean
  exportResult: string | null
  exportType: string | null
  onExportSavings: () => void
  onExportWithdrawal: () => void
  onExportAll: () => void
}

interface PDFExportButtonProps {
  label: string
  onClick: () => void
  isExporting: boolean
  variant: ButtonVariant
  isBold?: boolean
}

function PDFExportButton({ label, onClick, isExporting, variant, isBold = false }: PDFExportButtonProps) {
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

function PDFExportSection({
  hasSavingsData,
  hasWithdrawalCapability,
  isExporting,
  exportResult,
  exportType,
  onExportSavings,
  onExportWithdrawal,
  onExportAll,
}: PDFExportSectionProps) {
  const buttonVariant = getExportButtonState(isExporting, exportResult, exportType, 'pdf').variant

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">PDF Format</h4>

      {hasSavingsData && (
        <PDFExportButton
          label="Sparphase"
          onClick={onExportSavings}
          isExporting={isExporting}
          variant={buttonVariant}
        />
      )}

      {hasWithdrawalCapability && (
        <PDFExportButton
          label="Entnahmephase"
          onClick={onExportWithdrawal}
          isExporting={isExporting}
          variant={buttonVariant}
        />
      )}

      {hasSavingsData && hasWithdrawalCapability && (
        <PDFExportButton
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

function FormatInfoCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="space-y-2">
      <h4 className="font-medium text-gray-700">{title}</h4>
      <ul className="text-gray-600 space-y-1">
        {items.map(item => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  )
}

const FORMAT_INFO_DATA = {
  csv: [
    'Tabellenformat für Excel/Calc',
    'Jahr/Monat Aufschlüsselung',
    'Alle Einzahlungen nach Sparplänen',
    'Vorabpauschale & Steuerdetails',
    'Deutsche Zahlenformatierung',
  ],
  excel: [
    '.xlsx Datei mit Formeln',
    'Berechnungen nachvollziehbar',
    'Jahr-für-Jahr Detailansicht',
    'Vollständige Steuerberechnung',
    'Deutsche Zahlenformate',
  ],
  pdf: [
    'Professioneller Bericht',
    'Übersichtliche Tabellen',
    'Parameter-Zusammenfassung',
    'Druckfertig und teilbar',
    'Archivierungsfreundlich',
  ],
  markdown: [
    'Vollständiger Bericht',
    'Parameter & Berechnungsformeln',
    'Übersichtstabellen',
    'Dokumentations-freundlich',
    'GitHub/Wiki kompatibel',
  ],
}

function FormatInformationSection() {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <Info className="h-4 w-4" />
        Format-Informationen
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <FormatInfoCard title="CSV Export" items={FORMAT_INFO_DATA.csv} />
        <FormatInfoCard title="Excel Export" items={FORMAT_INFO_DATA.excel} />
        <FormatInfoCard title="PDF Export" items={FORMAT_INFO_DATA.pdf} />
        <FormatInfoCard title="Markdown Export" items={FORMAT_INFO_DATA.markdown} />
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
  onExportSavingsExcel: () => void
  onExportWithdrawalExcel: () => void
  onExportAllExcel: () => void
  onExportSavingsPDF: () => void
  onExportWithdrawalPDF: () => void
  onExportAllPDF: () => void
}

function NoDataWarning() {
  return (
    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
      <div className="flex items-center gap-2 text-yellow-800 text-sm">
        <Info className="h-4 w-4 flex-shrink-0" />
        <span>Keine Simulationsdaten verfügbar. Führen Sie zuerst eine Simulation durch.</span>
      </div>
    </div>
  )
}

type CommonExportProps = Pick<
  DataExportSectionProps,
  'hasSavingsData' | 'hasWithdrawalCapability' | 'isExporting' | 'exportResult' | 'exportType'
>

function ExportOptionsGrid({
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
  onExportSavingsExcel,
  onExportWithdrawalExcel,
  onExportAllExcel,
  onExportSavingsPDF,
  onExportWithdrawalPDF,
  onExportAllPDF,
}: Omit<DataExportSectionProps, 'hasAnyData'>) {
  const commonProps: CommonExportProps = {
    hasSavingsData,
    hasWithdrawalCapability,
    isExporting,
    exportResult,
    exportType,
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      <CSVExportSection
        {...commonProps}
        onExportSavings={onExportSavings}
        onExportWithdrawal={onExportWithdrawal}
        onExportAll={onExportAll}
      />
      <ExcelExportSection
        {...commonProps}
        onExportSavings={onExportSavingsExcel}
        onExportWithdrawal={onExportWithdrawalExcel}
        onExportAll={onExportAllExcel}
      />
      <PDFExportSection
        {...commonProps}
        onExportSavings={onExportSavingsPDF}
        onExportWithdrawal={onExportWithdrawalPDF}
        onExportAll={onExportAllPDF}
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
  )
}

function DataExportSection(props: DataExportSectionProps) {
  const { hasAnyData, ...gridProps } = props

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
      {hasAnyData && <ExportOptionsGrid {...gridProps} />}
    </div>
  )
}

function getExportButtonState(
  isExporting: boolean,
  exportResult: string | null,
  exportType: string | null,
  buttonType: string,
): { text: string; variant: ButtonVariant } {
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
    excel: 'Excel herunterladen',
    pdf: 'PDF herunterladen',
  }

  return {
    text: defaultTexts[buttonType as keyof typeof defaultTexts] || 'Export',
    variant: 'default',
  }
}

function useDataExportHooks() {
  const parameterExport = useParameterExport()
  const { lastExportResult, ...restDataExport } = useDataExport()
  const dataAvailability = useDataAvailability()
  const nestingLevel = useNestingLevel()
  const navigationRef = useNavigationItem({
    id: 'data-export',
    title: 'Export',
    icon: '📤',
    level: 0,
  })

  return {
    exportParameters: parameterExport.exportParameters,
    isParameterExporting: parameterExport.isExporting,
    parameterExportResult: parameterExport.lastExportResult,
    exportResult: lastExportResult,
    ...restDataExport,
    ...dataAvailability,
    nestingLevel,
    navigationRef,
  }
}

interface DataExportContentProps {
  isParameterExporting: boolean
  parameterExportResult: 'success' | 'error' | null
  exportParameters: () => Promise<boolean>
  hasAnyData: boolean
  hasSavingsData: boolean
  hasWithdrawalCapability: boolean
  isExporting: boolean
  exportResult: string | null
  exportType: string | null
  exportSavingsDataCSV: () => void
  exportWithdrawalDataCSV: () => void
  exportAllDataCSV: () => void
  exportDataMarkdown: () => void
  copyCalculationExplanations: () => void
  exportSavingsDataExcel: () => void
  exportWithdrawalDataExcel: () => void
  exportAllDataExcel: () => void
  exportSavingsDataPDF: () => void
  exportWithdrawalDataPDF: () => void
  exportAllDataPDF: () => void
  nestingLevel: number
}

function buildDataExportSectionProps(
  props: Omit<
    DataExportContentProps,
    'isParameterExporting' | 'parameterExportResult' | 'exportParameters' | 'nestingLevel'
  >,
): DataExportSectionProps {
  const {
    hasAnyData,
    hasSavingsData,
    hasWithdrawalCapability,
    isExporting,
    exportResult,
    exportType,
    exportSavingsDataCSV,
    exportWithdrawalDataCSV,
    exportAllDataCSV,
    exportDataMarkdown,
    copyCalculationExplanations,
    exportSavingsDataExcel,
    exportWithdrawalDataExcel,
    exportAllDataExcel,
    exportSavingsDataPDF,
    exportWithdrawalDataPDF,
    exportAllDataPDF,
  } = props

  return {
    hasAnyData,
    hasSavingsData,
    hasWithdrawalCapability,
    isExporting,
    exportResult,
    exportType,
    onExportSavings: exportSavingsDataCSV,
    onExportWithdrawal: exportWithdrawalDataCSV,
    onExportAll: exportAllDataCSV,
    onExportMarkdown: exportDataMarkdown,
    onCopyCalculations: copyCalculationExplanations,
    onExportSavingsExcel: exportSavingsDataExcel,
    onExportWithdrawalExcel: exportWithdrawalDataExcel,
    onExportAllExcel: exportAllDataExcel,
    onExportSavingsPDF: exportSavingsDataPDF,
    onExportWithdrawalPDF: exportWithdrawalDataPDF,
    onExportAllPDF: exportAllDataPDF,
  }
}

function DataExportContent(props: DataExportContentProps) {
  const { isParameterExporting, parameterExportResult, exportParameters, nestingLevel, ...rest } = props
  const dataExportProps = buildDataExportSectionProps(rest)

  return (
    <CollapsibleContent>
      <CardContent nestingLevel={nestingLevel}>
        <div className="space-y-6">
          <ParameterExportSection
            isExporting={isParameterExporting}
            lastExportResult={parameterExportResult}
            onExport={exportParameters}
          />
          <DataExportSection {...dataExportProps} />
          <FormatInformationSection />
        </div>
      </CardContent>
    </CollapsibleContent>
  )
}

const DataExport = () => {
  const hooks = useDataExportHooks()

  return (
    <Card nestingLevel={hooks.nestingLevel} className="mb-4" ref={hooks.navigationRef}>
      <Collapsible defaultOpen={false}>
        <CardHeader nestingLevel={hooks.nestingLevel}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors group">
              <CardTitle className="text-left">📤 Export</CardTitle>
              <div className="flex items-center gap-2">
                <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <DataExportContent {...hooks} />
      </Collapsible>
    </Card>
  )
}

export default DataExport
