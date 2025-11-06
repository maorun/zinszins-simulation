import React from 'react'
import type { Sparplan } from '../utils/sparplan-utils'

// Helper functions for date formatting and handling
export const formatDateForInput = (date: Date | string | null, format: string): string => {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  if (format === 'yyyy-MM') {
    return d.toISOString().substring(0, 7) // YYYY-MM
  }
  return d.toISOString().substring(0, 10) // YYYY-MM-DD (default)
}

export const handleDateChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  format: string,
  onChange: (date: Date | null) => void,
) => {
  const inputValue = e.target.value
  if (!inputValue) {
    onChange(null)
    return
  }

  // Create date from input value
  const date = new Date(inputValue + (format === 'yyyy-MM' ? '-01' : ''))
  if (!isNaN(date.getTime())) {
    onChange(date)
  }
}

// Helper function for number input handling
export const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
  const value = e.target.value
  onChange(value ? value : '')
}

// Helper to check if sparplan is an Einmalzahlung (single payment)
export const isSinglePaymentSparplan = (sparplan: Sparplan): boolean => {
  if (!sparplan.end) return false
  return new Date(sparplan.start).getTime() === new Date(sparplan.end).getTime()
}

// Helper to check if we're editing a Sparplan (not a single payment)
export const isEditingSparplan = (editingSparplan: Sparplan | null): boolean => {
  if (!editingSparplan) return false
  return !isSinglePaymentSparplan(editingSparplan)
}

// Helper to check if we're editing a single payment
export const isEditingSinglePayment = (editingSparplan: Sparplan | null): boolean => {
  if (!editingSparplan) return false
  return isSinglePaymentSparplan(editingSparplan)
}
