import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { SimulationAnnualType } from '../utils/simulate';
import { SimulationAnnual, simulate } from '../utils/simulate';
import type { ReturnMode, ReturnConfiguration } from '../utils/random-returns';
import type { Sparplan, SparplanElement } from '../utils/sparplan-utils';
import { convertSparplanToElements, initialSparplan } from '../utils/sparplan-utils';
import type { WithdrawalResult } from '../../helpers/withdrawal';
import { SimulationContext } from './SimulationContextValue';
import { saveConfiguration, loadConfiguration, type SavedConfiguration, type WithdrawalConfiguration } from '../utils/config-storage';
import type { BasiszinsConfiguration } from '../services/bundesbank-api';

export interface SimulationContextState {
  rendite: number;
  setRendite: (rendite: number) => void;
  steuerlast: number;
  setSteuerlast: (steuerlast: number) => void;
  teilfreistellungsquote: number;
  setTeilfreistellungsquote: (teilfreistellungsquote: number) => void;
  freibetragPerYear: { [year: number]: number };
  setFreibetragPerYear: (freibetragPerYear: { [year: number]: number }) => void;
  // Basiszins configuration for Vorabpauschale calculation
  basiszinsConfiguration: BasiszinsConfiguration;
  setBasiszinsConfiguration: (basiszinsConfiguration: BasiszinsConfiguration) => void;
  // Phase-specific tax reduction settings
  steuerReduzierenEndkapitalSparphase: boolean;
  setSteuerReduzierenEndkapitalSparphase: (steuerReduzierenEndkapitalSparphase: boolean) => void;
  steuerReduzierenEndkapitalEntspharphase: boolean;
  setSteuerReduzierenEndkapitalEntspharphase: (steuerReduzierenEndkapitalEntspharphase: boolean) => void;
  // Grundfreibetrag settings
  grundfreibetragAktiv: boolean;
  setGrundfreibetragAktiv: (grundfreibetragAktiv: boolean) => void;
  grundfreibetragBetrag: number;
  setGrundfreibetragBetrag: (grundfreibetragBetrag: number) => void;
  returnMode: ReturnMode;
  setReturnMode: (returnMode: ReturnMode) => void;
  averageReturn: number;
  setAverageReturn: (averageReturn: number) => void;
  standardDeviation: number;
  setStandardDeviation: (standardDeviation: number) => void;
  randomSeed?: number;
  setRandomSeed: (randomSeed?: number) => void;
  variableReturns: Record<number, number>;
  setVariableReturns: (variableReturns: Record<number, number>) => void;
  historicalIndex: string;
  setHistoricalIndex: (historicalIndex: string) => void;
  // Inflation settings for savings phase
  inflationAktivSparphase: boolean;
  setInflationAktivSparphase: (inflationAktivSparphase: boolean) => void;
  inflationsrateSparphase: number;
  setInflationsrateSparphase: (inflationsrateSparphase: number) => void;
  startEnd: [number, number];
  setStartEnd: (startEnd: [number, number]) => void;
  sparplan: Sparplan[];
  setSparplan: (sparplan: Sparplan[]) => void;
  simulationAnnual: SimulationAnnualType;
  setSimulationAnnual: (simulationAnnual: SimulationAnnualType) => void;
  sparplanElemente: SparplanElement[];
  setSparplanElemente: (sparplanElemente: SparplanElement[]) => void;
  simulationData: any;
  isLoading: boolean;
  withdrawalResults: WithdrawalResult | null;
  setWithdrawalResults: (withdrawalResults: WithdrawalResult | null) => void;
  performSimulation: (overwrite?: { rendite?: number }) => Promise<void>;
  // Configuration management
  saveCurrentConfiguration: () => void;
  loadSavedConfiguration: () => void;
  resetToDefaults: () => void;
  // Withdrawal configuration
  withdrawalConfig: WithdrawalConfiguration | null;
  setWithdrawalConfig: (config: WithdrawalConfiguration | null) => void;
}

