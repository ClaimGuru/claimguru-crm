import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface SignupFormProps {
  onToggleMode: () => void
}

export function SignupForm({ onToggleMode }: SignupFormProps) {
  const { signUp } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleInputChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // Validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    // Email validation to prevent bounces
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      return
    }

    // Warn about test emails (but still allow them for development)
    if (formData.email.includes('test') && !formData.email.includes('@minimax.com')) {
      console.warn('Using test email - ensure this is a valid address to prevent bounces')
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Use the AuthContext signUp function
      await signUp(formData.email, formData.password)
      
      setSuccess('Account created successfully! Please check your email to confirm your account.')
      
      // Clear form
      setFormData({
        email: '',
        password: '',
        confirmPassword: ''
      })
      
    } catch (error: any) {
      setError(error.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
        <CardDescription className="text-center">
          Start your free 30-day trial with ClaimGuru
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-md">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">{success}</span>
            </div>
          )}
          
          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="your@email.com"
            required
          />
          
          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder="Create a password"
            required
          />
          
          <Input
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            placeholder="Confirm your password"
            required
          />
          
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            loading={loading}
          >
            Start Free Trial
          </Button>
          
          <p className="text-xs text-gray-500 text-center mt-2">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
            No credit card required for your 30-day free trial.
          </p>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onToggleMode}
              className="text-blue-600 hover:underline font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}