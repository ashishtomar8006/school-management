'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { schoolSettingsApi, SchoolSettingsData } from './api/endpoints/school-settings'

// ─── Theme colors ──────────────────────────────────────────────────────────────

export interface ThemeColor {
  id: string; name: string
  light: string; dark: string   // oklch values
  hex: string                   // display swatch
}

export const THEME_COLORS: ThemeColor[] = [
  { id: 'teal',   name: 'Teal',   light: 'oklch(0.605 0.2 187)',  dark: 'oklch(0.65 0.2 187)',  hex: '#0d9488' },
  { id: 'blue',   name: 'Blue',   light: 'oklch(0.57 0.22 240)',  dark: 'oklch(0.62 0.22 240)', hex: '#2563eb' },
  { id: 'indigo', name: 'Indigo', light: 'oklch(0.55 0.22 263)',  dark: 'oklch(0.62 0.22 263)', hex: '#4f46e5' },
  { id: 'purple', name: 'Purple', light: 'oklch(0.57 0.22 295)',  dark: 'oklch(0.62 0.22 295)', hex: '#9333ea' },
  { id: 'rose',   name: 'Rose',   light: 'oklch(0.60 0.22 10)',   dark: 'oklch(0.65 0.22 10)',  hex: '#e11d48' },
  { id: 'orange', name: 'Orange', light: 'oklch(0.63 0.22 43)',   dark: 'oklch(0.68 0.22 43)',  hex: '#ea580c' },
  { id: 'amber',  name: 'Amber',  light: 'oklch(0.67 0.20 65)',   dark: 'oklch(0.72 0.20 65)',  hex: '#d97706' },
  { id: 'green',  name: 'Green',  light: 'oklch(0.58 0.20 145)',  dark: 'oklch(0.63 0.20 145)', hex: '#16a34a' },
]

// ─── Types ────────────────────────────────────────────────────────────────────

export type SchoolSettings = SchoolSettingsData

const DEFAULTS: SchoolSettings = {
  schoolName:       'EduManage School',
  tagline:          'Empowering Education',
  address:          '',
  phone:            '',
  email:            '',
  website:          '',
  principalName:    'Principal',
  logoDataUrl:      '',
  signatureDataUrl: '',
  themeColorId:     'teal',
}

// ─── Theme applier ────────────────────────────────────────────────────────────

export function applyTheme(colorId: string) {
  const color  = THEME_COLORS.find(c => c.id === colorId) ?? THEME_COLORS[0]
  const root   = document.documentElement
  const isDark = root.classList.contains('dark')
  const val    = isDark ? color.dark : color.light
  const props  = ['--primary', '--ring', '--sidebar-primary', '--sidebar-ring', '--sidebar-accent-foreground', '--chart-1']
  props.forEach(p => root.style.setProperty(p, val))
}

// ─── Local cache (for instant paint before API responds) ──────────────────────

const CACHE_KEY = 'school_settings_cache'

function readCache(): SchoolSettings | null {
  if (typeof window === 'undefined') return null
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null') } catch { return null }
}

function writeCache(s: SchoolSettings) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(s)) } catch {}
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface SettingsCtx {
  settings:  SchoolSettings
  save:      (patch: Partial<SchoolSettings>) => Promise<void>
  isSaving:  boolean
  isLoading: boolean
}

const Ctx = createContext<SettingsCtx | undefined>(undefined)

export function SchoolSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings,  setSettings]  = useState<SchoolSettings>(readCache() ?? DEFAULTS)
  const [isSaving,  setIsSaving]  = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Apply theme from cache immediately (no flash)
  useEffect(() => {
    const cached = readCache()
    if (cached?.themeColorId) applyTheme(cached.themeColorId)
  }, [])

  // Fetch from server on mount (all users get the same settings)
  useEffect(() => {
    schoolSettingsApi.get()
      .then(res => {
        // Strip null/undefined from DB response so Input value props never receive null
        const cleaned = Object.fromEntries(
          Object.entries(res.data.settings ?? {}).filter(([, v]) => v !== null && v !== undefined)
        )
        const s = { ...DEFAULTS, ...cleaned } as SchoolSettings
        setSettings(s)
        writeCache(s)
        applyTheme(s.themeColorId)
      })
      .catch(() => {
        // Server unavailable — use cache or defaults
        const cached = readCache()
        if (cached) { setSettings(cached); applyTheme(cached.themeColorId) }
      })
      .finally(() => setIsLoading(false))
  }, [])

  const save = useCallback(async (patch: Partial<SchoolSettings>) => {
    setIsSaving(true)
    try {
      const res = await schoolSettingsApi.update(patch)
      const cleaned = Object.fromEntries(
        Object.entries(res.data.settings ?? {}).filter(([, v]) => v !== null && v !== undefined)
      )
      const s = { ...DEFAULTS, ...cleaned } as SchoolSettings
      setSettings(s)
      writeCache(s)
      if (patch.themeColorId) applyTheme(patch.themeColorId)
    } catch {
      // Fallback: apply locally if server fails
      setSettings(prev => {
        const next = { ...prev, ...patch }
        writeCache(next)
        if (patch.themeColorId) applyTheme(patch.themeColorId)
        return next
      })
    } finally {
      setIsSaving(false)
    }
  }, [])

  return (
    <Ctx.Provider value={{ settings, save, isSaving, isLoading }}>
      {children}
    </Ctx.Provider>
  )
}

export function useSchoolSettings() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useSchoolSettings must be inside SchoolSettingsProvider')
  return ctx
}
