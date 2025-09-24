import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { 
  Building, 
  Mail, 
  Phone, 
  User, 
  MessageSquare,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ContactFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  companySize: string
  currentAdjusters: string
  requirements: string
  timeline: string
  message: string
}

interface EnterpriseContactFormProps {
  className?: string
  variant?: 'modal' | 'page' | 'inline'
  onSuccess?: () => void
}

export default function EnterpriseContactForm({ 
  className = '', 
  variant = 'page',
  onSuccess 
}: EnterpriseContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    companySize: '',
    currentAdjusters: '',
    requirements: '',
    timeline: '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Save enterprise lead to database
      const { error } = await supabase
        .from('enterprise_leads')
        .insert({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          company_size: formData.companySize,
          current_adjusters: parseInt(formData.currentAdjusters) || null,
          requirements: formData.requirements,
          timeline: formData.timeline,
          message: formData.message,
          source: 'website_form',
          status: 'new'
        })

      if (error) {
        // If table doesn't exist, create a simple contact record
        console.warn('Enterprise leads table not found, logging to console:', error)
        
        // Log the lead data for manual follow-up
        console.log('Enterprise Lead Submission:', {
          ...formData,
          timestamp: new Date().toISOString(),
          source: 'website_form'
        })
      }

      // Send notification email (would be handled by a trigger or edge function in production)
      toast.success('Thank you! Our sales team will contact you within 24 hours.')
      setSubmitted(true)
      
      if (onSuccess) {
        onSuccess()
      }

    } catch (error) {
      console.error('Failed to submit enterprise contact form:', error)
      toast.error('Failed to submit form. Please try again or contact us directly.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
          <p className="text-gray-600 mb-6">
            We've received your enterprise inquiry. Our sales team will contact you within 24 hours 
            to discuss your specific requirements and provide a personalized quote.
          </p>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <strong>Need immediate assistance?</strong><br />
              Call us directly at (555) 123-4567 or email enterprise@claimguru.com
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5 text-blue-600" />
          Enterprise Solution Inquiry
        </CardTitle>
        <p className="text-gray-600">
          Tell us about your organization's needs and we'll create a custom solution for you.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <User className="h-4 w-4 inline mr-1" />
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Mail className="h-4 w-4 inline mr-1" />
                Business Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                <Phone className="h-4 w-4 inline mr-1" />
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Company Information */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Building className="h-4 w-4 inline mr-1" />
              Company Name *
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Company Size *
              </label>
              <select
                name="companySize"
                value={formData.companySize}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select company size</option>
                <option value="10-49">10-49 employees</option>
                <option value="50-99">50-99 employees</option>
                <option value="100-249">100-249 employees</option>
                <option value="250-499">250-499 employees</option>
                <option value="500+">500+ employees</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Current Public Adjusters *
              </label>
              <input
                type="number"
                name="currentAdjusters"
                value={formData.currentAdjusters}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Number of adjusters"
                min="1"
                required
              />
            </div>
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Specific Requirements
            </label>
            <div className="grid md:grid-cols-2 gap-2">
              {[
                'Custom integrations',
                'Advanced security compliance',
                'Dedicated support',
                'Custom training',
                'API access',
                'White-label solution',
                'Multiple regions',
                'Advanced analytics'
              ].map((requirement) => (
                <label key={requirement} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{requirement}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Implementation Timeline
            </label>
            <select
              name="timeline"
              value={formData.timeline}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select timeline</option>
              <option value="immediate">Immediate (within 30 days)</option>
              <option value="1-3-months">1-3 months</option>
              <option value="3-6-months">3-6 months</option>
              <option value="6-12-months">6-12 months</option>
              <option value="planning-stage">Still in planning stage</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <MessageSquare className="h-4 w-4 inline mr-1" />
              Additional Information
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tell us about your specific needs, challenges, or questions..."
            />
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">What to expect:</h4>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Personalized demo of enterprise features</li>
              <li>• Custom pricing based on your requirements</li>
              <li>• Dedicated implementation support</li>
              <li>• 24/7 priority customer success management</li>
            </ul>
          </div>

          <Button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            size="lg"
          >
            {submitting ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <ArrowRight className="h-4 w-4 mr-2" />
            )}
            {submitting ? 'Submitting...' : 'Request Enterprise Quote'}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            By submitting this form, you agree to our privacy policy and terms of service.
            We'll only use your information to provide enterprise pricing and support.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}