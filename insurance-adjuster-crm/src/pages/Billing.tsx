import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { 
  CreditCard, 
  Users, 
  HardDrive, 
  Crown, 
  Check, 
  AlertCircle,
  Plus,
  X
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, PLANS_TABLE, SUBSCRIPTIONS_TABLE } from '../lib/supabase'
import { toast } from 'react-hot-toast'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

interface Plan {
  planType: string
  name: string
  price: number
  monthlyLimit: number
}

interface Subscription {
  id: string
  userId: string
  stripeSubscriptionId: string
  stripeCustomerId: string
  priceId: string
  status: string
  plan: Plan
}

export function Billing() {
  const { user, organization } = useAuth()
  const [plans, setPlans] = useState<Plan[]>([])
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState<string | null>(null)

  const PLAN_FEATURES = {
    individual: {
      name: 'Individual Plan',
      price: '$99',
      features: [
        '1 Assignable User + 1 Admin User',
        '1TB Base Storage',
        'Unlimited Claims',
        'Basic Client Portal',
        'Email Automations',
        'Standard Support'
      ],
      additionalUsers: '$59/month per additional assignable user'
    },
    firm: {
      name: 'Firm Plan',
      price: '$249',
      features: [
        '3 Assignable Users + 3 Admin Users',
        '2 Office Staff + 1 Sales User',
        '5TB Base Storage + 1TB per user',
        'Advanced Client Portal',
        'Team Collaboration Tools',
        'API Access',
        'Priority Support',
        'Advanced Reporting'
      ],
      additionalUsers: '$59/month per additional assignable user'
    },
    enterprise: {
      name: 'Enterprise Plan',
      price: 'Contact Us',
      features: [
        'Unlimited Users',
        'Unlimited Storage',
        'Custom Features',
        'Dedicated Support',
        'Custom Integrations',
        'White Label Options',
        'Advanced Analytics',
        'SLA Guarantee'
      ],
      additionalUsers: 'Custom pricing'
    }
  }

  useEffect(() => {
    fetchSubscriptionData()
  }, [user])

  const fetchSubscriptionData = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Fetch available plans
      const { data: plansData, error: plansError } = await supabase
        .from(PLANS_TABLE)
        .select('*')
        .order('price')
      
      if (plansError) throw plansError
      setPlans(plansData || [])

      // Fetch current subscription
      const { data: subscriptionData, error: subError } = await supabase
        .from(SUBSCRIPTIONS_TABLE)
        .select(`
          *,
          ${PLANS_TABLE}!price_id(
            plan_type,
            name,
            price,
            monthly_limit
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle()
      
      if (subError && subError.code !== 'PGRST116') {
        throw subError
      }
      
      setCurrentSubscription(subscriptionData)
      
    } catch (error: any) {
      console.error('Error fetching subscription data:', error)
      toast.error('Failed to load subscription data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (planType: string) => {
    if (!user) {
      toast.error('Please sign in to subscribe')
      return
    }

    setSubscribing(planType)

    try {
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: {
          planType,
          customerEmail: user.email
        }
      })

      if (error) throw error

      if (data.data?.checkoutUrl) {
        toast.success('Redirecting to payment...')
        window.location.href = data.data.checkoutUrl
      }
    } catch (error: any) {
      console.error('Subscription error:', error)
      toast.error(error.message || 'Failed to create subscription')
    } finally {
      setSubscribing(null)
    }
  }

  const formatPrice = (price: number) => {
    return (price / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
        <p className="text-gray-600 mt-1">
          Manage your subscription plan and billing information
        </p>
      </div>

      {/* Current Subscription */}
      {currentSubscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              <span>Current Subscription</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {currentSubscription.plan?.name || 'Unknown Plan'}
                </h3>
                <p className="text-gray-600">
                  {formatPrice(currentSubscription.plan?.price || 0)}/month
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800">
                {currentSubscription.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Summary */}
      {organization && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Assignable Users</p>
                  <p className="text-2xl font-bold">3 / 3</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <HardDrive className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Storage Used</p>
                  <p className="text-2xl font-bold">2.4 / 5 TB</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Next Billing</p>
                  <p className="text-2xl font-bold">Oct 24</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {currentSubscription ? 'Upgrade Your Plan' : 'Choose Your Plan'}
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {Object.entries(PLAN_FEATURES).map(([planType, planInfo]) => {
            const isCurrentPlan = currentSubscription?.plan?.planType === planType
            const isEnterprise = planType === 'enterprise'
            
            return (
              <Card 
                key={planType} 
                className={`relative ${planType === 'firm' ? 'border-blue-500 border-2' : ''}`}
              >
                {planType === 'firm' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-3 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{planInfo.name}</CardTitle>
                  <div className="text-3xl font-bold text-gray-900">
                    {planInfo.price}
                    {planInfo.price !== 'Contact Us' && (
                      <span className="text-lg font-normal text-gray-600">/month</span>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {planInfo.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="pt-4 border-t">
                    <p className="text-xs text-gray-500 mb-4">
                      <strong>Additional Users:</strong> {planInfo.additionalUsers}
                    </p>
                    
                    {isCurrentPlan ? (
                      <Button className="w-full" disabled>
                        Current Plan
                      </Button>
                    ) : isEnterprise ? (
                      <Button className="w-full" variant="outline">
                        Contact Sales
                      </Button>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={() => handleSubscribe(planType)}
                        disabled={subscribing === planType}
                      >
                        {subscribing === planType ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Processing...
                          </>
                        ) : (
                          `Subscribe to ${planInfo.name}`
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Billing Information */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-gray-600">Payment Method</span>
              <span className="font-medium">**** **** **** 4242</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-gray-600">Billing Email</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <span className="text-gray-600">Next Billing Date</span>
              <span className="font-medium">October 24, 2024</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>Need Help?</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Questions about your subscription or need to make changes? We're here to help.
          </p>
          <div className="flex space-x-3">
            <Button variant="outline">
              Contact Support
            </Button>
            <Button variant="outline">
              View Documentation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}