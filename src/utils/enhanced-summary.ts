import { calculateWithdrawal } from '../../helpers/withdrawal';
import { getEnhancedSummary } from './summary-utils';

export function getEnhancedOverviewSummary(
  simulationData: any,
  startEnd: [number, number],
  withdrawalResults: any,
  rendite: number,
  steuerlast: number,
  teilfreistellungsquote: number,
  withdrawalConfig?: any
) {
  if (!simulationData) return null;

  const startDates = simulationData.sparplanElements.map((el: any) => new Date(el.start).getFullYear());
  const savingsStartYear = Math.min(...startDates);
  const savingsEndYear = startEnd[0];

  let withdrawalResult;
  if (withdrawalResults) {
    withdrawalResult = withdrawalResults;
  } else {
    const { result } = calculateWithdrawal({
      elements: simulationData.sparplanElements,
      startYear: startEnd[0] + 1,
      endYear: startEnd[1],
      strategy: "4prozent",
      returnConfig: { mode: 'fixed', fixedRate: rendite / 100 },
      taxRate: steuerlast / 100,
      teilfreistellungsquote: teilfreistellungsquote / 100
    });
    withdrawalResult = result;
  }

  return getEnhancedSummary(
    simulationData.sparplanElements,
    savingsStartYear,
    savingsEndYear,
    withdrawalResult,
    withdrawalConfig?.useSegmentedWithdrawal,
    withdrawalConfig?.withdrawalSegments
  );
}
