import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Users, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Zap
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Plan {
  id: number
  price_id: string
  plan_type: string
  price: number
  monthly_limit: number
}

interface Subscription {
  id: number
  user_id: string
  stripe_subscription_id: string
  stripe_customer_id: string
  price_id: string
  status: string
  created_at: string
  updated_at: string
  stripe_plans?: Plan
}

const PLAN_FEATURES = {
  individual: {
    name: 'Individual Plan',
    description: 'Perfect for solo public adjusters',
    features: [
      '1 Assignable User (Public Adjuster)',
      '1 Admin User included',
      '1TB storage',
      'Unlimited claims',
      'Basic client portal',
      'Email automations'
    ],
    popular: false
  },
  firm: {
    name: 'Firm Plan',
    description: 'Ideal for growing adjustment firms',
    features: [
      '3 Assignable Users',
      '3 Admin Users included',
      '2 Office Staff included',
      '1 Sales User included',
      '5TB base storage',
      'Team collaboration tools',
      'API access',
      'Priority support'
    ],
    popular: true
  },
  additional_user: {
    name: 'Additional User',
    description: 'Expand your team capacity',
    features: [
      '1 Additional Assignable User',
      '1 Free Admin User included',
      '+1TB storage per user',
      'Full platform access'
    ],
    popular: false
  }
}

export default function Billing() {
  const { user, userProfile } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      // Fetch available plans
      const { data: plansData, error: plansError } = await supabase
        .from('stripe_plans')
        .select('*')
        .order('price', { ascending: true })

      if (plansError) throw plansError
      setPlans(plansData || [])

      // Fetch user's current subscription if they have one
      if (user) {
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('stripe_subscriptions')
          .select(`
            *,
            stripe_plans!price_id(
              id,
              price_id,
              plan_type,
              price,
              monthly_limit
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle()

        if (subscriptionError && subscriptionError.code !== 'PGRST116') {
          throw subscriptionError
        }

        setSubscription(subscriptionData)
      }
    } catch (error) {
      console.error('Failed to fetch billing data:', error)
      toast.error('Failed to load billing information')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Handle payment result from URL params
    const urlParams = new URLSearchParams(window.location.search)
    const subscriptionStatus = urlParams.get('subscription')

    if (subscriptionStatus === 'success') {
      toast.success('🎉 Subscription activated successfully!')
      window.history.replaceState({}, document.title, window.location.pathname)
      
      setTimeout(() => {
        fetchData()
      }, 2000)
    } else if (subscriptionStatus === 'cancelled') {
      toast.error('Subscription cancelled. You can try again anytime!')
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [user])

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

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(2)}`
  }

  const getCurrentPlanName = () => {
    if (!subscription?.stripe_plans) return null
    const planType = subscription.stripe_plans.plan_type
    return PLAN_FEATURES[planType as keyof typeof PLAN_FEATURES]?.name || planType
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Billing & Subscription" 
        description="Manage your subscription and billing preferences"
      />

      {/* Current Subscription Status */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{getCurrentPlanName()}</p>
                  <p className="text-sm text-gray-500">Current plan</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">{formatPrice(subscription.stripe_plans?.price || 0)}/month</p>
                  <p className="text-sm text-gray-500">Monthly cost</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">{subscription.stripe_plans?.monthly_limit || 0} users</p>
                  <p className="text-sm text-gray-500">User limit</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Badge 
                    variant={subscription.status === 'active' ? 'default' : 'destructive'}
                    className="mb-2"
                  >
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </Badge>
                  <p className="text-sm text-gray-500">
                    Subscribed since {new Date(subscription.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Manage Billing
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Active Subscription */}
      {!subscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              No Active Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              You don't have an active subscription. Choose a plan below to get started with ClaimGuru's full features.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const planFeatures = PLAN_FEATURES[plan.plan_type as keyof typeof PLAN_FEATURES]
          const isCurrentPlan = subscription?.price_id === plan.price_id
          const isSubscribed = !!subscription && subscription.status === 'active'
          
          return (
            <Card 
              key={plan.id} 
              className={`relative ${planFeatures?.popular ? 'ring-2 ring-blue-500' : ''} ${isCurrentPlan ? 'bg-blue-50 border-blue-200' : ''}`}
            >
              {planFeatures?.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-3 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{planFeatures?.name || plan.plan_type}</CardTitle>
                <p className="text-gray-600 text-sm">{planFeatures?.description}</p>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{formatPrice(plan.price)}</span>
                  <span className="text-gray-500">/month</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {planFeatures?.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {isCurrentPlan ? (
                  <Button 
                    className="w-full" 
                    variant="outline" 
                    disabled
                  >
                    Current Plan
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={() => handleSubscribe(plan.plan_type)}
                    disabled={subscribing === plan.plan_type || (isSubscribed && plan.plan_type !== 'additional_user')}
                    variant={planFeatures?.popular ? 'primary' : 'outline'}
                  >
                    {subscribing === plan.plan_type ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <ArrowRight className="h-4 w-4 mr-2" />
                    )}
                    {subscribing === plan.plan_type 
                      ? 'Processing...' 
                      : plan.plan_type === 'additional_user' 
                        ? 'Add User' 
                        : isSubscribed 
                          ? 'Upgrade' 
                          : 'Get Started'
                    }
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Enterprise Plan Call-to-Action */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Need an Enterprise Solution?</h3>
            <p className="text-gray-600 mb-4">
              For large organizations with custom requirements, contact us for personalized pricing and features.
            </p>
            <Button variant="outline">
              <CreditCard className="h-4 w-4 mr-2" />
              Contact Sales
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}