export const SimulationProvider = ({ children }: { children: React.ReactNode }) => {
  // Default configuration
  const defaultConfig = useMemo(() => ({
    rendite: 5,
    steuerlast: 26.375,
    teilfreistellungsquote: 30,
    freibetragPerYear: { 2023: 2000 },
    // Default Basiszins configuration with historical rates
    basiszinsConfiguration: {
      2018: { year: 2018, rate: 0.0087, source: 'fallback' as const, lastUpdated: new Date().toISOString() },
      2019: { year: 2019, rate: 0.0087, source: 'fallback' as const, lastUpdated: new Date().toISOString() },
      2020: { year: 2020, rate: 0.0070, source: 'fallback' as const, lastUpdated: new Date().toISOString() },
      2021: { year: 2021, rate: 0.0070, source: 'fallback' as const, lastUpdated: new Date().toISOString() },
      2022: { year: 2022, rate: 0.0180, source: 'fallback' as const, lastUpdated: new Date().toISOString() },
      2023: { year: 2023, rate: 0.0255, source: 'fallback' as const, lastUpdated: new Date().toISOString() },
      2024: { year: 2024, rate: 0.0255, source: 'fallback' as const, lastUpdated: new Date().toISOString() },
    } as BasiszinsConfiguration,
    // Default: taxes reduce capital for savings and withdrawal phases
    steuerReduzierenEndkapitalSparphase: true,
    steuerReduzierenEndkapitalEntspharphase: true,
    // Grundfreibetrag settings (German basic tax allowance for retirees)
    grundfreibetragAktiv: false,
    grundfreibetragBetrag: 11604, // Updated to 2024 German basic tax allowance, default when activated will be double (23208)
    returnMode: 'fixed' as ReturnMode,
    averageReturn: 7,
    standardDeviation: 15,
    randomSeed: undefined,
    variableReturns: {},
    historicalIndex: 'dax',
    // Inflation settings for savings phase (default: enabled with 2%)
    inflationAktivSparphase: true,
    inflationsrateSparphase: 2,
    startEnd: [2040, 2080] as [number, number],
    sparplan: [initialSparplan],
    simulationAnnual: SimulationAnnual.yearly,
  }), []);

  // Try to load saved configuration, fallback to defaults
  const loadInitialConfig = () => {
    const savedConfig = loadConfiguration();
    return savedConfig || defaultConfig;
  };

  const initialConfig = loadInitialConfig();

  const [rendite, setRendite] = useState(initialConfig.rendite);
  const [steuerlast, setSteuerlast] = useState(initialConfig.steuerlast);
  const [teilfreistellungsquote, setTeilfreistellungsquote] = useState(initialConfig.teilfreistellungsquote);
  const [freibetragPerYear, setFreibetragPerYear] = useState<{ [year: number]: number }>(initialConfig.freibetragPerYear);
  const [basiszinsConfiguration, setBasiszinsConfiguration] = useState<BasiszinsConfiguration>(
    (initialConfig as any).basiszinsConfiguration || defaultConfig.basiszinsConfiguration
  );
  const [steuerReduzierenEndkapitalSparphase, setSteuerReduzierenEndkapitalSparphase] = useState(
    (initialConfig as any).steuerReduzierenEndkapitalSparphase ?? true
  );
  const [steuerReduzierenEndkapitalEntspharphase, setSteuerReduzierenEndkapitalEntspharphase] = useState(
    (initialConfig as any).steuerReduzierenEndkapitalEntspharphase ?? true
  );
  const [grundfreibetragAktiv, setGrundfreibetragAktiv] = useState(
    (initialConfig as any).grundfreibetragAktiv ?? false
  );
  const [grundfreibetragBetrag, setGrundfreibetragBetrag] = useState(
    (initialConfig as any).grundfreibetragBetrag ?? (
      // When enabled for the first time, use double the current value as default
      (initialConfig as any).grundfreibetragAktiv ? 23208 : 11604
    )
  );
  const [returnMode, setReturnMode] = useState<ReturnMode>(initialConfig.returnMode);
  const [averageReturn, setAverageReturn] = useState(initialConfig.averageReturn);
  const [standardDeviation, setStandardDeviation] = useState(initialConfig.standardDeviation);
  const [randomSeed, setRandomSeed] = useState<number | undefined>(initialConfig.randomSeed);
  const [variableReturns, setVariableReturns] = useState<Record<number, number>>(initialConfig.variableReturns);
  const [historicalIndex, setHistoricalIndex] = useState<string>(
    (initialConfig as any).historicalIndex || defaultConfig.historicalIndex
  );
  // Inflation state for savings phase
  const [inflationAktivSparphase, setInflationAktivSparphase] = useState(
    (initialConfig as any).inflationAktivSparphase ?? defaultConfig.inflationAktivSparphase
  );
  const [inflationsrateSparphase, setInflationsrateSparphase] = useState(
    (initialConfig as any).inflationsrateSparphase ?? defaultConfig.inflationsrateSparphase
  );
  const [startEnd, setStartEnd] = useState<[number, number]>(initialConfig.startEnd);
  const [sparplan, setSparplan] = useState<Sparplan[]>(initialConfig.sparplan);
  const [simulationAnnual, setSimulationAnnual] = useState<SimulationAnnualType>(initialConfig.simulationAnnual);
  const [sparplanElemente, setSparplanElemente] = useState<SparplanElement[]>(
    convertSparplanToElements(initialConfig.sparplan, initialConfig.startEnd, initialConfig.simulationAnnual)
  );
  const [simulationData, setSimulationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [withdrawalResults, setWithdrawalResults] = useState<WithdrawalResult | null>(null);

  // Withdrawal configuration state
  const [withdrawalConfig, setWithdrawalConfig] = useState<WithdrawalConfiguration | null>(
    (initialConfig as SavedConfiguration).withdrawal || null
  );

  const yearToday = new Date().getFullYear();

  // Configuration management functions
  const getCurrentConfiguration = useCallback((): SavedConfiguration => ({
    rendite,
    steuerlast,
    teilfreistellungsquote,
    freibetragPerYear,
    basiszinsConfiguration,
    steuerReduzierenEndkapitalSparphase,
    steuerReduzierenEndkapitalEntspharphase,
    grundfreibetragAktiv,
    grundfreibetragBetrag,
    returnMode,
    averageReturn,
    standardDeviation,
    randomSeed,
    variableReturns,
    historicalIndex,
    // Inflation for savings phase
    inflationAktivSparphase,
    inflationsrateSparphase,
    startEnd,
    sparplan,
    simulationAnnual,
    withdrawal: withdrawalConfig || undefined,
  }), [rendite, steuerlast, teilfreistellungsquote, freibetragPerYear, basiszinsConfiguration, steuerReduzierenEndkapitalSparphase, steuerReduzierenEndkapitalEntspharphase, grundfreibetragAktiv, grundfreibetragBetrag, returnMode, averageReturn, standardDeviation, randomSeed, variableReturns, historicalIndex, inflationAktivSparphase, inflationsrateSparphase, startEnd, sparplan, simulationAnnual, withdrawalConfig]);

  const saveCurrentConfiguration = useCallback(() => {
    const config = getCurrentConfiguration();
    saveConfiguration(config);
  }, [getCurrentConfiguration]);

  const loadSavedConfiguration = useCallback(() => {
    const savedConfig = loadConfiguration();
    if (savedConfig) {
      setRendite(savedConfig.rendite);
      setSteuerlast(savedConfig.steuerlast);
      setTeilfreistellungsquote(savedConfig.teilfreistellungsquote);
      setFreibetragPerYear(savedConfig.freibetragPerYear);
      setBasiszinsConfiguration((savedConfig as any).basiszinsConfiguration || defaultConfig.basiszinsConfiguration);
      setSteuerReduzierenEndkapitalSparphase(savedConfig.steuerReduzierenEndkapitalSparphase ?? true);
      setSteuerReduzierenEndkapitalEntspharphase(savedConfig.steuerReduzierenEndkapitalEntspharphase ?? true);
      setGrundfreibetragAktiv((savedConfig as any).grundfreibetragAktiv ?? false);
      setGrundfreibetragBetrag((savedConfig as any).grundfreibetragBetrag ?? 11604);
      setReturnMode(savedConfig.returnMode);
      setAverageReturn(savedConfig.averageReturn);
      setStandardDeviation(savedConfig.standardDeviation);
      setRandomSeed(savedConfig.randomSeed);
      setVariableReturns(savedConfig.variableReturns);
      setHistoricalIndex((savedConfig as any).historicalIndex || defaultConfig.historicalIndex);
      // Load inflation settings for savings phase
      setInflationAktivSparphase((savedConfig as any).inflationAktivSparphase ?? defaultConfig.inflationAktivSparphase);
      setInflationsrateSparphase((savedConfig as any).inflationsrateSparphase ?? defaultConfig.inflationsrateSparphase);
      setStartEnd(savedConfig.startEnd);
      setSparplan(savedConfig.sparplan);
      setSimulationAnnual(savedConfig.simulationAnnual);
      setSparplanElemente(convertSparplanToElements(savedConfig.sparplan, savedConfig.startEnd, savedConfig.simulationAnnual));
      setWithdrawalConfig(savedConfig.withdrawal || null);
    }
  }, []);

  const resetToDefaults = useCallback(() => {
    setRendite(defaultConfig.rendite);
    setSteuerlast(defaultConfig.steuerlast);
    setTeilfreistellungsquote(defaultConfig.teilfreistellungsquote);
    setFreibetragPerYear(defaultConfig.freibetragPerYear);
    setBasiszinsConfiguration(defaultConfig.basiszinsConfiguration);
    setSteuerReduzierenEndkapitalSparphase(defaultConfig.steuerReduzierenEndkapitalSparphase);
    setSteuerReduzierenEndkapitalEntspharphase(defaultConfig.steuerReduzierenEndkapitalEntspharphase);
    setGrundfreibetragAktiv(defaultConfig.grundfreibetragAktiv);
    setGrundfreibetragBetrag(defaultConfig.grundfreibetragBetrag);
    setReturnMode(defaultConfig.returnMode);
    setAverageReturn(defaultConfig.averageReturn);
    setStandardDeviation(defaultConfig.standardDeviation);
    setRandomSeed(defaultConfig.randomSeed);
    setVariableReturns(defaultConfig.variableReturns);
    setHistoricalIndex(defaultConfig.historicalIndex);
    // Reset inflation settings for savings phase
    setInflationAktivSparphase(defaultConfig.inflationAktivSparphase);
    setInflationsrateSparphase(defaultConfig.inflationsrateSparphase);
    setStartEnd(defaultConfig.startEnd);
    setSparplan(defaultConfig.sparplan);
    setSimulationAnnual(defaultConfig.simulationAnnual);
    setSparplanElemente(convertSparplanToElements(defaultConfig.sparplan, defaultConfig.startEnd, defaultConfig.simulationAnnual));
    setWithdrawalConfig(null); // Reset withdrawal config to null
  }, [defaultConfig.basiszinsConfiguration, defaultConfig.historicalIndex, setSparplanElemente]);

  // Auto-save configuration whenever any config value changes
  useEffect(() => {
    saveCurrentConfiguration();
  }, [saveCurrentConfiguration]);

  const performSimulation = useCallback(async (overwrite: { rendite?: number } = {}) => {
    setIsLoading(true);
    try {
      let returnConfig: ReturnConfiguration;
      if (overwrite.rendite !== undefined) {
        returnConfig = { mode: 'fixed', fixedRate: overwrite.rendite / 100 };
      } else {
        if (returnMode === 'random') {
          returnConfig = {
            mode: 'random',
            randomConfig: {
              averageReturn: averageReturn / 100 || 0.07,
              standardDeviation: standardDeviation / 100 || 0.15,
              seed: randomSeed,
            },
          };
        } else if (returnMode === 'variable') {
          returnConfig = {
            mode: 'variable',
            variableConfig: {
              yearlyReturns: Object.fromEntries(
                Object.entries(variableReturns).map(([year, rate]) => [parseInt(year), rate / 100])
              ),
            },
          };
        } else if (returnMode === 'historical') {
          returnConfig = {
            mode: 'historical',
            historicalConfig: {
              indexId: historicalIndex,
            },
          };
        } else {
          returnConfig = {
            mode: 'fixed',
            fixedRate: rendite / 100 || 0.05,
          };
        }
      }

      const result = simulate({
        startYear: yearToday,
        endYear: startEnd[0],
        elements: sparplanElemente,
        returnConfig,
        steuerlast: steuerlast / 100,
        simulationAnnual,
        teilfreistellungsquote: teilfreistellungsquote / 100,
        freibetragPerYear,
        steuerReduzierenEndkapital: steuerReduzierenEndkapitalSparphase, // Use savings phase setting
        basiszinsConfiguration,
        // Inflation settings for savings phase
        inflationAktivSparphase,
        inflationsrateSparphase,
      });

      setSimulationData({
        sparplanElements: result.map(element => ({
          ...element,
        })),
      });
    } catch (error) {
      console.error('Simulation error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [rendite, returnMode, averageReturn, standardDeviation, randomSeed, variableReturns, historicalIndex, simulationAnnual, sparplanElemente, startEnd, yearToday, steuerlast, teilfreistellungsquote, freibetragPerYear, basiszinsConfiguration, steuerReduzierenEndkapitalSparphase, inflationAktivSparphase, inflationsrateSparphase]);

  const value = useMemo(() => ({
    rendite, setRendite,
    steuerlast, setSteuerlast,
    teilfreistellungsquote, setTeilfreistellungsquote,
    freibetragPerYear, setFreibetragPerYear,
    basiszinsConfiguration, setBasiszinsConfiguration,
    steuerReduzierenEndkapitalSparphase, setSteuerReduzierenEndkapitalSparphase,
    steuerReduzierenEndkapitalEntspharphase, setSteuerReduzierenEndkapitalEntspharphase,
    grundfreibetragAktiv, setGrundfreibetragAktiv,
    grundfreibetragBetrag, setGrundfreibetragBetrag,
    returnMode, setReturnMode,
    averageReturn, setAverageReturn,
    standardDeviation, setStandardDeviation,
    randomSeed, setRandomSeed,
    variableReturns, setVariableReturns,
    historicalIndex, setHistoricalIndex,
    // Inflation for savings phase
    inflationAktivSparphase, setInflationAktivSparphase,
    inflationsrateSparphase, setInflationsrateSparphase,
    startEnd, setStartEnd,
    sparplan, setSparplan,
    simulationAnnual, setSimulationAnnual,
    sparplanElemente, setSparplanElemente,
    simulationData,
    isLoading,
    withdrawalResults, setWithdrawalResults,
    performSimulation,
    // Configuration management
    saveCurrentConfiguration,
    loadSavedConfiguration,
    resetToDefaults,
    // Withdrawal configuration
    withdrawalConfig, setWithdrawalConfig,
  }), [
    rendite, steuerlast, teilfreistellungsquote, freibetragPerYear, basiszinsConfiguration, 
    steuerReduzierenEndkapitalSparphase, steuerReduzierenEndkapitalEntspharphase,
    grundfreibetragAktiv, grundfreibetragBetrag,
    returnMode, averageReturn, standardDeviation, randomSeed, variableReturns, historicalIndex,
    inflationAktivSparphase, inflationsrateSparphase,
    startEnd, sparplan, simulationAnnual, sparplanElemente,
    simulationData, isLoading, withdrawalResults, performSimulation,
    saveCurrentConfiguration, loadSavedConfiguration, resetToDefaults,
    withdrawalConfig
  ]);

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
};

