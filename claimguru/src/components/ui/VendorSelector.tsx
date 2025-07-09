import React, { useState, useEffect } from 'react'
import { Building2, Users, AlertTriangle, Clock, DollarSign, Star } from 'lucide-react'
import { allVendorCategories, getVendorCategoriesForClaimType, VendorCategory } from '../../utils/vendorCategories'
import { supabase, Vendor } from '../../lib/supabase'
import { useToastContext } from '../../contexts/ToastContext'

interface VendorSelectorProps {
  claimType?: string
  selectedVendors: string[]
  onVendorsChange: (vendors: string[]) => void
  emergencyOnly?: boolean
  showRecommendations?: boolean
}

const VendorSelector: React.FC<VendorSelectorProps> = ({
  claimType,
  selectedVendors,
  onVendorsChange,
  emergencyOnly = false,
  showRecommendations = true
}) => {
  const [availableVendors, setAvailableVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'recommended' | 'all' | 'contractors' | 'experts'>('recommended')
  const toast = useToastContext()

  useEffect(() => {
    fetchVendors()
  }, [])

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false })
      
      if (error) throw error
      setAvailableVendors(data || [])
    } catch (error) {
      console.error('Error fetching vendors:', error)
      toast.error('Failed to Load Vendors', 'Unable to load vendor list.')
    } finally {
      setLoading(false)
    }
  }

  const getRecommendedCategories = (): VendorCategory[] => {
    if (!claimType) return []
    return getVendorCategoriesForClaimType(claimType)
  }

  const getFilteredCategories = (): VendorCategory[] => {
    switch (activeTab) {
      case 'recommended':
        return getRecommendedCategories()
      case 'contractors':
        return allVendorCategories.filter(cat => cat.category === 'contractor')
      case 'experts':
        return allVendorCategories.filter(cat => cat.category === 'expert')
      default:
        return allVendorCategories
    }
  }

  const getVendorsForCategory = (categoryId: string): Vendor[] => {
    return availableVendors.filter(vendor => 
      vendor.specialties?.includes(categoryId) || 
      vendor.specialty === categoryId ||
      vendor.services?.includes(categoryId)
    )
  }

  const toggleVendor = (vendorId: string) => {
    const newSelection = selectedVendors.includes(vendorId)
      ? selectedVendors.filter(id => id !== vendorId)
      : [...selectedVendors, vendorId]
    
    onVendorsChange(newSelection)
  }

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'immediate': return 'text-red-600 bg-red-100'
      case 'urgent': return 'text-orange-600 bg-orange-100'
      default: return 'text-blue-600 bg-blue-100'
    }
  }

  const categories = getFilteredCategories()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      {showRecommendations && (
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'recommended', label: 'Recommended', count: getRecommendedCategories().length },
              { key: 'all', label: 'All Categories', count: allVendorCategories.length },
              { key: 'contractors', label: 'Contractors', count: allVendorCategories.filter(c => c.category === 'contractor').length },
              { key: 'experts', label: 'Experts', count: allVendorCategories.filter(c => c.category === 'expert').length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map(category => {
          const categoryVendors = getVendorsForCategory(category.id)
          const hasVendors = categoryVendors.length > 0
          
          return (
            <div key={category.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    category.category === 'contractor' ? 'bg-blue-100' : 'bg-purple-100'
                  }`}>
                    {category.category === 'contractor' ? (
                      <Building2 className={`h-5 w-5 ${
                        category.category === 'contractor' ? 'text-blue-600' : 'text-purple-600'
                      }`} />
                    ) : (
                      <Users className={`h-5 w-5 ${
                        category.category === 'contractor' ? 'text-blue-600' : 'text-purple-600'
                      }`} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.description}</p>
                  </div>
                </div>
                
                {category.urgency && (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    getUrgencyColor(category.urgency)
                  }`}>
                    {category.urgency === 'immediate' && <AlertTriangle className="h-3 w-3 mr-1" />}
                    {category.urgency === 'urgent' && <Clock className="h-3 w-3 mr-1" />}
                    {category.urgency}
                  </span>
                )}
              </div>
              
              {category.typicalCost && (
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span>Typical cost: {category.typicalCost}</span>
                </div>
              )}

              {/* Available Vendors */}
              {hasVendors ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Available Vendors ({categoryVendors.length}):</p>
                  {categoryVendors.slice(0, 3).map(vendor => (
                    <label key={vendor.id} className="flex items-center space-x-3 p-2 border border-gray-100 rounded hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedVendors.includes(vendor.id)}
                        onChange={() => toggleVendor(vendor.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">{vendor.company_name}</span>
                          {vendor.rating && (
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-600">{vendor.rating}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{vendor.contact_phone}</p>
                      </div>
                    </label>
                  ))}
                  {categoryVendors.length > 3 && (
                    <p className="text-xs text-gray-500">+{categoryVendors.length - 3} more vendors available</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded">
                  <p className="text-sm text-gray-500">No vendors available for this category</p>
                  <button className="text-sm text-blue-600 hover:text-blue-800 mt-1">
                    Add Vendor
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-8">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No vendor categories found for this claim type.</p>
          <p className="text-sm text-gray-400 mt-1">Try selecting a different category or claim type.</p>
        </div>
      )}

      {/* Selected Vendors Summary */}
      {selectedVendors.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">
            Selected Vendors ({selectedVendors.length})
          </h4>
          <div className="space-y-1">
            {selectedVendors.map(vendorId => {
              const vendor = availableVendors.find(v => v.id === vendorId)
              return vendor ? (
                <div key={vendorId} className="text-sm text-blue-800">
                  • {vendor.company_name}
                </div>
              ) : null
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default VendorSelector