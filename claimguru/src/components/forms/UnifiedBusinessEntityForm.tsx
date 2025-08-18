/**
 * UNIFIED BUSINESS ENTITY FORM COMPONENT
 * 
 * Consolidates 4 duplicate business entity form components into a single, configurable component:
 * - VendorForm.tsx (vendor/contractor management)
 * - MortgageLenderForm.tsx (mortgage lender details)
 * - InsuranceCarrierForm.tsx (insurance company information)
 * - CarrierPersonnelForm.tsx (insurance company personnel)
 * 
 * Features:
 * - Configurable entity types (vendor, lender, carrier, personnel)
 * - Dynamic field rendering based on entity type
 * - Standardized contact information handling
 * - Array field management (specialties, service areas, etc.)
 * - Rating and status management
 * - License and certification tracking
 * - Address standardization
 */

import React, { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { Textarea } from '../ui/Textarea'
import { Select } from '../ui/Select'
import { Switch } from '../ui/switch'
import { StandardizedAddressInput } from '../ui/StandardizedAddressInput'
import { StandardizedPhoneInput } from '../ui/StandardizedPhoneInput'
import { 
  Building, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  FileText,
  DollarSign,
  Star,
  Tag,
  Globe,
  Calendar,
  Shield,
  Award,
  Users,
  Clock,
  Plus,
  X,
  Save,
  CreditCard,
  Home
} from 'lucide-react'

interface ArrayField {
  id: string
  value: string
}

interface UnifiedBusinessEntityFormProps {
  entity?: any | null
  onSave: (data: any) => Promise<void> | void
  onCancel: () => void
  
  // Configuration props
  entityType: 'vendor' | 'lender' | 'carrier' | 'personnel'
  title?: string
  mode?: 'modal' | 'inline'
  showAdvancedFields?: boolean
}

const entityConfigs = {
  vendor: {
    title: 'Vendor/Contractor',
    icon: Building,
    primaryField: 'company_name',
    contactField: 'contact_name',
    fields: ['company_name', 'contact_name', 'title', 'category', 'specialties', 'hourly_rate', 'fixed_rate', 'payment_terms', 'license_number', 'license_expiry', 'insurance_certificate', 'availability', 'is_preferred']
  },
  lender: {
    title: 'Mortgage Lender',
    icon: Home,
    primaryField: 'lender_name',
    contactField: 'relationship_manager',
    fields: ['lender_name', 'lender_type', 'federal_id', 'nmls_id', 'years_in_business', 'license_states', 'loan_types_offered', 'service_areas', 'processing_time_days', 'satisfaction_rating', 'account_status']
  },
  carrier: {
    title: 'Insurance Carrier',
    icon: Shield,
    primaryField: 'carrier_name',
    contactField: 'primary_contact',
    fields: ['carrier_name', 'carrier_code', 'carrier_group', 'financial_rating', 'specializes_in', 'service_areas', 'payment_terms', 'average_response_time_hours', 'carrier_status']
  },
  personnel: {
    title: 'Carrier Personnel',
    icon: User,
    primaryField: 'first_name',
    contactField: 'last_name',
    fields: ['first_name', 'last_name', 'middle_initial', 'title', 'department', 'job_title', 'personnel_type', 'seniority_level', 'specialties', 'license_number', 'license_state', 'license_type', 'license_expiration', 'territory_coverage', 'caseload_capacity', 'current_caseload', 'availability_status', 'performance_rating', 'communication_style', 'preferred_contact_method', 'response_time_hours']
  }
}

const categoryOptions = {
  vendor: ['Contractor', 'Restoration', 'Roofing', 'Plumbing', 'Electrical', 'HVAC', 'Flooring', 'Legal', 'Medical', 'Engineering', 'Other'],
  lender: ['Bank', 'Credit Union', 'Mortgage Company', 'Broker', 'Government', 'Private Lender'],
  carrier: ['Property', 'Auto', 'Life', 'Health', 'Commercial', 'Specialty'],
  personnel: ['Adjuster', 'Vendor', 'Attorney', 'Supervisor', 'Manager', 'Claims Representative', 'Other']
}

const statusOptions = {
  vendor: ['active', 'inactive', 'preferred', 'blacklisted'],
  lender: ['active', 'inactive', 'preferred', 'under_review'],
  carrier: ['active', 'inactive', 'pending', 'suspended'],
  personnel: ['available', 'busy', 'unavailable', 'on_leave']
}

export function UnifiedBusinessEntityForm({
  entity,
  onSave,
  onCancel,
  entityType,
  title,
  mode = 'modal',
  showAdvancedFields = true
}: UnifiedBusinessEntityFormProps) {
  const config = entityConfigs[entityType]
  const IconComponent = config.icon
  
  const [formData, setFormData] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  
  // Array field states
  const [arrayFields, setArrayFields] = useState<Record<string, ArrayField[]>>({})
  const [arrayInputs, setArrayInputs] = useState<Record<string, string>>({})

  useEffect(() => {
    if (entity) {
      setFormData({ ...entity })
      
      // Initialize array fields
      const arrays: Record<string, ArrayField[]> = {}
      if (entity.specialties) {
        arrays.specialties = entity.specialties.map((spec: string, index: number) => ({
          id: `spec_${index}`,
          value: spec
        }))
      }
      if (entity.service_areas) {
        arrays.service_areas = entity.service_areas.map((area: string, index: number) => ({
          id: `area_${index}`,
          value: area
        }))
      }
      if (entity.license_states) {
        arrays.license_states = entity.license_states.map((state: string, index: number) => ({
          id: `state_${index}`,
          value: state
        }))
      }
      if (entity.loan_types_offered) {
        arrays.loan_types_offered = entity.loan_types_offered.map((type: string, index: number) => ({
          id: `loan_${index}`,
          value: type
        }))
      }
      if (entity.territory_coverage) {
        arrays.territory_coverage = entity.territory_coverage.map((territory: string, index: number) => ({
          id: `territory_${index}`,
          value: territory
        }))
      }
      setArrayFields(arrays)
    } else {
      // Initialize with defaults based on entity type
      const defaults: any = {
        is_active: true,
        country: 'United States',
        preferred_contact_method: 'email'
      }
      
      switch (entityType) {
        case 'vendor':
          defaults.payment_terms = '30'
          defaults.availability = 'available'
          defaults.status = 'active'
          defaults.rating = 0
          break
        case 'lender':
          defaults.response_time_hours = 24
          defaults.processing_time_days = 30
          defaults.satisfaction_rating = 3
          defaults.account_status = 'active'
          break
        case 'carrier':
          defaults.average_response_time_hours = 24
          defaults.carrier_status = 'active'
          defaults.rating = 3
          break
        case 'personnel':
          defaults.personnel_type = 'adjuster'
          defaults.availability_status = 'available'
          defaults.performance_rating = 3
          defaults.response_time_hours = 24
          break
      }
      
      setFormData(defaults)
      setArrayFields({})
    }
  }, [entity, entityType])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddressChange = (address: any) => {
    setFormData(prev => ({
      ...prev,
      address_line_1: address.streetAddress1,
      address_line_2: address.streetAddress2,
      city: address.city,
      state: address.state,
      zip_code: address.zipCode
    }))
  }

  const addArrayItem = (arrayName: string) => {
    const inputValue = arrayInputs[arrayName]?.trim()
    if (inputValue && !arrayFields[arrayName]?.some(item => item.value === inputValue)) {
      const newItem: ArrayField = {
        id: `${arrayName}_${Date.now()}`,
        value: inputValue
      }
      
      setArrayFields(prev => ({
        ...prev,
        [arrayName]: [...(prev[arrayName] || []), newItem]
      }))
      
      setArrayInputs(prev => ({ ...prev, [arrayName]: '' }))
    }
  }

  const removeArrayItem = (arrayName: string, itemId: string) => {
    setArrayFields(prev => ({
      ...prev,
      [arrayName]: prev[arrayName]?.filter(item => item.id !== itemId) || []
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Convert array fields back to simple arrays
      const submitData = { ...formData }
      
      Object.entries(arrayFields).forEach(([key, items]) => {
        submitData[key] = items.map(item => item.value)
      })
      
      // Type-specific data processing
      if (entityType === 'vendor') {
        if (submitData.hourly_rate) submitData.hourly_rate = parseFloat(submitData.hourly_rate)
        if (submitData.fixed_rate) submitData.fixed_rate = parseFloat(submitData.fixed_rate)
        if (submitData.payment_terms) submitData.payment_terms = parseInt(submitData.payment_terms)
      }
      
      if (entityType === 'lender') {
        if (submitData.years_in_business) submitData.years_in_business = parseInt(submitData.years_in_business)
        if (submitData.processing_time_days) submitData.processing_time_days = parseInt(submitData.processing_time_days)
        if (submitData.response_time_hours) submitData.response_time_hours = parseInt(submitData.response_time_hours)
      }
      
      if (entityType === 'carrier') {
        if (submitData.average_response_time_hours) submitData.average_response_time_hours = parseInt(submitData.average_response_time_hours)
      }
      
      if (entityType === 'personnel') {
        if (submitData.caseload_capacity) submitData.caseload_capacity = parseInt(submitData.caseload_capacity)
        if (submitData.current_caseload) submitData.current_caseload = parseInt(submitData.current_caseload)
        if (submitData.response_time_hours) submitData.response_time_hours = parseInt(submitData.response_time_hours)
      }
      
      await onSave(submitData)
    } catch (error) {
      // console.error(`Error saving ${entityType}:`, error)
    } finally {
      setLoading(false)
    }
  }

  const renderBasicInfo = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconComponent className="h-5 w-5" />
          Basic Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary identification fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entityType === 'personnel' ? (
            <>
              <div>
                <Label>First Name <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.first_name || ''}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="First name"
                  required
                />
              </div>
              <div>
                <Label>Last Name <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.last_name || ''}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="Last name"
                  required
                />
              </div>
            </>
          ) : (
            <div className="md:col-span-2">
              <Label>{config.primaryField.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} <span className="text-red-500">*</span></Label>
              <Input
                value={formData[config.primaryField] || ''}
                onChange={(e) => handleInputChange(config.primaryField, e.target.value)}
                placeholder={`Enter ${config.primaryField.replace('_', ' ')}`}
                required
              />
            </div>
          )}
        </div>
        
        {/* Secondary fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(entityType === 'vendor' || entityType === 'personnel') && (
            <div>
              <Label>Title/Position</Label>
              <Input
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Job title or position"
              />
            </div>
          )}
          
          {entityType === 'personnel' && (
            <div>
              <Label>Department</Label>
              <Input
                value={formData.department || ''}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder="Department"
              />
            </div>
          )}
          
          {(entityType === 'vendor' || entityType === 'personnel') && (
            <div>
              <Label>Category/Type</Label>
              <Select 
                value={formData[entityType === 'vendor' ? 'category' : 'personnel_type'] || ''} 
                onValueChange={(value) => handleInputChange(entityType === 'vendor' ? 'category' : 'personnel_type', value)}
              >
                <option value="">Select category</option>
                {categoryOptions[entityType].map(option => (
                  <option key={option} value={option.toLowerCase().replace(' ', '_')}>
                    {option}
                  </option>
                ))}
              </Select>
            </div>
          )}
          
          {entityType === 'lender' && (
            <>
              <div>
                <Label>Lender Type</Label>
                <Select 
                  value={formData.lender_type || ''} 
                  onValueChange={(value) => handleInputChange('lender_type', value)}
                >
                  <option value="">Select type</option>
                  {categoryOptions.lender.map(option => (
                    <option key={option} value={option.toLowerCase().replace(' ', '_')}>
                      {option}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Federal ID</Label>
                <Input
                  value={formData.federal_id || ''}
                  onChange={(e) => handleInputChange('federal_id', e.target.value)}
                  placeholder="Federal tax ID"
                />
              </div>
              <div>
                <Label>NMLS ID</Label>
                <Input
                  value={formData.nmls_id || ''}
                  onChange={(e) => handleInputChange('nmls_id', e.target.value)}
                  placeholder="NMLS identification number"
                />
              </div>
            </>
          )}
          
          {entityType === 'carrier' && (
            <>
              <div>
                <Label>Carrier Code</Label>
                <Input
                  value={formData.carrier_code || ''}
                  onChange={(e) => handleInputChange('carrier_code', e.target.value)}
                  placeholder="Carrier code"
                />
              </div>
              <div>
                <Label>Carrier Group</Label>
                <Input
                  value={formData.carrier_group || ''}
                  onChange={(e) => handleInputChange('carrier_group', e.target.value)}
                  placeholder="Parent company or group"
                />
              </div>
              <div>
                <Label>Financial Rating</Label>
                <Input
                  value={formData.financial_rating || ''}
                  onChange={(e) => handleInputChange('financial_rating', e.target.value)}
                  placeholder="A.M. Best rating"
                />
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const renderContactInfo = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Contact Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Primary Email <span className="text-red-500">*</span></Label>
            <Input
              type="email"
              value={formData.primary_email || formData.email || ''}
              onChange={(e) => handleInputChange(formData.primary_email ? 'primary_email' : 'email', e.target.value)}
              placeholder="email@example.com"
              required
            />
          </div>
          
          {showAdvancedFields && (
            <div>
              <Label>Secondary Email</Label>
              <Input
                type="email"
                value={formData.secondary_email || ''}
                onChange={(e) => handleInputChange('secondary_email', e.target.value)}
                placeholder="secondary@example.com"
              />
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Primary Phone <span className="text-red-500">*</span></Label>
            <Input
              type="tel"
              value={formData.phone_1 || formData.phone || formData.office_phone || ''}
              onChange={(e) => handleInputChange(
                formData.phone_1 ? 'phone_1' : formData.phone ? 'phone' : 'office_phone', 
                e.target.value
              )}
              placeholder="(555) 123-4567"
              required
            />
          </div>
          
          <div>
            <Label>Secondary Phone</Label>
            <Input
              type="tel"
              value={formData.phone_2 || formData.mobile || formData.mobile_phone || ''}
              onChange={(e) => handleInputChange(
                formData.phone_2 ? 'phone_2' : formData.mobile ? 'mobile' : 'mobile_phone',
                e.target.value
              )}
              placeholder="(555) 987-6543"
            />
          </div>
        </div>
        
        {showAdvancedFields && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Website</Label>
              <Input
                type="url"
                value={formData.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://www.example.com"
              />
            </div>
            
            <div>
              <Label>Preferred Contact Method</Label>
              <Select
                value={formData.preferred_contact_method || 'email'}
                onValueChange={(value) => handleInputChange('preferred_contact_method', value)}
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="text">Text</option>
                <option value="mail">Mail</option>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderAddressInfo = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Address Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <StandardizedAddressInput
          address={{
            streetAddress1: formData.address_line_1 || formData.street_address || '',
            streetAddress2: formData.address_line_2 || '',
            city: formData.city || '',
            state: formData.state || '',
            zipCode: formData.zip_code || ''
          }}
          onChange={handleAddressChange}
          label="Business Address"
          allowAutocomplete
        />
      </CardContent>
    </Card>
  )

  const renderArrayField = (arrayName: string, label: string, placeholder: string) => (
    <div>
      <Label>{label}</Label>
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            value={arrayInputs[arrayName] || ''}
            onChange={(e) => setArrayInputs(prev => ({ ...prev, [arrayName]: e.target.value }))}
            placeholder={placeholder}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addArrayItem(arrayName)
              }
            }}
          />
          <Button
            type="button"
            onClick={() => addArrayItem(arrayName)}
            size="sm"
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
        
        {arrayFields[arrayName] && arrayFields[arrayName].length > 0 && (
          <div className="flex flex-wrap gap-2">
            {arrayFields[arrayName].map(item => (
              <div key={item.id} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-sm">
                <span>{item.value}</span>
                <button
                  type="button"
                  onClick={() => removeArrayItem(arrayName, item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderSpecialtyFields = () => {
    const fields = []
    
    if (entityType === 'vendor' || entityType === 'carrier' || entityType === 'personnel') {
      fields.push(
        renderArrayField('specialties', 'Specialties', 'Add specialty')
      )
    }
    
    if (entityType === 'lender' || entityType === 'carrier') {
      fields.push(
        renderArrayField('service_areas', 'Service Areas', 'Add service area')
      )
    }
    
    if (entityType === 'lender') {
      fields.push(
        renderArrayField('license_states', 'Licensed States', 'Add state'),
        renderArrayField('loan_types_offered', 'Loan Types', 'Add loan type')
      )
    }
    
    if (entityType === 'personnel') {
      fields.push(
        renderArrayField('territory_coverage', 'Territory Coverage', 'Add territory')
      )
    }
    
    if (fields.length === 0) return null
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Specialties & Coverage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields}
        </CardContent>
      </Card>
    )
  }

  const renderStatusRating = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Status & Rating
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Status</Label>
            <Select
              value={formData.status || formData.carrier_status || formData.account_status || formData.availability_status || ''}
              onValueChange={(value) => {
                const statusField = entityType === 'carrier' ? 'carrier_status' : 
                                  entityType === 'lender' ? 'account_status' :
                                  entityType === 'personnel' ? 'availability_status' : 'status'
                handleInputChange(statusField, value)
              }}
            >
              <option value="">Select status</option>
              {statusOptions[entityType].map(option => (
                <option key={option} value={option}>
                  {option.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </Select>
          </div>
          
          <div>
            <Label>Rating</Label>
            <Select
              value={formData.rating || formData.satisfaction_rating || formData.performance_rating || '3'}
              onValueChange={(value) => {
                const ratingField = entityType === 'lender' ? 'satisfaction_rating' :
                                  entityType === 'personnel' ? 'performance_rating' : 'rating'
                handleInputChange(ratingField, parseInt(value))
              }}
            >
              {[1, 2, 3, 4, 5].map(rating => (
                <option key={rating} value={rating}>
                  {rating} Star{rating !== 1 ? 's' : ''}
                </option>
              ))}
            </Select>
          </div>
        </div>
        
        {(entityType === 'vendor' || entityType === 'personnel') && (
          <div className="flex items-center gap-2">
            <Switch
              checked={formData.is_preferred || false}
              onCheckedChange={(checked) => handleInputChange('is_preferred', checked)}
            />
            <Label>Preferred {entityType}</Label>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderNotes = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={formData.notes || ''}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder={`Additional notes about this ${entityType}...`}
          rows={4}
        />
      </CardContent>
    </Card>
  )

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: IconComponent },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'address', label: 'Address', icon: MapPin },
    { id: 'specialties', label: 'Specialties', icon: Tag },
    { id: 'status', label: 'Status', icon: Star },
    { id: 'notes', label: 'Notes', icon: FileText }
  ]

  const renderContent = () => {
    if (showAdvancedFields) {
      return (
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {tabs.map(tab => {
                const TabIcon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <TabIcon className="h-4 w-4" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>
          
          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'basic' && renderBasicInfo()}
            {activeTab === 'contact' && renderContactInfo()}
            {activeTab === 'address' && renderAddressInfo()}
            {activeTab === 'specialties' && renderSpecialtyFields()}
            {activeTab === 'status' && renderStatusRating()}
            {activeTab === 'notes' && renderNotes()}
          </div>
        </div>
      )
    }
    
    // Simple layout for basic mode
    return (
      <div className="space-y-6">
        {renderBasicInfo()}
        {renderContactInfo()}
        {renderStatusRating()}
        {renderNotes()}
      </div>
    )
  }

  const componentTitle = title || `${entity ? 'Edit' : 'Add'} ${config.title}`

  if (mode === 'inline') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{componentTitle}</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderContent()}
          
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : `Save ${config.title}`}
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{componentTitle}</h2>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit}>
            {renderContent()}
          </form>
        </div>
        
        {/* Footer */}
        <div className="flex justify-end gap-4 p-6 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : `Save ${config.title}`}
          </Button>
        </div>
      </div>
    </div>
  )
}