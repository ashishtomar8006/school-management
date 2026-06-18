'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi, AuthUser, UpdateProfilePayload } from './api/endpoints/auth'
import { setToken, removeToken, getToken } from './api/client'

interface AuthContextType {
  user: AuthUser | null
  profile: Record<string, unknown> | null   // student/teacher/parent profile record
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  updateProfile: (payload: UpdateProfilePayload) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const USER_CACHE_KEY    = 'auth_user'
const PROFILE_CACHE_KEY = 'auth_profile'

function getCachedUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

function setCachedUser(user: AuthUser) {
  localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user))
}

function clearCachedUser() {
  localStorage.removeItem(USER_CACHE_KEY)
  localStorage.removeItem(PROFILE_CACHE_KEY)
}

function getCachedProfile(): Record<string, unknown> | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function setCachedProfile(profile: Record<string, unknown> | null) {
  if (profile) localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile))
  else localStorage.removeItem(PROFILE_CACHE_KEY)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const restore = async () => {
      const token = getToken()
      if (!token) { setIsLoading(false); return }

      const cached        = getCachedUser()
      const cachedProfile = getCachedProfile()
      if (cached) {
        setUser(cached)
        setProfile(cachedProfile)
        setIsLoading(false)
      }

      try {
        const res = await authApi.getMe()
        setUser(res.data.user)
        setProfile(res.data.profile)
        setCachedUser(res.data.user)
        setCachedProfile(res.data.profile)
      } catch {
        if (!cached) {
          removeToken()
          clearCachedUser()
          setUser(null)
          setProfile(null)
        }
      } finally {
        setIsLoading(false)
      }
    }
    restore()
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const res = await authApi.login({ email, password })
      setToken(res.data.token)
      setUser(res.data.user)
      setProfile(res.data.profile)
      setCachedUser(res.data.user)
      setCachedProfile(res.data.profile)
      return true
    } catch {
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    removeToken()
    clearCachedUser()
    setUser(null)
    setProfile(null)
  }, [])

  const updateProfile = useCallback(async (payload: UpdateProfilePayload): Promise<boolean> => {
    try {
      const res = await authApi.updateProfile(payload)
      const updated = res.data.user
      setUser(updated)
      setCachedUser(updated)
      return true
    } catch {
      return false
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, isAuthenticated: !!user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
