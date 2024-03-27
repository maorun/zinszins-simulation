import { describe, expect, test } from "vitest";
import { vorabpauschale } from "./steuer";

describe("vorabpauschale", () => {
  test("vorabpauschale should calculate the correct flat rate interest", () => {
    const result1 = vorabpauschale(20100, 20200);
    expect(result1).toEqual({
      basisertrag: 358.78,
      vorabpauschale: 70,
      steuer: 18.46,
      becauseOfFreibetrag: {
        vorabpauschale: 0,
        steuer: 0,
        freibetrag: 1930,
      },
    });
  });
  test("multiple by 10", () => {
    const result2 = vorabpauschale(201000, 202000);
    expect(result2).toEqual({
      basisertrag: 3587.85,
      vorabpauschale: 700,
      steuer: 184.63,
      becauseOfFreibetrag: {
        vorabpauschale: 0,
        steuer: 0,
        freibetrag: 1300,
      },
    });
  });
  test("bis start", () => {
    const result3 = vorabpauschale(200000, 204000);
    expect(result3).toEqual({
      basisertrag: 3570,
      vorabpauschale: 2499,
      steuer: 659.11,
      becauseOfFreibetrag: {
        vorabpauschale: 499,
        steuer: 131.61,
        freibetrag: 0,
      },
    });
  });

  test("big gewinn", () => {
    const result3 = vorabpauschale(50000, 500010);
    expect(result3).toEqual({
      basisertrag: 892.5,
      vorabpauschale: 624.75,
      steuer: 164.78,
      becauseOfFreibetrag: {
        vorabpauschale: 0,
        steuer: 0,
        freibetrag: 1375.25,
      },
    });
  });
  test("1000 to 1050", () => {
    const result3 = vorabpauschale(1000, 1050);
    expect(result3).toEqual({
      basisertrag: 17.84,
      vorabpauschale: 12.49,
      steuer: 3.29,
      becauseOfFreibetrag: {
        vorabpauschale: 0,
        steuer: 0,
        freibetrag: 1987.51,
      },
    });
  });
  test("small gewinn", () => {
    const result3 = vorabpauschale(5000, 5010);
    expect(result3).toEqual({
      basisertrag: 89.24,
      vorabpauschale: 7,
      steuer: 1.85,
      becauseOfFreibetrag: {
        vorabpauschale: 0,
        steuer: 0,
        freibetrag: 1993,
      },
    });
  });
});
