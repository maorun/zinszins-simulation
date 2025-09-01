import type { SparplanElement } from "../utils/sparplan-utils";
import { getBasiszinsForYear, calculateVorabpauschale, calculateSteuerOnVorabpauschale } from "../../helpers/steuer.tsx";
import { type ReturnConfiguration, generateRandomReturns } from "./random-returns";

export type SimulationResultElement = {
    startkapital: number;
    zinsen: number;
    endkapital: number;
    bezahlteSteuer: number;
    genutzterFreibetrag: number;
    vorabpauschale: number; // The Vorabpauschale amount for this year
    vorabpauschaleAccumulated: number; // The accumulated Vorabpauschale over all years
}

export type SimulationResult = {
    [year: number]: SimulationResultElement;
};

const freibetrag: {
    [year: number]: number;
} = {
    2023: 2000,
};

export const SimulationAnnual: {
    [key in SimulationAnnualType]: SimulationAnnualType
} = {
    yearly: 'yearly',
    monthly: 'monthly',
} as const

export type SimulationAnnualType = 'yearly' | 'monthly'

export interface SimulateOptions {
    startYear: number;
    endYear: number;
    elements: SparplanElement[];
    returnConfig: ReturnConfiguration;
    steuerlast: number;
    simulationAnnual: SimulationAnnualType;
    teilfreistellungsquote?: number;
    freibetragPerYear?: { [year: number]: number };
  }

function generateYearlyGrowthRates(
    startYear: number,
    endYear: number,
    returnConfig: ReturnConfiguration
  ): Record<number, number> {
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
    const yearlyGrowthRates: Record<number, number> = {};

    switch (returnConfig.mode) {
        case 'fixed': {
          const fixedRate = returnConfig.fixedRate ?? 0.05;
          for (const year of years) {
            yearlyGrowthRates[year] = fixedRate;
          }
          break;
        }
        case 'random': {
          if (returnConfig.randomConfig) {
            const randomReturns = generateRandomReturns(years, returnConfig.randomConfig);
            Object.assign(yearlyGrowthRates, randomReturns);
          }
          break;
        }
        case 'variable': {
          if (returnConfig.variableConfig) {
            for (const year of years) {
              yearlyGrowthRates[year] = returnConfig.variableConfig.yearlyReturns[year] ?? 0.05;
            }
          }
          break;
        }
      }

    return yearlyGrowthRates;
  }

// Implementation
export function simulate(options: SimulateOptions): SparplanElement[] {
    const { elements, startYear, endYear, returnConfig } = options;

    const yearlyGrowthRates = generateYearlyGrowthRates(startYear, endYear, returnConfig);

    // Clear previous simulations
    for (const element of elements) {
      element.simulation = {};
    }

    // Main simulation loop
    for (let year = startYear; year <= endYear; year++) {
      calculateYearlySimulation(year, elements, yearlyGrowthRates[year], options);
    }

    return elements;
  }

  function calculateYearlySimulation(
    year: number,
    elements: SparplanElement[],
    wachstumsrate: number,
    options: SimulateOptions
  ) {
    const { simulationAnnual, steuerlast, teilfreistellungsquote = 0.3, freibetragPerYear } = options;
    const basiszins = getBasiszinsForYear(year);
    const yearlyCalculations: any[] = [];
    let totalPotentialTaxThisYear = 0;

    // Pass 1: Calculate growth and potential tax for each element
    for (const element of elements) {
      if (new Date(element.start).getFullYear() > year) continue;

      const startkapital =
        element.simulation?.[year - 1]?.endkapital ||
        element.einzahlung + (element.type === 'einmalzahlung' ? element.gewinn : 0);

      let endkapitalVorSteuer: number;
      let anteilImJahr = 12;

      if (simulationAnnual === 'monthly' && new Date(element.start).getFullYear() === year) {
        const wachstumsrateMonth = Math.pow(1 + wachstumsrate, 1 / 12) - 1;
        const startMonth = new Date(element.start).getMonth();
        anteilImJahr = 12 - startMonth;
        endkapitalVorSteuer = startkapital * Math.pow(1 + wachstumsrateMonth, anteilImJahr);
      } else {
        endkapitalVorSteuer = startkapital * (1 + wachstumsrate);
      }

      const jahresgewinn = endkapitalVorSteuer - startkapital;
      const vorabpauschaleBetrag = calculateVorabpauschale(
        startkapital,
        endkapitalVorSteuer,
        basiszins,
        anteilImJahr
      );
      const potentialTax = calculateSteuerOnVorabpauschale(
        vorabpauschaleBetrag,
        steuerlast,
        teilfreistellungsquote
      );

      totalPotentialTaxThisYear += potentialTax;
      yearlyCalculations.push({
        element,
        startkapital,
        endkapitalVorSteuer,
        jahresgewinn,
        vorabpauschaleBetrag,
        potentialTax,
      });
    }

    // Pass 2: Apply taxes
    applyTaxes(year, yearlyCalculations, totalPotentialTaxThisYear, freibetragPerYear);
  }

  function applyTaxes(
    year: number,
    yearlyCalculations: any[],
    totalPotentialTaxThisYear: number,
    freibetragPerYear?: { [year: number]: number }
  ) {
    const getFreibetragForYear = (year: number): number => {
      if (freibetragPerYear && freibetragPerYear[year] !== undefined) {
        return freibetragPerYear[year];
      }
      return freibetrag[2023] || 2000;
    };

    const freibetragInYear = getFreibetragForYear(year);
    const totalTaxPaid = Math.max(0, totalPotentialTaxThisYear - freibetragInYear);
    const genutzterFreibetragTotal = Math.min(totalPotentialTaxThisYear, freibetragInYear);

    for (const calc of yearlyCalculations) {
      const taxForElement =
        totalPotentialTaxThisYear > 0
          ? (calc.potentialTax / totalPotentialTaxThisYear) * totalTaxPaid
          : 0;
      const genutzterFreibetragForElement =
        totalPotentialTaxThisYear > 0
          ? (calc.potentialTax / totalPotentialTaxThisYear) * genutzterFreibetragTotal
          : 0;

      const endkapital = calc.endkapitalVorSteuer - taxForElement;
      const vorabpauschaleAccumulated =
        (calc.element.simulation[year - 1]?.vorabpauschaleAccumulated || 0) +
        calc.vorabpauschaleBetrag;

      calc.element.simulation[year] = {
        startkapital: calc.startkapital,
        endkapital,
        zinsen: calc.jahresgewinn,
        bezahlteSteuer: taxForElement,
        genutzterFreibetrag: genutzterFreibetragForElement,
        vorabpauschale: calc.vorabpauschaleBetrag,
        vorabpauschaleAccumulated,
      };
    }
  }

