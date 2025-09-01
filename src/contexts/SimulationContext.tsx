import React, { useState, useCallback, useMemo } from 'react';
import type { SimulationAnnualType } from '../utils/simulate';
import { SimulationAnnual, simulate } from '../utils/simulate';
import type { ReturnMode, ReturnConfiguration } from '../utils/random-returns';
import type { Sparplan, SparplanElement } from '../utils/sparplan-utils';
import { convertSparplanToElements, initialSparplan } from '../utils/sparplan-utils';
import type { WithdrawalResult } from '../../helpers/withdrawal';
import { SimulationContext } from './SimulationContextValue';

export interface SimulationContextState {
  rendite: number;
  setRendite: (rendite: number) => void;
  steuerlast: number;
  setSteuerlast: (steuerlast: number) => void;
  teilfreistellungsquote: number;
  setTeilfreistellungsquote: (teilfreistellungsquote: number) => void;
  freibetragPerYear: { [year: number]: number };
  setFreibetragPerYear: (freibetragPerYear: { [year: number]: number }) => void;
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
}

export const SimulationProvider = ({ children }: { children: React.ReactNode }) => {
  const [rendite, setRendite] = useState(5);
  const [steuerlast, setSteuerlast] = useState(26.375);
  const [teilfreistellungsquote, setTeilfreistellungsquote] = useState(30);
  const [freibetragPerYear, setFreibetragPerYear] = useState<{ [year: number]: number }>({ 2023: 2000 });
  const [returnMode, setReturnMode] = useState<ReturnMode>('fixed');
  const [averageReturn, setAverageReturn] = useState(7);
  const [standardDeviation, setStandardDeviation] = useState(15);
  const [randomSeed, setRandomSeed] = useState<number | undefined>(undefined);
  const [variableReturns, setVariableReturns] = useState<Record<number, number>>({});
  const [startEnd, setStartEnd] = useState<[number, number]>([2040, 2080]);
  const [sparplan, setSparplan] = useState<Sparplan[]>([initialSparplan]);
  const [simulationAnnual, setSimulationAnnual] = useState<SimulationAnnualType>(SimulationAnnual.yearly);
  const [sparplanElemente, setSparplanElemente] = useState<SparplanElement[]>(
    convertSparplanToElements([initialSparplan], startEnd, simulationAnnual)
  );
  const [simulationData, setSimulationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [withdrawalResults, setWithdrawalResults] = useState<WithdrawalResult | null>(null);

  const yearToday = new Date().getFullYear();

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
  }, [rendite, returnMode, averageReturn, standardDeviation, randomSeed, variableReturns, simulationAnnual, sparplanElemente, startEnd, yearToday, steuerlast, teilfreistellungsquote, freibetragPerYear]);

  const value = useMemo(() => ({
    rendite, setRendite,
    steuerlast, setSteuerlast,
    teilfreistellungsquote, setTeilfreistellungsquote,
    freibetragPerYear, setFreibetragPerYear,
    returnMode, setReturnMode,
    averageReturn, setAverageReturn,
    standardDeviation, setStandardDeviation,
    randomSeed, setRandomSeed,
    variableReturns, setVariableReturns,
    startEnd, setStartEnd,
    sparplan, setSparplan,
    simulationAnnual, setSimulationAnnual,
    sparplanElemente, setSparplanElemente,
    simulationData,
    isLoading,
    withdrawalResults, setWithdrawalResults,
    performSimulation,
  }), [
    rendite, steuerlast, teilfreistellungsquote, freibetragPerYear,
    returnMode, averageReturn, standardDeviation, randomSeed, variableReturns,
    startEnd, sparplan, simulationAnnual, sparplanElemente,
    simulationData, isLoading, withdrawalResults, performSimulation
  ]);

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
};

