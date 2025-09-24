import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Crown, 
  User, 
  Building, 
  Phone,
  Mail,
  Shield
} from 'lucide-react'
import toast from 'react-hot-toast'

interface UserProfile {
  id: string
  email: string
  first_name?: string
  last_name?: string
  phone_1?: string
  role: string
  user_type: 'assignable_user' | 'admin_user' | 'office_staff' | 'sales_user'
  is_active: boolean
  created_at: string
}

interface SubscriptionLimits {
  assignable_users_limit: number
  admin_users_limit: number
  office_staff_limit: number
  sales_users_limit: number
  plan_type: string
}

const USER_TYPE_CONFIG = {
  assignable_user: {
    name: 'Assignable User (Public Adjuster)',
    description: 'Can have claims assigned and generate revenue',
    icon: Crown,
    color: 'blue'
  },
  admin_user: {
    name: 'Admin User',
    description: 'System management and configuration',
    icon: Shield,
    color: 'purple'
  },
  office_staff: {
    name: 'Office Staff',
    description: 'Support functions (Firm plan only)',
    icon: Building,
    color: 'green'
  },
  sales_user: {
    name: 'Sales User',
    description: 'Lead generation (Firm plan only)',
    icon: Phone,
    color: 'orange'
  }
}

export default function UserManagement() {
  const { user, userProfile } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [subscriptionLimits, setSubscriptionLimits] = useState<SubscriptionLimits | null>(null)
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [selectedUserType, setSelectedUserType] = useState<string>('')

  const fetchData = async () => {
    try {
      if (!userProfile?.organization_id) return

      // Fetch organization users
      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .order('created_at', { ascending: false })

      if (usersError) throw usersError
      setUsers(usersData || [])

      // Fetch subscription limits
      const { data: limitsData, error: limitsError } = await supabase
        .from('organization_subscription_summary')
        .select('assignable_users_limit, admin_users_limit, office_staff_limit, sales_users_limit, plan_type')
        .eq('organization_id', userProfile.organization_id)
        .maybeSingle()

      if (limitsError && limitsError.code !== 'PGRST116') {
        throw limitsError
      }

      setSubscriptionLimits(limitsData)

    } catch (error) {
      console.error('Failed to fetch user management data:', error)
      toast.error('Failed to load user management data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [userProfile?.organization_id])

  const getUserCountByType = (userType: string) => {
    return users.filter(u => u.user_type === userType && u.is_active).length
  }

  const canAddUserType = (userType: string) => {
    if (!subscriptionLimits) return false
    
    const currentCount = getUserCountByType(userType)
    
    switch (userType) {
      case 'assignable_user':
        return currentCount < subscriptionLimits.assignable_users_limit
      case 'admin_user':
        return currentCount < subscriptionLimits.admin_users_limit
      case 'office_staff':
        return currentCount < subscriptionLimits.office_staff_limit && subscriptionLimits.plan_type === 'firm'
      case 'sales_user':
        return currentCount < subscriptionLimits.sales_users_limit && subscriptionLimits.plan_type === 'firm'
      default:
        return false
    }
  }

  const handleInviteUser = async (userType: string) => {
    if (!canAddUserType(userType)) {
      toast.error('User limit reached for this user type')
      return
    }
    
    setSelectedUserType(userType)
    setShowInviteModal(true)
  }

  const handleDeactivateUser = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: false })
        .eq('id', userId)

      if (error) throw error

      toast.success('User deactivated successfully')
      fetchData()
    } catch (error) {
      console.error('Failed to deactivate user:', error)
      toast.error('Failed to deactivate user')
    }
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
      {/* User Type Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(USER_TYPE_CONFIG).map(([type, config]) => {
          const currentCount = getUserCountByType(type)
          const maxCount = subscriptionLimits ? 
            (subscriptionLimits as any)[`${type}s_limit`] || 0 : 0
          const canAdd = canAddUserType(type)
          const Icon = config.icon

          return (
            <Card key={type} className="relative">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 bg-${config.color}-100 rounded-lg flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 text-${config.color}-600`} />
                  </div>
                  <Badge variant={currentCount >= maxCount ? 'destructive' : 'default'}>
                    {currentCount}/{maxCount}
                  </Badge>
                </div>
                
                <h3 className="font-semibold text-sm mb-1">{config.name}</h3>
                <p className="text-xs text-gray-600 mb-3">{config.description}</p>
                
                <Button
                  size="sm"
                  onClick={() => handleInviteUser(type)}
                  disabled={!canAdd}
                  className="w-full"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Current Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.filter(u => u.is_active).map((user) => {
              const typeConfig = USER_TYPE_CONFIG[user.user_type]
              const Icon = typeConfig?.icon || User

              return (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 bg-${typeConfig?.color || 'gray'}-100 rounded-lg flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 text-${typeConfig?.color || 'gray'}-600`} />
                    </div>
                    
                    <div>
                      <div className="font-medium">
                        {user.first_name && user.last_name 
                          ? `${user.first_name} ${user.last_name}`
                          : user.email
                        }
                      </div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                      <Badge className="mt-1">
                        {typeConfig?.name || user.user_type}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    {user.id !== user?.id && (
                      <Button 
                        size="sm" 
                        variant="danger"
                        onClick={() => handleDeactivateUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
            
            {users.filter(u => u.is_active).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No active team members found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Subscription Information */}
      {subscriptionLimits && (
        <Card>
          <CardHeader>
            <CardTitle>Current Plan Limits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {subscriptionLimits.assignable_users_limit}
                </div>
                <div className="text-sm text-gray-600">Assignable Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {subscriptionLimits.admin_users_limit}
                </div>
                <div className="text-sm text-gray-600">Admin Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {subscriptionLimits.office_staff_limit}
                </div>
                <div className="text-sm text-gray-600">Office Staff</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {subscriptionLimits.sales_users_limit}
                </div>
                <div className="text-sm text-gray-600">Sales Users</div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t text-center">
              <Badge className="mr-2">Current Plan: {subscriptionLimits.plan_type}</Badge>
              <Button size="sm" variant="outline">
                Upgrade Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invite User Modal would go here */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Invite {USER_TYPE_CONFIG[selectedUserType as keyof typeof USER_TYPE_CONFIG]?.name}
            </h3>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  className="w-full p-2 border rounded-lg"
                  placeholder="user@example.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  placeholder="John"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  placeholder="Doe"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowInviteModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Send Invitation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}