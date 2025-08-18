import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Star,
  StarOff,
  MapPin,
  Phone,
  Mail,
  Building,
  Calendar,
  DollarSign,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  X
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { Vendor } from '../lib/supabase'
import { VendorForm } from '../components/forms/VendorForm'
import { VendorDetails } from '../components/vendors/VendorDetails'
import { VendorPerformance } from '../components/vendors/VendorPerformance'
import { VendorAssignments } from '../components/vendors/VendorAssignments'

interface VendorStats {
  totalVendors: number
  activeVendors: number
  topRatedVendors: number
  pendingPayments: number
  totalSpent: number
  averageRating: number
  vendorsByCategory: { category: string; count: number }[]
  topPerformingVendors: { vendor: Vendor; rating: number; completedJobs: number }[]
  recentActivity: any[]
}

export function Vendors() {
  const navigate = useNavigate()
  const { userProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [stats, setStats] = useState<VendorStats | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [showForm, setShowForm] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterRating, setFilterRating] = useState('all')

  useEffect(() => {
    if (userProfile?.organization_id) {
      loadVendorData()
    }
  }, [userProfile?.organization_id])

  async function loadVendorData() {
    try {
      setLoading(true)
      
      // Fetch vendors with related data
      const { data: vendorsData } = await supabase
        .from('vendors')
        .select(`
          *,
          vendor_assignments(
            id,
            claim_id,
            status,
            assigned_date,
            completed_date,
            amount,
            rating
          )
        `)
        .eq('organization_id', userProfile?.organization_id)
        .order('created_at', { ascending: false })

      const vendorsResult = vendorsData || []
      
      // Calculate statistics
      const totalVendors = vendorsResult.length
      const activeVendors = vendorsResult.filter(vendor => vendor.status === 'active').length
      const topRatedVendors = vendorsResult.filter(vendor => vendor.rating >= 4.5).length
      
      // Calculate vendor performance stats
      const vendorStats = vendorsResult.map(vendor => {
        const assignments = vendor.vendor_assignments || []
        const completedJobs = assignments.filter(a => a.status === 'completed').length
        const totalRatings = assignments.filter(a => a.rating).length
        const averageRating = totalRatings > 0 
          ? assignments.reduce((sum, a) => sum + (a.rating || 0), 0) / totalRatings 
          : 0
        
        return {
          vendor,
          rating: averageRating,
          completedJobs
        }
      })
      
      const topPerformingVendors = vendorStats
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5)
      
      // Calculate financial metrics
      const totalSpent = vendorsResult.reduce((sum, vendor) => {
        const assignments = vendor.vendor_assignments || []
        return sum + assignments.reduce((assignmentSum, assignment) => 
          assignmentSum + (assignment.amount || 0), 0)
      }, 0)
      
      const pendingPayments = vendorsResult.reduce((sum, vendor) => {
        const assignments = vendor.vendor_assignments || []
        return sum + assignments
          .filter(a => a.status === 'completed' && !a.paid)
          .reduce((assignmentSum, assignment) => assignmentSum + (assignment.amount || 0), 0)
      }, 0)
      
      // Calculate category distribution
      const categoryCounts = vendorsResult.reduce((acc, vendor) => {
        const category = vendor.specialty || vendor.category || 'Other'
        acc[category] = (acc[category] || 0) + 1
        return acc
      }, {} as { [key: string]: number })
      
      // Group by contractor vs expert type
      const typeCounts = vendorsResult.reduce((acc, vendor) => {
        const specialty = vendor.specialty || vendor.category || ''
        const type = contractorCategories.includes(specialty) ? 'Contractors' : 'Experts'
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {} as { [key: string]: number })
      
      const vendorsByCategory = [
        ...Object.entries(typeCounts).map(([category, count]) => ({
          category,
          count: count as number
        })),
        ...Object.entries(categoryCounts)
          .filter(([category]) => category !== 'Other' || categoryCounts[category] > 0)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 8)
          .map(([category, count]) => ({
            category,
            count: count as number
          }))
      ]
      
      const averageRating = vendorStats.length > 0 
        ? vendorStats.reduce((sum, v) => sum + v.rating, 0) / vendorStats.length 
        : 0
      
      setStats({
        totalVendors,
        activeVendors,
        topRatedVendors,
        pendingPayments,
        totalSpent,
        averageRating,
        vendorsByCategory,
        topPerformingVendors,
        recentActivity: []
      })
      
      setVendors(vendorsResult)
    } catch (error) {
      console.error('Error loading vendor data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveVendor = async (data: any) => {
    try {
      const vendorData = {
        ...data,
        organization_id: userProfile?.organization_id
      }

      if (selectedVendor) {
        await supabase
          .from('vendors')
          .update(vendorData)
          .eq('id', selectedVendor.id)
      } else {
        await supabase
          .from('vendors')
          .insert([vendorData])
      }
      
      await loadVendorData()
      setShowForm(false)
      setSelectedVendor(null)
    } catch (error) {
      console.error('Error saving vendor:', error)
    }
  }

  const handleDeleteVendor = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return

    try {
      await supabase
        .from('vendors')
        .delete()
        .eq('id', id)
      
      await loadVendorData()
    } catch (error) {
      console.error('Error deleting vendor:', error)
    }
  }

  const handleToggleFavorite = async (vendor: Vendor) => {
    try {
      await supabase
        .from('vendors')
        .update({ is_preferred: !vendor.is_preferred })
        .eq('id', vendor.id)
      
      await loadVendorData()
    } catch (error) {
      console.error('Error updating vendor favorite status:', error)
    }
  }

  // Filter vendors
  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = !searchTerm || 
      vendor.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.specialties?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = filterCategory === 'all' || 
      vendor.category === filterCategory || 
      vendor.specialty === filterCategory ||
      vendor.specialties?.includes(filterCategory)
    
    const matchesStatus = filterStatus === 'all' || vendor.status === filterStatus
    
    let matchesRating = true
    if (filterRating !== 'all') {
      const rating = vendor.rating || 0
      switch (filterRating) {
        case '5': matchesRating = rating >= 4.5; break
        case '4': matchesRating = rating >= 3.5 && rating < 4.5; break
        case '3': matchesRating = rating >= 2.5 && rating < 3.5; break
        case '2': matchesRating = rating >= 1.5 && rating < 2.5; break
        case '1': matchesRating = rating < 1.5; break
      }
    }
    
    return matchesSearch && matchesCategory && matchesStatus && matchesRating
  })

  const contractorCategories = [
    'General Contractor',
    'Mold Remediation Specialist',
    'Water Mitigation/Restoration',
    'Lead Testing Specialist',
    'Emergency Tarping Service',
    'Roofing Contractor',
    'Plumbing Contractor',
    'Electrical Contractor',
    'HVAC Contractor',
    'Flooring Specialist',
    'Drywall/Painting Contractor',
    'Window/Glass Replacement',
    'Structural Repair',
    'Landscaping/Exterior',
    'Cleaning/Restoration Services'
  ]

  const expertCategories = [
    'Structural Engineer',
    'Environmental Consultant',
    'Public Adjuster',
    'Insurance Consultant',
    'Legal Expert/Attorney',
    'Forensic Accountant',
    'Building Code Consultant',
    'Fire Investigation Expert',
    'Weather Expert/Meteorologist',
    'Construction Consultant',
    'Safety Inspector',
    'Appraisal Expert'
  ]

  const allCategories = [...contractorCategories, ...expertCategories]
  const uniqueCategories = [...new Set(vendors.map(v => v.specialty || v.category).filter(Boolean))]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
          <p className="text-gray-600 mt-1">Manage your network of trusted vendors and service providers</p>
        </div>
        <Button onClick={() => navigate('/vendors/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Vendor
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'directory', label: 'Vendor Directory', icon: Users },
            { id: 'performance', label: 'Performance', icon: TrendingUp },
            { id: 'assignments', label: 'Assignments', icon: Calendar }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  <span>Total Vendors</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-indigo-600">{stats?.totalVendors || 0}</div>
                <p className="text-sm text-gray-600">{stats?.activeVendors || 0} active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  <span>Top Rated</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{stats?.topRatedVendors || 0}</div>
                <div className="flex items-center mt-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 ml-1">
                    {stats?.averageRating.toFixed(1) || '0.0'} avg rating
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span>Total Spent</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  ${stats?.totalSpent.toLocaleString() || '0'}
                </div>
                <p className="text-sm text-gray-600">This year</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-red-600" />
                  <span>Pending Payments</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  ${stats?.pendingPayments.toLocaleString() || '0'}
                </div>
                <p className="text-sm text-gray-600">Outstanding</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vendor Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Vendors by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.vendorsByCategory.map((item, index) => {
                    const percentage = stats.totalVendors > 0 ? (item.count / stats.totalVendors * 100) : 0
                    return (
                      <div key={item.category} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{item.category}</span>
                          <span className="text-gray-600">{item.count} vendors</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Vendors */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Vendors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.topPerformingVendors.map((item, index) => (
                    <div key={item.vendor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-orange-500' :
                          'bg-indigo-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.vendor.company_name}</p>
                          <p className="text-sm text-gray-600">{item.vendor.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="font-medium">{item.rating.toFixed(1)}</span>
                        </div>
                        <p className="text-xs text-gray-600">{item.completedJobs} jobs</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Vendor Directory Tab */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
            
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
            
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Vendor Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVendors.map((vendor) => (
              <Card key={vendor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{vendor.company_name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-sm text-gray-600">{vendor.specialty || vendor.category}</p>
                        {vendor.category && (
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            contractorCategories.includes(vendor.specialty || vendor.category || '')
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {contractorCategories.includes(vendor.specialty || vendor.category || '') ? 'Contractor' : 'Expert'}
                          </span>
                        )}\n                      </div>\n                      {vendor.emergency_available && (
                        <span className="inline-flex items-center px-2 py-1 mt-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                          Emergency Available
                        </span>
                      )}\n                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleFavorite(vendor)}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        {vendor.is_preferred ? (
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        ) : (
                          <StarOff className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        vendor.status === 'active' ? 'bg-green-100 text-green-800' :
                        vendor.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {vendor.status?.charAt(0).toUpperCase() + vendor.status?.slice(1)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Building className="h-4 w-4" />
                      <span>{vendor.contact_name}</span>
                    </div>
                    
                    {vendor.phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{vendor.phone}</span>
                      </div>
                    )}
                    
                    {vendor.email && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{vendor.email}</span>
                      </div>
                    )}
                    
                    {vendor.city && vendor.state && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{vendor.city}, {vendor.state}</span>
                      </div>
                    )}
                    
                    {vendor.rating && (
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= (vendor.rating || 0) 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">({vendor.rating})</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedVendor(vendor)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedVendor(vendor)
                          setShowForm(true)
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteVendor(vendor.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredVendors.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterCategory !== 'all' || filterStatus !== 'all' || filterRating !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Add your first vendor to get started'
                }
              </p>
              {!searchTerm && filterCategory === 'all' && filterStatus === 'all' && filterRating === 'all' && (
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vendor
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <VendorPerformance vendors={vendors} />
      )}

      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <VendorAssignments vendors={vendors} onRefresh={loadVendorData} />
      )}

      {/* Vendor Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedVendor ? 'Edit Vendor' : 'Add New Vendor'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false)
                  setSelectedVendor(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <VendorForm
              vendor={selectedVendor}
              onSave={handleSaveVendor}
              onCancel={() => {
                setShowForm(false)
                setSelectedVendor(null)
              }}
            />
          </div>
        </div>
      )}

      {/* Vendor Details Modal */}
      {selectedVendor && !showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedVendor.company_name}
              </h3>
              <button
                onClick={() => setSelectedVendor(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <VendorDetails vendor={selectedVendor} onEdit={() => setShowForm(true)} />
          </div>
        </div>
      )}
    </div>
  )
}