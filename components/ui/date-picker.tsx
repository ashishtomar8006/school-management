'use client'

import * as React from 'react'
import { format, parse, isValid } from 'date-fns'
import { CalendarIcon, X } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const DATE_FMT = 'yyyy-MM-dd'          // storage format  "2025-06-15"
export const DISP_FMT = 'd MMM yyyy'          // display format  "15 Jun 2025"
export const TIME_FMT = 'HH:mm'               // time storage    "09:30"

export function toDate(v: string | undefined): Date | undefined {
  if (!v) return undefined
  const d = parse(v, DATE_FMT, new Date())
  return isValid(d) ? d : undefined
}

export function fromDate(d: Date | undefined): string {
  return d && isValid(d) ? format(d, DATE_FMT) : ''
}

export function displayDate(v: string | undefined): string {
  const d = toDate(v)
  return d ? format(d, DISP_FMT) : ''
}

// ─── DatePicker ───────────────────────────────────────────────────────────────
// value / onChange use "yyyy-MM-dd" strings (form-friendly)

interface DatePickerProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  className?: string
  error?: boolean
  fromDate?: Date
  toDate?: Date
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  disabled = false,
  clearable = true,
  className,
  error,
  fromDate: minDate,
  toDate: maxDate,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const selected = toDate(value)

  const handleSelect = (day: Date | undefined) => {
    onChange?.(fromDate(day))
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'flex h-9 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background',
            'hover:bg-accent/20 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive',
            className,
          )}
        >
          <span className={cn('flex items-center gap-2 truncate', !selected && 'text-muted-foreground')}>
            <CalendarIcon className="w-4 h-4 shrink-0 text-muted-foreground" />
            {selected ? format(selected, DISP_FMT) : placeholder}
          </span>
          {clearable && selected && (
            <X
              className="w-3.5 h-3.5 shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              onClick={e => { e.stopPropagation(); onChange?.(''); setOpen(false) }}
            />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          defaultMonth={selected}
          fromDate={minDate}
          toDate={maxDate}
          captionLayout="dropdown"
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

// ─── DateRangePicker ──────────────────────────────────────────────────────────
// startValue / endValue / onStartChange / onEndChange use "yyyy-MM-dd" strings

interface DateRangePickerProps {
  startValue?: string
  endValue?: string
  onStartChange?: (v: string) => void
  onEndChange?: (v: string) => void
  startPlaceholder?: string
  endPlaceholder?: string
  disabled?: boolean
  className?: string
  startError?: boolean
  endError?: boolean
}

export function DateRangePicker({
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  startPlaceholder = 'Start date',
  endPlaceholder = 'End date',
  disabled,
  className,
  startError,
  endError,
}: DateRangePickerProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-3', className)}>
      <DatePicker
        value={startValue}
        onChange={onStartChange}
        placeholder={startPlaceholder}
        disabled={disabled}
        error={startError}
        toDate={endValue ? toDate(endValue) : undefined}
      />
      <DatePicker
        value={endValue}
        onChange={onEndChange}
        placeholder={endPlaceholder}
        disabled={disabled}
        error={endError}
        fromDate={startValue ? toDate(startValue) : undefined}
      />
    </div>
  )
}

// ─── TimeInput ────────────────────────────────────────────────────────────────

interface TimeInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export function TimeInput({ className, error, ...props }: TimeInputProps) {
  return (
    <input
      type="time"
      className={cn(
        'flex h-9 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-destructive',
        className,
      )}
      {...props}
    />
  )
}
