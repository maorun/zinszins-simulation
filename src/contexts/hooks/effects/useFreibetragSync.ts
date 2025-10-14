import { useEffect } from 'react'
import { updateFreibetragForPlanningMode } from '../../../utils/freibetrag-calculation'

export function useFreibetragSync(
  planningMode: 'individual' | 'couple',
  freibetragPerYear: { [year: number]: number },
  setFreibetragPerYear: (freibetragPerYear: { [year: number]: number }) => void,
) {
  useEffect(() => {
    const updatedFreibetrag = updateFreibetragForPlanningMode(
      freibetragPerYear,
      planningMode,
    )

    const hasChanges = Object.keys(updatedFreibetrag).some(
      year => updatedFreibetrag[parseInt(year)] !== freibetragPerYear[parseInt(year)],
    )

    if (hasChanges) {
      setFreibetragPerYear(updatedFreibetrag)
    }
  }, [planningMode, freibetragPerYear, setFreibetragPerYear])
}
