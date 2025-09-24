import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Card } from '../components/ui/Card'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { CheckCircle, ArrowRight, Building, User, MapPin, Phone, Mail, Briefcase } from 'lucide-react'
import toast from 'react-hot-toast'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
}

const steps: OnboardingStep[] = [
  {
    id: 'profile',
    title: 'Personal Information',
    description: 'Tell us about yourself',
    icon: User
  },
  {
    id: 'practice',
    title: 'Practice Details',
    description: 'Information about your adjusting practice',
    icon: Briefcase
  },
  {
    id: 'preferences',
    title: 'Preferences',
    description: 'Customize your experience',
    icon: CheckCircle
  }
]

export function OnboardingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    phone: '',
    
    // Practice Details
    licenseNumber: '',
    firmName: '',
    practiceType: 'individual', // individual or firm
    yearsExperience: '',
    specialties: [] as string[],
    
    // Address Information
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    
    // Preferences
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    notificationEmail: true,
    notificationSms: false,
    
    // Subscription
    selectedPlan: 'individual'
  })

  const specialtyOptions = [
    'Residential Property',
    'Commercial Property',
    'Water Damage',
    'Fire Damage',
    'Wind/Hail Damage',
    'Flood Claims',
    'Contents Claims',
    'Business Interruption',
    'Liability Claims'
  ]

  useEffect(() => {
    if (!user) {
      navigate('/auth')
      return
    }
    
    // Pre-fill email from auth
    if (user.email && !formData.firstName) {
      setFormData(prev => ({ ...prev, email: user.email }))
    }
  }, [user, navigate, formData.firstName])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }))
  }

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0: // Personal Information
        return formData.firstName && formData.lastName && formData.phone
      case 1: // Practice Details
        return formData.licenseNumber && formData.city && formData.state
      case 2: // Preferences
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        handleComplete()
      }
    } else {
      toast.error('Please fill in all required fields')
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    
    try {
      // Create organization if firm or individual practice
      let organizationId = null
      
      if (formData.practiceType === 'firm' && formData.firmName) {
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: formData.firmName,
            type: 'firm',
            email: user?.email,
            address_line_1: formData.addressLine1,
            address_line_2: formData.addressLine2,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zipCode,
            country: 'US',
            subscription_tier: formData.selectedPlan,
            subscription_status: 'trial',
            company_code: formData.firmName.replace(/\s+/g, '').toLowerCase()
          })
          .select()
          .single()
          
        if (orgError) throw orgError
        organizationId = orgData.id
      } else {
        // Create individual organization
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: `${formData.firstName} ${formData.lastName} Adjusting`,
            type: 'individual',
            email: user?.email,
            address_line_1: formData.addressLine1,
            address_line_2: formData.addressLine2,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zipCode,
            country: 'US',
            subscription_tier: formData.selectedPlan,
            subscription_status: 'trial',
            company_code: `${formData.firstName}${formData.lastName}`.toLowerCase()
          })
          .select()
          .single()
          
        if (orgError) throw orgError
        organizationId = orgData.id
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: user?.id,
          organization_id: organizationId,
          email: user?.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          address_line_1: formData.addressLine1,
          address_line_2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          country: 'US',
          role: formData.practiceType === 'firm' ? 'admin' : 'adjuster',
          license_number: formData.licenseNumber,
          is_active: true,
          timezone: formData.timezone,
          notification_email: formData.notificationEmail,
          notification_sms: formData.notificationSms
        })
        
      if (profileError) throw profileError

      toast.success('Welcome to ClaimGuru! Your account has been set up successfully.')
      navigate('/dashboard')
      
    } catch (error: any) {
      console.error('Onboarding error:', error)
      toast.error(error.message || 'Failed to complete setup. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Smith"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>
        )
        
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="licenseNumber">Adjuster License Number *</Label>
              <Input
                id="licenseNumber"
                value={formData.licenseNumber}
                onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                placeholder="PA-12345"
              />
            </div>
            
            <div>
              <Label>Practice Type</Label>
              <div className="flex space-x-4 mt-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="practiceType"
                    value="individual"
                    checked={formData.practiceType === 'individual'}
                    onChange={(e) => handleInputChange('practiceType', e.target.value)}
                  />
                  <span>Individual Practice</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="practiceType"
                    value="firm"
                    checked={formData.practiceType === 'firm'}
                    onChange={(e) => handleInputChange('practiceType', e.target.value)}
                  />
                  <span>Firm/Team</span>
                </label>
              </div>
            </div>
            
            {formData.practiceType === 'firm' && (
              <div>
                <Label htmlFor="firmName">Firm Name</Label>
                <Input
                  id="firmName"
                  value={formData.firmName}
                  onChange={(e) => handleInputChange('firmName', e.target.value)}
                  placeholder="Smith Adjusting Group"
                />
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="addressLine1">Address Line 1</Label>
                <Input
                  id="addressLine1"
                  value={formData.addressLine1}
                  onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                  placeholder="123 Main St"
                />
              </div>
              <div>
                <Label htmlFor="addressLine2">Address Line 2</Label>
                <Input
                  id="addressLine2"
                  value={formData.addressLine2}
                  onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                  placeholder="Suite 100"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Miami"
                />
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <select
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select State</option>
                  <option value="FL">Florida</option>
                  <option value="TX">Texas</option>
                  <option value="CA">California</option>
                  <option value="NY">New York</option>
                  {/* Add more states as needed */}
                </select>
              </div>
              <div>
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  placeholder="33101"
                />
              </div>
            </div>
            
            <div>
              <Label>Areas of Expertise</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {specialtyOptions.map((specialty) => (
                  <label key={specialty} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.specialties.includes(specialty)}
                      onChange={() => handleSpecialtyToggle(specialty)}
                    />
                    <span className="text-sm">{specialty}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )
        
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label>Select Your Plan</Label>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div 
                  className={`p-4 cursor-pointer border-2 rounded-lg ${
                    formData.selectedPlan === 'individual' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`} 
                  onClick={() => handleInputChange('selectedPlan', 'individual')}
                >
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Individual</h3>
                    <div className="text-2xl font-bold text-blue-600 mb-2">$15/month</div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Up to 25 active claims</li>
                      <li>• AI document analysis</li>
                      <li>• Client portal</li>
                      <li>• Basic reporting</li>
                    </ul>
                  </div>
                </div>
                
                <div 
                  className={`p-4 cursor-pointer border-2 rounded-lg ${
                    formData.selectedPlan === 'firm' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`} 
                  onClick={() => handleInputChange('selectedPlan', 'firm')}
                >
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Firm</h3>
                    <div className="text-2xl font-bold text-blue-600 mb-2">$50/month</div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Unlimited claims</li>
                      <li>• Multiple users</li>
                      <li>• Advanced AI</li>
                      <li>• Custom reporting</li>
                    </ul>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Start with a 30-day free trial. You can change plans anytime.
              </p>
            </div>
            
            <div>
              <Label>Notification Preferences</Label>
              <div className="space-y-3 mt-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.notificationEmail}
                    onChange={(e) => handleInputChange('notificationEmail', e.target.checked)}
                  />
                  <span>Email notifications for important updates</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.notificationSms}
                    onChange={(e) => handleInputChange('notificationSms', e.target.checked)}
                  />
                  <span>SMS notifications for urgent matters</span>
                </label>
              </div>
            </div>
          </div>
        )
        
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to ClaimGuru!
          </h1>
          <p className="text-gray-600">
            Let's set up your account to get you started with managing claims more efficiently.
          </p>
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = index === currentStep
            const isCompleted = index < currentStep
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isCompleted ? 'bg-green-500 border-green-500 text-white' :
                  isActive ? 'bg-blue-500 border-blue-500 text-white' :
                  'bg-white border-gray-300 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`w-12 h-1 mx-2 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
        
        {/* Step Content */}
        <Card className="p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {steps[currentStep].title}
            </h2>
            <p className="text-gray-600">
              {steps[currentStep].description}
            </p>
          </div>
          
          {renderStepContent()}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={loading || !validateCurrentStep()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : currentStep === steps.length - 1 ? (
                'Complete Setup'
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}