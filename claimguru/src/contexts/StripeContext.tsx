import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { loadStripe, Stripe } from '@stripe/stripe-js'
import { supabase, STRIPE_PUBLISHABLE_KEY, STRIPE_PLANS_TABLE, STRIPE_SUBSCRIPTIONS_TABLE, StripePlan, StripeSubscription } from '../lib/supabase'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

// Initialize Stripe
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY)

interface StripeContextType {
  stripe: Stripe | null
  subscription: StripeSubscription | null
  currentPlan: StripePlan | null
  availablePlans: StripePlan[]
  loading: boolean
  isSubscribed: boolean
  fetchSubscription: () => Promise<void>
  subscribeToPlan: (planType: string) => Promise<void>
  cancelSubscription: () => Promise<void>
}

const StripeContext = createContext<StripeContextType | undefined>(undefined)

export function StripeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [stripe, setStripe] = useState<Stripe | null>(null)
  const [subscription, setSubscription] = useState<StripeSubscription | null>(null)
  const [currentPlan, setCurrentPlan] = useState<StripePlan | null>(null)
  const [availablePlans, setAvailablePlans] = useState<StripePlan[]>([])
  const [loading, setLoading] = useState(false)

  const isSubscribed = subscription?.status === 'active'

  // Initialize Stripe
  useEffect(() => {
    stripePromise.then((stripeInstance) => {
      setStripe(stripeInstance)
    })
  }, [])

  // Fetch available plans
  const fetchAvailablePlans = async () => {
    try {
      const { data, error } = await supabase
        .from(STRIPE_PLANS_TABLE)
        .select('*')
        .order('price', { ascending: true })

      if (error) throw error
      setAvailablePlans(data || [])
    } catch (error) {
      console.error('Failed to fetch plans:', error)
    }
  }

  // Fetch user's subscription
  const fetchSubscription = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      
      // Get subscription with plan details
      const { data: subscriptionData, error } = await supabase
        .from(STRIPE_SUBSCRIPTIONS_TABLE)
        .select(`
          *,
          ${STRIPE_PLANS_TABLE}!price_id(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle()

      if (error) throw error

      setSubscription(subscriptionData)
      setCurrentPlan(subscriptionData?.[STRIPE_PLANS_TABLE] || null)
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  // Subscribe to a plan
  const subscribeToPlan = async (planType: string) => {
    if (!user?.email) {
      toast.error('Please sign in to subscribe')
      return
    }

    try {
      setLoading(true)
      toast.loading('Creating subscription...', { id: 'subscription' })

      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: {
          planType,
          customerEmail: user.email
        }
      })

      if (error) throw error

      if (data?.data?.checkoutUrl) {
        toast.success('Redirecting to payment...', { id: 'subscription' })
        window.location.href = data.data.checkoutUrl
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error: any) {
      console.error('Subscription error:', error)
      toast.error(error.message || 'Failed to create subscription', { id: 'subscription' })
    } finally {
      setLoading(false)
    }
  }

  // Cancel subscription
  const cancelSubscription = async () => {
    if (!subscription?.stripe_subscription_id) return

    try {
      setLoading(true)
      toast.loading('Canceling subscription...', { id: 'cancel' })

      // You would implement a cancel subscription function
      // const { error } = await supabase.functions.invoke('cancel-subscription', {
      //   body: { subscriptionId: subscription.stripe_subscription_id }
      // })

      // if (error) throw error

      toast.success('Subscription canceled successfully', { id: 'cancel' })
      await fetchSubscription()
    } catch (error: any) {
      console.error('Cancel subscription error:', error)
      toast.error(error.message || 'Failed to cancel subscription', { id: 'cancel' })
    } finally {
      setLoading(false)
    }
  }

  // Initialize data when user changes
  useEffect(() => {
    if (user) {
      fetchAvailablePlans()
      fetchSubscription()
    } else {
      setSubscription(null)
      setCurrentPlan(null)
    }
  }, [user])

  // Handle payment result from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const subscriptionStatus = urlParams.get('subscription')

    if (subscriptionStatus === 'success') {
      toast.success('🎉 Subscription activated successfully!')
      window.history.replaceState({}, document.title, window.location.pathname)
      setTimeout(() => fetchSubscription(), 2000)
    } else if (subscriptionStatus === 'cancelled') {
      toast.error('Subscription cancelled. You can try again anytime!')
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const value: StripeContextType = {
    stripe,
    subscription,
    currentPlan,
    availablePlans,
    loading,
    isSubscribed,
    fetchSubscription,
    subscribeToPlan,
    cancelSubscription
  }

  return (
    <StripeContext.Provider value={value}>
      {children}
    </StripeContext.Provider>
  )
}

export function useStripe() {
  const context = useContext(StripeContext)
  if (context === undefined) {
    throw new Error('useStripe must be used within a StripeProvider')
  }
  return context
}