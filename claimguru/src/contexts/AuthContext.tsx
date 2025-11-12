import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { UserProfile } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  needsOnboarding: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, userData?: any) => Promise<any>
  signOut: () => Promise<any>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

  // Demo mode - Set to true to use test user, false for real authentication
  const isDemoMode = true

  // Demo user configuration (matches existing database)
  const demoUser = {
    id: 'd03912b1-c00e-4915-b4fd-90a2e17f62a2',
    email: 'josh@dcsclaim.com',
    organization_id: '6b7b6902-4cf0-40a1-bea0-f5c1dd9fa2d5'
  } as const

  // Load user on mount (one-time check)
  useEffect(() => {
    async function loadUser() {
      try {
        if (isDemoMode) {
          // Demo mode: Use hardcoded demo user with real database access
          console.log('🔧 Demo Mode: Using test user josh@dcsclaim.com')
          const mockUser = {
            id: demoUser.id,
            email: demoUser.email,
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString()
          } as User
          
          setUser(mockUser)
          
          // Load real profile from database
          const demoProfile: UserProfile = {
            id: demoUser.id,
            organization_id: demoUser.organization_id,
            email: demoUser.email,
            first_name: 'Josh',
            last_name: 'Osteen',
            role: 'admin',
            permissions: ['all'],
            is_active: true,
            timezone: 'America/New_York',
            date_format: 'MM/DD/YYYY',
            notification_email: true,
            notification_sms: false,
            two_factor_enabled: false,
            country: 'United States',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          setUserProfile(demoProfile)
          setNeedsOnboarding(false)
          setLoading(false)
        } else {
          // Production mode: Use real Supabase authentication
          const { data: { user } } = await supabase.auth.getUser()
          setUser(user)
          
          if (user) {
            await loadUserProfile(user.id)
          } else {
            setLoading(false)
          }
        }
      } catch (error) {
        console.error('Error loading user:', error)
        setLoading(false)
      }
    }
    loadUser()

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // NEVER use any async operations directly in callback - use setTimeout
        setUser(session?.user || null)
        
        if (session?.user) {
          // Use setTimeout to avoid deadlocks
          setTimeout(() => {
            loadUserProfile(session.user.id)
          }, 0)
        } else {
          setUserProfile(null)
          setNeedsOnboarding(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function loadUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('Error loading user profile:', error)
        return
      }

      setUserProfile(data)
      // Check if user needs onboarding (no profile or incomplete profile)
      setNeedsOnboarding(!data || !data.first_name || !data.last_name || !data.organization_id)
    } catch (error) {
      console.error('Error loading user profile:', error)
      setNeedsOnboarding(true)
    }
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw error
    }

    return data
  }

  async function signUp(email: string, password: string, userData?: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.protocol}//${window.location.host}/auth/callback`
      }
    })

    if (error) {
      throw error
    }

    // Mark that user needs onboarding
    if (data.user) {
      setNeedsOnboarding(true)
    }

    return data
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
    setUserProfile(null)
  }

  async function updateProfile(updates: Partial<UserProfile>) {
    if (!user) {
      throw new Error('No user logged in')
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .maybeSingle()

    if (error) {
      throw error
    }

    setUserProfile(data)
    // Update onboarding status
    setNeedsOnboarding(!data || !data.first_name || !data.last_name || !data.organization_id)
  }

  async function refreshProfile() {
    if (user) {
      await loadUserProfile(user.id)
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    needsOnboarding,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}