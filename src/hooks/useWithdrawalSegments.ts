import { useState, useCallback } from 'react'
import {
  validateWithdrawalSegments,
  createDefaultWithdrawalSegment,
  type WithdrawalSegment,
} from '../utils/segmented-withdrawal'

function getNewSegmentYears(segments: WithdrawalSegment[], withdrawalStartYear: number) {
  let startYear: number
  let endYear: number

  if (segments.length === 0) {
    startYear = Math.round(withdrawalStartYear) - 1
    endYear = startYear + 4
  }
  else {
    const sortedSegments = [...segments].sort((a, b) => a.startYear - b.startYear)
    const lastSegment = sortedSegments[sortedSegments.length - 1]
    startYear = Math.round(lastSegment.endYear) + 1
    endYear = startYear + 4
  }
  return { startYear, endYear }
}

function move(segments: WithdrawalSegment[], segmentId: string, direction: 'up' | 'down') {
  const currentIndex = segments.findIndex(s => s.id === segmentId)
  const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

  if (newIndex < 0 || newIndex >= segments.length) {
    return segments
  }

  const newSegments = [...segments]
  const temp = newSegments[currentIndex]
  newSegments[currentIndex] = newSegments[newIndex]
  newSegments[newIndex] = temp
  return newSegments
}

export function useWithdrawalSegments(
  segments: WithdrawalSegment[],
  onSegmentsChange: (segments: WithdrawalSegment[]) => void,
  withdrawalStartYear: number,
  withdrawalEndYear: number,
) {
  const [errors, setErrors] = useState<string[]>([])

  const validateAndUpdateSegments = useCallback((newSegments: WithdrawalSegment[]) => {
    const validationErrors = validateWithdrawalSegments(newSegments, withdrawalStartYear, withdrawalEndYear)
    setErrors(validationErrors)
    onSegmentsChange(newSegments)
  }, [withdrawalStartYear, withdrawalEndYear, onSegmentsChange])

  const addSegment = () => {
    const newId = `segment_${Date.now()}`
    const { startYear, endYear } = getNewSegmentYears(segments, withdrawalStartYear)
    const newSegment = createDefaultWithdrawalSegment(newId, `Phase ${segments.length + 1}`, startYear, endYear)
    validateAndUpdateSegments([...segments, newSegment])
  }

  const removeSegment = (segmentId: string) => {
    validateAndUpdateSegments(segments.filter(s => s.id !== segmentId))
  }

  const updateSegment = (segmentId: string, updates: Partial<WithdrawalSegment>) => {
    const newSegments = segments.map(s => (s.id === segmentId ? { ...s, ...updates } : s))
    validateAndUpdateSegments(newSegments)
  }

  const moveSegmentUp = (segmentId: string) => {
    validateAndUpdateSegments(move(segments, segmentId, 'up'))
  }

  const moveSegmentDown = (segmentId: string) => {
    validateAndUpdateSegments(move(segments, segmentId, 'down'))
  }

  return {
    errors,
    addSegment,
    removeSegment,
    updateSegment,
    moveSegmentUp,
    moveSegmentDown,
  }
}
