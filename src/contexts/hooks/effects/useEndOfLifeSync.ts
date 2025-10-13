import { useEffect } from 'react'

export function useEndOfLifeSync(
  endOfLife: number,
  setStartEnd: (updater: (current: [number, number]) => [number, number]) => void,
) {
  useEffect(() => {
    setStartEnd((currentStartEnd) => {
      if (endOfLife !== currentStartEnd[1]) {
        return [currentStartEnd[0], endOfLife]
      }
      return currentStartEnd
    })
  }, [endOfLife, setStartEnd])
}
