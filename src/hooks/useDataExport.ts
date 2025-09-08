import { useCallback, useState } from 'react';
import { useSimulation } from '../contexts/useSimulation';
import { calculateWithdrawal } from '../../helpers/withdrawal';
import {
  exportSavingsDataToCSV,
  exportWithdrawalDataToCSV,
  exportDataToMarkdown,
  generateCalculationExplanations,
  downloadTextAsFile,
  copyTextToClipboard,
  type ExportData
} from '../utils/data-export';

export interface DataExportState {
  isExporting: boolean;
  lastExportResult: 'success' | 'error' | null;
  exportType: 'csv' | 'markdown' | 'clipboard' | null;
}

/**
 * Custom hook for exporting simulation data in various formats
 */
export function useDataExport() {
  const context = useSimulation();
  const [state, setState] = useState<DataExportState>({
    isExporting: false,
    lastExportResult: null,
    exportType: null,
  });

  const clearResultAfterDelay = useCallback(() => {
    setTimeout(() => {
      setState(prev => ({ ...prev, lastExportResult: null, exportType: null }));
    }, 3000);
  }, []);

  const setExportingState = useCallback((exportType: 'csv' | 'markdown' | 'clipboard') => {
    setState(prev => ({ 
      ...prev, 
      isExporting: true, 
      lastExportResult: null, 
      exportType 
    }));
  }, []);

  const setResultState = useCallback((success: boolean, exportType: 'csv' | 'markdown' | 'clipboard') => {
    setState({
      isExporting: false,
      lastExportResult: success ? 'success' : 'error',
      exportType,
    });
    clearResultAfterDelay();
  }, [clearResultAfterDelay]);

  const exportSavingsDataCSV = useCallback(async () => {
    setExportingState('csv');
    
    try {
      // Ensure we have savings data available
      if (!context.simulationData?.sparplanElements) {
        throw new Error('Keine Sparplan-Daten verfügbar. Bitte führen Sie zuerst eine Simulation durch.');
      }

      const exportData: ExportData = {
        savingsData: context.simulationData,
        context,
      };
      
      const csvContent = exportSavingsDataToCSV(exportData);
      
      // Calculate correct savings phase period for filename
      const currentYear = new Date().getFullYear();
      const savingsStartYear = Math.min(currentYear, 
        ...context.sparplanElemente.map(plan => new Date(plan.start).getFullYear())
      );
      const savingsEndYear = context.startEnd[0]; // End of savings phase = start of withdrawal
      const filename = `sparphase_${savingsStartYear}-${savingsEndYear}_${new Date().toISOString().slice(0, 10)}.csv`;
      
      downloadTextAsFile(csvContent, filename, 'text/csv;charset=utf-8');
      setResultState(true, 'csv');
      return true;
    } catch (error) {
      console.error('Failed to export savings data as CSV:', error);
      setResultState(false, 'csv');
      return false;
    }
  }, [context, setExportingState, setResultState]);

  const exportWithdrawalDataCSV = useCallback(async () => {
    setExportingState('csv');
    
    try {
      let withdrawalData = context.withdrawalResults;
      
      // If no withdrawal results exist but we have a withdrawal config, generate them
      if (!withdrawalData && context.withdrawalConfig?.formValue && context.simulationData?.sparplanElements) {
        const { result } = calculateWithdrawal({
          elements: context.simulationData.sparplanElements,
          startYear: context.startEnd[1] + 1,
          endYear: context.withdrawalConfig.formValue.endOfLife || (context.startEnd[1] + 21),
          strategy: context.withdrawalConfig.formValue.strategie,
          returnConfig: { mode: 'fixed', fixedRate: context.withdrawalConfig.formValue.rendite / 100 },
          taxRate: context.steuerlast / 100,
          teilfreistellungsquote: context.teilfreistellungsquote / 100,
          freibetragPerYear: context.freibetragPerYear,
          withdrawalFrequency: context.withdrawalConfig.formValue.withdrawalFrequency
        });
        withdrawalData = result;
      }
      
      if (!withdrawalData) {
        throw new Error('Keine Entnahme-Daten verfügbar. Bitte konfigurieren Sie eine Entnahmestrategie.');
      }

      const exportData: ExportData = {
        withdrawalData,
        context,
      };
      
      const csvContent = exportWithdrawalDataToCSV(exportData);
      const withdrawalConfig = context.withdrawalConfig;
      const startYear = context.startEnd[1] + 1;
      const endYear = withdrawalConfig?.formValue.endOfLife || (startYear + 20);
      const filename = `entnahmephase_${startYear}-${endYear}_${new Date().toISOString().slice(0, 10)}.csv`;
      
      downloadTextAsFile(csvContent, filename, 'text/csv;charset=utf-8');
      setResultState(true, 'csv');
      return true;
    } catch (error) {
      console.error('Failed to export withdrawal data as CSV:', error);
      setResultState(false, 'csv');
      return false;
    }
  }, [context, setExportingState, setResultState]);

  const exportAllDataCSV = useCallback(async () => {
    setExportingState('csv');
    
    try {
      const savingsData = context.simulationData;
      let withdrawalData = context.withdrawalResults;
      
      // If no withdrawal results exist but we have a withdrawal config, generate them
      if (!withdrawalData && context.withdrawalConfig?.formValue && savingsData?.sparplanElements) {
        const { result } = calculateWithdrawal({
          elements: savingsData.sparplanElements,
          startYear: context.startEnd[1] + 1,
          endYear: context.withdrawalConfig.formValue.endOfLife || (context.startEnd[1] + 21),
          strategy: context.withdrawalConfig.formValue.strategie,
          returnConfig: { mode: 'fixed', fixedRate: context.withdrawalConfig.formValue.rendite / 100 },
          taxRate: context.steuerlast / 100,
          teilfreistellungsquote: context.teilfreistellungsquote / 100,
          freibetragPerYear: context.freibetragPerYear,
          withdrawalFrequency: context.withdrawalConfig.formValue.withdrawalFrequency
        });
        withdrawalData = result;
      }
      
      if (!savingsData?.sparplanElements && !withdrawalData && !context.withdrawalConfig?.formValue) {
        throw new Error('Keine Simulationsdaten verfügbar');
      }

      const parts: string[] = [];
      
      // Export savings phase if available
      if (savingsData?.sparplanElements) {
        const exportData: ExportData = { savingsData, context };
        parts.push(exportSavingsDataToCSV(exportData));
      }
      
      // Add separator
      if (savingsData?.sparplanElements && (withdrawalData || context.withdrawalConfig?.formValue)) {
        parts.push('\n\n# ========================================\n');
      }
      
      // Export withdrawal phase if available
      if (withdrawalData) {
        const exportData: ExportData = { withdrawalData, context };
        parts.push(exportWithdrawalDataToCSV(exportData));
      }
      
      const csvContent = parts.join('\n');
      const filename = `simulation_komplett_${context.startEnd[0]}-${(context.withdrawalConfig?.formValue.endOfLife || context.startEnd[1])}_${new Date().toISOString().slice(0, 10)}.csv`;
      
      downloadTextAsFile(csvContent, filename, 'text/csv;charset=utf-8');
      setResultState(true, 'csv');
      return true;
    } catch (error) {
      console.error('Failed to export all data as CSV:', error);
      setResultState(false, 'csv');
      return false;
    }
  }, [context, setExportingState, setResultState]);

  const exportDataMarkdown = useCallback(async () => {
    setExportingState('markdown');
    
    try {
      // Check if we have any data to export
      const hasSavingsData = context.simulationData?.sparplanElements?.length > 0;
      let hasWithdrawalData = context.withdrawalResults && Object.keys(context.withdrawalResults).length > 0;
      const hasWithdrawalConfig = context.withdrawalConfig?.formValue;
      
      let withdrawalData = context.withdrawalResults;
      
      // If no withdrawal results exist but we have a withdrawal config, generate them
      if (!hasWithdrawalData && hasWithdrawalConfig && context.simulationData?.sparplanElements) {
        const { result } = calculateWithdrawal({
          elements: context.simulationData.sparplanElements,
          startYear: context.startEnd[1] + 1,
          endYear: context.withdrawalConfig!.formValue.endOfLife || (context.startEnd[1] + 21),
          strategy: context.withdrawalConfig!.formValue.strategie,
          returnConfig: { mode: 'fixed', fixedRate: context.withdrawalConfig!.formValue.rendite / 100 },
          taxRate: context.steuerlast / 100,
          teilfreistellungsquote: context.teilfreistellungsquote / 100,
          freibetragPerYear: context.freibetragPerYear,
          withdrawalFrequency: context.withdrawalConfig!.formValue.withdrawalFrequency
        });
        withdrawalData = result;
        hasWithdrawalData = true;
      }
      
      if (!hasSavingsData && !hasWithdrawalData && !hasWithdrawalConfig) {
        throw new Error('Keine Simulationsdaten verfügbar. Bitte führen Sie zuerst eine Simulation durch.');
      }

      const exportData: ExportData = {
        savingsData: hasSavingsData ? context.simulationData : undefined,
        withdrawalData: hasWithdrawalData ? withdrawalData || undefined : undefined,
        context,
      };
      
      const markdownContent = exportDataToMarkdown(exportData);
      const filename = `simulation_${context.startEnd[0]}-${(context.withdrawalConfig?.formValue.endOfLife || context.startEnd[1])}_${new Date().toISOString().slice(0, 10)}.md`;
      
      downloadTextAsFile(markdownContent, filename, 'text/markdown;charset=utf-8');
      setResultState(true, 'markdown');
      return true;
    } catch (error) {
      console.error('Failed to export data as Markdown:', error);
      setResultState(false, 'markdown');
      return false;
    }
  }, [context, setExportingState, setResultState]);

  const copyCalculationExplanations = useCallback(async () => {
    setExportingState('clipboard');
    
    try {
      const explanations = generateCalculationExplanations(context);
      const success = await copyTextToClipboard(explanations);
      setResultState(success, 'clipboard');
      return success;
    } catch (error) {
      console.error('Failed to copy calculation explanations:', error);
      setResultState(false, 'clipboard');
      return false;
    }
  }, [context, setExportingState, setResultState]);

  return {
    exportSavingsDataCSV,
    exportWithdrawalDataCSV,
    exportAllDataCSV,
    exportDataMarkdown,
    copyCalculationExplanations,
    ...state,
  };
}