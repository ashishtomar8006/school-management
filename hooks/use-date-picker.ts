'use client'

import { useState, useCallback } from 'react'
import { fromDate, toDate, displayDate, DATE_FMT } from '@/components/ui/date-picker'

/**
 * Standalone date-picker state hook (for non-react-hook-form usage).
 * Stores value as a "yyyy-MM-dd" string internally.
 */
export function useDatePicker(initial?: string) {
  const [value, setValue] = useState<string>(initial ?? '')

  const onChange = useCallback((v: string) => setValue(v), [])
  const clear    = useCallback(() => setValue(''), [])

  return {
    value,          // "yyyy-MM-dd" string — use in API payloads
    onChange,       // (v: string) => void  — pass to DatePicker
    clear,
    date: toDate(value),          // Date | undefined — for logic
    display: displayDate(value),  // "15 Jun 2025" — for display
    isEmpty: !value,
  }
}

/**
 * Date-range state hook for start + end date pairs.
 */
export function useDateRangePicker(initialStart?: string, initialEnd?: string) {
  const [startValue, setStart] = useState<string>(initialStart ?? '')
  const [endValue,   setEnd]   = useState<string>(initialEnd   ?? '')

  const onStartChange = useCallback((v: string) => setStart(v), [])
  const onEndChange   = useCallback((v: string) => setEnd(v), [])
  const clear         = useCallback(() => { setStart(''); setEnd('') }, [])

  return {
    startValue,
    endValue,
    onStartChange,
    onEndChange,
    clear,
    startDate: toDate(startValue),
    endDate:   toDate(endValue),
    displayStart: displayDate(startValue),
    displayEnd:   displayDate(endValue),
    hasRange: !!(startValue && endValue),
  }
}
