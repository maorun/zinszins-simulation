import type { ReturnMode } from './random-returns';
import type { Sparplan } from './sparplan-utils';
import type { SimulationAnnualType } from './simulate';
import type { WithdrawalStrategy, BucketStrategyConfig } from '../../helpers/withdrawal';
import type { WithdrawalSegment } from './segmented-withdrawal';
import type { BasiszinsConfiguration } from '../services/bundesbank-api';

/**
 * Return mode for withdrawal phase (subset of main ReturnMode)
 */
export type WithdrawalReturnMode = 'fixed' | 'random' | 'variable';

/**
 * Frequency mode for withdrawal calculations
 */
export type WithdrawalFrequency = 'yearly' | 'monthly';

/**
 * Form values for withdrawal configuration
 */
export interface WithdrawalFormValue {
  endOfLife: number;
  strategie: WithdrawalStrategy;
  rendite: number;
  // Withdrawal frequency configuration
  withdrawalFrequency: WithdrawalFrequency;
  // General inflation settings
  inflationAktiv: boolean;
  inflationsrate: number;
  // Monthly strategy specific settings
  monatlicheBetrag: number;
  guardrailsAktiv: boolean;
  guardrailsSchwelle: number;
  // Custom percentage strategy specific settings
  variabelProzent: number;
  // Dynamic strategy specific settings
  dynamischBasisrate: number;
  dynamischObereSchwell: number;
  dynamischObereAnpassung: number;
  dynamischUntereSchwell: number;
  dynamischUntereAnpassung: number;
  // Bucket strategy specific settings
  bucketConfig?: BucketStrategyConfig;
  // RMD strategy specific settings
  rmdStartAge: number;
  rmdLifeExpectancyTable: 'german_2020_22' | 'custom';
  rmdCustomLifeExpectancy?: number;
  // Kapitalerhalt strategy specific settings
  kapitalerhaltNominalReturn: number;
  kapitalerhaltInflationRate: number;
  // Grundfreibetrag settings (now handled globally, kept for backward compatibility)
  grundfreibetragAktiv?: boolean;
  grundfreibetragBetrag?: number;
  einkommensteuersatz: number;
}

/**
 * Comparison strategy for withdrawal comparison mode
 */
export interface ComparisonStrategy {
  id: string;
  name: string;
  strategie: WithdrawalStrategy;
  rendite: number;
  variabelProzent?: number;
  monatlicheBetrag?: number;
  dynamischBasisrate?: number;
  dynamischObereSchwell?: number;
  dynamischObereAnpassung?: number;
  dynamischUntereSchwell?: number;
  dynamischUntereAnpassung?: number;
  // Bucket strategy specific fields
  bucketInitialCash?: number;
  bucketBaseRate?: number;
  bucketRefillThreshold?: number;
  bucketRefillPercentage?: number;
  // RMD strategy specific fields
  rmdStartAge?: number;
  rmdLifeExpectancyTable?: 'german_2020_22' | 'custom';
  rmdCustomLifeExpectancy?: number;
  // Kapitalerhalt strategy specific fields
  kapitalerhaltNominalReturn?: number;
  kapitalerhaltInflationRate?: number;
}

/**
 * Complete withdrawal configuration that needs to be persisted
 */
export interface WithdrawalConfiguration {
  // Basic withdrawal form values
  formValue: WithdrawalFormValue;
  // Return configuration for withdrawal phase
  withdrawalReturnMode: WithdrawalReturnMode;
  withdrawalVariableReturns: Record<number, number>;
  withdrawalAverageReturn: number;
  withdrawalStandardDeviation: number;
  withdrawalRandomSeed?: number;
  // Segmented withdrawal configuration
  useSegmentedWithdrawal: boolean;
  withdrawalSegments: WithdrawalSegment[];
  // Comparison mode configuration
  useComparisonMode: boolean;
  comparisonStrategies: ComparisonStrategy[];
}

/**
 * Configuration interface for values that should be persisted
 */
export interface SavedConfiguration {
  rendite: number;
  steuerlast: number;
  teilfreistellungsquote: number;
  freibetragPerYear: { [year: number]: number };
  // Basiszins configuration for Vorabpauschale calculation
  basiszinsConfiguration?: BasiszinsConfiguration;
  // Legacy single setting for backward compatibility
  steuerReduzierenEndkapital?: boolean;
  // New phase-specific settings
  steuerReduzierenEndkapitalSparphase?: boolean;
  steuerReduzierenEndkapitalEntspharphase?: boolean;
  // Grundfreibetrag settings
  grundfreibetragAktiv?: boolean;
  grundfreibetragBetrag?: number;
  returnMode: ReturnMode;
  averageReturn: number;
  standardDeviation: number;
  randomSeed?: number;
  variableReturns: Record<number, number>;
  startEnd: [number, number];
  sparplan: Sparplan[];
  simulationAnnual: SimulationAnnualType;
  // Withdrawal configuration
  withdrawal?: WithdrawalConfiguration;
}

const STORAGE_KEY = 'zinszins-simulation-config';
const STORAGE_VERSION = 1;

/**
 * Save configuration to localStorage
 */
export function saveConfiguration(config: SavedConfiguration): void {
  try {
    const dataToSave = {
      version: STORAGE_VERSION,
      timestamp: new Date().toISOString(),
      config,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (error) {
    console.error('Failed to save configuration to localStorage:', error);
  }
}

/**
 * Migrate legacy single steuerReduzierenEndkapital to phase-specific settings
 */
function migrateTaxSettings(config: SavedConfiguration): SavedConfiguration {
  // If we have the legacy setting but not the new ones, migrate
  if (config.steuerReduzierenEndkapital !== undefined && 
      config.steuerReduzierenEndkapitalSparphase === undefined &&
      config.steuerReduzierenEndkapitalEntspharphase === undefined) {
    
    const legacyValue = config.steuerReduzierenEndkapital;
    return {
      ...config,
      steuerReduzierenEndkapitalSparphase: legacyValue,
      steuerReduzierenEndkapitalEntspharphase: legacyValue,
    };
  }
  
  // Ensure all phase-specific settings have defaults if missing
  return {
    ...config,
    steuerReduzierenEndkapitalSparphase: config.steuerReduzierenEndkapitalSparphase ?? true,
    steuerReduzierenEndkapitalEntspharphase: config.steuerReduzierenEndkapitalEntspharphase ?? true,
  };
}

/**
 * Load configuration from localStorage
 * Returns null if no configuration exists or if loading fails
 */
export function loadConfiguration(): SavedConfiguration | null {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) {
      return null;
    }

    const parsedData = JSON.parse(savedData);
    
    // Check version compatibility
    if (parsedData.version !== STORAGE_VERSION) {
      console.warn('Configuration version mismatch, using defaults');
      return null;
    }

    // Migrate legacy tax settings
    return migrateTaxSettings(parsedData.config);
  } catch (error) {
    console.error('Failed to load configuration from localStorage:', error);
    return null;
  }
}

/**
 * Clear saved configuration from localStorage
 */
export function clearConfiguration(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear configuration from localStorage:', error);
  }
}

/**
 * Check if configuration exists in localStorage
 */
export function hasConfiguration(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch (error) {
    return false;
  }
}