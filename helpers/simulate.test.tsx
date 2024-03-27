import { describe, expect, test } from "vitest";
import type { SparplanElement } from "~/components/SparplanEingabe";
import { SimulationAnnual, simulate, yearlyCalculation } from "./simulate";

describe("yearly", () => {
  describe("yearly calculation", () => {
    test("one year", () => {
      expect(
        yearlyCalculation(
          {
            start: "2023-01-01",
            type: "einmalzahlung",
            einzahlung: 1000,
            gewinn: 0,
            simulation: {},
          },
          2023,
          0.05,
          0.26375,
          2000,
        ),
      ).toEqual({
        start: "2023-01-01",
        type: "einmalzahlung",
        einzahlung: 1000,
        gewinn: 0,
        simulation: {
          2023: {
            bezahlteSteuer: 0,
            endkapital: 1050,
            genutzterFreibetrag: 12.49,
            startkapital: 1000,
            zinsen: 50,
          },
        },
      });
    });
  });
  describe("simulate", () => {
    test("should simulate a year", () => {
      const elements: SparplanElement[] = [
        {
          start: "2023-01-01",
          type: "einmalzahlung",
          einzahlung: 1000,
          gewinn: 0,
          simulation: {},
        },
      ];
      const nelements = simulate(
        2023,
        2023,
        elements,
        0.05,
        0.26375,
        SimulationAnnual.yearly,
      );
      expect(nelements).toEqual([
        {
          start: "2023-01-01",
          type: "einmalzahlung",
          einzahlung: 1000,
          gewinn: 0,
          simulation: {
            2023: {
              startkapital: 1000,
              endkapital: 1050,
              zinsen: 50,
              bezahlteSteuer: 0,
              genutzterFreibetrag: 12.49,
            },
          },
        },
      ]);
    });
    test("should simulate 2 years", () => {
      const elements: SparplanElement[] = [
        {
          start: "2023-01-01",
          type: "einmalzahlung",
          einzahlung: 1000,
          gewinn: 0,
          simulation: {},
        },
      ];
      const nelements = simulate(
        2023,
        2024,
        elements,
        0.05,
        0.26375,
        SimulationAnnual.yearly,
      );
      expect(nelements[0].simulation).toEqual({
        2023: {
          startkapital: 1000,
          endkapital: 1050,
          zinsen: 50,
          bezahlteSteuer: 0,
          genutzterFreibetrag: 0,
          verbleibenderFreibetrag: 1987.51,
        },
        2024: {
          startkapital: 1050,
          endkapital: 1099.04,
          zinsen: 50,
          bezahlteSteuer: 0,
          genutzterFreibetrag: 12.49,
        },
      });
    });
  });
});
