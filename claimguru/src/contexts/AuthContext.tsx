import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { UserProfile } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, userData: any) => Promise<any>
  signOut: () => Promise<any>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
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

  // Demo mode for testing - enabled for comprehensive audit
  const isDemoMode = true // Enable demo mode for testing

  // Load user on mount (one-time check)
  useEffect(() => {
    async function loadUser() {
      try {
        if (isDemoMode) {
          // Provide demo user profile for demo mode
          const demoUserProfile: UserProfile = {
            id: 'd03912b1-c00e-4915-b4fd-90a2e17f62a2',
            organization_id: '12345678-1234-5678-9012-123456789012', // Demo organization UUID 
            email: 'demo@claimguru.com',
            first_name: 'Demo',
            last_name: 'User',
            title: 'Claims Adjuster',
            role: 'adjuster',
            permissions: ['read', 'write', 'admin'],
            is_active: true,
            timezone: 'America/New_York',
            date_format: 'MM/DD/YYYY',
            notification_email: true,
            notification_sms: false,
            two_factor_enabled: false,
            country: 'US',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          setUserProfile(demoUserProfile)
          // Set a mock user object for demo mode
          setUser({
            id: 'd03912b1-c00e-4915-b4fd-90a2e17f62a2',
            email: 'demo@claimguru.com',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            email_confirmed_at: new Date().toISOString(),
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            confirmation_sent_at: undefined,
            confirmed_at: new Date().toISOString(),
            email_change_sent_at: undefined,
            email_change_token: undefined,
            email_change_confirm_status: 0,
            identities: [],
            invited_at: undefined,
            last_sign_in_at: new Date().toISOString(),
            phone: undefined,
            phone_change_sent_at: undefined,
            phone_change_token: undefined,
            phone_confirmed_at: undefined,
            recovery_sent_at: undefined,
            role: '',
            new_email: undefined,
            new_phone: undefined
          } as User)
        } else {
          // Real authentication mode
          const { data: { user } } = await supabase.auth.getUser()
          
          // For testing: Auto-login with josh@dcsclaim.com credentials if no session
          if (!user) {
            try {
              console.log('🔐 No existing session, attempting auto-login for testing...')
              const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: 'josh@dcsclaim.com',
                password: 'BestLyfe#0616'
              })
              
              if (authError) {
                console.error('❌ Auto-login failed:', authError)
                // Fallback to manual login requirement
                setUser(null)
              } else {
                console.log('✅ Auto-login successful:', authData.user?.email)
                setUser(authData.user)
                if (authData.user) {
                  await loadUserProfile(authData.user.id)
                }
              }
            } catch (error) {
              console.error('❌ Error during auto-login:', error)
              setUser(null)
            }
          } else {
            setUser(user)
            if (user) {
              await loadUserProfile(user.id)
            }
          }
        }
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setLoading(false)
      }
    }
    loadUser()

    if (!isDemoMode) {
      // Set up auth listener only for real auth mode
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
          }
        }
      )

      return () => subscription.unsubscribe()
    }
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
    } catch (error) {
      console.error('Error loading user profile:', error)
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

  async function signUp(email: string, password: string, userData: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.protocol}//${window.location.host}/auth/callback`,
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          company_name: userData.companyName,
          phone: userData.phone
        }
      }
    })

    if (error) {
      throw error
    }

    // If user is immediately confirmed, set up organization and profile
    if (data.user && data.session) {
      try {
        const { data: setupData, error: setupError } = await supabase.functions.invoke('setup-new-user', {
          body: {
            userId: data.user.id,
            email: data.user.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            companyName: userData.companyName,
            phone: userData.phone
          }
        })

        if (setupError) {
          console.error('Error setting up user:', setupError)
          // Don't throw error here, as the user account was created successfully
          // The profile can be created later
        }
      } catch (setupError) {
        console.error('Error during user setup:', setupError)
        // Don't throw error here, as the user account was created successfully
      }
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
  }

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}