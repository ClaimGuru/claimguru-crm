import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export function AuthCallback() {
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    handleAuthCallback()
  }, [])

  async function handleAuthCallback() {
    try {
      const hashFragment = window.location.hash
      const errorParam = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')

      // Check for error parameters first
      if (errorParam) {
        setError(errorDescription || errorParam)
        setLoading(false)
        return
      }

      // Handle email confirmation with hash fragment
      if (hashFragment && hashFragment.length > 0) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(hashFragment)

        if (error) {
          console.error('Error exchanging code for session:', error)
          setError(error.message)
          setLoading(false)
          return
        }

        if (data.session && data.user) {
          console.log('Successfully authenticated user:', data.user.email)
          
          // Check if user profile exists
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle()

          if (profileError) {
            console.error('Error loading user profile:', profileError)
          }

          // If no profile exists, try to create it using the edge function
          if (!profile) {
            console.log('No user profile found, attempting to create...')
            try {
              const userData = data.user.user_metadata || {}
              const { data: setupData, error: setupError } = await supabase.functions.invoke('setup-new-user', {
                body: {
                  userId: data.user.id,
                  email: data.user.email,
                  firstName: userData.first_name || '',
                  lastName: userData.last_name || '',
                  companyName: userData.company_name || 'New Organization',
                  phone: userData.phone || ''
                }
              })

              if (setupError) {
                console.error('Error setting up user profile:', setupError)
              } else {
                console.log('User profile created successfully')
              }
            } catch (setupError) {
              console.error('Error during user setup:', setupError)
            }
          }

          setSuccess(true)
          setLoading(false)
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard')
          }, 2000)
          return
        }
      }

      // If we get here, something went wrong
      setError('No valid authentication data found. Please try signing in again.')
      setLoading(false)
      
    } catch (error: any) {
      console.error('Error during auth callback:', error)
      setError(error.message || 'An unexpected error occurred')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Confirming your account...</h2>
            <p className="text-gray-600">Please wait while we verify your email address.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold text-gray-900">
              Email Confirmed Successfully!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              Your account has been verified. You're being redirected to your dashboard...
            </p>
            <Button 
              onClick={() => navigate('/dashboard')}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold text-gray-900">
            Confirmation Failed
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-red-600 mb-6">
            {error}
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/auth')}
              className="w-full"
            >
              Back to Sign In
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}