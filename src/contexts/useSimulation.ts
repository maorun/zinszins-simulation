import { useContext } from 'react';
import { SimulationContext } from './SimulationContextValue';
import type { SimulationContextState } from './SimulationContext';

export const useSimulation = (): SimulationContextState => {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
