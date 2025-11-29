/**
 * Example scenarios for Progressionsvorbehalt
 */
export const EXAMPLE_SCENARIOS = [
  {
    name: 'Elternzeit (1 Jahr)',
    description: 'Elterngeld während Elternzeit',
    yearlyIncome: 12000,
    incomeType: 'elterngeld',
  },
  {
    name: 'Kurzarbeit (6 Monate)',
    description: 'Kurzarbeitergeld bei 50% Kurzarbeit',
    yearlyIncome: 6000,
    incomeType: 'kurzarbeitergeld',
  },
  {
    name: 'Arbeitslosigkeit (kurz)',
    description: 'Arbeitslosengeld I für 3 Monate',
    yearlyIncome: 4500,
    incomeType: 'arbeitslosengeld',
  },
] as const

export type ExampleScenario = (typeof EXAMPLE_SCENARIOS)[number]
