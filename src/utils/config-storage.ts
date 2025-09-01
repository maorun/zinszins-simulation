import type { ReturnMode } from './random-returns';
import type { Sparplan } from './sparplan-utils';
import type { SimulationAnnualType } from './simulate';

/**
 * Configuration interface for values that should be persisted
 */
export interface SavedConfiguration {
  rendite: number;
  steuerlast: number;
  teilfreistellungsquote: number;
  freibetragPerYear: { [year: number]: number };
  returnMode: ReturnMode;
  averageReturn: number;
  standardDeviation: number;
  randomSeed?: number;
  variableReturns: Record<number, number>;
  startEnd: [number, number];
  sparplan: Sparplan[];
  simulationAnnual: SimulationAnnualType;
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

    return parsedData.config;
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