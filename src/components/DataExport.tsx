import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown, Download, FileText, Copy, Info } from 'lucide-react';
import { useParameterExport } from '../hooks/useParameterExport';
import { useDataExport } from '../hooks/useDataExport';
import { useSimulation } from '../contexts/useSimulation';
import { useNestingLevel } from '../lib/nesting-utils';

const DataExport = () => {
  const { exportParameters, isExporting: isParameterExporting, lastExportResult: parameterExportResult } = useParameterExport();
  const {
    exportSavingsDataCSV,
    exportWithdrawalDataCSV,
    exportAllDataCSV,
    exportDataMarkdown,
    copyCalculationExplanations,
    isExporting: isDataExporting,
    lastExportResult: dataExportResult,
    exportType
  } = useDataExport();
  
  const { simulationData, withdrawalResults, withdrawalConfig } = useSimulation();
  const nestingLevel = useNestingLevel();

  const handleParameterExportClick = async () => {
    await exportParameters();
  };

  const getParameterExportButtonText = () => {
    if (isParameterExporting) return 'Exportiere...';
    if (parameterExportResult === 'success') return '✓ Kopiert!';
    if (parameterExportResult === 'error') return '✗ Fehler';
    return '📋 Parameter kopieren';
  };

  const getParameterExportButtonVariant = () => {
    if (parameterExportResult === 'success') return 'secondary';
    if (parameterExportResult === 'error') return 'destructive';
    return 'outline';
  };

  const getDataExportButtonText = (buttonType: 'csv' | 'markdown' | 'clipboard') => {
    if (isDataExporting && exportType === buttonType) {
      return 'Exportiere...';
    }
    if (dataExportResult === 'success' && exportType === buttonType) {
      return '✓ Erfolg!';
    }
    if (dataExportResult === 'error' && exportType === buttonType) {
      return '✗ Fehler';
    }
    
    switch (buttonType) {
      case 'csv':
        return 'CSV herunterladen';
      case 'markdown':
        return 'Markdown herunterladen';
      case 'clipboard':
        return 'Formeln kopieren';
      default:
        return 'Export';
    }
  };

  const getDataExportButtonVariant = (buttonType: 'csv' | 'markdown' | 'clipboard') => {
    if (dataExportResult === 'success' && exportType === buttonType) return 'secondary';
    if (dataExportResult === 'error' && exportType === buttonType) return 'destructive';
    return 'default';
  };

  const hasSavingsData = simulationData?.sparplanElements && simulationData.sparplanElements.length > 0;
  const hasWithdrawalData = withdrawalResults && Object.keys(withdrawalResults).length > 0;
  const hasWithdrawalConfig = withdrawalConfig && withdrawalConfig.formValue;
  // Enhanced detection: check for withdrawal configuration that might be loaded from localStorage
  const hasWithdrawalConfigFromStorage = withdrawalConfig && (
    withdrawalConfig.formValue || 
    withdrawalConfig.useSegmentedWithdrawal || 
    withdrawalConfig.withdrawalSegments?.length > 0
  );
  // More robust detection: withdrawal capability exists if we have either results, config, or both savings data and basic setup
  const hasWithdrawalCapability = hasWithdrawalData || hasWithdrawalConfig || hasWithdrawalConfigFromStorage || (hasSavingsData && withdrawalConfig);
  const hasAnyData = hasSavingsData || hasWithdrawalData || hasWithdrawalConfig || hasWithdrawalConfigFromStorage;

  return (
    <Card nestingLevel={nestingLevel} className="mb-4">
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
              
              {/* Parameter Export Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Copy className="h-4 w-4" />
                  Parameter Export
                </h3>
                <p className="text-sm text-gray-600">
                  Exportiert alle Konfigurationsparameter in die Zwischenablage für Entwicklung und Fehlerbeschreibung.
                </p>
                <Button
                  variant={getParameterExportButtonVariant()}
                  size="sm"
                  onClick={handleParameterExportClick}
                  disabled={isParameterExporting}
                  className="w-full sm:w-auto"
                >
                  {getParameterExportButtonText()}
                </Button>
                <div className="block sm:hidden text-xs text-gray-500">
                  💡 Kopiert alle Parameter in die Zwischenablage
                </div>
              </div>

              {/* Data Export Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Daten Export
                </h3>
                <p className="text-sm text-gray-600">
                  Exportiert Simulationsdaten in verschiedenen Formaten mit Jahr-für-Jahr Aufschlüsselung.
                </p>
                
                {!hasAnyData && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex items-center gap-2 text-yellow-800 text-sm">
                      <Info className="h-4 w-4 flex-shrink-0" />
                      <span>
                        Keine Simulationsdaten verfügbar. Führen Sie zuerst eine Simulation durch.
                      </span>
                    </div>
                  </div>
                )}

                {hasAnyData && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    
                    {/* CSV Export Options */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">CSV Format</h4>
                      
                      {hasSavingsData && (
                        <Button
                          variant={getDataExportButtonVariant('csv')}
                          size="sm"
                          onClick={exportSavingsDataCSV}
                          disabled={isDataExporting}
                          className="w-full text-xs"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Sparphase
                        </Button>
                      )}
                      
                      {hasWithdrawalCapability && (
                        <Button
                          variant={getDataExportButtonVariant('csv')}
                          size="sm"
                          onClick={exportWithdrawalDataCSV}
                          disabled={isDataExporting}
                          className="w-full text-xs"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Entnahmephase
                        </Button>
                      )}
                      
                      {hasSavingsData && hasWithdrawalCapability && (
                        <Button
                          variant={getDataExportButtonVariant('csv')}
                          size="sm"
                          onClick={exportAllDataCSV}
                          disabled={isDataExporting}
                          className="w-full text-xs font-medium"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Komplett
                        </Button>
                      )}
                    </div>

                    {/* Markdown Export */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Markdown</h4>
                      <Button
                        variant={getDataExportButtonVariant('markdown')}
                        size="sm"
                        onClick={exportDataMarkdown}
                        disabled={isDataExporting}
                        className="w-full text-xs"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        {getDataExportButtonText('markdown')}
                      </Button>
                    </div>

                    {/* Calculation Explanations */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Berechnungen</h4>
                      <Button
                        variant={getDataExportButtonVariant('clipboard')}
                        size="sm"
                        onClick={copyCalculationExplanations}
                        disabled={isDataExporting}
                        className="w-full text-xs"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        {getDataExportButtonText('clipboard')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Format Information */}
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
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default DataExport;