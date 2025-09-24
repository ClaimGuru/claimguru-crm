import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { 
  CreditCard, 
  Calendar, 
  Users, 
  HardDrive, 
  Zap,
  ArrowUpRight,
  Settings
} from 'lucide-react'
import toast from 'react-hot-toast'

interface SubscriptionDetails {
  id: number
  stripe_subscription_id: string
  status: string
  plan_type: string
  price: number
  assignable_users_limit: number
  admin_users_limit: number
  office_staff_limit: number
  sales_users_limit: number
  current_storage_gb: number
  used_storage_gb: number
  created_at: string
}

export default function SubscriptionManagement() {
  const { user, userProfile } = useAuth()
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [managing, setManaging] = useState(false)

  const fetchSubscriptionDetails = async () => {
    try {
      if (!userProfile?.organization_id) return

      const { data, error } = await supabase
        .from('organization_subscription_summary')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      setSubscription(data)
    } catch (error) {
      console.error('Failed to fetch subscription details:', error)
      toast.error('Failed to load subscription details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscriptionDetails()
  }, [userProfile?.organization_id])

  const handleManageBilling = async () => {
    if (!user?.email) {
      toast.error('User email not found')
      return
    }

    setManaging(true)

    try {
      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        body: {
          action: 'create_portal_session',
          customerEmail: user.email
        }
      })

      if (error) throw error

      if (data.data?.portalUrl) {
        window.location.href = data.data.portalUrl
      }
    } catch (error: any) {
      console.error('Failed to create portal session:', error)
      toast.error(error.message || 'Failed to open billing portal')
    } finally {
      setManaging(false)
    }
  }

  const handleUpgradePlan = () => {
    // Navigate to billing page for plan selection
    window.location.href = '/billing'
  }

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(2)}`
  }

  const getStorageUsagePercentage = () => {
    if (!subscription) return 0
    return Math.min((subscription.used_storage_gb / subscription.current_storage_gb) * 100, 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!subscription) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Active Subscription</h3>
          <p className="text-gray-600 mb-6">
            Start with a plan that fits your needs and scale as you grow.
          </p>
          <Button onClick={handleUpgradePlan}>
            Choose a Plan
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Current Plan
            </span>
            <Badge 
              variant={subscription.status === 'active' ? 'default' : 'destructive'}
            >
              {subscription.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {formatPrice(subscription.price)}
              </div>
              <div className="text-sm text-gray-600">per month</div>
              <div className="font-medium capitalize">{subscription.plan_type} Plan</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {subscription.assignable_users_limit}
              </div>
              <div className="text-sm text-gray-600">Assignable Users</div>
              <div className="text-xs text-gray-500">
                Revenue-generating adjusters
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {subscription.current_storage_gb}GB
              </div>
              <div className="text-sm text-gray-600">Total Storage</div>
              <div className="text-xs text-gray-500">
                {subscription.used_storage_gb.toFixed(1)}GB used
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Subscribed since {new Date(subscription.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleManageBilling}
                  disabled={managing}
                >
                  {managing ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Settings className="h-4 w-4 mr-2" />
                  )}
                  Manage Billing
                </Button>
                <Button size="sm" onClick={handleUpgradePlan}>
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Limits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {subscription.assignable_users_limit}
              </div>
              <div className="text-sm text-gray-600">Assignable Users</div>
              <div className="text-xs text-gray-500 mt-1">
                Public Adjusters
              </div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {subscription.admin_users_limit}
              </div>
              <div className="text-sm text-gray-600">Admin Users</div>
              <div className="text-xs text-gray-500 mt-1">
                System management
              </div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {subscription.office_staff_limit}
              </div>
              <div className="text-sm text-gray-600">Office Staff</div>
              <div className="text-xs text-gray-500 mt-1">
                Support functions
              </div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {subscription.sales_users_limit}
              </div>
              <div className="text-sm text-gray-600">Sales Users</div>
              <div className="text-xs text-gray-500 mt-1">
                Lead generation
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Storage Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Used: {subscription.used_storage_gb.toFixed(1)}GB</span>
              <span>Total: {subscription.current_storage_gb}GB</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${getStorageUsagePercentage()}%` }}
              />
            </div>
            
            <div className="text-sm text-gray-600">
              {getStorageUsagePercentage().toFixed(1)}% of storage used
            </div>
            
            {getStorageUsagePercentage() > 80 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800 text-sm">
                  <strong>Storage Warning:</strong> You're using {getStorageUsagePercentage().toFixed(1)}% of your storage. 
                  Consider upgrading your plan or adding additional users for more storage.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}